
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import JobsPage from '@/pages/JobsPage';
import JobDetailPage from '@/pages/JobDetailPage';
import Profile from '@/pages/Profile'; 
import JobAutomationPage from '@/pages/JobAutomationPage';
import Index from '@/pages/Index';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/automation" element={<JobAutomationPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
