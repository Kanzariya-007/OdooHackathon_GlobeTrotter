import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components & Layout
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { MyTrips } from './pages/MyTrips';
import { CreateTrip } from './pages/CreateTrip';
import { EditTrip } from './pages/EditTrip';
import { TripDetails } from './pages/TripDetails';
import { PublicTrip } from './pages/PublicTrip';

// Protected Routes Guard
const ProtectedRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-semibold text-slate-400">Verifying session...</span>
      </div>
    );
  }
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

// Main Layout Wrapper
const AppLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <Navbar userName={currentUser?.name} onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      
      {/* Sidebar + Core Content Frame */}
      <div className="flex-1 flex relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-[100vw] lg:max-w-[calc(100vw-16rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function AppContent() {
  const { currentUser, checkAuth } = useAuth();

  const handleLoginSuccess = async () => {
    await checkAuth();
  };

  return (
    <BrowserRouter>
      <Routes>
        
        {/* Public Shared Itinerary Page (No Auth Needed) */}
        <Route path="/share/:id" element={<PublicTrip />} />

        {/* Guest Authentication Routes */}
        <Route 
          path="/login" 
          element={currentUser ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/signup" 
          element={currentUser ? <Navigate to="/dashboard" replace /> : <Signup onLoginSuccess={handleLoginSuccess} />} 
        />

        {/* Private Application Dashboard (Auth Guarded) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<MyTrips />} />
            <Route path="/trips/create" element={<CreateTrip />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route path="/trips/:id/edit" element={<EditTrip />} />
          </Route>
        </Route>

        {/* Root Redirect Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
