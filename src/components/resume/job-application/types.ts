
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
  matchKeywords?: string[];
}

export interface ResumeTemplate {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  downloadUrl: string;
  company: string;
  role: string;
  rating: number;
  downloads: number;
  tags: string[];
}
