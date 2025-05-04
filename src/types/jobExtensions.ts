
import { Job, JobApplicationStatus } from "@/types/job";

// Extended job interface with additional properties needed by our application
export interface ExtendedJob extends Job {
  status?: JobApplicationStatus;
  appliedAt?: string;
  logo?: string;
  jobType?: string;
  savedAt?: string;
}

// Helper function to convert a job to an extended job
export function extendJob(job: Job): ExtendedJob {
  return {
    ...job,
    // Set default values for required fields
    type: job.type || 'full-time',
    level: job.level || 'mid',
    postedAt: job.postedAt || new Date().toISOString(),
    requirements: job.requirements || []
  };
}

// Utility function to safely get job status as JobApplicationStatus
export function getJobStatus(job: ExtendedJob): JobApplicationStatus {
  return job.status || 'saved';
}
