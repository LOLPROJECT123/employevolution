
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: 'entry' | 'mid' | 'senior' | 'executive';
  postedAt: string;
  skills?: string[];
  remote?: boolean;
  applyUrl: string;
  source: string;
  matchPercentage?: number;
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

export interface JobAlert {
  id: string;
  name: string;
  filters: JobSearchFilters;
  frequency: 'daily' | 'weekly' | 'immediate';
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}
