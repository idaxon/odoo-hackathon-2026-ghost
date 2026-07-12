import { useState, useEffect } from 'react';
import { Sparkles, Clock, Activity } from 'lucide-react';
import { api } from '../api';

interface SummaryData {
  total: number;
  available: number;
  allocated: number;
  under_maintenance: number;
  utilization_pct: number;
  potential_savings: number;
}

interface ActivityLog {
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export default function Dashboard() {
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [insights, setInsights] = useState<{ id: string; type: string; text: string; borderClass: string }[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dashboardQuery, setDashboardQuery] = useState('');

  const handleAskAI = (qText: string) => {
    window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { query: qText } }));
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardQuery.trim()) return;
    handleAskAI(dashboardQuery);
    setDashboardQuery('');
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch dashboard summary
        const summaryData = await api.getDashboardSummary();
        setSummary(summaryData);

        // 2. Fetch AI Recommendations dynamically
        const replaceCandidates = await api.getAIReplaceCandidates();
        const idleAssets = await api.getAIIdleAssets();
        const bookings = await api.getBookings();

        // Warning (replace candidates)
        let warningText = 'No declining hardware health alerts.';
        if (replaceCandidates && replaceCandidates.length > 0) {
          warningText = `${replaceCandidates[0].name} shows declining health — schedule maintenance`;
        }

        // Cost (idle assets)
        let costText = '₹0 worth of assets idle.';
        if (idleAssets && idleAssets.length > 0) {
          const totalCost = idleAssets.reduce((sum: number, a: any) => sum + (a.savings || 0), 0);
          const lakhs = (totalCost / 100000).toFixed(1);
          costText = `₹${lakhs}L worth of assets idle for 30+ days`;
        }

        // Conflict (bookings overlap check)
        let conflictText = 'No resource booking conflicts detected.';
        const conflictingNames: string[] = [];
        bookings.forEach((b1: any, idx1: number) => {
          bookings.forEach((b2: any, idx2: number) => {
            if (
              idx1 !== idx2 &&
              b1.resource_name === b2.resource_name &&
              b1.start_time < b2.end_time &&
              b1.end_time > b2.start_time &&
              !conflictingNames.includes(b1.resource_name)
            ) {
              conflictingNames.push(b1.resource_name);
            }
          });
        });
        if (conflictingNames.length > 0) {
          conflictText = `${conflictingNames[0]} has 2 overlapping bookings`;
        }

        setInsights([
          {
            id: 'insight-1',
            type: 'warning',
            text: warningText,
            borderClass: 'border-l-4 border-amber-500 bg-amber-50/30'
          },
          {
            id: 'insight-2',
            type: 'cost',
            text: costText,
            borderClass: 'border-l-4 border-secondary bg-secondary/5'
          },
          {
            id: 'insight-3',
            type: 'conflict',
            text: conflictText,
            borderClass: 'border-l-4 border-primary bg-primary/5'
          },
          {
            id: 'insight-4',
            type: 'positive',
            text: 'Asset utilization up 6% this month',
            borderClass: 'border-l-4 border-secondary bg-secondary/5'
          }
        ]);

        // 3. Fetch activity logs
        const logs = await api.getActivityLogs();
        setActivityLogs(logs || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Good Morning, Daksh</h1>
          <p className="text-sm text-text-muted">{todayStr}</p>
        </div>
      </div>

      {/* AI Brief & AI Copilot Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's AI Brief (Focal Point Card) */}
        <div className="card-premium p-6 space-y-4 border-l-4 border-l-primary shadow-sm bg-white lg:col-span-2 flex flex-col justify-between min-h-[260px]">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-border-light mb-3">
              <Sparkles size={16} className="text-primary animate-pulse" />
              <h2 className="text-base font-bold text-text m-0">Today's AI Brief</h2>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                // AI Brief Loading Skeletons
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-11 w-full skeleton-pulse rounded-[4px]"></div>
                ))
              ) : (
                insights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className={`p-3.5 rounded-[4px] text-sm text-text font-medium flex items-center justify-between ${insight.borderClass}`}
                  >
                    <span>{insight.text}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted px-2 py-0.5 bg-white border border-border-light rounded-[4px]">
                      {insight.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Ask AI Copilot Search Card */}
        <div className="card-premium p-6 border-l-4 border-l-secondary bg-white flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border-light">
              <Sparkles size={16} className="text-secondary animate-pulse" />
              <h2 className="text-base font-bold text-text m-0">Ask AI Copilot</h2>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Ask about budget waste, projector availability, equipment replacements, or maintenance schedule.
            </p>
            
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button 
                onClick={() => handleAskAI('What is wasting budget?')}
                className="bg-gray-50 border border-border-light hover:bg-gray-100 hover:border-border-medium text-text text-[10px] py-1 px-2 rounded-[4px] font-semibold transition-colors cursor-pointer"
              >
                Wasting budget?
              </button>
              <button 
                onClick={() => handleAskAI('Find an available projector')}
                className="bg-gray-50 border border-border-light hover:bg-gray-100 hover:border-border-medium text-text text-[10px] py-1 px-2 rounded-[4px] font-semibold transition-colors cursor-pointer"
              >
                Available projector?
              </button>
            </div>
          </div>

          <form onSubmit={handleQuerySubmit} className="flex gap-2 pt-4">
            <input 
              type="text" 
              placeholder="Ask AssetFlow AI..." 
              className="input-premium flex-1 text-xs py-1.5 px-3"
              value={dashboardQuery}
              onChange={(e) => setDashboardQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="btn-primary py-1.5 px-3 rounded-[6px]"
            >
              Ask
            </button>
          </form>
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
          {loading ? (
            // Stats Row Loading Skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[76px] w-full skeleton-pulse rounded-[8px]"></div>
            ))
          ) : (
            summary && [
              { label: 'Total Assets', value: summary.total },
              { label: 'Available', value: summary.available },
              { label: 'Allocated', value: summary.allocated },
              { label: 'Under Maintenance', value: summary.under_maintenance },
              { label: 'Utilization %', value: `${summary.utilization_pct}%` },
              { label: 'Potential Savings', value: `₹${(summary.potential_savings / 100000).toFixed(1)}L` }
            ].map((stat) => (
              <div key={stat.label} className="card-premium p-4 flex flex-col justify-between bg-white">
                <span className="text-2xl font-bold text-text tracking-tight">{stat.value}</span>
                <span className="text-xs text-text-muted font-medium mt-1 truncate">{stat.label}</span>
              </div>
            ))
          )}
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
            {loading ? (
              // Activity Feed Loading Skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 w-full skeleton-pulse rounded-[4px] my-1"></div>
              ))
            ) : (
              activityLogs.slice(0, 5).map((log, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 text-sm text-text">
                  <span className="font-medium text-text">
                    {log.actor} {log.action} {log.target}
                  </span>
                  <span className="text-xs text-text-muted font-mono flex items-center gap-1">
                    <Clock size={12} /> {log.timestamp}
                  </span>
                </div>
              ))
            )}
            {!loading && activityLogs.length === 0 && (
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
