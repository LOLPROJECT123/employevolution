import React from "react";

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  applyUrl: string;
  postedAt: string;
  keywordMatch: KeywordMatchData;
  source: string;
  verified: boolean;
  remote: boolean;
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
}
