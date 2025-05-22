// Define ScrapedJob type
export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url?: string;
  source?: string;
  datePosted?: string;
  postedAt?: string;
  description?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  requirements?: string[];
  skills?: string[];
  applyUrl: string;
  verified: boolean;
  remote?: boolean;
  sourceUrl?: string;
  keywordMatch?: {
    score: number;
    total: number;
    found: number;
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
  matchPercentage?: number;
  atsSystem?: string | null;
}

// Define JobApplicationTab type
export type JobApplicationTab = 'manual' | 'auto' | 'scraper' | 'linkedin' | 'custom-urls';

// Define ResumeTemplate interface
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  previewUrl?: string;
  downloadUrl: string;
  tags?: string[];
  rating?: number;
  downloads?: number;
  title?: string;
  company?: string;
  role?: string;
  roleType?: string;
  licenseType?: string;
  attribution?: string;
  imageUrl?: string;
}

// Define TemplateSource interface
export interface TemplateSource {
  id: string;
  name: string;
  url: string;
  isActive?: boolean;
  templates: ResumeTemplate[];
}
