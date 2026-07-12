import { Package, Calendar, AlertTriangle, Activity, ArrowRight, Server } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Total Assets', value: '1,482', change: '+12 this week', icon: Package, color: 'text-primary' },
    { label: 'Active Bookings', value: '84', change: '8 pending approval', icon: Calendar, color: 'text-[#017E84]' },
    { label: 'In Maintenance', value: '12', change: '2 high priority', icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Utilization Rate', value: '87.4%', change: '+2.1% MoM', icon: Activity, color: 'text-green-600' },
  ];

  const recentActivities = [
    { id: '1', user: 'Sarah Connor', action: 'Booked MacBook Pro 16"', time: '10 mins ago', status: 'Approved', statusColor: 'bg-green-50 text-green-700 border-green-200' },
    { id: '2', user: 'John Doe', action: 'Reported issue on Server Rack B4', time: '1 hour ago', status: 'Maintenance', statusColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: '3', user: 'Alex Mercer', action: 'Returned iPad Pro 12.9"', time: '3 hours ago', status: 'Completed', statusColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: '4', user: 'Elena Rostova', action: 'Requested projector for Room 402', time: '5 hours ago', status: 'Pending', statusColor: 'bg-gray-100 text-gray-700 border-gray-200' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Dashboard</h1>
        <p className="text-sm text-text-muted">Real-time overview of your enterprise assets and operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card-premium p-4 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-text">{stat.value}</p>
                <p className="text-xs text-text-muted">{stat.change}</p>
              </div>
              <div className={`p-2 bg-gray-50 rounded ${stat.color}`}>
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="card-premium p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border-light pb-3">
            <h3 className="font-semibold text-text">Recent Activity</h3>
            <button className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1">
              View all log <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-border-light">
            {recentActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-medium text-xs text-primary">
                    {act.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{act.user}</p>
                    <p className="text-xs text-text-muted">{act.action} &bull; {act.time}</p>
                  </div>
                </div>
                <span className={`tag-status border ${act.statusColor}`}>
                  {act.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions / Critical Issues */}
        <div className="card-premium p-5 space-y-4">
          <div className="border-b border-border-light pb-3">
            <h3 className="font-semibold text-text">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            <button className="btn-primary w-full text-center text-sm py-2">
              + Register New Asset
            </button>
            <button className="btn-secondary w-full text-center text-sm py-2">
              New Booking Request
            </button>
            <button className="btn-secondary w-full text-center text-sm py-2">
              Report System Issue
            </button>
          </div>

          <div className="pt-4 border-t border-border-light">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Critical Notifications</h4>
            <div className="p-3 bg-red-50/50 border border-red-100 rounded-md flex items-start gap-2.5">
              <Server className="text-red-600 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-semibold text-red-950">Rack B12 Temp Warning</p>
                <p className="text-[11px] text-red-700">Ambient temp is exceeding 26&deg;C. Check air flow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
