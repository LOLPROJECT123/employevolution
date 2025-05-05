
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Job, JobApplicationStatus } from "@/types/job";
import { ExtendedJob } from "@/types/jobExtensions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JobApplicationTrackerProps {
  jobs: ExtendedJob[];
  job?: ExtendedJob; // Added this optional property to support single job view
  onStatusChange?: (jobId: string, status: JobApplicationStatus) => void;
}

const JobApplicationTracker = ({ jobs = [], job, onStatusChange }: JobApplicationTrackerProps) => {
  const [filter, setFilter] = useState<string>("all");
  
  // If a single job is provided, use that instead of jobs array
  const jobsToUse = job ? [job] : jobs;
  
  // Filter jobs based on status
  const filteredJobs = filter === "all" 
    ? jobsToUse 
    : jobsToUse.filter(job => job.status === filter);

  // Group jobs by status
  const groupedJobs = jobsToUse.reduce((acc, job) => {
    const status = job.status || 'saved';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(job);
    return acc;
  }, {} as Record<string, ExtendedJob[]>);

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'applied': return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case 'interviewing': return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case 'offered': return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 'rejected': return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };
  
  // Update job status
  const updateStatus = (jobId: string, newStatus: JobApplicationStatus) => {
    if (onStatusChange) {
      onStatusChange(jobId, newStatus);
    } else {
      console.log(`Updating job ${jobId} to status ${newStatus}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Tracker</CardTitle>
        <CardDescription>Track the status of your job applications</CardDescription>
        <Tabs
          value={filter}
          onValueChange={setFilter}
          className="w-full mt-2"
        >
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="interviewing">Interviewing</TabsTrigger>
            <TabsTrigger value="offered">Offered</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="flex justify-between items-center border-b pb-3 last:border-b-0">
                <div>
                  <h3 className="font-medium">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(job.status || 'saved')}>
                    {job.status || 'Saved'}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Simple status cycling logic
                      const statuses: JobApplicationStatus[] = ['saved', 'applied', 'interviewing', 'offered', 'rejected'];
                      const currentIndex = statuses.indexOf((job.status as JobApplicationStatus) || 'saved');
                      const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                      updateStatus(job.id, nextStatus);
                    }}
                  >
                    Update
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No applications found for the selected filter.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full text-sm text-muted-foreground">
          <p>Total applications: {jobsToUse.length}</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobApplicationTracker;
