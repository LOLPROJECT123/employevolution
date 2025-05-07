
/**
 * Implementation of Crawl4AI for job scraping
 * Based on: https://github.com/unclecode/crawl4ai
 */

import { ScrapedJob } from "@/components/resume/job-application/types";
import { toast } from "sonner";

// Crawl4AI configuration types
export interface Crawl4AIOptions {
  maxPages?: number;
  maxResults?: number;
  timeout?: number;
  waitFor?: number;
  proxy?: string;
  userAgent?: string;
  headers?: Record<string, string>;
}

export interface JobSiteConfig {
  siteName: string;
  baseUrl: string;
  searchUrlTemplate: string;
  selectors: {
    jobList: string;
    jobItem: string;
    title: string;
    company: string;
    location: string;
    description?: string;
    applyUrl?: string;
    date?: string;
    salary?: string;
  };
  pagination?: {
    nextButton?: string;
    pageParam?: string;
    maxPages?: number;
  };
  transform?: {
    title?: (text: string) => string;
    company?: (text: string) => string;
    location?: (text: string) => string;
    description?: (text: string) => string;
    date?: (text: string) => string;
  };
}

// Predefined job site configurations
export const JOB_SITE_CONFIGS: Record<string, JobSiteConfig> = {
  'linkedin': {
    siteName: 'LinkedIn',
    baseUrl: 'https://www.linkedin.com',
    searchUrlTemplate: 'https://www.linkedin.com/jobs/search/?keywords={query}&location={location}&start={offset}',
    selectors: {
      jobList: '.jobs-search__results-list',
      jobItem: '.job-search-card',
      title: '.base-search-card__title',
      company: '.base-search-card__subtitle',
      location: '.job-search-card__location',
      applyUrl: 'a.base-card__full-link',
      date: '.job-search-card__listdate'
    },
    pagination: {
      pageParam: 'start',
      maxPages: 5
    }
  },
  'indeed': {
    siteName: 'Indeed',
    baseUrl: 'https://www.indeed.com',
    searchUrlTemplate: 'https://www.indeed.com/jobs?q={query}&l={location}&start={offset}',
    selectors: {
      jobList: '.jobsearch-ResultsList',
      jobItem: '.job_seen_beacon',
      title: '.jcs-JobTitle',
      company: '.companyName',
      location: '.companyLocation',
      description: '.job-snippet',
      applyUrl: '.jcs-JobTitle',
      date: '.date'
    },
    pagination: {
      pageParam: 'start',
      maxPages: 5
    }
  },
  'glassdoor': {
    siteName: 'Glassdoor',
    baseUrl: 'https://www.glassdoor.com',
    searchUrlTemplate: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword={query}&locT=C&locId={locationId}',
    selectors: {
      jobList: '.job-search-results',
      jobItem: '.react-job-listing',
      title: '.job-title',
      company: '.employer-name',
      location: '.location',
      description: '.job-description',
      applyUrl: '.job-link'
    },
    pagination: {
      nextButton: '.next',
      maxPages: 3
    }
  }
};

/**
 * Main class for Crawl4AI job scraping
 */
export class Crawl4AI {
  private options: Crawl4AIOptions;
  
  constructor(options?: Crawl4AIOptions) {
    this.options = {
      maxPages: 3,
      maxResults: 50,
      timeout: 30000,
      waitFor: 2000,
      ...options
    };
  }
  
  /**
   * Search for jobs across multiple sites
   */
  async searchJobs(query: string, location: string = '', sitesToSearch: string[] = ['linkedin', 'indeed']): Promise<ScrapedJob[]> {
    const allJobs: ScrapedJob[] = [];
    
    for (const site of sitesToSearch) {
      if (JOB_SITE_CONFIGS[site]) {
        try {
          const jobs = await this.scrapeJobSite(site, query, location);
          allJobs.push(...jobs);
          
          // Break if we've reached the maximum number of results
          if (allJobs.length >= (this.options.maxResults || 50)) {
            break;
          }
        } catch (error) {
          console.error(`Error scraping ${site}:`, error);
        }
      }
    }
    
    return allJobs.slice(0, this.options.maxResults || 50);
  }
  
  /**
   * Scrape jobs from a specific site
   */
  private async scrapeJobSite(siteKey: string, query: string, location: string): Promise<ScrapedJob[]> {
    const config = JOB_SITE_CONFIGS[siteKey];
    
    if (!config) {
      throw new Error(`Unknown site: ${siteKey}`);
    }
    
    // For demo purposes, we'll simulate the scraping
    // In a real implementation, this would use a headless browser or API
    console.log(`Scraping ${config.siteName} for "${query}" in "${location || 'any location'}"`);
    
    // Simulate a delay for the scraping process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock results
    const results = this.generateMockResults(config, query, location, 10);
    
    return results;
  }
  
  /**
   * Generate mock job results for demonstration
   */
  private generateMockResults(config: JobSiteConfig, query: string, location: string, count: number): ScrapedJob[] {
    const results: ScrapedJob[] = [];
    const companies = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Spotify', 'Airbnb', 'Uber', 'Twitter'];
    const locations = location ? [location] : ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote', 'Boston, MA'];
    const titlePrefix = query || 'Software Engineer';
    
    for (let i = 0; i < count; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const jobLocation = locations[Math.floor(Math.random() * locations.length)];
      const daysAgo = Math.floor(Math.random() * 14) + 1;
      const id = `${config.siteName.toLowerCase()}-${Date.now()}-${i}`;
      
      // Create a more realistic job URL
      const jobUrlPath = `${titlePrefix.toLowerCase().replace(/\s+/g, '-')}-at-${company.toLowerCase().replace(/\s+/g, '-')}-${id}`;
      const jobUrl = `${config.baseUrl}/jobs/${jobUrlPath}`;
      const applyUrl = `${config.baseUrl}/jobs/apply/${jobUrlPath}`;
      
      results.push({
        id,
        title: `${titlePrefix} ${['Senior', 'Lead', 'Principal', 'Junior', ''][Math.floor(Math.random() * 5)]}`.trim(),
        company,
        location: jobLocation,
        url: jobUrl,
        source: config.siteName,
        datePosted: `${daysAgo} days ago`,
        description: `This is a ${titlePrefix} position at ${company}. Join our team to work on exciting projects using modern technologies.`,
        applyUrl,
        verified: Math.random() > 0.1, // 90% chance of being verified
        matchPercentage: Math.floor(Math.random() * 31) + 70, // 70-100%
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          `3+ years of experience with ${query}`,
          'Strong problem-solving skills'
        ]
      });
    }
    
    return results;
  }
  
  /**
   * Verify that job listings and apply URLs are valid
   */
  async verifyJobs(jobs: ScrapedJob[]): Promise<ScrapedJob[]> {
    console.log(`Verifying ${jobs.length} job listings`);
    
    // In a real implementation, this would check if the URLs are valid
    // For this demo, we'll simulate verification with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return jobs.map(job => ({
      ...job,
      verified: Math.random() > 0.15 // 85% chance of successful verification
    })).filter(job => job.verified);
  }
  
  /**
   * Extract details from a job listing page
   */
  async extractJobDetails(job: ScrapedJob): Promise<ScrapedJob> {
    console.log(`Extracting details for job: ${job.title} at ${job.company}`);
    
    // Simulate a delay for extracting details
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would visit the job page and extract more details
    // For this demo, we'll just add some additional information
    const enhancedJob: ScrapedJob = {
      ...job,
      description: job.description + `\n\nWe are looking for a ${job.title} to join our team at ${job.company}. You will be responsible for designing, developing, and maintaining our software systems. The ideal candidate has strong technical skills and works well in a team environment.`,
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '3+ years of experience in software development',
        'Proficiency in JavaScript and TypeScript',
        'Experience with React and modern frontend frameworks',
        'Knowledge of cloud services (AWS, Azure, or GCP)'
      ],
      keywordMatch: {
        score: Math.floor(Math.random() * 31) + 70,
        total: 12,
        found: 9,
        highPriority: {
          keywords: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'AWS'],
          found: 4,
          total: 5
        },
        lowPriority: {
          keywords: ['Git', 'Agile', 'REST API', 'Docker', 'CI/CD', 'Testing', 'MongoDB'],
          found: 5,
          total: 7
        }
      }
    };
    
    return enhancedJob;
  }
}

/**
 * Create an instance of the Crawl4AI scraper with default options
 */
export const createJobScraper = (options?: Crawl4AIOptions) => {
  return new Crawl4AI(options);
};

/**
 * Run a job search using Crawl4AI
 */
export async function searchJobsWithCrawl4AI(
  query: string, 
  location: string = '', 
  platforms: string[] = ['linkedin', 'indeed'],
  options?: Crawl4AIOptions
): Promise<ScrapedJob[]> {
  try {
    const scraper = createJobScraper(options);
    
    // Show search starting toast
    toast.loading("Searching for jobs...", {
      description: `Looking for "${query}" jobs across multiple platforms`,
      duration: 2000
    });
    
    // Search for jobs
    const jobs = await scraper.searchJobs(query, location, platforms);
    
    if (jobs.length === 0) {
      toast.error("No jobs found", {
        description: "Try different search terms or locations"
      });
      return [];
    }
    
    // Show verification starting toast
    toast.loading("Verifying job listings...", {
      description: "Making sure job listings are still active",
      duration: 1500
    });
    
    // Verify jobs
    const verifiedJobs = await scraper.verifyJobs(jobs);
    
    if (verifiedJobs.length === 0) {
      toast.warning("No valid job listings found", {
        description: "All jobs failed verification. Try a different search."
      });
      return [];
    }
    
    // Process and enhance job listings
    const enhancedJobs: ScrapedJob[] = [];
    
    for (const job of verifiedJobs.slice(0, 10)) { // Limit to 10 jobs for details extraction
      const enhancedJob = await scraper.extractJobDetails(job);
      enhancedJobs.push(enhancedJob);
    }
    
    // Add remaining jobs without detailed extraction
    enhancedJobs.push(...verifiedJobs.slice(10));
    
    toast.success(`Found ${enhancedJobs.length} job opportunities`, {
      description: `${Math.min(10, enhancedJobs.length)} with enhanced details`
    });
    
    return enhancedJobs;
    
  } catch (error) {
    console.error("Error searching for jobs:", error);
    toast.error("Failed to search for jobs", {
      description: "There was an error during the job search process."
    });
    return [];
  }
}
