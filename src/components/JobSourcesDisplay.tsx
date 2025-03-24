
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, SearchIcon, DatabaseIcon } from "lucide-react";
import { toast } from "sonner";
import { JobScraperConfig } from "@/components/JobScraperConfig";

interface JobSource {
  id: string;
  name: string;
  isActive: boolean;
  category?: string;
}

export default function JobSourcesDisplay() {
  // These would come from the backend in a real app
  const [jobSources, setJobSources] = useState<JobSource[]>([]);
  const [lastScraped, setLastScraped] = useState<string | null>(null);
  const [isScrapingNow, setIsScrapingNow] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [totalJobsFound, setTotalJobsFound] = useState(0);
  const [newJobsFound, setNewJobsFound] = useState(0);

  useEffect(() => {
    // Load job sources from localStorage
    try {
      const savedSources = localStorage.getItem('jobSources');
      if (savedSources) {
        setJobSources(JSON.parse(savedSources));
      } else {
        // Default to initial sources in JobScraperConfig if nothing saved
        const defaultSources = [
          { id: 'linkedin', name: 'LinkedIn', isActive: true },
          { id: 'github', name: 'GitHub Jobs', isActive: true },
          { id: 'indeed', name: 'Indeed', isActive: true },
          { id: 'zipRecruiter', name: 'ZipRecruiter', isActive: true },
        ];
        setJobSources(defaultSources);
      }
      
      const lastScrapedTime = localStorage.getItem('lastScrapedTime');
      if (lastScrapedTime) {
        setLastScraped(lastScrapedTime);
      }
      
      setTotalJobsFound(parseInt(localStorage.getItem('totalJobsFound') || '128'));
      setNewJobsFound(parseInt(localStorage.getItem('newJobsFound') || '14'));
      
    } catch (e) {
      console.error('Error loading job sources:', e);
    }
  }, []);
  
  const handleSourceUpdate = (updatedSources: JobSource[]) => {
    setJobSources(updatedSources);
    localStorage.setItem('jobSources', JSON.stringify(updatedSources));
  };
  
  const handleStartScraping = () => {
    if (isScrapingNow) return;
    
    setIsScrapingNow(true);
    setScrapingProgress(0);
    
    toast.success("Job search started", {
      description: "Searching for matching opportunities across all platforms"
    });
    
    // Simulate scraping progress
    const intervalId = setInterval(() => {
      setScrapingProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(intervalId);
          setIsScrapingNow(false);
          
          // Simulate finding new jobs
          const newJobs = Math.floor(Math.random() * 20) + 5;
          setNewJobsFound(newJobs);
          setTotalJobsFound(prev => prev + newJobs);
          
          const now = new Date().toISOString();
          setLastScraped(now);
          localStorage.setItem('lastScrapedTime', now);
          localStorage.setItem('totalJobsFound', (totalJobsFound + newJobs).toString());
          localStorage.setItem('newJobsFound', newJobs.toString());
          
          toast.success("Job search complete", {
            description: `Found ${newJobs} new job opportunities matching your profile`
          });
          
          return 100;
        }
        return newProgress;
      });
    }, 600);
    
    return () => clearInterval(intervalId);
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
  
  const activeSourcesCount = jobSources.filter(source => source.isActive).length;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900/50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold">
              Job Search Engine
            </CardTitle>
            <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
              Searching across {activeSourcesCount} platforms, {totalJobsFound} jobs found
            </CardDescription>
          </div>
          <JobScraperConfig onConfigUpdate={handleSourceUpdate} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 px-4 py-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
            <div className="bg-blue-500 dark:bg-blue-600 text-white p-3 rounded-full">
              <SearchIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-700 dark:text-blue-300">Multi-Platform Search</h3>
              <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
                Searching across all major job platforms
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-200/50 text-blue-700 dark:bg-blue-800/50 dark:text-blue-300 border-blue-300 dark:border-blue-700">
              <DatabaseIcon className="h-3.5 w-3.5 mr-1.5" />
              All Sources
            </Badge>
          </div>
          
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
            <div className="flex justify-between items-center">
              <div className="text-sm text-blue-600/70 dark:text-blue-400/70">
                Last updated: {getFormattedLastScraped()}
                {newJobsFound > 0 && (
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700">
                    +{newJobsFound} new
                  </Badge>
                )}
              </div>
              <Button 
                size="sm" 
                onClick={handleStartScraping}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCwIcon className="h-3.5 w-3.5" />
                Refresh Now
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
