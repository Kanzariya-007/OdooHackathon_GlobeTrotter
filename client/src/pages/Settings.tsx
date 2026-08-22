import React from 'react';
import PageContainer from '../components/PageContainer';
import { Shield, Sliders } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <PageContainer title="Account Settings" subtitle="Configure your traveler preferences and system credentials.">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Settings Block */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <div className="flex items-center gap-3 text-violet-400">
            <Sliders className="h-5 w-5" />
            <h3 className="text-base font-semibold text-slate-200">General Preferences</h3>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Preferred Currency</label>
              <select className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 px-3 text-sm text-slate-300 focus:border-violet-500 focus:outline-none">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Language</label>
              <select className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 px-3 text-sm text-slate-300 focus:border-violet-500 focus:outline-none">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Preferences */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
          <div className="flex items-center gap-3 text-violet-400">
            <Shield className="h-5 w-5" />
            <h3 className="text-base font-semibold text-slate-200">Security & Authentication</h3>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <div>
                <p className="text-sm font-semibold text-slate-200">Token Session</p>
                <p className="text-xs text-slate-400">Manage persistent JWT sessions on this machine</p>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('globetrotter_token');
                  alert('Session token cleared!');
                }}
                className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
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
