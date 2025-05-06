
import React from "react";
import { Job, JobApplicationStatus } from "@/types/job";
import { ExtendedJob } from "@/types/jobExtensions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, Send, Calendar } from "lucide-react";

export interface JobApplicationTrackerProps {
  jobs: ExtendedJob[];
  job?: ExtendedJob; // Optional single job parameter for detail view
  onStatusChange: (jobId: string, status: JobApplicationStatus) => void;
}

export default function JobApplicationTracker({ jobs, job, onStatusChange }: JobApplicationTrackerProps) {
  // Use the single job if provided, otherwise use the array
  const jobsToTrack = job ? [job] : jobs;
  
  const handleStatusChange = (jobId: string, value: string) => {
    onStatusChange(jobId, value as JobApplicationStatus);
  };

  const getStatusDisplay = (status: string = "saved") => {
    switch (status) {
      case "saved":
        return { label: "Saved", icon: <Clock className="h-4 w-4 text-blue-500" />, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
      case "applied":
        return { label: "Applied", icon: <Send className="h-4 w-4 text-green-500" />, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" };
      case "interviewing":
        return { label: "Interviewing", icon: <Calendar className="h-4 w-4 text-purple-500" />, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" };
      case "offered":
        return { label: "Offered", icon: <CheckCircle className="h-4 w-4 text-amber-500" />, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" };
      case "accepted":
        return { label: "Accepted", icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" };
      case "rejected":
        return { label: "Rejected", icon: <Clock className="h-4 w-4 text-red-500" />, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
      default:
        return { label: "Saved", icon: <Clock className="h-4 w-4 text-blue-500" />, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Application Status</CardTitle>
      </CardHeader>
      <CardContent>
        {jobsToTrack.map((job) => {
          const status = job.status || "saved";
          const { label, icon, color } = getStatusDisplay(status);
          
          return (
            <div key={job.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {icon}
                  <Badge variant="outline" className={color}>
                    {label}
                  </Badge>
                </div>
                
                <Select
                  value={status}
                  onValueChange={(value) => handleStatusChange(job.id, value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offered">Offered</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {job.appliedAt && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Applied:</span> {new Date(job.appliedAt).toLocaleDateString()}
                </div>
              )}
              
              {job.status === "interviewing" && job.interviewDate && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Interview:</span> {new Date(job.interviewDate).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
