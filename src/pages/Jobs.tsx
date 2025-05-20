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
import { Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobSourcesDisplay from "@/components/JobSourcesDisplay";
import { Card } from "@/components/ui/card";
import { ScrapedJob } from "@/components/resume/job-application/types";
import JobScraper from "@/components/resume/job-application/JobScraper";
import JobAutomationPanel from "@/components/jobs/JobAutomationPanel";
import { startAutomation } from "@/utils/automationUtils";
import { isMobileApp } from "@/utils/mobileUtils";
import { jobScraper } from "@/utils/jobScraperService";

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
  const [jobs, setJobs] = useState<Job[]>([]);
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
  const [showJobScraperInterface, setShowJobScraperInterface] = useState(false);
  const [scrapedJobs, setScrapedJobs] = useState<ScrapedJob[]>([]);
  const [automationEnabled, setAutomationEnabled] = useState<boolean>(false);
  const [automationConfig, setAutomationConfig] = useState<any>(null);
  const [showAutomationPanel, setShowAutomationPanel] = useState<boolean>(false);
  const [isNativeMobileApp, setIsNativeMobileApp] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalJobCount, setTotalJobCount] = useState<number>(0);

  useEffect(() => {
    // Check if this is running in a native mobile app
    const checkMobileApp = async () => {
      const mobileAppStatus = await isMobileApp();
      setIsNativeMobileApp(mobileAppStatus);
    };
    
    checkMobileApp();
    
    // Load saved and applied jobs
    const savedJobs = localStorage.getItem('savedJobs');
    if (savedJobs) {
      setSavedJobIds(JSON.parse(savedJobs));
    }

    const appliedJobs = localStorage.getItem('appliedJobs');
    if (appliedJobs) {
      setAppliedJobIds(JSON.parse(appliedJobs));
    }

    // Load automation configuration if available
    const automationConfigStr = localStorage.getItem('automationConfig');
    if (automationConfigStr) {
      try {
        setAutomationConfig(JSON.parse(automationConfigStr));
        setAutomationEnabled(true);
      } catch (error) {
        console.error("Error parsing automation config:", error);
      }
    }
    
    // Load initial jobs from the job scraper service
    loadInitialJobs();

    // Setup message listener for Chrome extension communication
    const handleExtensionMessage = (event: MessageEvent) => {
      // Check if the message is from our extension
      if (event.data && event.data.type === 'EXTENSION_INSTALLED') {
        setAutomationEnabled(true);
        toast.success("Job Automation Extension connected");
      }
      
      // Handle automation status updates
      if (event.data && event.data.type === 'AUTOMATION_STATUS') {
        toast(event.data.status, {
          description: event.data.message || "Job application automation in progress",
        });
      }
    };

    window.addEventListener('message', handleExtensionMessage);

    return () => {
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, []);
  
  /**
   * Load initial jobs from the job scraper service
   */
  const loadInitialJobs = async () => {
    setIsLoading(true);
    
    try {
      // Get all cached jobs from the scraper service
      const allScrapedJobs = jobScraper.getAllJobs();
      
      if (allScrapedJobs.length === 0) {
        // If no cached jobs, scrape a default set
        await jobScraper.scrapeJobs("software engineer", "");
        const freshJobs = jobScraper.getAllJobs();
        setScrapedJobs(freshJobs);
        processScrapedJobs(freshJobs);
        setTotalJobCount(freshJobs.length);
      } else {
        // Use cached jobs
        setScrapedJobs(allScrapedJobs);
        processScrapedJobs(allScrapedJobs);
        setTotalJobCount(allScrapedJobs.length);
      }
    } catch (error) {
      console.error("Error loading initial jobs:", error);
      toast.error("Failed to load job listings");
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Process scraped jobs into our Job type
   */
  const processScrapedJobs = (scrapedJobs: ScrapedJob[]) => {
    const convertedJobs = scrapedJobs.map((scrapedJob): Job => 
      jobScraper.convertScrapedJobToJob(scrapedJob)
    );
    
    setJobs(convertedJobs);
    
    if (convertedJobs.length > 0) {
      toast.success(`Found ${convertedJobs.length} jobs`);
    }
  };

  useEffect(() => {
    // Save jobs to localStorage when they change
    localStorage.setItem('savedJobs', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    localStorage.setItem('appliedJobs', JSON.stringify(appliedJobIds));
  }, [appliedJobIds]);

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
      toast.success("Job removed from saved listings!");
    } else {
      setSavedJobIds(prev => [...prev, jobId]);
      toast.success("Job saved!");
    }
  };

  const handleApplyJob = (job: Job) => {
    const jobId = job.id;
    
    // If already applied, show notification
    if (appliedJobIds.includes(jobId)) {
      toast("You have already applied for this job!");
      return;
    }
    
    // Check if automation is enabled and config is available
    if (automationEnabled && automationConfig && job.applyUrl) {
      // Try to start automation process
      try {
        startAutomation(job.applyUrl, automationConfig);
        
        // Add to applied jobs
        setAppliedJobIds(prev => [...prev, jobId]);
        toast.success("Application process started", {
          description: "The browser extension will handle the application process"
        });
      } catch (error) {
        console.error("Error starting automation:", error);
        // Fall back to manual apply
        setAppliedJobIds(prev => [...prev, jobId]);
        toast.success("Job applied!");
      }
    } else {
      // Regular apply process
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

  const handleSkipJob = () => {
    // This function doesn't need parameters as specified by SwipeJobsInterface props
    toast.info("Job skipped");
  };
  
  const handleJobsScraped = (newScrapedJobs: ScrapedJob[]) => {
    setScrapedJobs(newScrapedJobs);
    processScrapedJobs(newScrapedJobs);
    setTotalJobCount(newScrapedJobs.length);
    
    // If automation is enabled, check for auto-apply opportunities
    if (automationEnabled && automationConfig && automationConfig.autoApplyEnabled) {
      // Find the best matching jobs
      const bestMatches = newScrapedJobs
        .sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0))
        .slice(0, 3);
        
      for (const match of bestMatches) {
        if (match && match.applyUrl && match.matchPercentage && match.matchPercentage > 85) {
          toast(`${match.title} at ${match.company} is a ${match.matchPercentage}% match.`, {
            action: {
              label: "Auto Apply",
              onClick: () => {
                const convertedJob = jobScraper.convertScrapedJobToJob(match);
                handleApplyJob(convertedJob);
              }
            },
            duration: 8000
          });
          // Just show one for now
          break;
        }
      }
    }
  };
  
  // Apply filters to jobs
  const filteredJobs = jobs.filter(job => {
    // Search filter (title, company, description)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        job.title.toLowerCase().includes(searchLower) || 
        job.company.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Location filter
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    // Remote filter
    if (filters.remote && !job.remote && job.workModel !== 'remote') {
      return false;
    }
    
    // Job type filter
    if (filters.jobType && filters.jobType.length > 0 && !filters.jobType.includes(job.type)) {
      return false;
    }
    
    // Experience level filter
    if (filters.experienceLevels && filters.experienceLevels.length > 0 && !filters.experienceLevels.includes(job.level)) {
      return false;
    }
    
    // Salary range filter
    if (filters.salaryRange && (job.salary.min < filters.salaryRange[0] || job.salary.max > filters.salaryRange[1])) {
      return false;
    }
    
    // Company type filter
    if (filters.companyTypes && filters.companyTypes.length > 0 && job.companyType && !filters.companyTypes.includes(job.companyType)) {
      return false;
    }
    
    return true;
  });
  
  // Sort filtered jobs based on sort preference
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (!filters.sort || filters.sort === 'relevance') {
      // Sort by match percentage (highest first) if available, otherwise keep original order
      return (b.matchPercentage || 0) - (a.matchPercentage || 0);
    }
    
    if (filters.sort === 'date-newest') {
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    }
    
    if (filters.sort === 'date-oldest') {
      return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
    }
    
    if (filters.sort === 'salary-highest') {
      return b.salary.max - a.salary.max;
    }
    
    if (filters.sort === 'salary-lowest') {
      return a.salary.min - b.salary.min;
    }
    
    return 0;
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
          
          {/* Job Sources */}
          <div className="w-full mb-6">
            <JobSourcesDisplay />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className="space-y-6">
                <JobFiltersSection onApplyFilters={handleFilterChange} />
                
                {/* Job Automation Panel */}
                <JobAutomationPanel />
              </div>
            </div>
            <div className="md:col-span-3">
              {/* Job Scraper Toggle */}
              <div className="flex justify-end mb-4">
                <Button 
                  variant={showJobScraperInterface ? "default" : "outline"} 
                  onClick={() => setShowJobScraperInterface(!showJobScraperInterface)}
                >
                  {showJobScraperInterface ? "Hide Job Search" : "Search Jobs"}
                </Button>
              </div>
              
              {/* Job Scraper Interface */}
              {showJobScraperInterface && (
                <Card className="mb-6 p-4">
                  <JobScraper onJobsScraped={handleJobsScraped} />
                </Card>
              )}

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                  {isLoading ? "Loading jobs..." : `${sortedJobs.length} Opportunities`}
                  <span className="text-sm text-gray-500 ml-2">from {totalJobCount} total jobs</span>
                </h2>
                {/* Only show swipe view button on mobile app */}
                {sortedJobs.length > 3 && isNativeMobileApp && (
                  <Button variant="outline" onClick={handleShowSwipeInterface}>
                    Try Swipe View
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg w-full max-w-3xl" />
                    ))}
                  </div>
                </div>
              ) : showSwipeInterface && isNativeMobileApp ? (
                <SwipeJobsInterface
                  jobs={sortedJobs}
                  onApply={handleApplyJob}
                  onSkip={handleSkipJob}
                  onSave={(job) => handleSaveJob(job)}
                  onClose={handleCloseSwipeInterface}
                />
              ) : (
                <div className="space-y-4">
                  {sortedJobs.length > 0 ? (
                    sortedJobs.map(job => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onClick={() => handleJobSelect(job)}
                        isSaved={savedJobIds.includes(job.id)}
                        onSave={() => handleSaveJob(job)}
                        isApplied={appliedJobIds.includes(job.id)}
                        onApply={() => handleApplyJob(job)}
                        showMatchScore={true}
                      />
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500 dark:text-gray-400">No jobs found matching your criteria.</p>
                      <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters or search for different keywords.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Job Detail View (as a modal for mobile, side panel for desktop) */}
          {selectedJob && isDetailOpen && (
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${isMobile ? '' : 'p-6'}`}>
              <div className={`bg-white rounded-lg shadow-xl overflow-hidden ${isMobile ? 'w-full h-full' : 'w-3/4 max-w-4xl max-h-[90vh]'}`} ref={detailViewRef}>
                <JobDetailView
                  job={selectedJob}
                  onClose={handleCloseDetail}
                  onSave={() => handleSaveJob(selectedJob)}
                  onApply={() => handleApplyJob(selectedJob)}
                  isSaved={savedJobIds.includes(selectedJob.id)}
                  isApplied={appliedJobIds.includes(selectedJob.id)}
                  isMobile={isMobile}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Jobs;
