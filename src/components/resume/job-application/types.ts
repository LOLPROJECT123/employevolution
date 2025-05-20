export type JobApplicationTab = 'manual' | 'auto' | 'scraper' | 'linkedin';

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  datePosted: string;
  description: string;
  applyUrl: string;
  verified?: boolean;
  matchPercentage?: number;
  matchKeywords?: string[];
  remote?: boolean;
  keywordMatch?: {
    score: number;
    total: number;
    found: number;
    highPriority: {
      keywords: string[];
      found: number;
      total: number;
    };
    lowPriority: {
      keywords: string[];
      found: number;
      total: number;
    };
  };
  requirements?: string[];
}

export interface ResumeTemplate {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  previewUrl: string;
  downloadUrl: string;
  company: string;
  role: string;
  roleType?: string;
  rating: number;
  downloads: number;
  tags: string[];
  source?: string;
  attribution?: string;
  licenseType?: 'free' | 'premium' | 'attribution-required';
}

export interface TemplateSource {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  isActive: boolean;
  attribution: string;
}

export interface SwipeJobsInterfaceProps {
  jobs: any[];
  onApply: (job: any) => void;
  onSkip: () => void;
  onSave: (job: any) => void;
  onClose: () => void;
}

export interface JobCardProps {
  job: any;
  onClick: () => void;
  isSaved: boolean;
  onSave: () => void;
  isApplied: boolean;
  onApply: () => void;
  showMatchScore: boolean;
}

export interface LinkedInContactFinderProps {
  job?: any;
  university?: string;
}

export interface JobSource {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  category?: string;
  lastScraped?: string;
  jobCount?: number;
}
