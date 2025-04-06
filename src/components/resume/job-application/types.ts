
export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  datePosted?: string;
  description?: string;
  applyUrl?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  matchPercentage?: number;
}

export type JobApplicationTab = "manual" | "auto" | "scraper";

export interface JobFilterOptions {
  locations: string[];
  jobTypes: string[];
  experienceLevels: string[];
  skills: string[];
  companyTypes: string[];
  companySizes: string[];
  benefits: string[];
  salaryRanges: { min: number; max: number; label: string }[];
}
