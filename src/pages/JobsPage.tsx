
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JobListings from '@/components/JobListings';
import JobDetailPage from '@/pages/JobDetailPage';

const JobsPage: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<JobListings />} />
      <Route path="/:id" element={<JobDetailPage />} />
    </Routes>
  );
};

export default JobsPage;
