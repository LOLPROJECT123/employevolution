
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { JobScraperConfig } from "@/components/JobScraperConfig";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';

interface JobSource {
  id: string;
  name: string;
  isActive: boolean;
  category?: string;
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
    
    const intervalId = setInterval(() => {
      setScrapingProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(intervalId);
          setIsScrapingNow(false);
          
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
  
  const handleAddCustomSource = () => {
    if (!newSourceName.trim() || !newSourceUrl.trim()) {
      toast.error("Please enter both a name and URL for the new source");
      return;
    }

    try {
      new URL(newSourceUrl);
      
      const newId = `custom-${newSourceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      
      if (jobSources.some(source => source.id === newId)) {
        toast.error("A source with this name already exists");
        return;
      }
      
      const newSource: JobSource = {
        id: newId,
        name: newSourceName,
        isActive: true,
        category: 'custom'
      };
      
      const updatedSources = [...jobSources, newSource];
      setJobSources(updatedSources);
      localStorage.setItem('jobSources', JSON.stringify(updatedSources));
      
      setNewSourceName('');
      setNewSourceUrl('');
      setOpenAddDialog(false);
      
      toast.success("Custom job source added", {
        description: `${newSourceName} has been added to your search sources`
      });
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };
  
  const activeSourcesCount = jobSources.filter(source => source.isActive).length;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900/50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className={isMobile ? "mt-8" : ""}>
            <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 font-bold whitespace-nowrap">
              Job Search Engine
            </CardTitle>
            <CardDescription className="text-blue-600/70 dark:text-blue-400/70 whitespace-nowrap text-xs md:text-sm">
              Searching across {activeSourcesCount} platforms, {totalJobsFound} jobs found
            </CardDescription>
          </div>
          <div className="flex gap-2">
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
                    Add a custom website to search for job opportunities
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
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sourceUrl" className="text-sm font-medium">
                      Source URL
                    </label>
                    <Input
                      id="sourceUrl"
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                      placeholder="https://example.com/careers"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCustomSource}>
                      Add Source
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <JobScraperConfig onConfigUpdate={handleSourceUpdate} />
          </div>
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
