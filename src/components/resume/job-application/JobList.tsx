
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrapedJob } from "./types";
import { BookmarkIcon, Percent } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface JobListProps {
  jobs: ScrapedJob[];
  onSelectJob: (job: ScrapedJob) => void;
}

const JobList = ({ jobs, onSelectJob }: JobListProps) => {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-sm font-medium">Results ({jobs.length})</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {jobs.map((job) => (
          <div 
            key={job.id} 
            className="p-3 border rounded-md hover:bg-accent transition-colors cursor-pointer"
            onClick={() => onSelectJob(job)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium">{job.title}</div>
                <div className="text-sm text-muted-foreground">{job.company}</div>
                <div className="text-sm text-muted-foreground">{job.location}</div>
                
                {job.matchPercentage && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Match</span>
                      <span className="font-medium">{job.matchPercentage}%</span>
                    </div>
                    <Progress value={job.matchPercentage} className="h-1.5" />
                  </div>
                )}
                
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {job.source}
                  </Badge>
                  {job.datePosted && (
                    <span className="text-xs text-muted-foreground">
                      {job.datePosted}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-16">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <BookmarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-2">
              <Button variant="default" size="sm" className="w-full mt-2">
                Apply
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;
