
import { useState, useEffect } from 'react';
import MobileHeader from "@/components/MobileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobAutomationPanel from "@/components/jobs/JobAutomationPanel";
import { MobileJobDetail } from "@/components/MobileJobDetail";
import { MobileJobList } from "@/components/MobileJobList";
import { Button } from "@/components/ui/button";
import { Job } from "@/types/job";
import { toast } from "sonner";
import { Settings } from "lucide-react";

const MobileJobs = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'automation'>('browse');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Sample jobs or fetch from API
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  
  // Load saved jobs on component mount
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem('savedJobs');
      if (savedJobs) {
        setSavedJobIds(JSON.parse(savedJobs));
      }

      const appliedJobs = localStorage.getItem('appliedJobs');
      if (appliedJobs) {
        setAppliedJobIds(JSON.parse(appliedJobs));
      }
      
      // For demonstration, generate some sample jobs
      const sampleJobs = generateSampleJobs(5);
      setJobs(sampleJobs);
    } catch (error) {
      console.error("Error loading saved jobs:", error);
    }
  }, []);
  
  // Handle job selection
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setShowDetail(true);
  };
  
  // Handle going back from job detail view
  const handleBack = () => {
    setShowDetail(false);
  };
  
  // Handle saving a job
  const handleSaveJob = (job: Job) => {
    // Add or remove from saved jobs
    const jobId = job.id;
    setSavedJobIds(prev => {
      const newSavedJobs = prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId];
      
      // Save to localStorage
      localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
      
      return newSavedJobs;
    });
    
    // Show toast notification
    if (savedJobIds.includes(jobId)) {
      toast.success("Job removed from saved jobs");
    } else {
      toast.success("Job saved successfully");
    }
  };
  
  // Handle applying to a job
  const handleApplyJob = (job: Job) => {
    // Add to applied jobs if not already applied
    const jobId = job.id;
    if (!appliedJobIds.includes(jobId)) {
      const newAppliedJobs = [...appliedJobIds, jobId];
      setAppliedJobIds(newAppliedJobs);
      
      // Save to localStorage
      localStorage.setItem('appliedJobs', JSON.stringify(newAppliedJobs));
      
      // Show toast notification
      toast.success("Application submitted successfully");
    } else {
      toast.info("You've already applied to this job");
    }
  };

  // Helper function to generate sample jobs
  const generateSampleJobs = (count: number): Job[] => {
    const now = new Date();
    return Array.from({ length: count }, (_, i) => ({
      id: `sample-job-${i}`,
      title: `Software Engineer ${i+1}`,
      company: `Sample Company ${i+1}`,
      location: 'San Francisco, CA',
      salary: {
        min: 120000,
        max: 180000,
        currency: 'USD',
      },
      type: 'full-time',
      level: 'mid',
      description: 'Exciting opportunity to work on cutting-edge technology.',
      requirements: ['5+ years of experience', 'BS in Computer Science'],
      postedAt: `${i} days ago`,
      skills: ['JavaScript', 'React', 'Node.js'],
      matchPercentage: Math.floor(Math.random() * 100),
      workModel: 'hybrid',
      benefits: ['Health insurance', 'Remote work options', '401k']
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900/30">
      <MobileHeader title="Jobs" />
      
      <main className="flex-1 pt-16 pb-16">
        {showDetail && selectedJob ? (
          <MobileJobDetail 
            job={selectedJob}
            onBack={handleBack}
            onApply={handleApplyJob}
            onSave={handleSaveJob}
            isSaved={savedJobIds.includes(selectedJob.id)}
            isApplied={appliedJobIds.includes(selectedJob.id)}
          />
        ) : (
          <div className="container px-4 py-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'browse' | 'automation')} className="space-y-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
                <TabsTrigger value="automation">Application Automation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="browse" className="space-y-4">
                <MobileJobList 
                  jobs={jobs}
                  savedJobIds={savedJobIds}
                  appliedJobIds={appliedJobIds}
                  onSelect={handleJobSelect}
                  onSave={handleSaveJob}
                  onApply={handleApplyJob}
                />
              </TabsContent>
              
              <TabsContent value="automation">
                <JobAutomationPanel />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default MobileJobs;
