
/**
 * Types for job scraping functionality
 */

import { Job } from "@/types/job";

export type JobSource = 
  | 'LinkedIn' 
  | 'Indeed' 
  | 'Glassdoor'
  | 'ZipRecruiter'
  | 'Monster' 
  | 'Upwork'
  | 'Freelancer'
  | 'AngelList'
  | 'Wellfound'
  | 'BuiltIn'
  | 'CompanyWebsite';

export interface ScraperFilters {
  keywords: string[];
  location?: string;
  distance?: number; // in miles/km
  datePosted?: 'today' | 'past_week' | 'past_month' | 'anytime';
  jobType?: ('full_time' | 'part_time' | 'contract' | 'temporary' | 'internship')[];
  experienceLevel?: ('entry' | 'mid' | 'senior' | 'executive')[];
  remote?: boolean;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  excludeTerms?: string[];
  includeTerms?: string[];
  companies?: string[];
  industries?: string[];
}

export interface ScraperProgress {
  currentPage: number;
  totalPages?: number;
  jobsFound: number;
  jobsProcessed: number;
  jobsFiltered: number;
  currentSource?: JobSource;
  remainingSources: JobSource[];
  estimatedTimeRemaining?: number; // in seconds
  status: 'idle' | 'running' | 'paused' | 'complete' | 'error';
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface ScrapedJobListing {
  title: string;
  company: string;
  location: string;
  salary?: string;
  datePosted: string;
  jobUrl: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  skills?: string[];
  source: JobSource;
  sourceId: string; // ID from the source platform
  isPremium?: boolean; // Job requiring premium access
  hasEasyApply?: boolean;
}

export interface ScraperStats {
  totalJobs: number;
  sourceCounts: Record<JobSource, number>;
  matchRatingDistribution: {
    excellent: number; // 90-100%
    good: number; // 75-89%
    fair: number; // 50-74%
    poor: number; // <50%
  };
  dateRange: {
    oldest: string;
    newest: string;
  };
  mostCommonSkills: Array<{skill: string, count: number}>;
  salaryRange?: {
    min: number;
    max: number;
    average: number;
    median: number;
  };
  remoteJobs: number;
  localJobs: number;
}

export interface JobScraperConfig {
  sources: JobSource[];
  maxJobsPerSource?: number;
  maxTotalJobs?: number;
  filters: ScraperFilters;
  useProxy?: boolean;
  proxyConfig?: ProxyConfig;
  concurrentRequests?: number;
  requestDelay?: number; // milliseconds between requests
  browserConfig?: BrowserConfig;
  autoSaveResults?: boolean;
  resumeOnFailure?: boolean;
  excludeDuplicates?: boolean;
}

export interface ProxyConfig {
  proxyList?: string[];
  rotateProxies?: boolean;
  apiKey?: string;
  serviceType?: 'brightdata' | 'smartproxy' | 'oxylabs' | 'luminati' | 'custom';
}

export interface BrowserConfig {
  headless?: boolean;
  userAgent?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  bypassDetection?: boolean;
}

export interface JobScraperResult {
  jobs: ScrapedJobListing[];
  stats: ScraperStats;
  runtime: number; // milliseconds
  timestamp: string;
  filters: ScraperFilters;
  sources: JobSource[];
  successful: boolean;
  errors?: string[];
}

export interface JobScraperOptions {
  resumeExisting?: boolean;
  notify?: boolean;
  exportFormat?: 'json' | 'csv' | 'excel';
  sessionId?: string;
}
