
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: 'entry' | 'mid' | 'senior' | 'executive' | 'intern';
  description: string;
  requirements: string[];
  postedAt: string;
  skills: string[];
  applyUrl: string;
  source: string;
  remote: boolean;
  workModel: 'onsite' | 'remote' | 'hybrid';
  matchPercentage?: number;
  // New properties for advanced filtering
  season?: string;
  isLeadershipRole?: boolean;
  requiresSecurityClearance?: boolean;
  sponsorsH1B?: boolean;
  isSimpleApplication?: boolean;
}

export interface JobFilters {
  search: string;
  location: string;
  jobType: string[];
  remote: boolean;
  experienceLevels: string[];
  education: string[];
  salaryRange: [number, number];
  skills: string[];
  companyTypes: string[];
  companySize: string[];
  benefits: string[];
  // New advanced filters
  seasons: string[];
  leadership: 'individual' | 'manager' | 'no-preference';
  securityClearance: 'hide' | 'show-only' | 'allow';
  sponsorH1B: boolean;
  simpleApplications: boolean;
  hideAppliedJobs: boolean;
}

export type JobStatus = 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted';

export interface JobApplication {
  id: string;
  jobId: string;
  appliedAt: string;
  status: JobStatus;
  notes?: string;
}

export interface SavedJob {
  id: string;
  jobId: string;
  savedAt: string;
  notes?: string;
}
