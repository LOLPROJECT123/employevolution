
import React from 'react';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your job search progress and analytics</p>
        </div>
        
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default Dashboard;
