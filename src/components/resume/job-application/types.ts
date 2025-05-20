
// Define available tabs for job application workflow
export type JobApplicationTab = 'manual' | 'auto' | 'scraper';

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
  salary?: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  matchPercentage?: number;
  matchKeywords?: string[];
  requiredSkills?: string[];
  matchedSkills?: string[];
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
  jobType?: string;
  workModel?: 'onsite' | 'remote' | 'hybrid';
  experienceLevel?: string;
  education?: string[];
  benefits?: string[];
  applicationCount?: number;
  companyLogo?: string;
  companySize?: string;
  companyIndustry?: string;
  responsibilities?: string[];
  applicationStatus?: string;
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
