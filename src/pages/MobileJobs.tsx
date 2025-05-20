import { useState, useEffect } from 'react';
import MobileHeader from "@/components/MobileHeader";
import { MobileJobDetail } from "@/components/MobileJobDetail";
import { MobileJobList } from "@/components/MobileJobList";
import { Job } from "@/types/job";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import JobAutomationPanel from "@/components/jobs/JobAutomationPanel";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const MobileJobs = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [showAutomationDialog, setShowAutomationDialog] = useState(false);
  
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

  // Toggle automation dialog
  const toggleAutomationDialog = () => {
    setShowAutomationDialog(!showAutomationDialog);
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Available Positions</h2>
              <Button variant="outline" size="sm" onClick={toggleAutomationDialog} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Application Automation
              </Button>
            </div>
            
            <MobileJobList 
              jobs={jobs}
              savedJobIds={savedJobIds}
              appliedJobIds={appliedJobIds}
              onSelect={handleJobSelect}
              onSave={handleSaveJob}
              onApply={handleApplyJob}
            />
          </div>
        )}
        
        {/* Application Automation Dialog */}
        <Dialog open={showAutomationDialog} onOpenChange={setShowAutomationDialog}>
          <DialogContent className="sm:max-w-[95%] md:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Application Automation</DialogTitle>
            </DialogHeader>
            <JobAutomationPanel />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default MobileJobs;
