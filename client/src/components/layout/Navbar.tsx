import React from 'react';
import { Compass, Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface NavbarProps {
  userName?: string;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userName = 'Traveler', onToggleSidebar }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm shadow-slate-100/50">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand Logo and Burger Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 lg:hidden focus:outline-none"
            aria-label="Toggle Sidebar Menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md shadow-indigo-100 flex items-center justify-center">
              <Compass size={18} className="animate-pulse" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">GlobeTrotter</span>
          </div>
        </div>

        {/* Right Side: Profile area and Logout button */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <User size={12} />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-semibold text-slate-400 leading-none">Logged in as</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5 leading-none">{userName}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut size={14} />}
            className="text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all"
          >
            Logout
          </Button>
        </div>

      </div>
    </header>
  );
};
