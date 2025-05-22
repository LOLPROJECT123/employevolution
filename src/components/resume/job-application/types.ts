
export type JobApplicationTab = 'manual' | 'auto' | 'scraper' | 'linkedin';

export interface JobSource {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  category: 'general' | 'tech' | 'finance' | 'custom' | 'ats' | 'corporate';
  lastScraped: string;
  jobCount: number;
  isGeneric?: boolean;
  atsType?: string;
}

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  applyUrl?: string;
  // Add missing properties
  url?: string;
  datePosted?: string;
  postedAt?: string; // Some components use postedAt and others use datePosted
  matchPercentage?: number;
  requirements?: string[];
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
  source?: string;
  verified?: boolean;
  logoUrl?: string;
  remote?: boolean;
  atsSystem?: string;
  requirementsMatch?: {
    score: number;
    requirements: Array<{
      text: string;
      matched: boolean;
    }>;
  };
}

// Add the missing types needed by ResumeTemplates.tsx
export interface ResumeTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  previewUrl: string;
  downloadUrl: string;
  company: string;
  role: string;
  roleType: string;
  rating: number;
  downloads: number;
  tags: string[];
  source: string;
  attribution: string;
  licenseType: 'free' | 'premium' | 'attribution-required';
  thumbnail?: string;
  category?: string;
  popularity?: 'high' | 'medium' | 'low';
  atsScore?: number;
  premium?: boolean;
  customizable?: boolean;
}

export interface TemplateSource {
  id: string;
  name: string;
  url: string;
  templateCount: number;
  isPremium: boolean;
  isOfficial: boolean;
  isActive?: boolean;
  attribution?: string;
}
