import { useState, useEffect } from 'react';
import { Search, Bell, HelpCircle, X, HelpCircle as HelpIcon, Clock } from 'lucide-react';
import { api } from '../api';

interface ActivityLog {
  id: number;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export default function Topbar() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const fetchLogs = async () => {
    try {
      const data = await api.getActivityLogs();
      setLogs(data?.slice(0, 5) || []); // Get top 5 recent events
    } catch (err) {
      console.error('Failed to load topbar notifications:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Poll logs every 15 seconds to keep notifications active
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsHelpOpen(false);
    setHasUnread(false); // Clear red dot indicator on click
  };

  const handleHelpClick = () => {
    setIsHelpOpen(!isHelpOpen);
    setIsNotificationsOpen(false);
  };

  return (
    <header className="h-16 border-b border-border-light bg-surface flex items-center justify-between px-8 sticky top-0 z-20 font-sans">
      {/* Search Input Area */}
      <div className="relative w-80">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search assets, bookings, tickets..."
          className="input-premium pl-9 w-full bg-gray-50/50"
        />
      </div>

      {/* Right Utility Navigation */}
      <div className="flex items-center gap-4">
        {/* Support Dropdown */}
        <div className="relative">
          <button 
            onClick={handleHelpClick}
            className={`p-1.5 rounded transition-colors ${
              isHelpOpen 
                ? 'text-primary bg-primary/5' 
                : 'text-text-muted hover:text-text hover:bg-gray-50'
            }`}
            title="Help Center"
          >
            <HelpCircle size={18} />
          </button>

          {isHelpOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-border-light rounded shadow-lg z-50 p-4 text-xs space-y-3.5 animate-scale-up">
              <div className="flex items-center justify-between border-b border-border-light pb-2">
                <span className="font-bold text-text text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <HelpIcon size={12} className="text-primary" /> AssetFlow Help Center
                </span>
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="text-text-muted hover:text-text"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-text">📍 How to Check-In Assets?</h4>
                  <p className="text-text-muted leading-relaxed">
                    Scan the asset QR code on any device or append <code>?scan=true</code> in the URL. Type your location and click Save.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-text">🛡️ Duplicate Prevention Rules</h4>
                  <p className="text-text-muted leading-relaxed">
                    Procurement checks for identical idle categories. The queue flags risks with a blinking warning badge.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-text">⚡ Reserving Alternates</h4>
                  <p className="text-text-muted leading-relaxed">
                    On calendar conflict overlaps, the scheduler displays an alternate available resource list with a one-click book trigger.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border-light text-[10px] text-text-muted leading-relaxed">
                Contact administrator support at <strong>support@assetflow.com</strong>.
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={handleNotificationsClick}
            className={`relative p-1.5 rounded transition-colors ${
              isNotificationsOpen 
                ? 'text-primary bg-primary/5' 
                : 'text-text-muted hover:text-text hover:bg-gray-50'
            }`}
            title="Recent Alerts"
          >
            <Bell size={18} />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-sm animate-pulse"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-border-light rounded shadow-lg z-50 p-3.5 space-y-3 animate-scale-up">
              <div className="flex items-center justify-between border-b border-border-light pb-2">
                <span className="font-bold text-text text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <Bell size={12} className="text-secondary" /> System Notifications
                </span>
                <button 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-text-muted hover:text-text"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="divide-y divide-border-light max-h-60 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-center py-4 text-text-muted">No new alerts.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 space-y-0.5">
                      <div className="flex justify-between items-center text-[10px] text-text-muted">
                        <span className="font-bold text-secondary">{log.actor}</span>
                        <span className="flex items-center gap-0.5 font-mono">
                          <Clock size={10} /> {log.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-text font-medium leading-normal">
                        {log.action} {log.target}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-border-light flex justify-between items-center text-[9px] font-bold text-text-muted uppercase">
                <span>SQL Activity feed sync active</span>
                <button 
                  onClick={fetchLogs}
                  className="text-secondary hover:underline cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-6 bg-border-light"></div>

        {/* User Info Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-text">Daksh Mishra</p>
            <p className="text-[10px] text-text-muted">Admin role</p>
          </div>
          <div className="w-8 h-8 rounded-md bg-[#714B67] text-white flex items-center justify-center font-bold text-xs select-none">
            DM
          </div>
        </div>
      </div>
    </header>
  );
}
