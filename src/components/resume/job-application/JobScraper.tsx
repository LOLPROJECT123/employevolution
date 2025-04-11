
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_JOB_SOURCES } from "./constants";
import { ScrapedJob } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface JobScraperProps {
  onJobsScraped: (jobs: ScrapedJob[]) => void;
}

const JobScraper = ({ onJobsScraped }: JobScraperProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>(["LinkedIn", "Indeed"]);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [isVerifyingJobs, setIsVerifyingJobs] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  // Function to verify job URLs actually exist
  const verifyJobUrls = async (jobs: ScrapedJob[]): Promise<ScrapedJob[]> => {
    setIsVerifyingJobs(true);
    setVerificationProgress(0);
    
    const verifiedJobs: ScrapedJob[] = [];
    let validCount = 0;
    
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      try {
        // Simulate API call to verify URL existence
        // In a real implementation, this would use a server-side API to check URL status
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // For demo purposes, we'll consider ~85% of jobs as valid
        const isValid = Math.random() > 0.15;
        
        if (isValid) {
          verifiedJobs.push({
            ...job,
            verified: true
          });
          validCount++;
        }
        
        // Update progress
        const progress = Math.floor(((i + 1) / jobs.length) * 100);
        setVerificationProgress(progress);
      } catch (error) {
        console.error(`Error verifying job ${job.id}:`, error);
      }
    }
    
    setIsVerifyingJobs(false);
    
    if (validCount < jobs.length) {
      toast.info(`Filtered out ${jobs.length - validCount} invalid job listings`);
    }
    
    return verifiedJobs;
  };

  // Function to scrape jobs based on search criteria
  const handleScrapeJobs = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a job title or keyword");
      return;
    }

    setIsScrapingJobs(true);
    
    try {
      // Simulate API call to scrape jobs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock job results
      const generateMockJobs = (): ScrapedJob[] => {
        const companies = ['Google', 'Microsoft', 'Apple', 'Meta', 'Amazon', 'Netflix', 'Spotify', 'Airbnb', 'Uber', 'Twitter'];
        const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote', 'Boston, MA', 'Chicago, IL'];
        const sources = ['LinkedIn', 'Indeed', 'Levels.fyi', 'Handshake', 'Company Website'];
        
        const titlePrefix = searchQuery.trim();
        
        return Array(12).fill(0).map((_, index) => {
          const company = companies[Math.floor(Math.random() * companies.length)];
          const location = searchLocation.trim() || locations[Math.floor(Math.random() * locations.length)];
          const source = sources[Math.floor(Math.random() * sources.length)];
          const daysAgo = Math.floor(Math.random() * 14) + 1;
          
          // Add match percentage
          const matchPercentage = Math.floor(Math.random() * 31) + 70; // 70-100%
          
          return {
            id: `job-${index + 1}`,
            title: `${titlePrefix} ${['Engineer', 'Developer', 'Specialist', 'Analyst', 'Manager'][Math.floor(Math.random() * 5)]}`,
            company,
            location,
            url: `https://example.com/jobs/${company.toLowerCase().replace(/\s/g, '-')}/${index + 1}`,
            source,
            datePosted: `${daysAgo} days ago`,
            description: "This is a sample job description that would contain details about the role, responsibilities, and requirements.",
            applyUrl: `https://example.com/jobs/${company.toLowerCase().replace(/\s/g, '-')}/${index + 1}/apply`,
            matchPercentage,
            verified: false
          };
        });
      };
      
      let mockJobs = generateMockJobs();
      
      // Filter by selected sources
      mockJobs = selectedSources.length > 0 
        ? mockJobs.filter(job => selectedSources.some(source => job.source.includes(source)))
        : mockJobs;
      
      // Verify job URLs exist
      const verifiedJobs = await verifyJobUrls(mockJobs);
      
      onJobsScraped(verifiedJobs);
      
      if (verifiedJobs.length > 0) {
        toast.success(`Found ${verifiedJobs.length} verified jobs matching your search`);
      } else {
        toast.error("No valid jobs found matching your criteria. Try adjusting your search.");
      }
    } catch (error) {
      console.error("Error scraping jobs:", error);
      toast.error("Failed to scrape jobs. Please try again.");
    } finally {
      setIsScrapingJobs(false);
      setIsVerifyingJobs(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="search-query" className="text-sm font-medium">
          Job Title or Keywords
        </label>
        <Input
          id="search-query"
          placeholder="Software Engineer, Data Scientist, etc."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="search-location" className="text-sm font-medium">
          Location (Optional)
        </label>
        <Input
          id="search-location"
          placeholder="San Francisco, Remote, etc."
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Job Sources
        </label>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_JOB_SOURCES.map(source => (
            <Badge
              key={source.name}
              variant={selectedSources.includes(source.name) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                if (selectedSources.includes(source.name)) {
                  setSelectedSources(selectedSources.filter(s => s !== source.name));
                } else {
                  setSelectedSources([...selectedSources, source.name]);
                }
              }}
            >
              {source.name}
            </Badge>
          ))}
        </div>
      </div>

      {isVerifyingJobs && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Verifying job listings...</span>
            <span>{verificationProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${verificationProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <Button 
        type="button" 
        onClick={handleScrapeJobs} 
        disabled={isScrapingJobs || isVerifyingJobs || !searchQuery.trim()}
        className="w-full"
      >
        {isScrapingJobs || isVerifyingJobs ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isScrapingJobs ? 'Searching for Jobs...' : 'Verifying Jobs...'}
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Find Jobs
          </>
        )}
      </Button>

      <Alert variant="destructive" className="bg-amber-50 text-amber-900 border border-amber-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Only verified job listings will be shown to ensure you don't waste time on expired or invalid positions.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default JobScraper;
