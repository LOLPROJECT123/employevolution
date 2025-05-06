
// Types for job scraper and application functionality

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  datePosted: string;
  description: string;
  applyUrl?: string;
  matchPercentage?: number;
  requirements?: string[];
  verified?: boolean;
  keywordMatch?: {
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
  };
}

export interface JobSource {
  name: string;
  supported: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface JobScraperSettings {
  maxResults: number;
  useProxy: boolean;
  proxyConfig: {
    url: string;
    enabled: boolean;
  };
  selectedSources: string[];
  keywords: string[];
  locations: string[];
}

export interface ApplicationCredentials {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  linkedin: string;
  website: string;
  yearsOfExperience: number;
  workAuthorization: string;
  education: {
    school: string;
    degree: string;
    field: string;
    graduationDate: string;
  };
}

export interface AutofillConfig {
  enabled: boolean;
  credentials: ApplicationCredentials;
  preferences: {
    skipAssessments: boolean;
    skipCoverLetter: boolean;
    skipFutureEmails: boolean;
  };
}
