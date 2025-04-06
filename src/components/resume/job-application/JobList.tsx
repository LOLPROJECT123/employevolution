
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrapedJob } from "./types";

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
              <div>
                <div className="font-medium">{job.title}</div>
                <div className="text-sm text-muted-foreground">{job.company}</div>
                <div className="text-sm text-muted-foreground">{job.location}</div>
                <div className="flex items-center mt-1 space-x-2">
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
              <Button variant="ghost" size="sm">
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
