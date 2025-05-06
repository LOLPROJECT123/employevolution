
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import JobsPage from '@/pages/JobsPage';
import JobDetailPage from '@/pages/JobDetailPage';
import Profile from '@/pages/Profile'; // Changed from ProfilePage to Profile
import JobAutomationPage from '@/pages/JobAutomationPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<JobsPage />} />
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
