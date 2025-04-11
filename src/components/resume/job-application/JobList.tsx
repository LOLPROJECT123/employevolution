
import { ScrapedJob } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";

interface JobListProps {
  jobs: ScrapedJob[];
  onSelectJob: (job: ScrapedJob) => void;
}

const JobList = ({ jobs, onSelectJob }: JobListProps) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No jobs found. Try a different search.</p>
      </div>
    );
  }

  const formatMatchBadge = (percentage: number) => {
    if (percentage >= 90) {
      return <Badge className="bg-green-500 hover:bg-green-600">{percentage}% Match</Badge>;
    } else if (percentage >= 80) {
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">{percentage}% Match</Badge>;
    } else {
      return <Badge className="bg-blue-500 hover:bg-blue-600">{percentage}% Match</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Search Results ({jobs.length})</h3>
      
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="divide-y">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-base">{job.title}</h4>
                <div className="flex gap-1.5">
                  {job.verified && (
                    <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified</span>
                    </Badge>
                  )}
                  {job.matchPercentage && formatMatchBadge(job.matchPercentage)}
                </div>
              </div>
              
              <div className="mb-2">
                <p className="text-sm">{job.company} • {job.location}</p>
                <p className="text-xs text-muted-foreground">Posted {job.datePosted} • via {job.source}</p>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  View Original <ExternalLink className="h-3 w-3" />
                </a>
                
                <Button 
                  size="sm" 
                  onClick={() => onSelectJob(job)}
                >
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default JobList;
