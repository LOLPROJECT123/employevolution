
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrapedJob } from "./types";
import { Loader2, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import { createJobScraper } from "@/utils/crawl4ai";

interface JobSourceScraperProps {
  onJobsScraped: (jobs: ScrapedJob[]) => void;
}

const JobSourceScraper = ({ onJobsScraped }: JobSourceScraperProps) => {
  const [jobUrls, setJobUrls] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scrapingProgress, setScrapingProgress] = useState<number>(0);
  
  const handleScrapeJobs = async () => {
    if (!jobUrls.trim()) {
      toast.error("Please enter at least one job URL to scrape");
      return;
    }
    
    // Split the input by lines to get individual URLs
    const urlList = jobUrls
      .split("\n")
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urlList.length === 0) {
      toast.error("No valid URLs found");
      return;
    }
    
    setIsLoading(true);
    setScrapingProgress(0);
    
    try {
      toast.loading("Setting up job scraper...", {
        duration: 1500
      });
      
      // Initialize the enhanced job scraper
      const jobScraper = createJobScraper();
      const scrapedJobs: ScrapedJob[] = [];
      
      // Process each URL
      for (let i = 0; i < urlList.length; i++) {
        const url = urlList[i];
        
        // Update progress
        const progress = Math.floor(((i + 1) / urlList.length) * 100);
        setScrapingProgress(progress);
        
        toast.loading(`Scraping job ${i + 1} of ${urlList.length}`, {
          description: url,
          duration: 2000
        });
        
        try {
          // Extract domain for the search (simulate targeted scraping)
          let domain;
          try {
            domain = new URL(url).hostname;
          } catch (e) {
            // If URL parsing fails, try adding https:// prefix
            try {
              domain = new URL(`https://${url}`).hostname;
            } catch (e2) {
              throw new Error("Invalid URL format");
            }
          }
          
          // Search for jobs from this domain
          const jobs = await jobScraper.searchJobs("", "", [domain]);
          
          if (jobs.length > 0) {
            // Add source URL to the job data
            const jobsWithSource = jobs.map(job => ({
              ...job,
              sourceUrl: url
            }));
            
            scrapedJobs.push(...jobsWithSource);
          }
          
          // Add a small delay between requests
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
          console.error(`Error scraping jobs from ${url}:`, error);
          toast.error(`Failed to scrape jobs from ${url}`);
        }
      }
      
      // Verify the jobs
      toast.loading("Verifying job listings...", {
        duration: 1500
      });
      
      const verifiedJobs = await jobScraper.verifyJobs(scrapedJobs);
      
      if (verifiedJobs.length > 0) {
        onJobsScraped(verifiedJobs);
        toast.success(`Successfully scraped ${verifiedJobs.length} jobs from ${urlList.length} sources`);
      } else {
        toast.error("No valid jobs found after scraping");
      }
    } catch (error) {
      console.error("Error scraping jobs:", error);
      toast.error("Failed to scrape jobs");
    } finally {
      setIsLoading(false);
      setScrapingProgress(0);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Custom Job URL Scraper</CardTitle>
        <CardDescription>
          Paste job page URLs (one per line) to scrape all available job listings from those sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="https://job-boards.greenhouse.io/example&#10;https://careers.example.com/jobs&#10;https://jobs.lever.co/example"
          value={jobUrls}
          onChange={(e) => setJobUrls(e.target.value)}
          className="h-40"
          disabled={isLoading}
        />
        
        {isLoading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Scraping jobs...</span>
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
        
        <Button 
          type="button"
          onClick={handleScrapeJobs}
          disabled={isLoading || !jobUrls.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping Jobs...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              Scrape Jobs from URLs
            </>
          )}
        </Button>
      </CardContent>
      
      <CardFooter>
        <Alert variant="default" className="bg-blue-50 text-blue-800 border border-blue-200">
          <Check className="h-4 w-4" />
          <AlertDescription>
            This tool will extract job listings from the specified URLs and only show verified jobs that are still available.
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
};

export default JobSourceScraper;
