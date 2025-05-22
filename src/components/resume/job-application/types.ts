
import React from "react";

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  applyUrl: string;
  postedAt?: string;
  datePosted?: string;  // Added for backward compatibility
  keywordMatch?: KeywordMatchData;
  matchPercentage?: number; // Added for match percentage display
  source: string;
  verified: boolean;
  remote?: boolean;
  atsSystem?: string | null;
  url?: string;
  detailsFetched?: boolean;
  requirements?: string[];
  benefitsOffered?: string[];
  sourceUrl?: string;
  lastVerified?: string;
}

export interface KeywordMatchData {
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
}

export type JobApplicationTab = "manual" | "auto" | "scraper" | "linkedin" | "custom-urls";

export interface JobSource {
  id: string;
  name: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  category?: 'general' | 'tech' | 'finance' | 'custom' | 'ats' | 'corporate';
  lastScraped?: string;
  jobCount?: number;
  isGeneric?: boolean;
  atsType?: string;
}

// Add ResumeTemplate and TemplateSource types needed for ResumeTemplates.tsx
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isPremium: boolean;
  isPopular?: boolean;
  category: string;
  tags: string[];
  // Additional properties used in the component
  company?: string;
  role?: string;
  roleType?: string;
  rating?: number;
  downloads?: number;
  source?: string;
  attribution?: string;
  licenseType?: string;
  imageUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
}

export interface TemplateSource {
  id: string;
  name: string;
  url: string;
  templateCount: number;
  isPremium: boolean;
  isOfficial: boolean;
  isActive: boolean;
  attribution: string;
  templates: ResumeTemplate[];
}
