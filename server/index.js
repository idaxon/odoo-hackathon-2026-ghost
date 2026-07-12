import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper to get formatted local time
const getLocalTime = () => {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Log helper
const logActivity = (actor, action, target) => {
  const timestamp = getLocalTime();
  db.prepare('INSERT INTO activity_logs (actor, action, target, timestamp) VALUES (?, ?, ?, ?)')
    .run(actor, action, target, timestamp);
};

// -------------------------------------------------------------
// DASHBOARD ENDPOINTS
// -------------------------------------------------------------

// GET /api/dashboard/summary
app.get('/api/dashboard/summary', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM assets').get().count;
    const available = db.prepare("SELECT COUNT(*) as count FROM assets WHERE status = 'Available'").get().count;
    const allocated = db.prepare("SELECT COUNT(*) as count FROM assets WHERE status = 'In Use'").get().count;
    const underMaintenance = db.prepare("SELECT COUNT(*) as count FROM assets WHERE status = 'Maintenance'").get().count;
    
    const utilization = total > 0 ? ((allocated / total) * 100).toFixed(1) : 0;
    
    // potential_savings: sum of purchase_cost for idle assets (where idle_since_date is not null)
    const savingsRow = db.prepare('SELECT SUM(purchase_cost) as total FROM assets WHERE idle_since_date IS NOT NULL').get();
    const potentialSavings = savingsRow.total || 0;

    res.json({
      total,
      available,
      allocated,
      under_maintenance: underMaintenance,
      utilization_pct: parseFloat(utilization),
      potential_savings: potentialSavings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ASSETS ENDPOINTS
// -------------------------------------------------------------

// GET /api/assets
app.get('/api/assets', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT a.*, d.name as department_name, e.name as assigned_to_name
      FROM assets a
      JOIN departments d ON a.department_id = d.id
      LEFT JOIN employees e ON a.assigned_to = e.id
    `).all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assets/:id
app.get('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  try {
    const asset = db.prepare(`
      SELECT a.*, d.name as department_name, e.name as assigned_to_name
      FROM assets a
      JOIN departments d ON a.department_id = d.id
      LEFT JOIN employees e ON a.assigned_to = e.id
      WHERE a.id = ? OR a.asset_code = ?
    `).get(id, id);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    // Dynamic timeline construction
    const timelineSteps = [
      { label: 'Purchased', date: asset.purchase_date, desc: `Acquired through vendor partner ${asset.vendor || 'direct store'}.` }
    ];

    if (asset.assigned_to_name) {
      timelineSteps.push({
        label: 'Allocated',
        date: asset.purchase_date, // fallback or initial date
        desc: `Assigned as operational asset to ${asset.assigned_to_name} (${asset.department_name} department).`
      });
    }

    // Retrieve any resolved maintenance requests for the timeline
    const resolvedMaint = db.prepare(`
      SELECT resolved_at, raised_by, description FROM maintenance_requests 
      WHERE asset_id = ? AND status = 'Resolved'
      ORDER BY resolved_at ASC
    `).all(asset.id);

    resolvedMaint.forEach(rm => {
      timelineSteps.push({
        label: 'Maintenance',
        date: rm.resolved_at,
        desc: `Resolved issue raised by ${rm.raised_by}: ${rm.description || 'Routine repairs completed'}.`
      });
    });

    timelineSteps.push({
      label: 'Current Status',
      date: new Date().toISOString().split('T')[0],
      desc: asset.status === 'In Use' 
        ? `In active operation by ${asset.assigned_to_name || 'Owner'}.`
        : asset.status === 'Available'
        ? 'Available in storage vault.'
        : `Node currently in ${asset.status} phase.`
    });

    // Dynamic AI Recommendation logic
    let aiRec = 'Asset is fully optimized. No current maintenance recommendations.';
    if (asset.health_score < 40 && asset.replacement_cost < asset.repair_cost) {
      aiRec = `Warning: Repair cost (₹${asset.repair_cost}) exceeds replacement cost (₹${asset.replacement_cost}). Recommendation: Replace device.`;
    } else if (asset.idle_since_date) {
      const days = Math.floor((new Date() - new Date(asset.idle_since_date)) / (1000 * 60 * 60 * 24));
      aiRec = `Savings Alert: Unused for ${days} days. Reallocating this asset can avoid ₹${asset.purchase_cost} in CAPEX capital.`;
    } else if (asset.battery_pct && asset.battery_pct < 85) {
      aiRec = `Proactive Insight: Battery health at ${asset.battery_pct}%. Plan replacement within 6 months.`;
    }

    res.json({
      ...asset,
      timelineSteps,
      aiRecommendation: aiRec
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/assets
app.post('/api/assets', (req, res) => {
  const { name, category, department_id, purchase_date, purchase_cost, vendor, serial_number, warranty_expiry, condition, battery_pct } = req.body;
  try {
    // Auto-generate incremented Asset ID
    const countRow = db.prepare('SELECT COUNT(*) as count FROM assets').get();
    const nextNum = countRow.count + 1;
    const assetCode = `AF-${String(nextNum).padStart(4, '0')}`;

    const info = db.prepare(`
      INSERT INTO assets (
        asset_code, name, category, department_id, status, purchase_date, purchase_cost,
        vendor, serial_number, warranty_expiry, health_score, condition, battery_pct, risk_level
      ) VALUES (?, ?, ?, ?, 'Available', ?, ?, ?, ?, ?, 100, ?, ?, 'Low')
    `).run(assetCode, name, category, department_id, purchase_date, purchase_cost, vendor, serial_number, warranty_expiry, condition || 'Excellent', battery_pct || null);

    logActivity('Daksh Mishra', 'registered', `${name} (${assetCode})`);

    res.status(201).json({ id: info.lastInsertRowid, asset_code: assetCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/assets/:id/allocate
app.patch('/api/assets/:id/allocate', (req, res) => {
  const { id } = req.params;
  const { employeeId, departmentId } = req.body;
  try {
    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });

    // Block if already allocated
    if (asset.assigned_to !== null) {
      return res.status(400).json({ error: `Asset is already assigned to employee ID ${asset.assigned_to}` });
    }

    db.prepare(`
      UPDATE assets 
      SET assigned_to = ?, department_id = ?, status = 'In Use', idle_since_date = NULL
      WHERE id = ?
    `).run(employeeId, departmentId, id);

    const emp = db.prepare('SELECT name FROM employees WHERE id = ?').get(employeeId);
    logActivity('Daksh Mishra', 'allocated', `${asset.name} to ${emp ? emp.name : 'Employee'}`);

    res.json({ message: 'Asset allocated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/assets/:id/transfer
app.patch('/api/assets/:id/transfer', (req, res) => {
  const { id } = req.params;
  const { employeeId, departmentId } = req.body;
  try {
    const asset = db.prepare('SELECT a.*, e.name as old_owner FROM assets a LEFT JOIN employees e ON a.assigned_to = e.id WHERE a.id = ?').get(id);
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });

    db.prepare(`
      UPDATE assets 
      SET assigned_to = ?, department_id = ?, status = 'In Use', idle_since_date = NULL
      WHERE id = ?
    `).run(employeeId, departmentId, id);

    const emp = db.prepare('SELECT name FROM employees WHERE id = ?').get(employeeId);
    logActivity('Daksh Mishra', 'transferred', `${asset.name} from ${asset.old_owner || 'Unassigned'} to ${emp ? emp.name : 'Employee'}`);

    res.json({ message: 'Asset transferred successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// BOOKINGS ENDPOINTS
// -------------------------------------------------------------

// GET /api/bookings
app.get('/api/bookings', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM bookings ORDER BY start_time ASC').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/bookings
app.post('/api/bookings', (req, res) => {
  const { resource_name, resource_type, booked_by, start_time, end_time } = req.body;
  try {
    // Collision detection: check overlapping times for same resource name
    // overlapping query: start_time < new_end_time AND end_time > new_start_time
    const conflict = db.prepare(`
      SELECT * FROM bookings 
      WHERE resource_name = ? 
      AND start_time < ? 
      AND end_time > ?
    `).get(resource_name, end_time, start_time);

    if (conflict) {
      return res.status(409).json({
        conflict: true,
        conflictingBooking: conflict,
        message: `Overlapping reservation detected on ${resource_name} (Booked by ${conflict.booked_by}).`
      });
    }

    const info = db.prepare(`
      INSERT INTO bookings (resource_name, resource_type, booked_by, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `).run(resource_name, resource_type, booked_by, start_time, end_time);

    logActivity(booked_by, 'booked', resource_name);

    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// MAINTENANCE ENDPOINTS
// -------------------------------------------------------------

// GET /api/maintenance
app.get('/api/maintenance', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT mr.*, a.name as asset_name, a.asset_code
      FROM maintenance_requests mr
      JOIN assets a ON mr.asset_id = a.id
      ORDER BY mr.id DESC
    `).all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/maintenance
app.post('/api/maintenance', (req, res) => {
  const { asset_id, raised_by, priority, description } = req.body;
  try {
    const today = new Date().toISOString().split('T')[0];
    const info = db.prepare(`
      INSERT INTO maintenance_requests (asset_id, raised_by, status, priority, description, created_at)
      VALUES (?, ?, 'Pending', ?, ?, ?)
    `).run(asset_id, raised_by, priority, description, today);

    // Set asset status to 'Maintenance'
    db.prepare("UPDATE assets SET status = 'Maintenance' WHERE id = ?").run(asset_id);

    const asset = db.prepare('SELECT name FROM assets WHERE id = ?').get(asset_id);
    logActivity(raised_by, 'reported issue', asset ? asset.name : 'Asset');

    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/maintenance/:id/resolve
app.patch('/api/maintenance/:id/resolve', (req, res) => {
  const { id } = req.params;
  try {
    const request = db.prepare('SELECT * FROM maintenance_requests WHERE id = ?').get(id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    const today = new Date().toISOString().split('T')[0];

    // Mark ticket resolved
    db.prepare('UPDATE maintenance_requests SET status = "Resolved", resolved_at = ? WHERE id = ?')
      .run(today, id);

    // Update asset parameters
    const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(request.asset_id);
    if (asset) {
      // Set status: if employee allocated → 'In Use', else 'Available'
      const newStatus = asset.assigned_to ? 'In Use' : 'Available';
      
      // Bump health score up to 95 and update last maintenance date
      db.prepare(`
        UPDATE assets 
        SET status = ?, health_score = 95, last_maintenance_date = ? 
        WHERE id = ?
      `).run(newStatus, today, asset.id);

      logActivity('System Maintenance', 'resolved ticket', `for ${asset.name}`);
    }

    res.json({ message: 'Maintenance request resolved successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// ACTIVITY LOGS ENDPOINT
// -------------------------------------------------------------

// GET /api/activity-logs
app.get('/api/activity-logs', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM activity_logs ORDER BY id DESC').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// AI INTELLIGENCE ENDPOINTS (Rule-based lookups)
// -------------------------------------------------------------

// GET /api/ai/idle-assets → idle_since_date is 30+ days ago
app.get('/api/ai/idle-assets', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM assets WHERE idle_since_date IS NOT NULL').all();
    
    // Filter and map to calculate idle days in JavaScript
    const idleAssets = rows.filter(a => {
      const days = Math.floor((new Date() - new Date(a.idle_since_date)) / (1000 * 60 * 60 * 24));
      return days >= 30;
    }).map(a => {
      const days = Math.floor((new Date() - new Date(a.idle_since_date)) / (1000 * 60 * 60 * 24));
      return {
        id: a.id,
        asset_code: a.asset_code,
        name: a.name,
        category: a.category,
        days_idle: days,
        savings: a.purchase_cost
      };
    });

    res.json(idleAssets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ai/replace-candidates → replacement_cost < repair_cost
app.get('/api/ai/replace-candidates', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM assets WHERE replacement_cost < repair_cost').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ai/available/:category → Available assets by category
app.get('/api/ai/available/:category', (req, res) => {
  const { category } = req.params;
  try {
    const rows = db.prepare("SELECT * FROM assets WHERE LOWER(category) = LOWER(?) AND status = 'Available'")
      .all(category);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ai/maintenance-today → Requests pending created today
app.get('/api/ai/maintenance-today', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const rows = db.prepare(`
      SELECT mr.*, a.name as asset_name 
      FROM maintenance_requests mr
      JOIN assets a ON mr.asset_id = a.id
      WHERE mr.status = 'Pending' AND mr.created_at = ?
    `).all(today);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`AssetFlow backend listening on http://localhost:${PORT}`);
});
