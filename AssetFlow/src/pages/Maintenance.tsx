import { ShieldAlert, Plus, Wrench, CheckCircle2, User } from 'lucide-react';

interface MaintenanceTask {
  id: string;
  assetName: string;
  issue: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Scheduled' | 'Resolved';
  assignedTo: string;
  reportedDate: string;
}

export default function Maintenance() {
  const tasks: MaintenanceTask[] = [
    { id: 'MNT-401', assetName: 'Server Rack B4', issue: 'Overheating - fan failure on Unit 3', priority: 'Critical', status: 'In Progress', assignedTo: 'Alex Mercer (Infra)', reportedDate: '2026-07-12' },
    { id: 'MNT-402', assetName: 'HQ HVAC Unit 2', issue: 'Compressor making loud humming noise', priority: 'High', status: 'Scheduled', assignedTo: 'Carrier Maintenance', reportedDate: '2026-07-11' },
    { id: 'MNT-403', assetName: 'Conference Room 102 TV', issue: 'HDMI 1 port does not output audio', priority: 'Low', status: 'Open', assignedTo: 'Unassigned', reportedDate: '2026-07-10' },
    { id: 'MNT-404', assetName: 'Toyota Forklift (ID: FL-03)', issue: 'Hydraulic line slow leak', priority: 'High', status: 'Open', assignedTo: 'Bob Vance (Logistics)', reportedDate: '2026-07-09' },
    { id: 'MNT-405', assetName: '3D Printer (Ultimaker S5)', issue: 'Extruder nozzle replacement and calibration', priority: 'Medium', status: 'Resolved', assignedTo: 'Elena Rostova', reportedDate: '2026-07-08' },
  ];

  const getPriorityStyle = (priority: MaintenanceTask['priority']) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusStyle = (status: MaintenanceTask['status']) => {
    switch (status) {
      case 'Open':
        return 'text-blue-600 border border-blue-200 bg-blue-50/50';
      case 'In Progress':
        return 'text-amber-600 border border-amber-200 bg-amber-50/50';
      case 'Scheduled':
        return 'text-indigo-600 border border-indigo-200 bg-indigo-50/50';
      case 'Resolved':
        return 'text-green-600 border border-green-200 bg-green-50/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Maintenance & Repairs</h1>
          <p className="text-sm text-text-muted">Schedule calibration, manage tickets, and assign technicians to faulty hardware.</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Log Issue
        </button>
      </div>

      {/* Task Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-premium p-4 flex items-center gap-3">
          <div className="p-2 bg-red-50 text-red-600 rounded">
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Critical issues</p>
            <p className="text-xl font-bold text-text">1 Open</p>
          </div>
        </div>
        <div className="card-premium p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded">
            <Wrench size={20} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">In Progress</p>
            <p className="text-xl font-bold text-text">2 Tasks</p>
          </div>
        </div>
        <div className="card-premium p-4 flex items-center gap-3">
          <div className="p-2 bg-green-50 text-green-600 rounded">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Resolved This Week</p>
            <p className="text-xl font-bold text-text">14 Tickets</p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="card-premium overflow-hidden bg-white">
        <div className="px-5 py-4 border-b border-border-light bg-gray-50/50">
          <h3 className="font-semibold text-text">Maintenance Log</h3>
        </div>
        <div className="divide-y divide-border-light">
          {tasks.map((task) => (
            <div key={task.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/20">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-text-muted">{task.id}</span>
                  <span className="font-semibold text-text text-sm">&bull; {task.assetName}</span>
                  <span className={`tag-status border ${getPriorityStyle(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                </div>
                <p className="text-sm text-text font-medium">{task.issue}</p>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <User size={13} /> {task.assignedTo}
                  </span>
                  <span>Reported: {task.reportedDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end">
                <span className={`tag-status text-xs py-1 px-2.5 font-semibold ${getStatusStyle(task.status)}`}>
                  {task.status}
                </span>
                <button className="btn-secondary py-1.5 px-3 text-xs">
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
