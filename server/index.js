import express from 'express';
import cors from 'cors';
import os from 'os';
import db from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[API REQUEST] ${req.method} ${req.url}`, req.body ? `- Body: ${JSON.stringify(req.body)}` : '');
  next();
});

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
  const { resolution_notes, scanned_code } = req.body || {};
  try {
    const request = db.prepare('SELECT * FROM maintenance_requests WHERE id = ?').get(id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    const today = new Date().toISOString().split('T')[0];
    const notes = resolution_notes || 'Routine repairs completed';
    const updatedDesc = request.description
      ? `${request.description} | Resolution Notes: ${notes}`
      : `Resolution Notes: ${notes}`;

    // Mark ticket resolved and store notes
    db.prepare("UPDATE maintenance_requests SET status = 'Resolved', resolved_at = ?, description = ? WHERE id = ?")
      .run(today, updatedDesc, id);

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

      const isVerified = scanned_code && scanned_code.trim() === asset.asset_code;
      const verifySuffix = isVerified ? ' (verified QR match)' : scanned_code ? ' (mismatched QR)' : ' (unverified)';
      logActivity('System Maintenance', `resolved ticket${verifySuffix}`, `for ${asset.name}`);
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

// GET /api/system/ip → Retrieves local network interface IP address
app.get('/api/system/ip', (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let localIp = '127.0.0.1';
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      if (!iface) continue;
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          localIp = alias.address;
          break;
        }
      }
      if (localIp !== '127.0.0.1') break;
    }
    res.json({ ip: localIp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assets/:id/voice → Returns generated first-person message
app.get('/api/assets/:id/voice', (req, res) => {
  const { id } = req.params;
  try {
    const asset = db.prepare(`
      SELECT a.*, d.name as department_name
      FROM assets a
      JOIN departments d ON a.department_id = d.id
      WHERE a.id = ? OR a.asset_code = ?
    `).get(id, id);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    // Check repair count
    const repairCountRow = db.prepare('SELECT COUNT(*) as count FROM maintenance_requests WHERE asset_id = ?').get(asset.id);
    const repairCount = repairCountRow.count || 0;

    let voiceText = '';

    // Condition 1: replacement_cost < repair_cost
    if (asset.replacement_cost && asset.repair_cost && asset.replacement_cost < asset.repair_cost) {
      voiceText = `I'm ${asset.name}. I've needed repairs ${repairCount} times, and honestly, replacing me now (₹${asset.replacement_cost}) makes more sense than fixing me again (₹${asset.repair_cost}).`;
    }
    // Condition 2: idle_since_date is 20+ days ago
    else if (asset.idle_since_date) {
      const days = Math.floor((new Date() - new Date(asset.idle_since_date)) / (1000 * 60 * 60 * 24));
      if (days >= 20) {
        voiceText = `I'm ${asset.name}. I've been sitting idle in ${asset.department_name} for ${days} days. Someone in another department could probably use me.`;
      }
    }

    // Condition 3: health_score < 50
    if (!voiceText && asset.health_score !== null && asset.health_score < 50) {
      voiceText = `I'm ${asset.name}. My health score has dropped to ${asset.health_score}/100 — I could use some maintenance soon.`;
    }
    // Condition 4: health_score > 85
    else if (!voiceText && asset.health_score !== null && asset.health_score > 85) {
      voiceText = `I'm ${asset.name}. I'm in great shape — ${asset.health_score}/100 — no concerns right now.`;
    }
    // Condition 5: Default neutral
    else if (!voiceText) {
      const lastMaint = asset.last_maintenance_date ? `last inspected on ${asset.last_maintenance_date}` : 'not inspected recently';
      voiceText = `I'm ${asset.name}, currently deployed in ${asset.department_name}. My status is ${asset.status === 'In Use' ? 'Allocated' : asset.status} and condition is ${asset.condition || 'normal'}. I was ${lastMaint}.`;
    }

    res.json({ voiceText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/assets/:id/scan-log → Record a scan event
app.post('/api/assets/:id/scan-log', (req, res) => {
  const { id } = req.params;
  const { location_note, scanned_by } = req.body;
  try {
    const asset = db.prepare('SELECT id, name FROM assets WHERE id = ? OR asset_code = ?').get(id, id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    const loc = location_note || 'Unknown location';
    const actor = scanned_by || 'Public Scanner';
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    db.prepare('INSERT INTO scan_logs (asset_id, scanned_by, location_note, timestamp) VALUES (?, ?, ?, ?)')
      .run(asset.id, actor, loc, timestamp);

    logActivity(actor, 'scanned QR code', `for ${asset.name} at ${loc}`);

    res.status(201).json({ message: 'Scan logged successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assets/:id/scan-history → Get scan logs for that asset, newest first
app.get('/api/assets/:id/scan-history', (req, res) => {
  const { id } = req.params;
  try {
    const asset = db.prepare('SELECT id FROM assets WHERE id = ? OR asset_code = ?').get(id, id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found.' });
    }

    const rows = db.prepare('SELECT * FROM scan_logs WHERE asset_id = ? ORDER BY id DESC').all(asset.id);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/asset-requests → List all requests
app.get('/api/asset-requests', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT r.*, d.name as department_name 
      FROM asset_requests r 
      JOIN departments d ON r.department_id = d.id 
      ORDER BY r.id DESC
    `).all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/asset-requests → Create an asset request with duplicate check
app.post('/api/asset-requests', (req, res) => {
  const { requested_by, category, department_id, justification, force } = req.body;
  try {
    // Look up available or idle assets matching the requested category
    const matchingAssets = db.prepare(`
      SELECT a.*, d.name as department_name
      FROM assets a
      JOIN departments d ON a.department_id = d.id
      WHERE a.category = ? AND (
        a.status = 'Available' OR (
          a.idle_since_date IS NOT NULL AND 
          (strftime('%s', 'now') - strftime('%s', a.idle_since_date)) / 86400 >= 20
        )
      )
    `).all(category);

    // If matches exist and force is not true, interrupt the user
    if (matchingAssets.length > 0 && force !== true) {
      return res.json({ duplicate_warning: true, matching_assets: matchingAssets });
    }

    // Determine if request proceeds under duplicate risk flag
    const duplicateRisk = matchingAssets.length > 0 ? 1 : 0;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const result = db.prepare(`
      INSERT INTO asset_requests (requested_by, category, department_id, justification, status, duplicate_risk, created_at)
      VALUES (?, ?, ?, ?, 'Pending', ?, ?)
    `).run(requested_by, category, department_id, justification, duplicateRisk, timestamp);

    logActivity(requested_by, 'submitted asset request', `for a new ${category} (Risk: ${duplicateRisk ? 'High' : 'None'})`);

    res.status(201).json({ success: true, duplicate_warning: false, requestId: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/asset-requests/:id/approve → Approve request
app.patch('/api/asset-requests/:id/approve', (req, res) => {
  const { id } = req.params;
  try {
    const requestItem = db.prepare('SELECT * FROM asset_requests WHERE id = ?').get(id);
    if (!requestItem) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    db.prepare("UPDATE asset_requests SET status = 'Approved' WHERE id = ?").run(id);
    logActivity('Asset Manager', 'approved asset request', `ID ${id} for ${requestItem.category}`);

    res.json({ message: 'Request approved successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/asset-requests/:id/reject → Reject request
app.patch('/api/asset-requests/:id/reject', (req, res) => {
  const { id } = req.params;
  try {
    const requestItem = db.prepare('SELECT * FROM asset_requests WHERE id = ?').get(id);
    if (!requestItem) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    db.prepare("UPDATE asset_requests SET status = 'Rejected' WHERE id = ?").run(id);
    logActivity('Asset Manager', 'rejected asset request', `ID ${id} for ${requestItem.category}`);

    res.json({ message: 'Request rejected successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`AssetFlow backend listening on http://localhost:${PORT}`);
});
