import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import Itinerary from './pages/Itinerary';
import Budget from './pages/Budget';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Layout Wrap */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="trips" element={<Trips />} />
          <Route path="itinerary" element={<Itinerary />} />
          <Route path="budget" element={<Budget />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Catch-all route redirects back to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
