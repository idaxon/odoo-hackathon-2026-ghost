import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'assetflow.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department_id INTEGER NOT NULL,
    email TEXT UNIQUE,
    FOREIGN KEY(department_id) REFERENCES departments(id)
  );

  CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    department_id INTEGER NOT NULL,
    status TEXT NOT NULL, -- Available, In Use, Maintenance, Retired
    purchase_date TEXT,
    purchase_cost REAL,
    vendor TEXT,
    serial_number TEXT,
    warranty_expiry TEXT,
    health_score INTEGER,
    condition TEXT,
    battery_pct INTEGER,
    risk_level TEXT, -- Low, Medium, High
    assigned_to INTEGER, -- Nullable, references employees(id)
    last_maintenance_date TEXT,
    repair_cost REAL,
    replacement_cost REAL,
    idle_since_date TEXT, -- Nullable
    FOREIGN KEY(department_id) REFERENCES departments(id),
    FOREIGN KEY(assigned_to) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_name TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    booked_by TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    raised_by TEXT NOT NULL,
    status TEXT NOT NULL, -- Pending, In Progress, Resolved
    priority TEXT NOT NULL, -- Low, Medium, High, Critical
    description TEXT,
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    FOREIGN KEY(asset_id) REFERENCES assets(id)
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );
`);

// Seeding Logic
const seedDatabase = () => {
  // 1. Seed Departments
  const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get().count;
  if (deptCount === 0) {
    const insertDept = db.prepare('INSERT INTO departments (name) VALUES (?)');
    const depts = ['Marketing', 'HR', 'Engineering'];
    for (const name of depts) {
      insertDept.run(name);
    }
    console.log('Seeded departments.');
  }

  // Get department IDs for reference
  const departmentsMap = {};
  db.prepare('SELECT id, name FROM departments').all().forEach(row => {
    departmentsMap[row.name] = row.id;
  });

  // 2. Seed Employees
  const empCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  if (empCount === 0) {
    const insertEmp = db.prepare('INSERT INTO employees (name, department_id, email) VALUES (?, ?, ?)');
    const employees = [
      { name: 'Sarah Connor', dept: 'Engineering', email: 'sarah@assetflow.com' },
      { name: 'John Doe', dept: 'Marketing', email: 'john@assetflow.com' },
      { name: 'Alex Mercer', dept: 'Engineering', email: 'alex@assetflow.com' },
      { name: 'Elena Rostova', dept: 'HR', email: 'elena@assetflow.com' },
      { name: 'Michael Scott', dept: 'Marketing', email: 'michael@assetflow.com' },
      { name: 'Jane Austen', dept: 'HR', email: 'jane@assetflow.com' }
    ];
    for (const emp of employees) {
      insertEmp.run(emp.name, departmentsMap[emp.dept], emp.email);
    }
    console.log('Seeded employees.');
  }

  // Get employee IDs map
  const employeesMap = {};
  db.prepare('SELECT id, name FROM employees').all().forEach(row => {
    employeesMap[row.name] = row.id;
  });

  // 3. Seed Assets (12 items with requested variations)
  const assetCount = db.prepare('SELECT COUNT(*) as count FROM assets').get().count;
  if (assetCount === 0) {
    const insertAsset = db.prepare(`
      INSERT INTO assets (
        asset_code, name, category, department_id, status, purchase_date, purchase_cost,
        vendor, serial_number, warranty_expiry, health_score, condition, battery_pct,
        risk_level, assigned_to, last_maintenance_date, repair_cost, replacement_cost, idle_since_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const assetsData = [
      // Normal healthy assets
      {
        asset_code: 'AF-0001', name: 'MacBook Pro 16" (M3 Max)', category: 'Laptop',
        dept: 'Engineering', status: 'In Use', p_date: '2025-10-15', p_cost: 245000,
        vendor: 'Apple Enterprise', sn: 'C02F12X0Q05D', warranty: '2028-10-15',
        health: 94, cond: 'Excellent', batt: 92, risk: 'Low', assigned: 'Sarah Connor',
        last_m: '2026-06-30', rep_c: 25000, repl_c: 245000, idle: null
      },
      {
        asset_code: 'AF-0002', name: 'Dell UltraSharp 32" 4K Monitor', category: 'Monitor',
        dept: 'Design', status: 'Available', p_date: '2024-03-12', p_cost: 85000,
        vendor: 'Dell Corporate', sn: 'CN-0P826D-74443', warranty: '2026-03-12',
        health: 98, cond: 'Good', batt: null, risk: 'Low', assigned: null,
        last_m: '2026-01-12', rep_c: 8000, repl_c: 85000, idle: null
      },
      {
        asset_code: 'AF-0003', name: 'iPhone 15 Pro Max 256GB', category: 'Mobile',
        dept: 'Marketing', status: 'In Use', p_date: '2025-09-22', p_cost: 140000,
        vendor: 'Airtel Business', sn: 'G03K4829G902', warranty: '2026-09-22',
        health: 89, cond: 'Good', batt: 84, risk: 'Low', assigned: 'John Doe',
        last_m: '2026-05-28', rep_c: 15000, repl_c: 140000, idle: null
      },

      // Variation 1: At least 2 assets with idle_since_date 30+ days ago and status "Available" (unused/idle candidates)
      {
        asset_code: 'AF-0012', name: 'MacBook Air M2 13" (Reserve)', category: 'Laptop',
        dept: 'HR', status: 'Available', p_date: '2024-11-10', p_cost: 95000,
        vendor: 'Apple Enterprise', sn: 'C02H28D7F91S', warranty: '2026-11-10',
        health: 95, cond: 'Excellent', batt: 97, risk: 'Low', assigned: null,
        last_m: '2025-11-10', rep_c: 12000, repl_c: 95000, idle: '2026-05-10' // idle > 60 days
      },
      {
        asset_code: 'AF-0010', name: 'Ergonomic Desk Chair V2', category: 'Furniture',
        dept: 'Operations', status: 'Available', p_date: '2023-04-05', p_cost: 21000,
        vendor: 'Featherlite', sn: 'FL-CH-92810', warranty: '2026-04-05',
        health: 90, cond: 'Good', batt: null, risk: 'Low', assigned: null,
        last_m: '2025-04-05', rep_c: 2000, repl_c: 21000, idle: '2026-06-01' // idle > 40 days
      },

      // Variation 2: At least 1 printer with health_score below 40, repair_cost and replacement_cost set, replacement_cost < repair_cost (replace candidate)
      {
        asset_code: 'AF-0004', name: 'HP LaserJet Enterprise Printer P17', category: 'Printer',
        dept: 'Engineering', status: 'Maintenance', p_date: '2022-05-18', p_cost: 45000,
        vendor: 'HP Direct', sn: 'HP-P17-291A2', warranty: '2025-05-18',
        health: 32, cond: 'Poor', batt: null, risk: 'Medium', assigned: null,
        last_m: '2026-03-10', rep_c: 16000, repl_c: 13000, idle: null // replace candidate!
      },

      // Variation 3: At least 1 projector with status "Available", department "Marketing", to be findable
      {
        asset_code: 'AF-0008', name: 'Epson Wireless Projector P08', category: 'Projector',
        dept: 'Marketing', status: 'Available', p_date: '2024-11-04', p_cost: 65000,
        vendor: 'Epson Corporate', sn: 'EPS-P08-9892', warranty: '2026-11-04',
        health: 85, cond: 'Good', batt: null, risk: 'Low', assigned: null,
        last_m: '2026-02-22', rep_c: 6000, repl_c: 65000, idle: null
      },

      // Variation 4: At least 3 assets with a maintenance_request status "Pending" dated today
      {
        asset_code: 'AF-0005', name: 'Database Server Rack B4', category: 'Server',
        dept: 'Infrastructure', status: 'Maintenance', p_date: '2023-05-18', p_cost: 350000,
        vendor: 'Supermicro', sn: 'SM-82910398', warranty: '2026-05-18',
        health: 42, cond: 'Fair', batt: null, risk: 'High', assigned: null,
        last_m: '2026-07-08', rep_c: 45000, repl_c: 350000, idle: null
      },
      {
        asset_code: 'AF-0006', name: 'HQ HVAC Unit 2', category: 'Infrastructure',
        dept: 'Operations', status: 'Maintenance', p_date: '2021-08-14', p_cost: 180000,
        vendor: 'Carrier Systems', sn: 'CAR-HVAC-921', warranty: '2026-08-14',
        health: 58, cond: 'Fair', batt: null, risk: 'Medium', assigned: null,
        last_m: '2026-04-12', rep_c: 22000, repl_c: 180000, idle: null
      },
      {
        asset_code: 'AF-0007', name: 'Toyota Logistics Forklift FL-03', category: 'Vehicle',
        dept: 'Operations', status: 'Maintenance', p_date: '2020-02-15', p_cost: 620000,
        vendor: 'Toyota Material Handling', sn: 'TOY-FL3-82910', warranty: '2025-02-15',
        health: 55, cond: 'Fair', batt: null, risk: 'Medium', assigned: null,
        last_m: '2025-09-10', rep_c: 35000, repl_c: 620000, idle: null
      },

      // Rest healthy assets
      {
        asset_code: 'AF-0009', name: 'ThinkPad X1 Carbon Gen 11', category: 'Laptop',
        dept: 'Finance', status: 'In Use', p_date: '2023-02-15', p_cost: 165000,
        vendor: 'Lenovo Corporate', sn: 'PF-289D2B', warranty: '2026-02-15',
        health: 80, cond: 'Good', batt: 76, risk: 'Low', assigned: 'Michael Scott',
        last_m: '2026-02-15', rep_c: 14000, repl_c: 165000, idle: null
      },
      {
        asset_code: 'AF-0011', name: 'Oculus Rift VR Kit', category: 'Tablet',
        dept: 'Marketing', status: 'In Use', p_date: '2025-08-11', p_cost: 48000,
        vendor: 'Meta Business', sn: 'DLX29103810', warranty: '2026-08-11',
        health: 87, cond: 'Good', batt: 81, risk: 'Low', assigned: 'Jane Austen',
        last_m: '2026-04-13', rep_c: 5000, repl_c: 48000, idle: null
      }
    ];

    for (const a of assetsData) {
      const deptId = departmentsMap[a.dept] || 1;
      const assignedId = a.assigned ? employeesMap[a.assigned] : null;
      insertAsset.run(
        a.asset_code, a.name, a.category, deptId, a.status, a.p_date, a.p_cost,
        a.vendor, a.sn, a.warranty, a.health, a.cond, a.batt,
        a.risk, assignedId, a.last_m, a.rep_c, a.repl_c, a.idle
      );
    }
    console.log('Seeded assets.');
  }

  // Get asset IDs map
  const assetsMap = {};
  db.prepare('SELECT id, asset_code FROM assets').all().forEach(row => {
    assetsMap[row.asset_code] = row.id;
  });

  // 4. Seed Bookings
  const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
  if (bookingCount === 0) {
    const insertBooking = db.prepare(`
      INSERT INTO bookings (resource_name, resource_type, booked_by, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `);
    const bookingsData = [
      // Conflict: Booking 1 and Booking 2 overlap on "Meeting Room B"
      { name: 'Meeting Room B', type: 'Room', user: 'John Doe', start: '2026-07-12 14:00', end: '2026-07-12 16:00' },
      { name: 'Meeting Room B', type: 'Room', user: 'Michael Scott', start: '2026-07-12 15:00', end: '2026-07-12 17:00' }, // Overlap conflict
      
      { name: 'Design Lab Projector', type: 'Equipment', user: 'Jane Austen', start: '2026-07-13 10:00', end: '2026-07-13 12:00' },
      { name: 'Boardroom', type: 'Room', user: 'Sarah Connor', start: '2026-07-14 09:00', end: '2026-07-14 11:00' }
    ];
    for (const b of bookingsData) {
      insertBooking.run(b.name, b.type, b.user, b.start, b.end);
    }
    console.log('Seeded bookings (with conflicts).');
  }

  // 5. Seed Maintenance Requests (At least 3 pending today, e.g. July 12, 2026)
  const maintCount = db.prepare('SELECT COUNT(*) as count FROM maintenance_requests').get().count;
  if (maintCount === 0) {
    const insertMaint = db.prepare(`
      INSERT INTO maintenance_requests (asset_id, raised_by, status, priority, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const maintenanceData = [
      { code: 'AF-0005', raised: 'System Monitor', status: 'Pending', priority: 'Critical', desc: 'Overheating - fan failure detected on unit 3.', created: '2026-07-12' },
      { code: 'AF-0006', raised: 'Elena Rostova', status: 'Pending', priority: 'High', desc: 'HVAC unit compressor making loud humming noise.', created: '2026-07-12' },
      { code: 'AF-0007', raised: 'Sarah Connor', status: 'Pending', priority: 'High', desc: 'Slow hydraulic line fluid leak.', created: '2026-07-12' },
      
      { code: 'AF-0004', raised: 'Alex Mercer', status: 'In Progress', priority: 'Medium', desc: 'Paper feed roller gear cracked, replacing nozzle.', created: '2026-07-10' }
    ];
    for (const m of maintenanceData) {
      insertMaint.run(assetsMap[m.code], m.raised, m.status, m.priority, m.desc, m.created);
    }
    console.log('Seeded maintenance requests.');
  }

  // 6. Seed Activity Logs
  const logCount = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get().count;
  if (logCount === 0) {
    const insertLog = db.prepare('INSERT INTO activity_logs (actor, action, target, timestamp) VALUES (?, ?, ?, ?)');
    const logs = [
      { actor: 'Daksh Mishra', action: 'registered', target: 'HP LaserJet Enterprise Printer P17', time: '09:15 AM' },
      { actor: 'System Monitor', action: 'marked for maintenance', target: 'Database Server Rack B4', time: '10:20 AM' },
      { actor: 'Jane Austen', action: 'returned', target: 'Dell UltraSharp 32" Monitor', time: '10:45 AM' },
      { actor: 'Sarah Connor', action: 'allocated', target: 'MacBook Pro 16" to Sarah Connor', time: '11:15 AM' },
      { actor: 'Michael Scott', action: 'allocated', target: 'ThinkPad X1 Carbon to Michael Scott', time: '11:30 AM' }
    ];
    for (const log of logs) {
      insertLog.run(log.actor, log.action, log.target, log.time);
    }
    console.log('Seeded activity logs.');
  }
};

// Execute Seeding on Startup
seedDatabase();

export default db;
