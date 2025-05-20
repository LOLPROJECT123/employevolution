
import React from 'react';
import Navbar from "@/components/Navbar";
import { SavedAndAppliedJobs } from "@/components/SavedAndAppliedJobs";
import { Job } from "@/types/job";
import { useState, useEffect } from 'react';
import { toast } from "sonner";

const MyJobs = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll generate some sample jobs based on saved IDs
      const savedJobIds = localStorage.getItem('savedJobs') ? 
        JSON.parse(localStorage.getItem('savedJobs') || '[]') : [];
      
      const appliedJobIds = localStorage.getItem('appliedJobs') ? 
        JSON.parse(localStorage.getItem('appliedJobs') || '[]') : [];
      
      // Generate sample saved and applied jobs
      const generateJobs = (ids: string[], isApplied: boolean) => {
        return ids.map((id, index) => {
          const postedDate = new Date();
          postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 30));
          
          return {
            id,
            title: `${isApplied ? 'Applied' : 'Saved'} Job ${index + 1}`,
            company: `Company ${index + 1}`,
            location: 'San Francisco, CA',
            salary: {
              min: 100000 + (index * 5000),
              max: 150000 + (index * 5000),
              currency: 'USD',
            },
            type: index % 2 === 0 ? 'full-time' : 'contract',
            level: index % 3 === 0 ? 'senior' : (index % 3 === 1 ? 'mid' : 'entry'),
            description: 'This is a sample job description for a position.',
            requirements: ['Bachelor\'s degree', '3+ years experience'],
            postedAt: postedDate.toISOString(),
            skills: ['JavaScript', 'React', 'Node.js'],
            matchPercentage: Math.floor(Math.random() * 30) + 70,
          } as Job;
        });
      };
      
      setSavedJobs(generateJobs(savedJobIds, false));
      setAppliedJobs(generateJobs(appliedJobIds, true));
      
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast.error("Could not load your saved jobs");
    }
  }, []);
  
  const handleJobSelect = (job: Job) => {
    setSelectedJobId(job.id);
    // In a real app, this would navigate to the job detail page
  };
  
  const handleSaveJob = (job: Job) => {
    // Remove job from saved jobs
    setSavedJobs(prev => prev.filter(j => j.id !== job.id));
    
    // Update localStorage
    const savedJobIds = localStorage.getItem('savedJobs') ? 
      JSON.parse(localStorage.getItem('savedJobs') || '[]') : [];
    
    const updatedIds = savedJobIds.filter((id: string) => id !== job.id);
    localStorage.setItem('savedJobs', JSON.stringify(updatedIds));
    
    toast.success("Job removed from saved jobs");
  };
  
  const handleApplyJob = (job: Job) => {
    // If already applied, show notification
    if (appliedJobs.some(j => j.id === job.id)) {
      toast("You have already applied for this job");
      return;
    }
    
    // Move from saved to applied
    setSavedJobs(prev => prev.filter(j => j.id !== job.id));
    setAppliedJobs(prev => [...prev, job]);
    
    // Update localStorage
    const savedJobIds = localStorage.getItem('savedJobs') ? 
      JSON.parse(localStorage.getItem('savedJobs') || '[]') : [];
    const appliedJobIds = localStorage.getItem('appliedJobs') ? 
      JSON.parse(localStorage.getItem('appliedJobs') || '[]') : [];
    
    const updatedSavedIds = savedJobIds.filter((id: string) => id !== job.id);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedIds));
    
    if (!appliedJobIds.includes(job.id)) {
      localStorage.setItem('appliedJobs', JSON.stringify([...appliedJobIds, job.id]));
    }
    
    toast.success("Application submitted");
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/30">
      <Navbar />
      <main className="pt-16">
        <SavedAndAppliedJobs
          onSelect={handleJobSelect}
          selectedJobId={selectedJobId}
          savedJobs={savedJobs}
          appliedJobs={appliedJobs}
          onApply={handleApplyJob}
          onSave={handleSaveJob}
          variant="standalone"
        />
      </main>
    </div>
  );
};

export default MyJobs;
