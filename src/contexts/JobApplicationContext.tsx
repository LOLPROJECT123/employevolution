
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface JobApplication {
  id: string;
  jobId: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted';
  appliedAt: string;
  notes?: string;
  followUpDate?: string;
}

export interface AppliedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  description: string;
  requirements: string[];
  postedAt: string;
  skills: string[];
}

interface JobApplicationContextType {
  applications: JobApplication[];
  appliedJobs: AppliedJob[];
  addApplication: (application: Omit<JobApplication, 'id'>) => void;
  updateApplicationStatus: (id: string, status: JobApplication['status']) => void;
  addAppliedJob: (job: AppliedJob) => void;
}

const JobApplicationContext = createContext<JobApplicationContextType | undefined>(undefined);

export const JobApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedApplications = localStorage.getItem('jobApplications');
    const savedJobs = localStorage.getItem('appliedJobs');
    
    if (savedApplications) {
      try {
        setApplications(JSON.parse(savedApplications));
      } catch (error) {
        console.error('Error loading applications:', error);
      }
    }
    
    if (savedJobs) {
      try {
        setAppliedJobs(JSON.parse(savedJobs));
      } catch (error) {
        console.error('Error loading applied jobs:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('jobApplications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  const addApplication = (application: Omit<JobApplication, 'id'>) => {
    const newApplication: JobApplication = {
      ...application,
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setApplications(prev => [...prev, newApplication]);
  };

  const updateApplicationStatus = (id: string, status: JobApplication['status']) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === id ? { ...app, status } : app
      )
    );
  };

  const addAppliedJob = (job: AppliedJob) => {
    setAppliedJobs(prev => {
      const exists = prev.find(j => j.id === job.id);
      if (exists) return prev;
      return [...prev, job];
    });
  };

  return (
    <JobApplicationContext.Provider value={{
      applications,
      appliedJobs,
      addApplication,
      updateApplicationStatus,
      addAppliedJob
    }}>
      {children}
    </JobApplicationContext.Provider>
  );
};

export const useJobApplications = () => {
  const context = useContext(JobApplicationContext);
  if (context === undefined) {
    throw new Error('useJobApplications must be used within a JobApplicationProvider');
  }
  return context;
};
