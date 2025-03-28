
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
}

export type JobApplicationTab = "manual" | "auto" | "scraper";
