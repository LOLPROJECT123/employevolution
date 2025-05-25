
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Job, JobStatus, JobApplication } from '@/types/job';
import { toast } from 'sonner';

interface JobApplicationContextType {
  savedJobs: Job[];
  appliedJobs: Job[];
  applications: JobApplication[];
  saveJob: (job: Job) => void;
  unsaveJob: (jobId: string) => void;
  applyToJob: (job: Job) => void;
  updateApplicationStatus: (applicationId: string, status: JobStatus) => void;
  getApplicationByJobId: (jobId: string) => JobApplication | undefined;
}

const JobApplicationContext = createContext<JobApplicationContextType | undefined>(undefined);

export function JobApplicationProvider({ children }: { children: ReactNode }) {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const savedJobsData = localStorage.getItem('savedJobs');
      const appliedJobsData = localStorage.getItem('appliedJobs');
      const applicationsData = localStorage.getItem('applications');

      if (savedJobsData) setSavedJobs(JSON.parse(savedJobsData));
      if (appliedJobsData) setAppliedJobs(JSON.parse(appliedJobsData));
      if (applicationsData) setApplications(JSON.parse(applicationsData));
    } catch (error) {
      console.error('Error loading job data from localStorage:', error);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  useEffect(() => {
    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
  }, [appliedJobs]);

  useEffect(() => {
    localStorage.setItem('applications', JSON.stringify(applications));
  }, [applications]);

  const saveJob = (job: Job) => {
    if (!savedJobs.some(j => j.id === job.id)) {
      setSavedJobs([...savedJobs, job]);
      toast.success("Job saved to your profile");
    } else {
      unsaveJob(job.id);
    }
  };

  const unsaveJob = (jobId: string) => {
    setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    toast.success("Job removed from saved jobs");
  };

  const applyToJob = (job: Job) => {
    // Check if already applied
    if (applications.some(app => app.jobId === job.id)) {
      toast.info("You've already applied to this job");
      return;
    }

    // Create a new application
    const newApplication: JobApplication = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      userId: 'current-user', // In a real app, this would be the actual user ID
      status: 'applied',
      appliedAt: new Date().toISOString(),
      notes: ''
    };

    // Update applications list
    setApplications([...applications, newApplication]);
    
    // Update applied jobs list if not already there
    if (!appliedJobs.some(j => j.id === job.id)) {
      setAppliedJobs([...appliedJobs, job]);
    }

    toast.success("Application submitted successfully");
  };

  const updateApplicationStatus = (applicationId: string, status: JobStatus) => {
    const updatedApplications = applications.map(app => 
      app.id === applicationId ? { ...app, status } : app
    );
    
    setApplications(updatedApplications);
    
    // Get the application and corresponding job for the toast message
    const updatedApp = updatedApplications.find(app => app.id === applicationId);
    if (updatedApp) {
      const job = appliedJobs.find(job => job.id === updatedApp.jobId);
      
      if (job) {
        let statusMessage = "";
        switch (status) {
          case 'interviewing':
            statusMessage = "Interview scheduled";
            break;
          case 'offered':
            statusMessage = "Received job offer";
            break;
          case 'rejected':
            statusMessage = "Application status updated to rejected";
            break;
          case 'accepted':
            statusMessage = "Offer accepted! Congratulations!";
            break;
          default:
            statusMessage = "Application status updated";
        }
        
        toast.success(statusMessage, {
          description: `${job.title} at ${job.company}`
        });
      }
    }
  };

  const getApplicationByJobId = (jobId: string) => {
    return applications.find(app => app.jobId === jobId);
  };

  return (
    <JobApplicationContext.Provider value={{
      savedJobs,
      appliedJobs,
      applications,
      saveJob,
      unsaveJob,
      applyToJob,
      updateApplicationStatus,
      getApplicationByJobId
    }}>
      {children}
    </JobApplicationContext.Provider>
  );
}

export function useJobApplications() {
  const context = useContext(JobApplicationContext);
  if (context === undefined) {
    throw new Error('useJobApplications must be used within a JobApplicationProvider');
  }
  return context;
}
