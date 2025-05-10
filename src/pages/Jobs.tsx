
import { useState, useEffect, useRef } from 'react';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { Job, JobFilters } from "@/types/job";
import { JobDetailView } from "@/components/JobDetailView";
import { JobFiltersSection } from "@/components/JobFilters";
import { JobCard } from "@/components/JobCard";
import { useMobile } from "@/hooks/use-mobile";
import SwipeJobsInterface from "@/components/SwipeJobsInterface";
import { SavedAndAppliedJobs } from "@/components/SavedAndAppliedJobs";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobSourcesDisplay from "@/components/JobSourcesDisplay";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobAutomationPanel from "@/components/jobs/JobAutomationPanel";
import { ScrapedJob } from "@/components/resume/job-application/types";

const generateSampleJobs = (count: number = 10): Job[] => {
  const now = new Date();
  
  // Helper function to generate random date strings in the proper format
  const getRandomDate = () => {
    const days = Math.floor(Math.random() * 30); // Random number of days in the past (0-30)
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    // Return a formatted date string or ISO string
    return date.toISOString();
  };
  
  return Array.from({ length: count }, (_, i) => ({
    id: `sample-job-${i}`,
    title: `Software Engineer ${i}`,
    company: `Sample Company ${i}`,
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
    postedAt: getRandomDate(),
    skills: ['JavaScript', 'React', 'Node.js'],
    matchPercentage: Math.floor(Math.random() * 100),
  }));
};

const jobsData: Job[] = generateSampleJobs(15);

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>(jobsData);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    location: '',
    jobType: [],
    remote: false,
    experienceLevels: [],
    education: [],
    salaryRange: [0, 200000],
    skills: [],
    companyTypes: [],
    companySize: [],
    benefits: [],
  });
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [showSwipeInterface, setShowSwipeInterface] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const isMobile = useMobile();
  const detailViewRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'automation'>('browse');
  const [scrapedJobs, setScrapedJobs] = useState<ScrapedJob[]>([]);

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
          // Convert scraped jobs to regular job format
          const convertedJobs = parsedJobs.map(convertScrapedJobToJob);
          setJobs(prev => [...convertedJobs, ...prev]);
          
          toast.info(`${parsedJobs.length} previously scraped jobs available`, {
            description: "These jobs have been added to your browse list",
            duration: 3000
          });
        }
      } catch (error) {
        console.error('Error parsing scraped jobs:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

   useEffect(() => {
    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobIds));
  }, [appliedJobIds]);

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
    
    // Convert scraped jobs to regular jobs format for display
    const convertedJobs = newScrapedJobs.map(convertScrapedJobToJob);
    setJobs(prev => [...convertedJobs, ...prev]);
    
    toast.success(`Found ${newScrapedJobs.length} jobs`, {
      description: "Jobs have been added to your browse list"
    });
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
    if (detailViewRef.current) {
      detailViewRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (newFilters: Partial<JobFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleSaveJob = (job: Job) => {
    const jobId = job.id;
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(prev => prev.filter(id => id !== jobId));
      toast.success("Job unsaved!");
    } else {
      setSavedJobIds(prev => [...prev, jobId]);
      toast.success("Job saved!");
    }
  };

  const handleApplyJob = (job: Job) => {
     const jobId = job.id;
    if (appliedJobIds.includes(jobId)) {
       toast("You have already applied for this job!", {
        duration: 4000,
      });
    } else {
      setAppliedJobIds(prev => [...prev, jobId]);
       toast.success("Job applied!");
    }
  };

  const handleShowSwipeInterface = () => {
    setShowSwipeInterface(true);
  };

  const handleCloseSwipeInterface = () => {
    setShowSwipeInterface(false);
  };

  // This function now handles individual actions rather than being called by SwipeJobsInterface
  const handleSwipeAction = (action: 'save' | 'apply' | 'skip', job?: Job) => {
    if (!job && (action === 'save' || action === 'apply')) {
      return; // Can't save or apply without a job
    }
    
    if (action === 'save' && job) {
      handleSaveJob(job);
    } else if (action === 'apply' && job) {
      handleApplyJob(job);
    } else if (action === 'skip') {
      // Skip logic doesn't need a job parameter
      toast.info("Job skipped");
    }
  };

  // Create a skip function that matches the expected signature in SwipeJobsInterface
  const handleSkipJob = () => {
    // This function doesn't need parameters as specified by SwipeJobsInterface props
    toast.info("Job skipped");
  };

  const filteredJobs = jobs.filter(job => {
    if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase()) && !job.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900/30">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      <main className={`flex-1 ${isMobile ? 'pt-16' : 'pt-20'}`}>
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Find Your Next Opportunity
            </h1>
          </div>
          
          {/* Tabs to switch between job browsing and job automation */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'browse' | 'automation')} className="space-y-6">
            <TabsList className="w-full md:w-auto mb-2">
              <TabsTrigger value="browse" className="flex-1 md:flex-none">Browse Jobs</TabsTrigger>
              <TabsTrigger value="automation" className="flex-1 md:flex-none">Application Automation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse" className="space-y-6">
              {/* Job browsing content */}
              <div className="w-full">
                <JobSourcesDisplay onJobsScraped={handleJobsScraped} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                  <JobFiltersSection onApplyFilters={handleFilterChange} />
                </div>
                <div className="md:col-span-3">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                      {filteredJobs.length} Opportunities
                    </h2>
                    {filteredJobs.length > 3 && (
                      <Button variant="outline" onClick={handleShowSwipeInterface}>
                        Try Swipe View
                      </Button>
                    )}
                  </div>

                  {showSwipeInterface ? (
                    <SwipeJobsInterface
                      jobs={filteredJobs}
                      onApply={handleApplyJob}
                      onSkip={handleSkipJob}
                    />
                  ) : (
                    <div className="space-y-4">
                      {filteredJobs.map(job => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onClick={() => handleJobSelect(job)}
                          isSaved={savedJobIds.includes(job.id)}
                          onSave={() => handleSaveJob(job)}
                          isApplied={appliedJobIds.includes(job.id)}
                          onApply={() => handleApplyJob(job)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="automation">
              {/* Job automation content */}
              <JobAutomationPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
