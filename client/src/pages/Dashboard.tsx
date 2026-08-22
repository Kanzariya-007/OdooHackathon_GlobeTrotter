import React, { useEffect, useState } from 'react';
import PageContainer from '../components/PageContainer';
import api from '../services/api';
import { Loading } from '../components/Loading';
import { 
  Server, 
  CheckCircle2, 
  XCircle, 
  Map, 
  Calendar, 
  DollarSign, 
  Compass 
} from 'lucide-react';

interface HealthResponse {
  status: string;
  timestamp: string;
  message: string;
}

export const Dashboard: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<HealthResponse>('/health');
      setHealth(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <PageContainer 
      title="Welcome to GlobeTrotter" 
      subtitle="Your premium collaborative travel planning space."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* API Health Check Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400">
                <Server className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-100">API Health Status</h3>
            </div>
            
            {!loading && (
              <button 
                onClick={checkHealth}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
          
          <div className="mt-6 flex flex-col justify-center">
            {loading ? (
              <div className="py-2">
                <Loading message="Checking connection..." />
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 rounded-lg bg-rose-950/20 border border-rose-500/20 p-3 text-rose-400">
                <XCircle className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium">{error}</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 p-3 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-medium">Backend Online</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1 pl-1">
                  <p><span className="font-semibold text-slate-300">Message:</span> {health?.message}</p>
                  <p><span className="font-semibold text-slate-300">Timestamp:</span> {health && new Date(health.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Welcome Guide */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-indigo-950/20 to-violet-950/20 p-6 shadow-xl md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-100">Project Overview</h3>
          </div>
          <p className="mt-4 text-sm text-slate-400 leading-relaxed">
            GlobeTrotter is a modern travel-planning application designed for collaborative groups. 
            This Hour 1 setup establishes the shared stack (Vite, React, TS, Tailwind, Express, Prisma, Postgres) 
            so the team can build concurrently.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">React 19</span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">Vite 6</span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">Tailwind CSS v4</span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">Express</span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">Prisma</span>
          </div>
        </div>

      </div>

      {/* Feature ownership matrix */}
      <div className="mt-10">
        <h3 className="text-lg font-bold text-slate-200">Shared Feature Roadmap</h3>
        <p className="mt-1 text-xs text-slate-400">Team tasks and feature division matrix</p>
        
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Map className="h-4 w-4" />
                <span className="text-sm font-bold text-slate-200">Trip & City Management</span>
              </div>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                Member 2
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Create, view, delete trips. Add and sort travel destinations/stops.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-bold text-slate-200">Daily Itinerary & Timelines</span>
              </div>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                Member 3
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Plan stops, set arrival/departure orders, and allocate daily activities.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-bold text-slate-200">Budgeting & Expenses</span>
              </div>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                Member 4
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Track travel costs, log expenses, specify currencies, and analyze budget categories.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
