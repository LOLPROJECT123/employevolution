
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_JOB_SOURCES } from "./constants";
import { ScrapedJob } from "./types";

interface JobScraperProps {
  onJobsScraped: (jobs: ScrapedJob[]) => void;
}

const JobScraper = ({ onJobsScraped }: JobScraperProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>(["LinkedIn", "Indeed"]);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);

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
          
          return {
            id: `job-${index + 1}`,
            title: `${titlePrefix} ${['Engineer', 'Developer', 'Specialist', 'Analyst', 'Manager'][Math.floor(Math.random() * 5)]}`,
            company,
            location,
            url: `https://example.com/jobs/${company.toLowerCase().replace(/\s/g, '-')}/${index + 1}`,
            source,
            datePosted: `${daysAgo} days ago`,
            description: "This is a sample job description that would contain details about the role, responsibilities, and requirements.",
            applyUrl: `https://example.com/jobs/${company.toLowerCase().replace(/\s/g, '-')}/${index + 1}/apply`
          };
        });
      };
      
      const mockJobs = generateMockJobs();
      
      // Filter by selected sources
      const filteredJobs = selectedSources.length > 0 
        ? mockJobs.filter(job => selectedSources.some(source => job.source.includes(source)))
        : mockJobs;
      
      onJobsScraped(filteredJobs);
      
      if (filteredJobs.length > 0) {
        toast.success(`Found ${filteredJobs.length} jobs matching your search`);
      } else {
        toast.error("No jobs found matching your criteria. Try adjusting your search.");
      }
    } catch (error) {
      console.error("Error scraping jobs:", error);
      toast.error("Failed to scrape jobs. Please try again.");
    } finally {
      setIsScrapingJobs(false);
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
      
      <Button 
        type="button" 
        onClick={handleScrapeJobs} 
        disabled={isScrapingJobs || !searchQuery.trim()}
        className="w-full"
      >
        {isScrapingJobs ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching for Jobs...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Find Jobs
          </>
        )}
      </Button>
    </div>
  );
};

export default JobScraper;
