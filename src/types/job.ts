
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
  // Properties used in existing components
  benefits?: string[];
  responsibilities?: string[];
  applicantCount?: number;
  companySize?: string;
  companyType?: string;
  category?: string;
  jobFunction?: string;
  matchCriteria?: {
    degree: boolean;
    experience: boolean;
    skills: boolean;
    location: boolean;
  };
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
  // Additional filters used in components
  jobFunction?: string;
  companies?: string[];
  title?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: JobFilters;
  createdAt: string;
  lastUsed?: string;
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

// Export JobApplicationStatus as an alias for JobStatus for backwards compatibility
export type JobApplicationStatus = JobStatus;
