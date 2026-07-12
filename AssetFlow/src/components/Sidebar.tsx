import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  Wrench, 
  BarChart2, 
  Layers 
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Assets', path: '/assets', icon: Package },
    { name: 'Bookings', path: '/bookings', icon: Calendar },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Reports', path: '/reports', icon: BarChart2 },
  ];

  return (
    <aside className="w-60 h-screen fixed top-0 left-0 bg-primary text-white flex flex-col z-30">
      {/* Brand Logo Container */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 gap-2.5">
        <div className="bg-white/10 p-1.5 rounded">
          <Layers size={20} className="text-[#017E84]" />
        </div>
        <span className="text-lg font-bold tracking-tight">AssetFlow</span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Info / Sidebar Footer */}
      <div className="p-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs text-white">
          DM
        </div>
        <div className="truncate">
          <p className="text-xs font-semibold truncate">Daksh Mishra</p>
          <p className="text-[10px] text-white/50 truncate">BML Munjal University</p>
        </div>
      </div>
    </aside>
  );
}
