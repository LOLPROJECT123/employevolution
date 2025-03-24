import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { Job } from "@/types/job";
import { JobDetailView } from "@/components/JobDetailView";
import { JobFiltersSection } from "@/components/JobFilters";
import { JobCard } from "@/components/JobCard";
import { useIsMobile } from "@/hooks/use-mobile";
import SwipeJobsInterface from "@/components/SwipeJobsInterface";
import { SavedAndAppliedJobs } from "@/components/SavedAndAppliedJobs";
import { toast } from "sonner";
import AutomationSettings from "@/components/AutomationSettings";
import Zap from "@/components/Zap";
import Button from "@/components/Button";

const sampleJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    salary: {
      min: 150000,
      max: 220000,
      currency: '$'
    },
    type: 'full-time',
    level: 'senior',
    description: 'We are looking for a Senior Software Engineer...',
    requirements: ['5+ years experience', 'React', 'Node.js'],
    postedAt: new Date().toISOString(),
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
    applyUrl: 'https://joinhandshake.com/jobs/example1'
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'InnovateCo',
    location: 'New York, NY',
    salary: {
      min: 130000,
      max: 180000,
      currency: '$'
    },
    type: 'full-time',
    level: 'mid',
    description: 'Seeking an experienced Product Manager...',
    requirements: ['3+ years experience', 'Agile', 'Technical background'],
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis'],
    applyUrl: 'https://linkedin.com/jobs/example2'
  }
];

const Jobs = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(sampleJobs);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [showAutomation, setShowAutomation] = useState(false);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'list' | 'swipe'>(isMobile ? 'swipe' : 'list');
  const [showMyJobs, setShowMyJobs] = useState(false);

  useEffect(() => {
    setViewMode(isMobile ? 'swipe' : 'list');
  }, [isMobile]);

  const savedJobs = jobs.filter(job => savedJobIds.includes(job.id));
  const appliedJobs = jobs.filter(job => appliedJobIds.includes(job.id));

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleSaveJob = (job: Job) => {
    if (savedJobIds.includes(job.id)) {
      setSavedJobIds(savedJobIds.filter(id => id !== job.id));
      toast.info("Job removed from saved jobs");
    } else {
      setSavedJobIds([...savedJobIds, job.id]);
      toast.success("Job saved successfully");
    }
  };

  const handleApplyJob = (job: Job) => {
    if (!appliedJobIds.includes(job.id)) {
      setAppliedJobIds([...appliedJobIds, job.id]);
      
      const canAutomate = job.applyUrl ? detectPlatform(job.applyUrl) !== null : false;
      const automationEnabled = (() => {
        try {
          const config = JSON.parse(localStorage.getItem('automationConfig') || '{}');
          return config?.credentials?.enabled || false;
        } catch (e) {
          return false;
        }
      })();
      
      if (!isMobile && job.applyUrl) {
        if (canAutomate && automationEnabled) {
          setShowAutomation(true);
          toast.success("Automation Available", {
            description: "You can use the automation tools to apply to this job automatically."
          });
        } else {
          window.open(job.applyUrl, '_blank');
          toast.success("Opening application page", {
            description: "The application page has been opened in a new tab."
          });
        }
      } else {
        toast.success("Application submitted successfully", {
          description: `Your application to ${job.company} for ${job.title} has been submitted.`
        });
      }
      
      if (viewMode === 'swipe') {
        const currentIndex = filteredJobs.findIndex(j => j.id === job.id);
        if (currentIndex < filteredJobs.length - 1) {
          setSelectedJob(filteredJobs[currentIndex + 1]);
        }
      }
    }
  };

  const handleAutomatedApply = (job: Job) => {
    try {
      if (!job.applyUrl) {
        toast.error("Cannot automate application", {
          description: "This job doesn't have an application URL."
        });
        return;
      }
      
      const automationConfig = localStorage.getItem('automationConfig');
      if (!automationConfig) {
        toast.error("Automation not configured", {
          description: "Please configure your automation settings first."
        });
        return;
      }
      
      const config = JSON.parse(automationConfig);
      
      startAutomation(job.applyUrl, config);
      
      const platform = detectPlatform(job.applyUrl);
      
      toast.success("Automation initiated", {
        description: `The automation script will now apply to this job on ${platform || 'the job platform'}. Please check the browser extension for details.`
      });
    } catch (error) {
      toast.error("Automation failed", {
        description: "There was an error starting the automation process."
      });
      console.error("Automation error:", error);
    }
  };

  const handleSkipJob = (job: Job) => {
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'swipe' : 'list');
  };

  const toggleMyJobs = () => {
    setShowMyJobs(!showMyJobs);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Find Jobs</h1>
            <div className="hidden md:block">
              <AutomationSettings />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
              <JobFiltersSection />
              
              {isMobile && (
                <div className="mt-4 space-y-3">
                  <button 
                    onClick={toggleViewMode}
                    className="w-full py-2 px-4 rounded-md bg-primary text-white font-medium"
                  >
                    Switch to {viewMode === 'list' ? 'Swipe' : 'List'} View
                  </button>
                  
                  <button 
                    onClick={toggleMyJobs}
                    className="w-full py-2 px-4 rounded-md bg-secondary text-foreground font-medium border"
                  >
                    {showMyJobs ? 'Browse Jobs' : 'My Saved & Applied Jobs'}
                  </button>
                  
                  <div className="mt-2">
                    <AutomationSettings />
                  </div>
                </div>
              )}
              
              {isMobile && showMyJobs ? (
                <div className="mt-6">
                  <SavedAndAppliedJobs
                    savedJobs={savedJobs}
                    appliedJobs={appliedJobs}
                    onApply={handleApplyJob}
                    onSave={handleSaveJob}
                    onSelect={handleJobSelect}
                    selectedJobId={selectedJob?.id || null}
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {!isMobile && (
                    <SavedAndAppliedJobs
                      savedJobs={savedJobs}
                      appliedJobs={appliedJobs}
                      onApply={handleApplyJob}
                      onSave={handleSaveJob}
                      onSelect={handleJobSelect}
                      selectedJobId={selectedJob?.id || null}
                    />
                  )}
                  
                  {(viewMode === 'list' || !isMobile) && (
                    <>
                      <h2 className="text-lg font-medium">Browse Jobs</h2>
                      <div className="space-y-4">
                        {filteredJobs.map(job => (
                          <JobCard 
                            key={job.id}
                            job={job}
                            onApply={handleApplyJob}
                            isSelected={selectedJob?.id === job.id}
                            isSaved={savedJobIds.includes(job.id)}
                            isApplied={appliedJobIds.includes(job.id)}
                            onClick={() => handleJobSelect(job)}
                            onSave={() => handleSaveJob(job)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-full md:w-2/3 lg:w-3/4 mt-6 md:mt-0">
              {viewMode === 'swipe' && isMobile ? (
                <SwipeJobsInterface 
                  jobs={filteredJobs}
                  onApply={handleApplyJob}
                  onSkip={handleSkipJob}
                />
              ) : (
                <JobDetailView 
                  job={selectedJob} 
                  onApply={handleApplyJob}
                  onSave={handleSaveJob}
                />
              )}
              
              {showAutomation && selectedJob && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Automated Application
                    </h3>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAutomation(false)}
                    >
                      Close
                    </Button>
                  </div>
                  
                  <p className="text-sm mb-3">
                    Use automation to apply to this job at {selectedJob.company} automatically.
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleAutomatedApply(selectedJob)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Run Automation Script
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedJob.applyUrl, '_blank')}
                    >
                      Apply Manually
                    </Button>
                    
                    <div className="ml-auto">
                      <AutomationSettings />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
