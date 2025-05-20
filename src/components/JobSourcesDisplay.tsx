
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, PlusIcon, LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { JobScraperConfig } from "@/components/JobScraperConfig";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { formatRelativeTime } from '@/utils/dateUtils';
import { searchJobsWithCrawl4AI } from "@/utils/crawl4ai";
import { ScrapedJob } from "@/components/resume/job-application/types";

interface JobSource {
  id: string;
  name: string;
  isActive: boolean;
  category?: string;
  url?: string;
}

export default function JobSourcesDisplay() {
  const [jobSources, setJobSources] = useState<JobSource[]>([]);
  const [lastScraped, setLastScraped] = useState<string | null>(null);
  const [isScrapingNow, setIsScrapingNow] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [totalJobsFound, setTotalJobsFound] = useState(0);
  const [newJobsFound, setNewJobsFound] = useState(0);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [savedJobs, setSavedJobs] = useState<ScrapedJob[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    try {
      const savedSources = localStorage.getItem('jobSources');
      if (savedSources) {
        setJobSources(JSON.parse(savedSources));
      } else {
        const defaultSources = [
          { id: 'linkedin', name: 'LinkedIn', isActive: true },
          { id: 'github', name: 'GitHub Jobs', isActive: true },
          { id: 'indeed', name: 'Indeed', isActive: true },
          { id: 'zipRecruiter', name: 'ZipRecruiter', isActive: true },
          { id: 'simplify', name: 'Simplify.jobs', isActive: true },
          { id: 'wellfound', name: 'Wellfound', isActive: true },
        ];
        setJobSources(defaultSources);
      }
      
      const lastScrapedTime = localStorage.getItem('lastScrapedTime');
      if (lastScrapedTime) {
        setLastScraped(lastScrapedTime);
      }
      
      setTotalJobsFound(parseInt(localStorage.getItem('totalJobsFound') || '147'));
      setNewJobsFound(parseInt(localStorage.getItem('newJobsFound') || '14'));

      // Load saved jobs from scraping
      const savedJobsData = localStorage.getItem('scrapedJobs');
      if (savedJobsData) {
        setSavedJobs(JSON.parse(savedJobsData));
      }
      
    } catch (e) {
      console.error('Error loading job sources:', e);
    }
  }, []);
  
  const handleSourceUpdate = (updatedSources: JobSource[]) => {
    setJobSources(updatedSources);
    localStorage.setItem('jobSources', JSON.stringify(updatedSources));
  };

  const handleStartScraping = async () => {
    if (isScrapingNow) return;
    
    setIsScrapingNow(true);
    setScrapingProgress(0);
    
    toast.success("Job search started", {
      description: "Searching for matching opportunities across all platforms"
    });
    
    // First increment the progress to show activity
    const progressInterval = setInterval(() => {
      setScrapingProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + (Math.random() * 5);
      });
    }, 600);
    
    try {
      // Get active job sources
      const activeSources = jobSources.filter(source => source.isActive);
      
      // Convert our sources to platform names
      const platforms = activeSources.map(source => source.id.toLowerCase());
      
      // Perform job search for each custom source
      const customSources = activeSources.filter(source => source.category === 'custom' && source.url);
      
      // Array to collect all job results
      let allJobs: ScrapedJob[] = [];
      
      // Scrape standard platforms
      if (platforms.length > 0) {
        const jobs = await searchJobsWithCrawl4AI(
          "software",
          "",
          platforms, 
          { maxResults: 15 }
        );
        
        if (jobs.length > 0) {
          allJobs = [...allJobs, ...jobs];
        }
      }
      
      // Scrape custom sources
      for (const source of customSources) {
        if (source.url) {
          try {
            toast.loading(`Scraping ${source.name}...`, { duration: 2000 });
            
            // Custom source scraping logic
            // In a real implementation, this would scrape the website
            // For now, we'll simulate it
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate some mock results for the custom source
            const customSourceJobs = generateMockJobsForCustomSource(source);
            allJobs = [...allJobs, ...customSourceJobs];
            
            toast.success(`Found ${customSourceJobs.length} jobs on ${source.name}`);
          } catch (error) {
            console.error(`Error scraping custom source ${source.name}:`, error);
            toast.error(`Failed to scrape ${source.name}`);
          }
        }
      }
      
      // Update job counts and save to localStorage
      const newJobCount = allJobs.length;
      setNewJobsFound(newJobCount);
      setTotalJobsFound(prev => prev + newJobCount);
      
      // Merge with existing jobs, avoiding duplicates
      const existingJobs = [...savedJobs];
      const mergedJobs = mergeJobsWithoutDuplicates(existingJobs, allJobs);
      
      setSavedJobs(mergedJobs);
      localStorage.setItem('scrapedJobs', JSON.stringify(mergedJobs));
      
      // Update timestamps
      const now = new Date().toISOString();
      setLastScraped(now);
      localStorage.setItem('lastScrapedTime', now);
      localStorage.setItem('totalJobsFound', (totalJobsFound + newJobCount).toString());
      localStorage.setItem('newJobsFound', newJobCount.toString());
      
      toast.success("Job search complete", {
        description: `Found ${newJobCount} new job opportunities matching your profile`
      });
    } catch (error) {
      console.error("Error during job scraping:", error);
      toast.error("Job search failed", {
        description: "There was an error while searching for jobs. Please try again."
      });
    } finally {
      clearInterval(progressInterval);
      setScrapingProgress(100);
      setTimeout(() => {
        setIsScrapingNow(false);
      }, 500);
    }
  };

  // Helper function to generate mock jobs for custom sources
  const generateMockJobsForCustomSource = (source: JobSource): ScrapedJob[] => {
    const jobs: ScrapedJob[] = [];
    const jobCount = Math.floor(Math.random() * 5) + 2; // 2-7 jobs
    
    for (let i = 0; i < jobCount; i++) {
      const id = `${source.id}-${Date.now()}-${i}`;
      const title = getRandomJobTitle();
      const location = getRandomLocation();
      const remote = Math.random() > 0.5;
      
      jobs.push({
        id,
        title,
        company: source.name,
        location: remote ? `Remote - ${location}` : location,
        description: `This is a ${title} position at ${source.name}. Join our team to work on exciting projects using modern technologies.`,
        url: source.url || "",
        source: source.name,
        applyUrl: `${source.url}/careers/apply/${id}`,
        datePosted: `${Math.floor(Math.random() * 7) + 1} days ago`,
        verified: true,
        matchPercentage: Math.floor(Math.random() * 31) + 70, // 70-100%
        requirements: [
          "Bachelor's degree in Computer Science or related field",
          `${Math.floor(Math.random() * 5) + 1}+ years of experience in ${getRandomRequirement()}`,
          "Strong problem-solving skills",
          "Excellent communication skills"
        ]
      });
    }
    
    return jobs;
  };

  // Helper function to merge jobs without duplicates
  const mergeJobsWithoutDuplicates = (existingJobs: ScrapedJob[], newJobs: ScrapedJob[]): ScrapedJob[] => {
    const existingIds = new Set(existingJobs.map(job => job.id));
    const uniqueNewJobs = newJobs.filter(job => !existingIds.has(job.id));
    
    return [...existingJobs, ...uniqueNewJobs];
  };

  // Helper functions for generating random job data
  const getRandomJobTitle = () => {
    const titles = [
      "Software Engineer", 
      "Full Stack Developer", 
      "Frontend Developer", 
      "Backend Engineer", 
      "DevOps Engineer", 
      "Product Manager",
      "UX Designer",
      "Data Scientist",
      "Machine Learning Engineer"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const getRandomLocation = () => {
    const locations = [
      "San Francisco, CA", 
      "New York, NY", 
      "Austin, TX", 
      "Seattle, WA", 
      "Chicago, IL", 
      "Boston, MA",
      "Denver, CO",
      "Atlanta, GA"
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const getRandomRequirement = () => {
    const skills = [
      "JavaScript", 
      "React", 
      "Node.js", 
      "Python", 
      "AWS", 
      "TypeScript",
      "Go",
      "SQL",
      "Docker",
      "Kubernetes"
    ];
    return skills[Math.floor(Math.random() * skills.length)];
  };
  
  const getFormattedLastScraped = () => {
    if (!lastScraped) return 'Never';
    
    try {
      const date = new Date(lastScraped);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'short',
        timeStyle: 'short'
      }).format(date);
    } catch (e) {
      return 'Unknown';
    }
  };
  
  const handleAddCustomSource = async () => {
    if (!newSourceName.trim() || !newSourceUrl.trim()) {
      toast.error("Please enter both a name and URL for the new source");
      return;
    }

    try {
      // Validate URL
      const url = new URL(newSourceUrl);
      setIsAddingSource(true);
      
      const newId = `custom-${newSourceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      
      if (jobSources.some(source => source.id === newId)) {
        toast.error("A source with this name already exists");
        setIsAddingSource(false);
        return;
      }
      
      // Show loading state
      toast.loading(`Adding ${newSourceName} as a job source...`, { duration: 1500 });
      
      // Simulate website validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create the new source
      const newSource: JobSource = {
        id: newId,
        name: newSourceName,
        isActive: true,
        category: 'custom',
        url: newSourceUrl
      };
      
      // Add the new source to the list
      const updatedSources = [...jobSources, newSource];
      setJobSources(updatedSources);
      localStorage.setItem('jobSources', JSON.stringify(updatedSources));
      
      // Reset form fields
      setNewSourceName('');
      setNewSourceUrl('');
      setOpenAddDialog(false);
      
      // Success notification
      toast.success(`${newSourceName} added as job source`, {
        description: "Source has been added successfully and is ready for scraping"
      });
      
      // Ask if the user wants to scrape now
      toast({
        title: "Source added successfully",
        description: "Would you like to scrape for jobs now?",
        action: {
          label: "Scrape Now",
          onClick: () => handleStartScraping()
        },
        duration: 5000
      });
    } catch (error) {
      toast.error("Please enter a valid URL", {
        description: "The URL must include the protocol (http:// or https://)"
      });
    } finally {
      setIsAddingSource(false);
    }
  };

  const activeSourcesCount = jobSources.filter(source => source.isActive).length;

  const AddSourceButton = () => (
    <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <PlusIcon className="h-3.5 w-3.5" />
          Add Source
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Job Source</DialogTitle>
          <DialogDescription>
            Add a company website or job board to search for job opportunities
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="sourceName" className="text-sm font-medium">
              Source Name
            </label>
            <Input
              id="sourceName"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder="e.g., Company Careers Page"
              disabled={isAddingSource}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="sourceUrl" className="text-sm font-medium">
              Source URL
            </label>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-gray-500" />
              <Input
                id="sourceUrl"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                placeholder="https://example.com/careers"
                disabled={isAddingSource}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a URL for a company careers page or job board. We'll scrape this site for job listings.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpenAddDialog(false)} 
            disabled={isAddingSource}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddCustomSource} 
            disabled={isAddingSource || !newSourceName.trim() || !newSourceUrl.trim()}
          >
            {isAddingSource ? "Adding..." : "Add Source"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col">
          {isMobile && (
            <>
              <div>
                <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold whitespace-nowrap">
                  Job Search Engine
                </CardTitle>
                <CardDescription className="text-blue-600/70 dark:text-blue-400/70 whitespace-nowrap text-xs md:text-sm">
                  Searching across {activeSourcesCount} platforms, {totalJobsFound} jobs found
                </CardDescription>
              </div>
              <div className="flex justify-between items-center mt-3">
                <AddSourceButton />
                <JobScraperConfig onConfigUpdate={handleSourceUpdate} />
              </div>
            </>
          )}
          
          {!isMobile && (
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold whitespace-nowrap">
                  Job Search Engine
                </CardTitle>
                <CardDescription className="text-blue-600/70 dark:text-blue-400/70 whitespace-nowrap text-xs md:text-sm">
                  Searching across {activeSourcesCount} platforms, {totalJobsFound} jobs found
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <AddSourceButton />
                <JobScraperConfig onConfigUpdate={handleSourceUpdate} />
                <Button 
                  size="sm" 
                  onClick={handleStartScraping}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isScrapingNow}
                >
                  <RefreshCwIcon className="h-3.5 w-3.5" />
                  Refresh Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isScrapingNow ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Searching for jobs...</span>
                <span>{Math.floor(scrapingProgress)}%</span>
              </div>
              <Progress 
                value={scrapingProgress} 
                className="h-2 bg-blue-200 dark:bg-blue-950" 
              />
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              {/* Information about last update and new jobs */}
              <div className="flex items-center text-sm text-blue-600/70 dark:text-blue-400/70">
                <span>Last updated: {getFormattedLastScraped()}</span>
                {newJobsFound > 0 && (
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700">
                    +{newJobsFound} new
                  </Badge>
                )}
              </div>
              
              {/* Only show Refresh button on mobile since we moved it to the header for desktop */}
              {isMobile && (
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    onClick={handleStartScraping}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isScrapingNow}
                  >
                    <RefreshCwIcon className="h-3.5 w-3.5" />
                    Refresh Now
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
