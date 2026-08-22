import React from 'react';
import { Compass, User, Bell, Search } from 'lucide-react';

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  userName = 'Traveler', 
  onLogout 
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Compass className="h-5 w-5 animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            GlobeTrotter
          </span>
        </div>

        {/* Global Search Bar Placeholder */}
        <div className="hidden md:flex relative max-w-md w-full mx-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="search"
            placeholder="Search trips, destinations, itineraries..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 pl-10 pr-4 text-sm text-slate-300 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Actions & User Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications Button */}
          <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-slate-900"></span>
          </button>

          {/* User Dropdown / Profile Card */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-200">{userName}</p>
              <p className="text-xs text-slate-400">Explorer</p>
            </div>
            
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-violet-400 ring-2 ring-violet-500/20">
              <User className="h-5 w-5" />
            </div>

            {onLogout && (
              <button 
                onClick={onLogout}
                className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Log out
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
