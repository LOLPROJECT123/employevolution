
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
  previewUrl: string;
  downloadUrl: string;
  company: string;
  role: string;
  roleType?: string; // Added roleType to indicate full-time, intern, contract, etc.
  rating: number;
  downloads: number;
  tags: string[];
}
