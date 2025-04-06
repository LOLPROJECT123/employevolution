
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
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BookmarkCheck className="w-5 h-5 mr-2 text-primary" />
            My Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
            You haven't saved or applied to any jobs yet. Browse jobs and click "Save" or "Apply" to see them here.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">My Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4" />
              <span>Saved Jobs ({savedJobs.length})</span>
            </TabsTrigger>
            <TabsTrigger value="applied" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Applied Jobs ({appliedJobs.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="saved" className="space-y-4">
            {savedJobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                You haven't saved any jobs yet.
              </p>
            ) : (
              <div className="space-y-4">
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
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="applied" className="space-y-4">
            {appliedJobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                You haven't applied to any jobs yet.
              </p>
            ) : (
              <div className="space-y-4">
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
