
import { ScrapedJob } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, ExternalLink, Briefcase, MapPin, Clock, Check } from "lucide-react";
import JobKeywordMatch from "@/components/JobKeywordMatch";

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
      
      <ScrollArea className="h-[600px] rounded-md border">
        <div className="p-1 space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex justify-between items-start">
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
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1.5" />
                      <span>{job.company}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      <span>{job.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1.5" />
                      <span>Posted {job.datePosted} • via {job.source}</span>
                    </div>
                  </div>
                  
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-1.5">Key Requirements</h5>
                      <ul className="text-sm space-y-1">
                        {job.requirements.slice(0, 2).map((req, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{req}</span>
                          </li>
                        ))}
                        {job.requirements.length > 2 && (
                          <li className="text-xs text-muted-foreground pl-5">
                            +{job.requirements.length - 2} more requirements
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  
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
                      onClick={() => onSelectJob(job)}
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
                
                {/* Keyword match section */}
                {job.keywordMatch && (
                  <div className="w-full md:w-64 flex-shrink-0">
                    <JobKeywordMatch
                      matchScore={job.keywordMatch.score}
                      keywordsFound={job.keywordMatch.found}
                      keywordsTotal={job.keywordMatch.total}
                      keywordsList={[
                        ...job.keywordMatch.highPriority.keywords.slice(0, 4),
                        ...job.keywordMatch.lowPriority.keywords.slice(0, 2)
                      ]}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default JobList;
