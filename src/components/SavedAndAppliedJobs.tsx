
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ModeToggle";

interface SavedAndAppliedJobsProps {
  onSelect: (job: Job) => void;
  selectedJobId: string | null;
}

export function SavedAndAppliedJobs({
  onSelect,
  selectedJobId
}: SavedAndAppliedJobsProps) {
  const [activeTab, setActiveTab] = useState<string>("saved");
  
  const { 
    savedJobs, 
    appliedJobs, 
    applyToJob, 
    saveJob, 
    applications,
    updateApplicationStatus,
    getApplicationByJobId
  } = useJobApplications();
  
  const handleStatusChange = (jobId: string, status: JobStatus) => {
    const application = getApplicationByJobId(jobId);
    if (application) {
      updateApplicationStatus(application.id, status);
    }
  };
  
  // User profile avatar with initials at the top
  const profileHeader = (
    <div className="flex justify-between items-center bg-background py-2 px-4 border-b">
      <Avatar className="h-8 w-8">
        <AvatarFallback>VV</AvatarFallback>
      </Avatar>
      <ModeToggle />
    </div>
  );
  
  if (savedJobs.length === 0 && appliedJobs.length === 0) {
    return (
      <Card className="h-full">
        {profileHeader}
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg">My Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-4 py-8 text-center">
            <div className="flex justify-center gap-6 mb-4 text-sm font-medium">
              <span>Saved Jobs (0)</span>
              <span className="text-muted-foreground">Applied Jobs (0)</span>
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
    <Card className="h-full">
      {profileHeader}
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
          
          <TabsContent value="saved" className="p-0 pt-2 overflow-auto max-h-[calc(100vh-350px)]">
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
          
          <TabsContent value="applied" className="p-0 pt-2 overflow-auto max-h-[calc(100vh-350px)]">
            {appliedJobs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                You Haven't Applied To Any Jobs Yet.
              </p>
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
