
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Globe } from "lucide-react";
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
import { jobScraper, JOB_SOURCES } from "@/utils/jobScraperService";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface JobScraperProps {
  onJobsScraped: (jobs: ScrapedJob[]) => void;
}

const JobScraper = ({ onJobsScraped }: JobScraperProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>(["All"]);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  // Function to handle location input
  const handleLocationInput = (input: string) => {
    setSearchLocation(input);
    if (input.length >= 2) {
      // Generate suggestions based on input
      const cities = [
        "San Francisco, CA",
        "New York, NY",
        "Seattle, WA",
        "Austin, TX",
        "Los Angeles, CA",
        "Chicago, IL",
        "Boston, MA",
        "Denver, CO",
        "Atlanta, GA",
        "Dallas, TX",
        "Dallas, GA",
        "Houston, TX",
        "Phoenix, AZ",
        "Portland, OR",
        "Miami, FL",
        "Nashville, TN",
        "San Diego, CA",
        "San Jose, CA",
        "San Antonio, TX",
        "Philadelphia, PA"
      ];
      
      const filteredCities = cities.filter(city => 
        city.toLowerCase().includes(input.toLowerCase())
      );
      
      setLocationSuggestions(filteredCities);
      setShowLocationSuggestions(filteredCities.length > 0);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };
  
  // Handle selecting a location suggestion
  const handleSelectLocation = (location: string) => {
    setSearchLocation(location);
    setShowLocationSuggestions(false);
  };

  // Handle toggling a job source
  const handleToggleSource = (source: string) => {
    if (source === "All") {
      // If "All" is selected, clear other selections
      setSelectedSources(["All"]);
    } else {
      // If "All" was previously selected, remove it
      const newSources = selectedSources.filter(s => s !== "All");
      
      // Toggle the selected source
      if (newSources.includes(source)) {
        const updatedSources = newSources.filter(s => s !== source);
        setSelectedSources(updatedSources.length === 0 ? ["All"] : updatedSources);
      } else {
        setSelectedSources([...newSources, source]);
      }
    }
  };
  
  // Function to scrape jobs
  const handleScrapeJobs = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a job title or keywords");
      return;
    }

    setIsScrapingJobs(true);
    
    try {
      // Determine which sources to scrape
      const sourcesToScrape = selectedSources.includes("All") 
        ? undefined // Scrape all sources
        : selectedSources;
      
      // Use the job scraper service
      const jobs = await jobScraper.scrapeJobs(
        searchQuery.trim(),
        searchLocation.trim(),
        sourcesToScrape
      );
      
      if (jobs.length > 0) {
        onJobsScraped(jobs);
        toast.success(`Found ${jobs.length} jobs matching your search`);
      } else {
        toast.warning("No jobs found matching your criteria. Try adjusting your search.");
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
      <h3 className="text-lg font-medium">Find Jobs</h3>
      
      <div className="space-y-3">
        {/* Job Title/Keywords Input */}
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium mb-1">
            Job Title or Keywords
          </label>
          <Input
            id="jobTitle"
            placeholder="Software Engineer, Data Scientist, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        {/* Location Input with Autocomplete */}
        <div className="relative">
          <label htmlFor="location" className="block text-sm font-medium mb-1">
            Location (Optional)
          </label>
          <Input
            id="location"
            placeholder="San Francisco, Remote, etc."
            value={searchLocation}
            onChange={(e) => handleLocationInput(e.target.value)}
            onFocus={() => setShowLocationSuggestions(locationSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
            className="w-full"
          />
          
          {/* Location Suggestions Dropdown */}
          {showLocationSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {locationSuggestions.map((location, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSelectLocation(location)}
                >
                  {location}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Advanced Options Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="w-full"
        >
          {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
        </Button>
        
        {/* Advanced Options */}
        {showAdvancedOptions && (
          <div className="border rounded-md p-3 space-y-3">
            <label className="block text-sm font-medium">Select Job Sources</label>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="source-all"
                  checked={selectedSources.includes("All")}
                  onCheckedChange={() => handleToggleSource("All")}
                />
                <label 
                  htmlFor="source-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  All Sources
                </label>
              </div>
              
              <ScrollArea className="h-40 border rounded-md p-2">
                <div className="space-y-2">
                  {JOB_SOURCES.slice(0, 15).map((source) => (
                    <div key={source.name} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`source-${source.name}`}
                        checked={selectedSources.includes(source.name)}
                        onCheckedChange={() => handleToggleSource(source.name)}
                        disabled={selectedSources.includes("All")}
                      />
                      <label 
                        htmlFor={`source-${source.name}`}
                        className="text-sm cursor-pointer truncate"
                      >
                        {source.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
        
        {/* Search Button */}
        <Button 
          className="w-full" 
          onClick={handleScrapeJobs} 
          disabled={isScrapingJobs}
        >
          {isScrapingJobs ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Find Jobs
            </>
          )}
        </Button>
      </div>
      
      <Alert variant="default" className="bg-blue-50 text-blue-800 border border-blue-200">
        <AlertDescription className="text-sm">
          Search across {JOB_SOURCES.length} top tech and finance companies to find your perfect role.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default JobScraper;
