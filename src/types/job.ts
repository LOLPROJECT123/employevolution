
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
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary' | 'volunteer' | 'other';
  level: 'intern' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'manager' | 'director';
  description: string;
  requirements?: string[];
  postedAt: string;
  skills: string[];
  applyUrl?: string;
  remote: boolean;
  workModel?: 'remote' | 'hybrid' | 'onsite';
  responsibilities?: string[];
  benefits?: string[];
  matchPercentage?: number;
  matchCriteria?: {
    degree: boolean;
    experience: boolean;
    skills: boolean;
    location: boolean;
  };
  companyType?: 'public' | 'private' | 'startup' | 'non-profit';
  companySize?: 'startup' | 'small' | 'mid-size' | 'enterprise';
  source?: string;
  applicationDetails?: {
    isAvailable: boolean;
    applicantCount?: number;
    easyApply?: boolean;
    platform?: string;
  };
  sponsorH1b?: boolean;
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
}
