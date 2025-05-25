
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

export interface SavedJob {
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
  savedAt: string;
}

interface JobApplicationContextType {
  applications: JobApplication[];
  appliedJobs: AppliedJob[];
  savedJobs: SavedJob[];
  addApplication: (application: Omit<JobApplication, 'id'>) => void;
  updateApplicationStatus: (id: string, status: JobApplication['status']) => void;
  addAppliedJob: (job: AppliedJob) => void;
  applyToJob: (job: AppliedJob) => void;
  saveJob: (job: SavedJob) => void;
  getApplicationByJobId: (jobId: string) => JobApplication | undefined;
}

const JobApplicationContext = createContext<JobApplicationContextType | undefined>(undefined);

export const JobApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedApplications = localStorage.getItem('jobApplications');
    const savedAppliedJobs = localStorage.getItem('appliedJobs');
    const savedJobsList = localStorage.getItem('savedJobs');
    
    if (savedApplications) {
      try {
        setApplications(JSON.parse(savedApplications));
      } catch (error) {
        console.error('Error loading applications:', error);
      }
    }
    
    if (savedAppliedJobs) {
      try {
        setAppliedJobs(JSON.parse(savedAppliedJobs));
      } catch (error) {
        console.error('Error loading applied jobs:', error);
      }
    }

    if (savedJobsList) {
      try {
        setSavedJobs(JSON.parse(savedJobsList));
      } catch (error) {
        console.error('Error loading saved jobs:', error);
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

  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

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

  const applyToJob = (job: AppliedJob) => {
    addAppliedJob(job);
    addApplication({
      jobId: job.id,
      status: 'applied',
      appliedAt: new Date().toISOString()
    });
  };

  const saveJob = (job: SavedJob) => {
    setSavedJobs(prev => {
      const exists = prev.find(j => j.id === job.id);
      if (exists) return prev;
      return [...prev, job];
    });
  };

  const getApplicationByJobId = (jobId: string) => {
    return applications.find(app => app.jobId === jobId);
  };

  return (
    <JobApplicationContext.Provider value={{
      applications,
      appliedJobs,
      savedJobs,
      addApplication,
      updateApplicationStatus,
      addAppliedJob,
      applyToJob,
      saveJob,
      getApplicationByJobId
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
