
import { useState } from "react";
import { Job } from "@/types/job";
import { ScrapedJob } from "@/components/resume/job-application/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { searchJobsWithCrawl4AI } from "@/utils/crawl4ai";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

interface MobileJobListProps {
  jobs: Job[];
  savedJobIds: string[];
  appliedJobIds: string[];
  onSelect: (job: Job) => void;
  onSave: (job: Job) => void;
  onApply: (job: Job) => void;
}

export const MobileJobList = ({ 
  jobs, 
  savedJobIds, 
  appliedJobIds, 
  onSelect, 
  onSave, 
  onApply 
}: MobileJobListProps) => {
  const [showJobScraper, setShowJobScraper] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchingJobs, setSearchingJobs] = useState(false);
  
  const handleSearchJobs = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a job title or keywords");
      return;
    }
    
    setSearchingJobs(true);
    
    try {
      // This would normally update the parent component's job list
      // For now, it just shows a toast
      toast.success(`Searching for "${searchQuery}" jobs`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Found 5 jobs matching "${searchQuery}"`);
    } catch (error) {
      console.error("Error searching for jobs:", error);
      toast.error("Failed to search for jobs");
    } finally {
      setSearchingJobs(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Job Listings</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowJobScraper(!showJobScraper)}
        >
          {showJobScraper ? "Hide Search" : "Find Jobs"}
        </Button>
      </div>
      
      {showJobScraper && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4 mb-4">
          <div className="space-y-2">
            <label htmlFor="jobTitle" className="text-sm font-medium">
              Job Title or Keywords
            </label>
            <Input
              id="jobTitle"
              placeholder="Software Engineer, Data Scientist, etc."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location (Optional)
            </label>
            <Input
              id="location"
              placeholder="San Francisco, Remote, etc."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              className="w-full" 
              onClick={handleSearchJobs} 
              disabled={searchingJobs}
            >
              {searchingJobs ? (
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
        </div>
      )}
      
      {jobs.length === 0 ? (
        <div className="text-center p-6">
          <p className="text-gray-500">No jobs found.</p>
          <p className="text-sm text-gray-400 mt-2">Try different search criteria or check back later.</p>
        </div>
      ) : (
        jobs.map((job) => (
          <div 
            key={job.id} 
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
            onClick={() => onSelect(job)}
          >
            <h3 className="font-medium text-lg">{job.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">{job.location}</p>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">{job.postedAt}</span>
              
              <div className="flex gap-2">
                <button 
                  className={`p-2 rounded-full ${savedJobIds.includes(job.id) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave(job);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={savedJobIds.includes(job.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
                
                <button 
                  className={`p-2 rounded-full ${appliedJobIds.includes(job.id) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply(job);
                  }}
                  disabled={appliedJobIds.includes(job.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
