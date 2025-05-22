
export interface ScrapeOptions {
  maxResults?: number;
  maxPages?: number;
  keywords?: string[];
  timeout?: number;
  useProxy?: boolean;
}

export interface ScraperConfig {
  userAgentList: string[];
  rateLimitDelay: number;
  maxRetries: number;
  headlessBrowserEnabled: boolean;
}

export interface JobSelectors {
  title: string[];
  company: string[];
  location: string[];
  description: string[];
  salary: string[];
  requirements?: string[];
  applyButton?: string[];
}

export interface ScraperResult {
  success: boolean;
  jobsFound: number;
  verifiedJobs: number;
  errors?: string[];
  duration: number;
}

export interface ParsingError extends Error {
  selectors?: string[];
  url?: string;
  component?: string;
}
