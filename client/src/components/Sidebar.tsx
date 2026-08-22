import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Calendar, 
  DollarSign, 
  Settings, 
  Info 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const activeClass = "flex items-center gap-3 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/10 transition-all";
  const inactiveClass = "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all";

  // Sidebar items categorized by who develops them or general placeholders
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'My Trips', icon: Map, path: '/trips', note: 'Member 2' },
    { name: 'Itinerary', icon: Calendar, path: '/itinerary', note: 'Member 3' },
    { name: 'Budget & Expenses', icon: DollarSign, path: '/budget', note: 'Member 4' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/40 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        
        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </p>
          <nav className="mt-2 space-y-1">
            {menuItems.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.path}
                className={({ isActive }) => isActive ? activeClass : inactiveClass}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.note && (
                  <span className="text-[9px] font-semibold bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-tight">
                    {item.note}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Collaboration Note */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
          <div className="flex gap-2 text-violet-400">
            <Info className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold">Hackathon Dev Note</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 leading-normal">
            Modules like Trips, Itinerary, and Budget are placeholder routes allocated to respective team members.
          </p>
        </div>

      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800 pt-4 text-center">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          GlobeTrotter v1.0.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
