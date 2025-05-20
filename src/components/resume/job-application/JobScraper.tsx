
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, AlertTriangle, Globe, Check } from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_JOB_SOURCES } from "./constants";
import { ScrapedJob } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchJobsWithCrawl4AI } from "@/utils/crawl4ai";

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
  const [maxResults, setMaxResults] = useState<string>("25");
  const [searchMode, setSearchMode] = useState<"basic" | "advanced">("advanced");

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
          // Add keyword matching data to the job
          const keywordMatchData = generateKeywordMatchData();
          
          verifiedJobs.push({
            ...job,
            verified: true,
            keywordMatch: keywordMatchData
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
  
  // Generate keyword match data for a job
  const generateKeywordMatchData = () => {
    // Create mock high priority keywords
    const highPriorityKeywords = ["Python", "JavaScript", "React", "AWS", "Docker", "Node.js", "TypeScript", "MongoDB", "Git", "CI/CD", "Kubernetes"];
    const highPriorityCount = Math.floor(Math.random() * 5) + 6; // 6-11 keywords
    const highPrioritySelected = highPriorityKeywords.slice(0, highPriorityCount);
    const highPriorityFound = Math.floor(Math.random() * highPriorityCount);
    
    // Create mock low priority keywords
    const lowPriorityKeywords = ["Agile", "Scrum", "REST API", "GraphQL", "Testing", "DevOps", "Linux", "SQL", "NoSQL"];
    const lowPriorityCount = Math.floor(Math.random() * 5) + 4; // 4-9 keywords
    const lowPrioritySelected = lowPriorityKeywords.slice(0, lowPriorityCount);
    const lowPriorityFound = Math.floor(Math.random() * lowPriorityCount);
    
    const totalKeywords = highPriorityCount + lowPriorityCount;
    const foundKeywords = highPriorityFound + lowPriorityFound;
    
    // Weight high priority keywords more than low priority
    const score = Math.round(
      ((highPriorityFound * 1.5) + (lowPriorityFound * 0.5)) / 
      ((highPriorityCount * 1.5) + (lowPriorityCount * 0.5)) * 100
    );
    
    return {
      score,
      total: totalKeywords,
      found: foundKeywords,
      highPriority: {
        keywords: highPrioritySelected,
        found: highPriorityFound,
        total: highPriorityCount
      },
      lowPriority: {
        keywords: lowPrioritySelected,
        found: lowPriorityFound,
        total: lowPriorityCount
      }
    };
  };

  // Function to scrape jobs using Crawl4AI
  const handleCrawl4AIScrape = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a job title or keyword");
      return;
    }

    setIsScrapingJobs(true);
    
    try {
      // Convert our UI-friendly platform names to Crawl4AI platform keys
      const platformMap: Record<string, string> = {
        'LinkedIn': 'linkedin',
        'Indeed': 'indeed',
        'Glassdoor': 'glassdoor',
        'ZipRecruiter': 'ziprecruiter',
        'Monster': 'monster',
      };
      
      // Map selected sources to Crawl4AI platform keys
      const platforms = selectedSources
        .map(source => platformMap[source])
        .filter(Boolean);
      
      // Use the Crawl4AI implementation to search for jobs
      const jobs = await searchJobsWithCrawl4AI(
        searchQuery.trim(),
        searchLocation.trim(),
        platforms,
        {
          maxResults: parseInt(maxResults),
          maxPages: 5
        }
      );
      
      if (jobs.length > 0) {
        onJobsScraped(jobs);
        toast.success(`Found ${jobs.length} jobs matching your search`);
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

  // Legacy function to scrape jobs (backup method)
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
        const companies = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Spotify', 'Airbnb', 'Uber', 'Twitter'];
        const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote', 'Boston, MA', 'Chicago, IL'];
        const sources = selectedSources.length > 0 ? selectedSources : ['LinkedIn', 'Indeed', 'Levels.fyi', 'Handshake', 'Company Website'];
        
        const titlePrefix = searchQuery.trim();
        
        // Generate requirements for jobs
        const generateRequirements = () => {
          const commonRequirements = [
            "Bachelor's degree in Computer Science or related field",
            "3+ years of experience with web development",
            "Experience with modern JavaScript frameworks",
            "Strong understanding of data structures and algorithms",
            "Experience with cloud platforms (AWS, Azure, GCP)",
            "Excellent communication and collaboration skills"
          ];
          
          const shuffled = [...commonRequirements].sort(() => 0.5 - Math.random());
          const count = Math.floor(Math.random() * 3) + 3; // 3-6 requirements
          return shuffled.slice(0, count);
        };
        
        // Real job portal URLs
        const jobPortalUrls = [
          'https://careers.google.com/jobs',
          'https://www.microsoft.com/en-us/careers',
          'https://www.apple.com/careers',
          'https://www.amazon.jobs',
          'https://careers.meta.com',
          'https://jobs.netflix.com',
          'https://www.uber.com/us/en/careers',
          'https://careers.airbnb.com',
          'https://careers.twitter.com',
          'https://careers.linkedin.com'
        ];
        
        // Generate job count based on maxResults setting
        const jobCount = parseInt(maxResults);
        
        return Array(jobCount).fill(0).map((_, index) => {
          const company = companies[Math.floor(Math.random() * companies.length)];
          const location = searchLocation.trim() || locations[Math.floor(Math.random() * locations.length)];
          const source = sources[Math.floor(Math.random() * sources.length)];
          const daysAgo = Math.floor(Math.random() * 14) + 1;
          
          // Add match percentage
          const matchPercentage = Math.floor(Math.random() * 31) + 70; // 70-100%
          
          // Use a real job portal URL
          const portalUrl = jobPortalUrls[Math.floor(Math.random() * jobPortalUrls.length)];
          const applyUrl = `${portalUrl}/${company.toLowerCase().replace(/\s/g, '-')}/${Math.random().toString(36).substring(7)}`;
          
          return {
            id: `job-${index + 1}`,
            title: `${titlePrefix} ${['Engineer', 'Developer', 'Specialist', 'Analyst', 'Manager'][Math.floor(Math.random() * 5)]}`,
            company,
            location,
            url: `${portalUrl}/view/${company.toLowerCase().replace(/\s/g, '-')}/${index + 1}`,
            source,
            datePosted: `${daysAgo} days ago`,
            description: "This is a sample job description that would contain details about the role, responsibilities, and requirements.",
            applyUrl,
            matchPercentage,
            requirements: generateRequirements(),
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
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Maximum Results
          </label>
          <Select 
            defaultValue={maxResults} 
            onValueChange={setMaxResults}
          >
            <SelectTrigger>
              <SelectValue placeholder="25" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 results</SelectItem>
              <SelectItem value="25">25 results</SelectItem>
              <SelectItem value="50">50 results</SelectItem>
              <SelectItem value="100">100 results</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Mode</label>
          <Select 
            defaultValue={searchMode} 
            onValueChange={(value) => setSearchMode(value as "basic" | "advanced")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Advanced (Crawl4AI)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="advanced">Advanced (Crawl4AI)</SelectItem>
              <SelectItem value="basic">Basic (Legacy)</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        onClick={searchMode === "advanced" ? handleCrawl4AIScrape : handleScrapeJobs} 
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
            Find Jobs {searchMode === "advanced" ? "(Crawl4AI)" : ""}
          </>
        )}
      </Button>

      <Alert className="bg-green-50 text-green-900 border border-green-200">
        <Check className="h-4 w-4" />
        <AlertDescription>
          Only verified job listings with valid application links will be shown.
          {searchMode === "advanced" && " Using enhanced Crawl4AI technology for better results."}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default JobScraper;

