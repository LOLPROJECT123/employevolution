
import { Job } from "@/types/job";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobCard } from "@/components/JobCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SavedAndAppliedJobsProps {
  savedJobs: Job[];
  appliedJobs: Job[];
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  onSelect: (job: Job) => void;
  selectedJobId: string | null;
}

export const SavedAndAppliedJobs = ({
  savedJobs,
  appliedJobs,
  onApply,
  onSave,
  onSelect,
  selectedJobId
}: SavedAndAppliedJobsProps) => {
  return (
    <Tabs defaultValue="saved" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="saved">Saved ({savedJobs.length})</TabsTrigger>
        <TabsTrigger value="applied">Applied ({appliedJobs.length})</TabsTrigger>
      </TabsList>
      
      <TabsContent value="saved" className="mt-4">
        <ScrollArea className="h-[400px]">
          {savedJobs.length > 0 ? (
            <div className="space-y-4">
              {savedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSelected={selectedJobId === job.id}
                  isSaved={true}
                  isApplied={false}
                  onApply={() => onApply(job)}
                  onClick={() => onSelect(job)}
                  onSave={() => onSave(job)}
                  variant="list"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No saved jobs yet
            </div>
          )}
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="applied" className="mt-4">
        <ScrollArea className="h-[400px]">
          {appliedJobs.length > 0 ? (
            <div className="space-y-4">
              {appliedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSelected={selectedJobId === job.id}
                  isSaved={false}
                  isApplied={true}
                  onApply={() => onApply(job)}
                  onClick={() => onSelect(job)}
                  onSave={() => onSave(job)}
                  variant="list"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No applications yet
            </div>
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};
