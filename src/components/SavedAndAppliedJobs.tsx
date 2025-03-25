
import { useState } from 'react';
import { Job } from "@/types/job";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { JobCard } from "@/components/JobCard";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { BookmarkCheck, CheckCircle } from "lucide-react";

interface SavedAndAppliedJobsProps {
  savedJobs: Job[];
  appliedJobs: Job[];
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  onSelect: (job: Job) => void;
  selectedJobId: string | null;
}

export function SavedAndAppliedJobs({
  savedJobs,
  appliedJobs,
  onApply,
  onSave,
  onSelect,
  selectedJobId
}: SavedAndAppliedJobsProps) {
  const [activeTab, setActiveTab] = useState<string>("saved");
  
  if (savedJobs.length === 0 && appliedJobs.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">My Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border">
            <h3 className="font-medium mb-2 text-center">My Jobs</h3>
            <div className="flex justify-center gap-4 mb-4">
              <span className="text-sm">Saved Jobs (0)</span>
              <span className="text-sm text-gray-500">Applied Jobs (0)</span>
            </div>
            <p className="text-center text-muted-foreground text-sm">
              You Haven't Saved Any Jobs Yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-lg">My Jobs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
            <TabsTrigger value="saved" className="text-sm rounded-none py-3">
              Saved Jobs ({savedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="applied" className="text-sm rounded-none py-3">
              Applied Jobs ({appliedJobs.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="saved" className="p-0 pt-2">
            {savedJobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                You Haven't Saved Any Jobs Yet.
              </p>
            ) : (
              <div className="divide-y">
                {savedJobs.map(job => (
                  <JobCard 
                    key={job.id}
                    job={job}
                    onApply={onApply}
                    isSelected={selectedJobId === job.id}
                    isSaved={true}
                    isApplied={appliedJobs.some(j => j.id === job.id)}
                    onClick={() => onSelect(job)}
                    onSave={() => onSave(job)}
                    variant="list"
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="applied" className="p-0 pt-2">
            {appliedJobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                You Haven't Applied To Any Jobs Yet.
              </p>
            ) : (
              <div className="divide-y">
                {appliedJobs.map(job => (
                  <JobCard 
                    key={job.id}
                    job={job}
                    onApply={onApply}
                    isSelected={selectedJobId === job.id}
                    isSaved={savedJobs.some(j => j.id === job.id)}
                    isApplied={true}
                    onClick={() => onSelect(job)}
                    onSave={() => onSave(job)}
                    variant="list"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
