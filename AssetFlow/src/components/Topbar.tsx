import { Search, Bell, HelpCircle } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="h-16 border-b border-border-light bg-surface flex items-center justify-between px-8 sticky top-0 z-20">
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
        {/* Support */}
        <button className="text-text-muted hover:text-text p-1.5 rounded hover:bg-gray-50 transition-colors">
          <HelpCircle size={18} />
        </button>

        {/* Notifications */}
        <button className="relative text-text-muted hover:text-text p-1.5 rounded hover:bg-gray-50 transition-colors">
          <Bell size={18} />
          {/* Notification Badge: 4px rounded status element */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-sm"></span>
        </button>

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
