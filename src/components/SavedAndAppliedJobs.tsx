
import { useState } from 'react';
import { Job, JobStatus } from "@/types/job";
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
import {
  Button
} from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useJobApplications } from "@/contexts/JobApplicationContext";

interface SavedAndAppliedJobsProps {
  onSelect: (job: Job) => void;
  selectedJobId: string | null;
  // Add these props to match how it's used in Jobs.tsx
  savedJobs?: Job[];
  appliedJobs?: Job[];
  onApply?: (job: Job) => void;
  onSave?: (job: Job) => void;
  hideTitle?: boolean; // New prop to hide the title
}

export function SavedAndAppliedJobs({
  onSelect,
  selectedJobId,
  savedJobs: propSavedJobs,
  appliedJobs: propAppliedJobs,
  onApply: propOnApply,
  onSave: propOnSave,
  hideTitle = false // Default to false
}: SavedAndAppliedJobsProps) {
  const [activeTab, setActiveTab] = useState<string>("saved");
  
  const { 
    savedJobs: contextSavedJobs, 
    appliedJobs: contextAppliedJobs, 
    applyToJob: contextApplyToJob, 
    saveJob: contextSaveJob, 
    applications,
    updateApplicationStatus,
    getApplicationByJobId
  } = useJobApplications();
  
  // Use props if provided, otherwise fall back to context values
  const savedJobs = propSavedJobs || contextSavedJobs;
  const appliedJobs = propAppliedJobs || contextAppliedJobs;
  const applyToJob = propOnApply || contextApplyToJob;
  const saveJob = propOnSave || contextSaveJob;
  
  const handleStatusChange = (jobId: string, status: JobStatus) => {
    const application = getApplicationByJobId(jobId);
    if (application) {
      updateApplicationStatus(application.id, status);
    }
  };
  
  return (
    <Card className="h-full shadow-none border-0 sm:border sm:shadow-sm overflow-hidden">
      {!hideTitle && (
        <CardHeader className="border-b pb-3 pt-4">
          <CardTitle className="text-lg">My Jobs</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-transparent h-auto">
            <TabsTrigger value="saved" className="text-sm rounded-none py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
              Saved Jobs ({savedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="applied" className="text-sm rounded-none py-3 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
              Applied Jobs ({appliedJobs.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="saved" className="p-0 pt-2 overflow-auto max-h-[calc(100vh-180px)]">
            {savedJobs.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-muted-foreground mb-2">
                  You Haven't Saved Any Jobs Yet.
                </p>
                <p className="text-muted-foreground text-sm mb-4">
                  Save jobs to keep track of positions you're interested in.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {savedJobs.map(job => (
                  <JobCard 
                    key={job.id}
                    job={job}
                    onApply={() => applyToJob(job)}
                    isSelected={selectedJobId === job.id}
                    isSaved={true}
                    isApplied={appliedJobs.some(j => j.id === job.id)}
                    onClick={() => onSelect(job)}
                    onSave={() => saveJob(job)}
                    variant="list"
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="applied" className="p-0 pt-2 overflow-auto max-h-[calc(100vh-180px)]">
            {appliedJobs.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-muted-foreground mb-2">
                  You Haven't Applied To Any Jobs Yet.
                </p>
                <p className="text-muted-foreground text-sm mb-4">
                  Apply to jobs to track your application progress.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {appliedJobs.map(job => {
                  const application = getApplicationByJobId(job.id);
                  return (
                    <div key={job.id} className="relative">
                      <JobCard 
                        job={job}
                        onApply={() => applyToJob(job)}
                        isSelected={selectedJobId === job.id}
                        isSaved={savedJobs.some(j => j.id === job.id)}
                        isApplied={true}
                        onClick={() => onSelect(job)}
                        onSave={() => saveJob(job)}
                        variant="list"
                      />
                      <div className="px-4 py-2 border-t flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Status: <span className="font-medium">{application?.status.charAt(0).toUpperCase() + application?.status.slice(1)}</span>
                        </span>
                        <Select
                          value={application?.status}
                          onValueChange={(value) => handleStatusChange(job.id, value as JobStatus)}
                        >
                          <SelectTrigger className="w-[160px] h-8">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="interviewing">Interviewing</SelectItem>
                            <SelectItem value="offered">Offered</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
