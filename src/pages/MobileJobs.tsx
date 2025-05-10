
import { useState, useEffect } from 'react';
import MobileHeader from "@/components/MobileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobAutomationPanel from "@/components/jobs/JobAutomationPanel";
import { MobileJobDetail } from "@/components/MobileJobDetail";
import { MobileJobList } from "@/components/MobileJobList";
import { Job } from "@/types/job";
import { ScrapedJob } from "@/components/resume/job-application/types";
import { toast } from "sonner";

const MobileJobs = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'automation'>('browse');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Sample jobs or fetch from API
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  
  // Job scraping integration
  const [showScraperResults, setShowScraperResults] = useState(false);
  const [scrapedJobs, setScrapedJobs] = useState<ScrapedJob[]>([]);
  
  // Load saved jobs and settings from localStorage on component mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('savedJobs');
    if (savedJobs) {
      setSavedJobIds(JSON.parse(savedJobs));
    }

    const appliedJobs = localStorage.getItem('appliedJobs');
    if (appliedJobs) {
      setAppliedJobIds(JSON.parse(appliedJobs));
    }
    
    // Check for any scraped jobs that might be available in localStorage
    const savedScrapedJobs = localStorage.getItem('scrapedJobs');
    if (savedScrapedJobs) {
      try {
        const parsedJobs = JSON.parse(savedScrapedJobs);
        if (parsedJobs.length > 0) {
          setScrapedJobs(parsedJobs);
          // If we have scraped jobs, show a notification to the user
          toast.info(`${parsedJobs.length} previously scraped jobs available`, {
            description: "Switch to 'Scraped Jobs' to view them",
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Error parsing scraped jobs:', error);
      }
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
    setSavedJobIds(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };
  
  // Handle applying to a job
  const handleApplyJob = (job: Job) => {
    // Add to applied jobs if not already applied
    const jobId = job.id;
    if (!appliedJobIds.includes(jobId)) {
      setAppliedJobIds(prev => [...prev, jobId]);
    }
  };
  
  // Convert ScrapedJob to Job format for compatibility
  const convertScrapedJobToJob = (scrapedJob: ScrapedJob): Job => {
    return {
      id: scrapedJob.id,
      title: scrapedJob.title,
      company: scrapedJob.company,
      location: scrapedJob.location,
      description: scrapedJob.description,
      type: 'full-time', // Default value
      level: 'mid', // Default value
      postedAt: scrapedJob.datePosted,
      requirements: scrapedJob.requirements || [],
      skills: scrapedJob.matchKeywords || [],
      matchPercentage: scrapedJob.matchPercentage,
      salary: {
        min: 0,
        max: 0,
        currency: 'USD'
      },
      keywordMatch: scrapedJob.keywordMatch,
      applyUrl: scrapedJob.applyUrl,
      source: scrapedJob.source
    };
  };
  
  // Handle job scraping results
  const handleJobsScraped = (newScrapedJobs: ScrapedJob[]) => {
    setScrapedJobs(newScrapedJobs);
    setShowScraperResults(true);
    
    // Convert scraped jobs to regular jobs format for display
    const convertedJobs = newScrapedJobs.map(convertScrapedJobToJob);
    setJobs(prev => [...convertedJobs, ...prev]);
    
    toast.success(`Found ${newScrapedJobs.length} jobs`, {
      description: "Jobs have been added to your browse list"
    });
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
                  onJobsScraped={handleJobsScraped}
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
