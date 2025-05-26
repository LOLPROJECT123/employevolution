
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  level: 'entry' | 'mid' | 'senior' | 'executive' | 'intern' | 'lead';
  postedAt: string;
  skills?: string[];
  remote?: boolean;
  applyUrl: string;
  source: string;
  matchPercentage?: number;
  workModel?: 'onsite' | 'remote' | 'hybrid';
  companySize?: string;
  companyType?: string;
  category?: string;
  jobFunction?: string;
  applicationDetails?: {
    isAvailable: boolean;
    applicantCount?: number;
    easyApply?: boolean;
  };
  matchCriteria?: {
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number;
  };
  aiMatchData?: {
    overall: number;
    skillsMatch: number;
    salaryMatch: number;
    locationMatch: number;
    experienceMatch: number;
    reasons: string[];
    suggestions: string[];
  };
}

export interface JobSearchFilters {
  query: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  jobType?: string;
  experienceLevel?: string;
  remote?: boolean;
  postedDays?: number;
  skills?: string[];
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
  jobFunction?: string[];
  companies?: string[];
  title?: string[];
}

export interface JobAlert {
  id: string;
  name: string;
  filters: JobSearchFilters;
  frequency: 'daily' | 'weekly' | 'immediate';
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: JobFilters;
  createdAt: string;
  lastUsed?: string;
}

export type JobStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'saved';
