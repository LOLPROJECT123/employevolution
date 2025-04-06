
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { JobScraperConfig } from "@/components/JobScraperConfig";

interface JobSource {
  id: string;
  name: string;
  isActive: boolean;
  category?: string;
}

const platformIcons: Record<string, string> = {
  linkedin: "🔵",
  github: "⚫",
  indeed: "🟣",
  glassdoor: "🟢",
  zipRecruiter: "🟠",
  simplify: "🟡",
  levelsFyi: "🔵",
  offerPilot: "🟤",
  jobRight: "🟢",
  google: "🔴",
  microsoft: "🔵",
  amazon: "🟠",
  apple: "⚪",
  meta: "🔵",
};

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
    
    const activeSources = jobSources.filter(source => source.isActive);
    if (activeSources.length === 0) {
      toast.error("No job sources enabled", {
        description: "Please enable at least one job source before scraping."
      });
      return;
    }
    
    setIsScrapingNow(true);
    setScrapingProgress(0);
    
    toast.success("Job scraping started", {
      description: `Searching for jobs across ${activeSources.length} platforms`
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
          
          toast.success("Job scraping complete", {
            description: `Found ${newJobs} new job postings`
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
  
  const activeSources = jobSources.filter(source => source.isActive);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Job Sources</CardTitle>
            <CardDescription>
              {activeSources.length} active sources, {totalJobsFound} jobs found
            </CardDescription>
          </div>
          <JobScraperConfig onConfigUpdate={handleSourceUpdate} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeSources.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeSources.map(source => (
                <Badge key={source.id} variant="secondary" className="flex items-center gap-1">
                  <span>{platformIcons[source.id] || '🔍'}</span>
                  <span>{source.name}</span>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-3 bg-secondary/20 rounded-md">
              <AlertCircle className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">No job sources enabled</span>
            </div>
          )}
          
          {isScrapingNow ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scraping in progress...</span>
                <span>{Math.floor(scrapingProgress)}%</span>
              </div>
              <Progress value={scrapingProgress} />
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Last scraped: {getFormattedLastScraped()}
                {newJobsFound > 0 && (
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    +{newJobsFound} new
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleStartScraping}
                className="flex items-center gap-1.5"
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
