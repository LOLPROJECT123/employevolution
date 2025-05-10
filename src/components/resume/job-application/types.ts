
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
  verified: boolean;
  salary?: string;
  requirements?: string[];
  jobType?: string;
  remote?: boolean;
  level?: string;
  // Add missing properties that are causing TypeScript errors
  matchPercentage?: number;
  keywordMatch?: {
    score?: number;
    found?: number;
    total?: number;
    highPriority?: {
      keywords?: string[];
      found?: number;
      total?: number;
    };
    lowPriority?: {
      keywords?: string[];
      found?: number;
      total?: number;
    };
  };
}

export interface JobScrapeConfig {
  url: string;
  platform: string;
  keywords?: string[];
  locations?: string[];
  excludeKeywords?: string[];
  dateRange?: string;
  experienceLevel?: string[];
  remote?: boolean;
}

// Add missing types for ResumeTemplate and TemplateSource
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  source: TemplateSource;
}

export enum TemplateSource {
  DEFAULT = "default",
  CUSTOM = "custom",
  DOWNLOADED = "downloaded"
}
