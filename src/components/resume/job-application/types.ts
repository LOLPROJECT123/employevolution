
export type JobApplicationTab = 'manual' | 'auto' | 'scraper' | 'browse';

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
