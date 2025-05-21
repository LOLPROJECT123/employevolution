
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
  postedAt?: string;
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
