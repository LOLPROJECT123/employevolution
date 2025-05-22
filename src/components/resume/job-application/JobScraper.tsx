import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrapedJob } from "./types";
import { SUPPORTED_JOB_SOURCES } from "./constants";
import { Loader2, Search, Briefcase, Building, MapPin } from "lucide-react";
import { toast } from "sonner";
import { createJobScraper } from "@/utils/crawl4ai";

interface JobScraperProps {
  onJobsScraped: (jobs: ScrapedJob[]) => void;
}

const JobScraper = ({ onJobsScraped }: JobScraperProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scrapingProgress, setScrapingProgress] = useState<number>(0);
  const [selectedSources, setSelectedSources] = useState<string[]>(
    SUPPORTED_JOB_SOURCES.map(source => source.id)
  );
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a job title or keywords to search for");
      return;
    }
    
    setIsLoading(true);
    setScrapingProgress(0);
    
    try {
      toast.loading("Setting up job search...", {
        duration: 1500
      });
      
      // Initialize the enhanced job scraper
      const jobScraper = createJobScraper();
      
      // Get the selected job sources
      const sources = SUPPORTED_JOB_SOURCES
        .filter(source => selectedSources.includes(source.id))
        .map(source => {
          try {
            const url = new URL(source.url);
            return url.hostname.replace('www.', '');
          } catch (e) {
            return source.url;
          }
        });
      
      toast.loading("Searching for jobs...", {
        description: `Searching across ${sources.length} platforms`,
        duration: 2000
      });
      
      // Show initial progress
      setScrapingProgress(10);
      
      // Search for jobs with the enhanced scraper
      const jobs = await jobScraper.searchJobs(
        searchQuery,
        location,
        sources
      );
      
      setScrapingProgress(50);
      
      if (jobs.length > 0) {
        toast.loading(`Found ${jobs.length} potential matches. Verifying...`, {
          duration: 2000
        });
        
        // Verify the jobs
        const verifiedJobs = await jobScraper.verifyJobs(jobs);
        setScrapingProgress(100);
        
        if (verifiedJobs.length > 0) {
          onJobsScraped(verifiedJobs);
          toast.success(`Found ${verifiedJobs.length} matching jobs`);
        } else {
          toast.error("No matching jobs found after verification");
        }
      } else {
        toast.error("No jobs found matching your criteria");
      }
    } catch (error) {
      console.error("Error searching for jobs:", error);
      toast.error("Failed to search for jobs");
    } finally {
      setIsLoading(false);
      setScrapingProgress(0);
    }
  };
  
  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId);
      } else {
        return [...prev, sourceId];
      }
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Job Search</CardTitle>
        <CardDescription>
          Search for jobs across multiple platforms with a single query
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Job title, keywords, or company"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Location (optional)"
                className="pl-8"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <Button 
            type="button"
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            className="md:w-auto w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Jobs
              </>
            )}
          </Button>
        </div>
        
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Searching for jobs...</span>
              <span>{scrapingProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${scrapingProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <p className="text-sm font-medium mb-2">Search Sources:</p>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_JOB_SOURCES.map(source => (
              <Button
                key={source.id}
                variant={selectedSources.includes(source.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSource(source.id)}
                className="flex items-center gap-1.5"
              >
                {source.id === 'linkedin' ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                ) : source.id === 'indeed' ? (
                  <Building className="h-3.5 w-3.5" />
                ) : (
                  <Briefcase className="h-3.5 w-3.5" />
                )}
                {source.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobScraper;
