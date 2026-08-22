import React from 'react';
import PageContainer from '../components/PageContainer';
import { Shield, Sliders, User, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Settings: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <PageContainer title="Account Settings" subtitle="Configure your traveler preferences and system credentials.">
      <div className="max-w-4xl mx-auto space-y-6 text-left">
        
        {/* User Profile Block */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3 text-indigo-600 mb-4">
            <User className="h-5 w-5" />
            <h3 className="text-base font-semibold text-slate-800">Traveler Profile</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-450 uppercase leading-none">Full Name</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5 leading-none">{currentUser?.name || 'Traveler'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-450 uppercase leading-none">Email Address</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5 leading-none">{currentUser?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Block */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3 text-indigo-600 mb-4">
            <Sliders className="h-5 w-5" />
            <h3 className="text-base font-semibold text-slate-800">General Preferences</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Preferred Currency</label>
              <select className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer">
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Language</label>
              <select className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none cursor-pointer">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Preferences */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3 text-indigo-600 mb-4">
            <Shield className="h-5 w-5" />
            <h3 className="text-base font-semibold text-slate-800">Security & Authentication</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Token Session</p>
                <p className="text-xs text-slate-400">Manage persistent JWT sessions on this machine</p>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('globetrotter_token');
                  alert('Session token cleared!');
                  window.location.reload();
                }}
                className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-650 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Clear Token
              </button>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
};

export default Settings;
