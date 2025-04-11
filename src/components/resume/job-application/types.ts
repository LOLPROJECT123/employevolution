
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
  matchPercentage?: number;
}
