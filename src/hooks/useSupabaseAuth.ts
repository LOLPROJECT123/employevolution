
import { useState, useEffect } from 'react';
import { Job } from '@/types/job';

// Mock user and auth functions for now
export const useSupabaseAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Mock user data
    setUser({ id: '1', email: 'user@example.com' });
    setUserProfile({ full_name: 'John Doe' });
  }, []);

  const logout = async () => {
    setUser(null);
    setUserProfile(null);
  };

  const saveJob = async (job: Job) => {
    console.log('Saving job:', job.title);
    return true;
  };

  const unsaveJob = async (jobId: string) => {
    console.log('Unsaving job:', jobId);
    return true;
  };

  const applyToJob = async (job: Job, resumeName?: string, coverLetterName?: string, notes?: string) => {
    console.log('Applying to job:', job.title);
    return true;
  };

  return {
    user,
    userProfile,
    logout,
    saveJob,
    unsaveJob,
    applyToJob
  };
};
