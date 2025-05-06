
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import JobListings from '@/components/JobListings';
import JobDetailPage from '@/pages/JobDetailPage';
import { ExtendedJob } from '@/types/jobExtensions';
import AutoFillDetector from '@/components/AutoFillDetector';

const JobsPage: React.FC = () => {
  const [autoFillEnabled, setAutoFillEnabled] = useState<boolean>(false);

  const handleToggleAutofill = (enabled: boolean) => {
    setAutoFillEnabled(enabled);
    console.log("Auto-fill enabled:", enabled);
  };

  return (
    <div className="space-y-4">
      <AutoFillDetector onToggleAutofill={handleToggleAutofill} />
      
      <Routes>
        <Route path="/" element={<JobListings />} />
        <Route path="/:id" element={<JobDetailPage />} />
      </Routes>
    </div>
  );
};

export default JobsPage;
