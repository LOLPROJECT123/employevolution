
import { Job } from "@/types/job";
import { ScrapedJob } from "@/components/resume/job-application/types";
import { EnhancedJobCard } from "@/components/jobs/EnhancedJobCard";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Building, MapPin, Calendar, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnifiedJobListProps {
  apiJobs: Job[];
  scrapedJobs: ScrapedJob[];
  selectedJobId: string | null;
  savedJobIds: string[];
  appliedJobIds: string[];
  onJobSelect: (job: Job | ScrapedJob) => void;
  onSaveJob: (job: Job | ScrapedJob) => void;
  onApplyJob: (job: Job | ScrapedJob) => void;
  onSelectScrapedJob: (job: ScrapedJob) => void;
}

const UnifiedJobList = ({
  apiJobs,
  scrapedJobs,
  selectedJobId,
  savedJobIds,
  appliedJobIds,
  onJobSelect,
  onSaveJob,
  onApplyJob,
  onSelectScrapedJob
}: UnifiedJobListProps) => {
  return (
    <div className="space-y-4">
      {/* API Jobs Section */}
      {apiJobs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold">Job Search Results</h3>
            <Badge variant="secondary">{apiJobs.length} jobs</Badge>
          </div>
          <div className="space-y-3">
            {apiJobs.map((job) => (
              <EnhancedJobCard
                key={job.id}
                job={job}
                isSelected={selectedJobId === job.id}
                isSaved={savedJobIds.includes(job.id)}
                isApplied={appliedJobIds.includes(job.id)}
                onApply={() => onApplyJob(job)}
                onClick={() => onJobSelect(job)}
                onSave={() => onSaveJob(job)}
                variant="list"
              />
            ))}
          </div>
        </div>
      )}

      {/* Scraped Jobs Section */}
      {scrapedJobs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold">Discovered Jobs</h3>
            <Badge variant="secondary">{scrapedJobs.length} jobs</Badge>
            <Badge variant="outline" className="text-green-600">Verified</Badge>
          </div>
          <div className="space-y-3">
            {scrapedJobs.map((job) => (
              <div
                key={job.id}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                  selectedJobId === job.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => {
                  onJobSelect(job as any);
                  onSelectScrapedJob(job);
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{job.title}</h4>
                      {job.verified && (
                        <Badge className="bg-green-600">Verified</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{job.datePosted}</span>
                      </div>
                    </div>

                    {job.salary && (
                      <div className="text-sm font-medium text-green-600 mb-2">
                        {job.salary.currency}{job.salary.min.toLocaleString()} - {job.salary.currency}{job.salary.max.toLocaleString()}
                      </div>
                    )}

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{job.source}</Badge>
                      {job.atsSystem && (
                        <Badge variant="outline">{job.atsSystem}</Badge>
                      )}
                      {job.remote && (
                        <Badge variant="outline">Remote</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectScrapedJob(job);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Zap className="h-4 w-4" />
                      Auto Apply
                    </Button>
                    
                    {job.applyUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(job.applyUrl, '_blank');
                        }}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Job
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {apiJobs.length === 0 && scrapedJobs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No jobs found. Try searching for jobs or scraping from job board URLs.
        </div>
      )}
    </div>
  );
};

export default UnifiedJobList;
