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
  requirements: string[];
  postedAt: string;
  skills: string[];
  matchPercentage?: number;
  remote?: boolean;
  companyType?: 'private' | 'public' | 'nonprofit' | 'education';
  companySize?: 'seed' | 'early' | 'mid-size' | 'large' | 'enterprise';
  datePosted?: string;
  education?: string[];
  benefits?: string[];
  matchCriteria?: {
    degree?: boolean;
    experience?: boolean;
    skills?: boolean;
    location?: boolean;
  };
  responsibilities?: string[];
  applyUrl?: string;
  source?: string;
  workModel?: 'onsite' | 'remote' | 'hybrid';
  sponsorH1b?: boolean;
  category?: string;
  excludedSkills?: string[];
  jobFunction?: string;
  applicationStatus?: JobApplicationStatus;
  applicationDetails?: {
    appliedDate?: string;
    platform?: string;
    resumeUsed?: string;
    coverLetterUsed?: string;
    contactPerson?: string;
    notesHistory?: Array<{
      date: string;
      note: string;
    }>;
    nextSteps?: string;
    applicantCount?: number;
    isAvailable?: boolean;
  };
  interviews?: Array<{
    id: string;
    date: string;
    type: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral';
    interviewers?: string[];
    feedback?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
  }>;
  keywordMatch?: {
    score: number;
    found: number;
    total: number;
    highPriority?: {
      keywords: string[];
      found: number;
      total: number;
    };
    lowPriority?: {
      keywords: string[];
      found: number;
      total: number;
    };
  };
  sortScore?: number;
}

export type JobStatus = 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted';

export type JobApplicationStatus = 
  | 'saved' 
  | 'applied' 
  | 'phone_screen' 
  | 'interview' 
  | 'assessment' 
  | 'offer' 
  | 'accepted' 
  | 'rejected' 
  | 'declined' 
  | 'withdrawn';

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: JobStatus;
  appliedAt: string;
  notes?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: JobFilters;
  createdAt: string;
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
  sort?: 'relevance' | 'date-newest' | 'date-oldest' | 'salary-highest' | 'salary-lowest';
}

export interface JobCardProps {
  job: Job;
  view?: 'list' | 'grid' | 'detailed'; // Updated to include 'detailed' view
  onClick?: () => void;
  onSave?: () => void;
  onApply?: () => void;
  isSaved?: boolean;
  isApplied?: boolean;
  showMatchScore?: boolean;
}

export interface CoverLetterTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface ApplicationQuestion {
  id: string;
  question: string;
  category: 'experience' | 'skills' | 'behavioral' | 'motivation' | 'other';
  sampleAnswer: string;
  lastUsed?: string;
  jobIds?: string[];  // Jobs where this question appeared
}
