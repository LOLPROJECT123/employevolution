
import { useState, useEffect } from "react";
import { ScrapedJob } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, MapPin, Building, Calendar, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface JobListProps {
  jobs: ScrapedJob[];
  onSelectJob: (job: ScrapedJob) => void;
}

const JobList = ({ jobs, onSelectJob }: JobListProps) => {
  const [savedJobs, setSavedJobs] = useState<ScrapedJob[]>([]);
  const [displayedJobs, setDisplayedJobs] = useState<ScrapedJob[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Load previously saved jobs when component mounts
  useEffect(() => {
    const savedJobsJson = localStorage.getItem('scrapedJobs');
    if (savedJobsJson) {
      try {
        const parsedJobs = JSON.parse(savedJobsJson);
        setSavedJobs(parsedJobs);
        
        // If no new jobs are passed as props, display saved jobs by default
        if (jobs.length === 0) {
          setDisplayedJobs(parsedJobs);
        } else {
          setDisplayedJobs(jobs);
        }
      } catch (error) {
        console.error("Error parsing saved jobs:", error);
      }
    } else if (jobs.length > 0) {
      setDisplayedJobs(jobs);
    }
  }, [jobs]);

  // Handle toggling between new jobs and saved jobs
  const toggleSavedJobs = () => {
    if (showSavedOnly) {
      setDisplayedJobs(jobs.length > 0 ? jobs : []);
    } else {
      setDisplayedJobs(savedJobs);
    }
    setShowSavedOnly(!showSavedOnly);
  };

  const handleSelectJob = (job: ScrapedJob) => {
    onSelectJob(job);
  };

  const handleOpenJobUrl = (event: React.MouseEvent, url: string) => {
    event.stopPropagation();
    window.open(url, '_blank');
    toast.info("Opening job details in a new tab");
  };

  if (displayedJobs.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center space-y-3">
        <p className="text-gray-600">No jobs found. Try searching with different criteria or adding more sources.</p>
        {savedJobs.length > 0 && (
          <Button 
            variant="outline" 
            onClick={toggleSavedJobs} 
            className="mt-2"
          >
            View {savedJobs.length} Saved Jobs
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">
          {showSavedOnly 
            ? `Showing All Saved Jobs (${displayedJobs.length})` 
            : `Found ${displayedJobs.length} Jobs`}
        </h3>
        {savedJobs.length > 0 && (
          <Button variant="outline" size="sm" onClick={toggleSavedJobs}>
            {showSavedOnly ? "Show Search Results" : `View All Saved Jobs (${savedJobs.length})`}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {displayedJobs.map((job) => (
          <Card 
            key={job.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              job.verified ? 'border-gray-200' : 'border-red-200 bg-red-50'
            }`}
            onClick={() => handleSelectJob(job)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-medium text-base line-clamp-1">{job.title}</h3>
                  <div className="flex gap-1.5 items-center text-sm text-gray-600">
                    <Building className="h-3.5 w-3.5" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex gap-1.5 items-center text-sm text-gray-600">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex gap-1.5 items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{job.datePosted || "Recently posted"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {job.matchPercentage && (
                    <Badge className={`${
                      job.matchPercentage >= 90 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : job.matchPercentage >= 80 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}>
                      {job.matchPercentage}% Match
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex gap-1 items-center">
                    {job.source}
                  </Badge>
                  {job.verified ? (
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Unverified</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                  {job.requirements && job.requirements.slice(0, 2).map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-gray-50 truncate max-w-full">
                      {req.length > 30 ? `${req.substring(0, 30)}...` : req}
                    </Badge>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="shrink-0 h-6 gap-1 text-xs"
                  onClick={(e) => handleOpenJobUrl(e, job.url)}
                >
                  <ExternalLink className="h-3 w-3" />
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobList;
