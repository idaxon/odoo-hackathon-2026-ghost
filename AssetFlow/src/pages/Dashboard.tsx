import { useState, useEffect } from 'react';
import { Sparkles, Clock, Activity } from 'lucide-react';

export default function Dashboard() {
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const insights = [
    {
      id: 'insight-1',
      type: 'warning',
      text: 'Printer P17 shows declining health — schedule maintenance',
      borderClass: 'border-l-4 border-amber-500 bg-amber-50/30'
    },
    {
      id: 'insight-2',
      type: 'cost',
      text: '₹2.3L worth of assets idle for 30+ days',
      borderClass: 'border-l-4 border-secondary bg-secondary/5'
    },
    {
      id: 'insight-3',
      type: 'conflict',
      text: 'Meeting Room B has 2 overlapping bookings',
      borderClass: 'border-l-4 border-primary bg-primary/5'
    },
    {
      id: 'insight-4',
      type: 'positive',
      text: 'Asset utilization up 6% this month',
      borderClass: 'border-l-4 border-secondary bg-secondary/5'
    }
  ];

  // Dynamic activity logs synced with LocalStorage
  const [activityLogs, setActivityLogs] = useState<string[]>([]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('assetflow_activity_log');
    if (savedLogs) {
      setActivityLogs(JSON.parse(savedLogs));
    } else {
      const defaults = [
        "Daksh registered Printer P17 — 09:15 AM",
        "System marked Server Rack B4 for Maintenance — 10:20 AM",
        "Jane Austen returned Dell UltraSharp 32\" Monitor — 10:45 AM"
      ];
      localStorage.setItem('assetflow_activity_log', JSON.stringify(defaults));
      setActivityLogs(defaults);
    }
  }, []);

  const stats = [
    { label: 'Total Assets', value: '1,482' },
    { label: 'Available', value: '864' },
    { label: 'Allocated', value: '606' },
    { label: 'Under Maintenance', value: '12' },
    { label: 'Utilization %', value: '87.4%' },
    { label: 'Potential Savings', value: '₹2.3L' }
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Good Morning, Daksh</h1>
          <p className="text-sm text-text-muted">{todayStr}</p>
        </div>
      </div>

      {/* Today's AI Brief (Focal Point Card) */}
      <div className="card-premium p-6 space-y-4 border-l-4 border-l-primary shadow-sm bg-white">
        <div className="flex items-center gap-2 pb-2 border-b border-border-light">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <h2 className="text-base font-bold text-text m-0">Today's AI Brief</h2>
        </div>
        
        <div className="space-y-3">
          {insights.map((insight) => (
            <div 
              key={insight.id} 
              className={`p-3.5 rounded-[4px] text-sm text-text font-medium flex items-center justify-between ${insight.borderClass}`}
            >
              <span>{insight.text}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted px-2 py-0.5 bg-white border border-border-light rounded-[4px]">
                {insight.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-3">
        <button className="btn-secondary text-primary border-primary hover:bg-primary/5 font-semibold text-sm rounded-[6px] py-2 px-4 border">
          Reallocate Assets
        </button>
        <button className="btn-secondary text-primary border-primary hover:bg-primary/5 font-semibold text-sm rounded-[6px] py-2 px-4 border">
          Schedule Maintenance
        </button>
        <button className="btn-secondary text-primary border-primary hover:bg-primary/5 font-semibold text-sm rounded-[6px] py-2 px-4 border">
          View Recommendations
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Operational Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card-premium p-4 flex flex-col justify-between bg-white">
              <span className="text-2xl font-bold text-text tracking-tight">{stat.value}</span>
              <span className="text-xs text-text-muted font-medium mt-1 truncate">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border-light pb-2">
          <Activity size={16} className="text-secondary" />
          <h3 className="text-sm font-semibold text-text uppercase tracking-wider m-0">Recent Activity Feed</h3>
        </div>
        <div className="card-premium p-5 bg-white">
          <div className="divide-y divide-border-light">
            {activityLogs.slice(0).reverse().map((log, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 text-sm text-text">
                <span className="font-medium text-text">{log.split(' — ')[0]}</span>
                <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                  <Clock size={12} /> {log.split(' — ')[1]}
                </span>
              </div>
            ))}
            {activityLogs.length === 0 && (
              <div className="py-2 text-center text-text-muted text-sm">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
