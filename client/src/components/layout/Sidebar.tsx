import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, PlusCircle, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'My Trips', path: '/trips', icon: <Map size={18} /> },
    { name: 'Create Trip', path: '/trips/create', icon: <PlusCircle size={18} /> },
  ];

  const activeStyle = "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 transition-colors";
  const inactiveStyle = "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors";

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 w-64 bg-white border-r border-slate-200/80 p-5 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:z-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between lg:hidden border-b border-slate-100 pb-3">
            <span className="font-bold text-slate-950 text-sm">Navigation Menu</span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          {/* Logo in Sidebar (Visible only when sidebar is expanded in mobile or as header) */}
          <div className="hidden lg:flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</span>
          </div>

          {/* Links list */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose} // Auto-close drawer on click on mobile
                className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
              >
                <span className="flex-shrink-0 text-current">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-[11px] text-slate-400 font-medium">&copy; 2026 GlobeTrotter Inc.</p>
          <p className="text-[9px] text-indigo-400 font-semibold uppercase mt-0.5 tracking-wider">Version 1.0 (Core)</p>
        </div>
      </aside>
    </>
  );
};
