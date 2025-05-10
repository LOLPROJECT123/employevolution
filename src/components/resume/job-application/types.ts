
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
