
/**
 * Server-side Job Scraper Module
 * 
 * This module implements a comprehensive workflow for scraping job listings
 * from various job platforms with features like proxy rotation, user agent
 * randomization, rate limiting, and fallback to headless browsing.
 */

import axios, { AxiosRequestConfig } from 'axios';
import puppeteer, { Browser, Page } from 'puppeteer';

// Configuration types
export interface ScraperConfig {
  proxyList: string[];
  userAgentList: string[];
  rateLimitDelay: number;
  maxRetries: number;
  headlessBrowserEnabled: boolean;
}

export interface JobDataSchema {
  // Required fields
  title: boolean;
  company: boolean;
  location: boolean;
  description: boolean;
  salary: boolean;
  // Optional fields
  requirements?: boolean;
  skills?: boolean;
  postedAt?: boolean;
  applyUrl?: boolean;
  remote?: boolean;
}

export interface ScrapedJobData {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  requirements?: string[];
  skills?: string[];
  postedAt?: string;
  applyUrl?: string;
  remote?: boolean;
  source?: string;
  error?: string;
  url?: string;
}

// Default configuration
const DEFAULT_CONFIG: ScraperConfig = {
  proxyList: [],
  userAgentList: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
  ],
  rateLimitDelay: 3,
  maxRetries: 3,
  headlessBrowserEnabled: true
};

// Default schema for job data
const DEFAULT_SCHEMA: JobDataSchema = {
  title: true,
  company: true,
  location: true,
  description: true,
  salary: true,
  requirements: true,
  skills: true,
  postedAt: true,
  applyUrl: true,
  remote: true
};

// Define search configurations for different job platforms
export const SEARCH_CONFIG = {
  'linkedin': {
    urlTemplate: 'https://www.linkedin.com/jobs/search/?keywords={query}&location={location}&start={offset}',
    maxPages: 5,
    resultsPerPage: 25
  },
  'indeed': {
    urlTemplate: 'https://www.indeed.com/jobs?q={query}&l={location}&start={offset}',
    maxPages: 5,
    resultsPerPage: 10
  },
  'glassdoor': {
    urlTemplate: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword={query}&locT=C&locId={locationId}&jobType=all&fromAge=-1&minSalary=0&includeNoSalaryJobs=true&radius=25&cityId=-1&minRating=0.0&industryId=-1&sgocId=-1&seniorityType=all&companyId=-1&employerSizes=0&applicationType=0&remoteWorkType=0',
    maxPages: 3,
    resultsPerPage: 30
  },
  'monster': {
    urlTemplate: 'https://www.monster.com/jobs/search/?q={query}&where={location}&page={page}',
    maxPages: 5,
    resultsPerPage: 20
  },
  'github': {
    urlTemplate: 'https://github.com/search?q={query}&type=issues&p={page}',
    maxPages: 3,
    resultsPerPage: 10
  },
  'lever': {
    // ATS platform: requires specific company job board URL
    urlTemplate: 'https://jobs.lever.co/{company}?query={query}&location={location}',
    maxPages: 1, // Typically, ATS sites are per-company, so less pagination needed
    resultsPerPage: 20
  },
  'icims': {
    // ATS platform: requires specific company job board URL
    urlTemplate: 'https://careers.icims.com/jobs/search?ss=1&searchKeyword={query}&searchLocation={location}&page={page}',
    maxPages: 3,
    resultsPerPage: 20
  },
  'workday': {
    // ATS platform: requires specific company job board URL
    // Workday URLs are often company-specific like: https://{company}.wd5.myworkdayjobs.com/{jobboardname}
    urlTemplate: 'https://examplecompany.myworkdayjobs.com/en-US/exampleboard/jobs?query={query}&location={location}&page={page}',
    maxPages: 3,
    resultsPerPage: 20
  },
  'greenhouse': {
    // ATS platform: requires specific company job board URL
    urlTemplate: 'https://boards.greenhouse.io/{company}?q={query}&location={location}',
    maxPages: 1, // Typically, ATS sites are per-company
    resultsPerPage: 20
  },
  'ziprecruiter': {
    urlTemplate: 'https://www.ziprecruiter.com/jobs-search?search={query}&location={location}&page={page}',
    maxPages: 5,
    resultsPerPage: 20
  },
  'dice': {
    urlTemplate: 'https://www.dice.com/jobs?q={query}&location={location}&page={page}',
    maxPages: 5,
    resultsPerPage: 20
  },
  'simplyhired': {
    urlTemplate: 'https://www.simplyhired.com/search?q={query}&l={location}&pn={page}',
    maxPages: 5,
    resultsPerPage: 20
  },
  'ashby': {
    // ATS platform: requires specific company job board URL
    urlTemplate: 'https://jobs.ashbyhq.com/{company}?query={query}&location={location}',
    maxPages: 1, // Typically, ATS sites are per-company
    resultsPerPage: 20
  },
  'rippling': {
    // ATS platform: requires specific company job board URL
    // Rippling job boards might be part of a company's main site or a subdomain.
    urlTemplate: 'https://examplecompany.rippling-ats.com/jobs?query={query}&location={location}&page={page}',
    maxPages: 3,
    resultsPerPage: 20
  }
};

/**
 * JobScraper class that implements the comprehensive scraping workflow
 */
export class JobScraper {
  private config: ScraperConfig;
  private schema: JobDataSchema;
  private domainDelayMap: Map<string, number>;
  private searchConfig: typeof SEARCH_CONFIG;

  constructor(config: Partial<ScraperConfig> = {}, schema: Partial<JobDataSchema> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.schema = { ...DEFAULT_SCHEMA, ...schema };
    this.domainDelayMap = new Map<string, number>();
    this.searchConfig = SEARCH_CONFIG;
  }

  /**
   * Main method to scrape job data from multiple sources based on search criteria
   */
  async scrapeJobs(query: string, location: string = '', platforms: string[] = ['linkedin', 'indeed']): Promise<ScrapedJobData[]> {
    const allJobs: ScrapedJobData[] = [];
    
    // Filter platforms to only use those that exist in our config
    const validPlatforms = platforms.filter(p => this.searchConfig.hasOwnProperty(p));
    
    if (validPlatforms.length === 0) {
      console.warn("No valid platforms specified for job scraping");
      return [];
    }
    
    console.log(`[JobScraper] Starting job search for query: "${query}" in location: "${location || 'any'}" on platforms: ${validPlatforms.join(', ')}`);
    
    // Process each platform sequentially to respect rate limits
    for (const platform of validPlatforms) {
      console.log(`[JobScraper] Processing platform: ${platform}`);
      try {
        const platformConfig = this.searchConfig[platform as keyof typeof SEARCH_CONFIG];
        const platformJobs = await this.scrapePlatform(platform, query, location, platformConfig);
        
        if (platformJobs.length > 0) {
          console.log(`[JobScraper] Successfully processed platform: ${platform}. Found ${platformJobs.length} jobs.`);
          allJobs.push(...platformJobs);
        } else {
          console.log(`[JobScraper] No jobs found on ${platform} for the given criteria.`);
        }
        
        // Add a delay between platforms
        await this.delay(this.config.rateLimitDelay * 2000);
      } catch (error) {
        console.error(`[JobScraper] Error scraping jobs from ${platform}: ${(error as Error).message}. Skipping this platform.`);
      }
    }
    
    console.log(`[JobScraper] Finished job search. Total jobs found: ${allJobs.length}`);
    return allJobs;
  }
  
  /**
   * Scrape jobs from a specific platform
   */
  private async scrapePlatform(platform: string, query: string, location: string, platformConfig: any): Promise<ScrapedJobData[]> {
    const jobs: ScrapedJobData[] = [];
    
    for (let page = 1; page <= platformConfig.maxPages; page++) {
      try {
        // Construct the URL for this page
        const url = this.constructUrl(platformConfig.urlTemplate, {
          query,
          location,
          page,
          offset: (page - 1) * platformConfig.resultsPerPage
        });
        
        console.log(`[JobScraper] Scraping ${platform} page ${page} at: ${url}`);
        
        // Apply domain-specific rate limiting
        const domain = this.extractDomain(url);
        await this.applyDomainRateLimit(domain);
        
        // Scrape the job data from this URL
        const pageJobs = await this.scrapeJobsFromUrl(url, platform);
        
        if (pageJobs.length > 0) {
          jobs.push(...pageJobs);
          // console.log(`[JobScraper] Found ${pageJobs.length} jobs on page ${page} of ${platform}`); // Covered by scrapeJobsFromUrl logs
        } else {
          console.log(`[JobScraper] No jobs found on page ${page} of ${platform}. May have reached the end or page is empty.`);
          // Break out of the loop if we don't find any more jobs
          break;
        }
        
        // Update the domain timestamp for rate limiting
        this.updateDomainTimestamp(domain);
        
        // Add a polite delay between pages
        if (page < platformConfig.maxPages) {
          const delayTime = this.randomDelay(2, 5);
          await this.delay(delayTime * 1000);
        }
      } catch (error) {
        console.error(`[JobScraper] Error scraping page ${page} from ${platform} at ${url}: ${(error as Error).message}. Continuing to next page/platform.`);
      }
    }
    
    return jobs;
  }

  /**
   * Main method to scrape job data from a URL
   */
  async scrapeJobsFromUrl(targetUrl: string, sourcePlatform: string): Promise<ScrapedJobData[]> {
    console.log(`[JobScraper] Scraping URL: ${targetUrl} for platform: ${sourcePlatform}`);
    // Extract domain for rate limiting
    const domain = this.extractDomain(targetUrl);
    
    // Apply domain-specific rate limiting
    await this.applyDomainRateLimit(domain);

    // Prepare for Request
    const currentProxy = this.getRandomProxy();
    const currentUserAgent = this.getRandomUserAgent();
    
    // Attempt to scrape the page
    let htmlContent: string | null = null;
    let error: Error | null = null;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        console.log(`[JobScraper] Attempting to fetch ${targetUrl} (attempt ${attempt + 1}/${this.config.maxRetries}) using direct request.`);
        if (currentProxy) {
          console.log(`[JobScraper] Using proxy: ${currentProxy ? currentProxy.split('@')[0] : 'N/A'} for attempt ${attempt + 1}`);
        }
        
        htmlContent = await this.fetchHtmlContent(targetUrl, currentUserAgent, currentProxy);
        
        // Check if we're blocked.
        // Note: This basic check might need to be more sophisticated
        // depending on how different sites indicate blocking.
        if (this.isBlocked(htmlContent)) {
          console.warn(`[JobScraper] Direct request blocked on attempt ${attempt + 1} for ${targetUrl}`);
          htmlContent = null; // Ensure htmlContent is null if blocked
          continue; // Try next attempt
        }
        
        break; // Success, exit retry loop
      } catch (e) {
        error = e as Error;
        console.error(`[JobScraper] Direct request failed on attempt ${attempt + 1} for ${targetUrl}: ${error.message}`);
        
        // Get a new proxy for the next attempt
        if (attempt < this.config.maxRetries - 1) {
          await this.delay(this.config.rateLimitDelay * 1000);
        }
      }
    }

    // If direct fetching failed and headless browsing is enabled, try with headless browser
    if (!htmlContent && this.config.headlessBrowserEnabled) {
      console.log(`[JobScraper] Falling back to headless browser for ${targetUrl}`);
      try {
        console.log(`[JobScraper] Attempting to fetch ${targetUrl} using headless browser.`);
        if (currentProxy) {
           console.log(`[JobScraper] Using proxy: ${currentProxy ? currentProxy.split('@')[0] : 'N/A'} for headless attempt.`);
        }
        htmlContent = await this.fetchHtmlWithHeadlessBrowser(targetUrl, currentUserAgent, currentProxy);
        if (this.isBlocked(htmlContent)) { // Check if headless attempt was also blocked
          console.warn(`[JobScraper] Headless browser attempt also blocked for ${targetUrl}`);
          htmlContent = null; // Ensure it's null if blocked
        }
      } catch (headlessError) {
        console.error(`[JobScraper] Headless browser attempt failed for ${targetUrl}: ${(headlessError as Error).message}`);
        htmlContent = null; // Ensure it's null on error
      }
    }
    
    // If all attempts failed (direct and headless)
    if (!htmlContent) {
      console.error(`[JobScraper] Failed to retrieve page after all attempts (including headless if enabled): ${targetUrl}`);
      return [];
    }
    
    // Parse the HTML and extract job data
    const jobs = this.parseJobListings(htmlContent, sourcePlatform, targetUrl);
    
    // Update the rate limiting timestamp for this domain
    this.updateDomainTimestamp(domain);
    
    return jobs;
  }

  /**
   * Parse job listings from HTML content based on the source platform
   */
  private parseJobListings(html: string, platform: string, sourceUrl: string): ScrapedJobData[] {
    console.log(`[JobScraper] Parsing job listings for platform: ${platform} from URL: ${sourceUrl}`);
    try {
      // In a real implementation, we would use a library like Cheerio to parse HTML
      // Here we're simulating with platform-specific parsing logic
      switch(platform.toLowerCase()) {
        case 'linkedin':
          return this.simulateLinkedInParsing(html, sourceUrl, platform);
        case 'indeed':
          return this.simulateIndeedParsing(html, sourceUrl, platform);
        case 'glassdoor':
          return this.simulateGlassdoorParsing(html, sourceUrl, platform);
        case 'monster':
          return this.simulateMonsterParsing(html, sourceUrl, platform);
        case 'github':
          return this.simulateGithubParsing(html, sourceUrl, platform);
        case 'lever':
          return this.parseLeverJobs(html, sourceUrl); // Placeholder, will log TODO
        case 'icims':
          return this.parseIcimsJobs(html, sourceUrl); // Placeholder
        case 'workday':
          return this.parseWorkdayJobs(html, sourceUrl); // Placeholder
        case 'greenhouse':
          return this.parseGreenhouseJobs(html, sourceUrl); // Placeholder
        case 'ziprecruiter':
          return this.parseZipRecruiterJobs(html, sourceUrl); // Placeholder
        case 'dice':
          return this.parseDiceJobs(html, sourceUrl); // Placeholder
        case 'simplyhired':
          return this.parseSimplyHiredJobs(html, sourceUrl); // Placeholder
        case 'ashby':
          return this.parseAshbyJobs(html, sourceUrl); // Placeholder
        case 'rippling':
          return this.parseRipplingJobs(html, sourceUrl); // Placeholder
        default:
          console.warn(`[JobScraper] No specific parsing logic implemented for platform: ${platform}`);
          return [];
      }
    } catch (parseError) {
      console.error(`[JobScraper] Error parsing ${platform} job listings from ${sourceUrl}: ${(parseError as Error).message}`);
      return []; // Return empty on parsing error
    }
  }
  
  /**
   * Simulate LinkedIn parsing (for demo purposes)
   */
  private simulateLinkedInParsing(html: string, sourceUrl: string, platform: string = 'LinkedIn'): ScrapedJobData[] {
    console.log(`[JobScraper] Simulating parsing for ${platform} from HTML content of ${sourceUrl}. NOTE: This is using mock data generation.`);
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    const jobs: ScrapedJobData[] = [];
    // For demo purposes, we'll create some sample job data
    for (let i = 0; i < 5; i++) {
      const jobId = `linkedin-${Date.now()}-${i}`;
      jobs.push({
        id: jobId,
        title: `Software Engineer ${i+1}`,
        company: `Tech Company ${String.fromCharCode(65 + i)}`,
        location: 'San Francisco, CA',
        description: 'We are looking for a talented software engineer to join our team.',
        salary: {
          min: 100000 + (i * 10000),
          max: 150000 + (i * 10000),
          currency: '$'
        },
        requirements: [
          'Bachelor\'s degree in Computer Science',
          '3+ years of experience with JavaScript',
          'Experience with React'
        ],
        skills: ['JavaScript', 'React', 'Node.js'],
        postedAt: new Date(Date.now() - i * 86400000).toISOString(),
        applyUrl: `https://www.linkedin.com/jobs/view/${jobId}`,
        remote: Math.random() > 0.5,
        source: 'LinkedIn',
        url: sourceUrl
      });
    }
    
    return jobs;
  }
  
  /**
   * Simulate Indeed parsing (for demo purposes)
   */
  private simulateIndeedParsing(html: string, sourceUrl: string, platform: string = 'Indeed'): ScrapedJobData[] {
    console.log(`[JobScraper] Simulating parsing for ${platform} from HTML content of ${sourceUrl}. NOTE: This is using mock data generation.`);
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    const jobs: ScrapedJobData[] = [];
    for (let i = 0; i < 5; i++) {
      const jobId = `indeed-${Date.now()}-${i}`;
      jobs.push({
        id: jobId,
        title: `Full Stack Developer ${i+1}`,
        company: `Software Solutions ${String.fromCharCode(65 + i)}`,
        location: 'New York, NY',
        description: 'Join our innovative team building the next generation of web applications.',
        salary: {
          min: 90000 + (i * 8000),
          max: 130000 + (i * 8000),
          currency: '$'
        },
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          '2+ years of experience in web development',
          'Proficiency in JavaScript, HTML, CSS'
        ],
        skills: ['JavaScript', 'HTML', 'CSS', 'React', 'Node.js'],
        postedAt: new Date(Date.now() - i * 172800000).toISOString(),
        applyUrl: `https://www.indeed.com/viewjob?jk=${jobId}`,
        remote: Math.random() > 0.7,
        source: 'Indeed',
        url: sourceUrl
      });
    }
    
    return jobs;
  }
  
  /**
   * Simulate Glassdoor parsing (for demo purposes)
   */
  private simulateGlassdoorParsing(html: string, sourceUrl: string, platform: string = 'Glassdoor'): ScrapedJobData[] {
    console.log(`[JobScraper] Simulating parsing for ${platform} from HTML content of ${sourceUrl}. NOTE: This is using mock data generation.`);
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    const jobs: ScrapedJobData[] = [];
    for (let i = 0; i < 5; i++) {
      const jobId = `glassdoor-${Date.now()}-${i}`;
      jobs.push({
        id: jobId,
        title: `Data Scientist ${i+1}`,
        company: `Data Analytics ${String.fromCharCode(65 + i)}`,
        location: 'Austin, TX',
        description: 'We are seeking a data scientist to help us derive insights from our data.',
        salary: {
          min: 110000 + (i * 9000),
          max: 160000 + (i * 9000),
          currency: '$'
        },
        requirements: [
          'Master\'s or PhD in Statistics, Computer Science, or related field',
          '3+ years of experience in data analysis',
          'Experience with machine learning algorithms'
        ],
        skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics'],
        postedAt: new Date(Date.now() - i * 259200000).toISOString(),
        applyUrl: `https://www.glassdoor.com/job-listing/${jobId}`,
        remote: Math.random() > 0.4,
        source: 'Glassdoor',
        url: sourceUrl
      });
    }
    
    return jobs;
  }
  
  /**
   * Simulate GitHub parsing (for demo purposes)
   */
  private simulateGithubParsing(html: string, sourceUrl: string, platform: string = 'GitHub'): ScrapedJobData[] {
    console.log(`[JobScraper] Simulating parsing for ${platform} from HTML content of ${sourceUrl}. NOTE: This is using mock data generation.`);
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".issue-item"; // Example for GitHub issues
    // const titleSelector = ".issue-title"; // Example
    // const companySelector = ".repository-name"; // Example, company might be repo owner
    // const locationSelector = ".location-label"; // Example
    // const descriptionSelector = ".issue-body"; // Example
    // const salarySelector = null; // Typically not applicable for GitHub issues
    // const applyUrlSelector = "a.issue-link"; // Example
    // const postedAtSelector = "time-ago"; // Example
    // const remoteSelector = ".remote-label"; // Example
    const jobs: ScrapedJobData[] = [];
    for (let i = 0; i < 5; i++) {
      const jobId = `github-${Date.now()}-${i}`;
      jobs.push({
        id: jobId,
        title: `Open Source Contributor ${i+1}`,
        company: `Open Source Project ${String.fromCharCode(65 + i)}`,
        location: 'Remote',
        description: 'Help us improve our open source project with your skills.',
        salary: {
          min: 0,
          max: 0,
          currency: '$'
        },
        requirements: [
          'Familiarity with open source contribution workflows',
          'Experience with git and GitHub',
          'Knowledge of the project\'s tech stack'
        ],
        skills: ['Git', 'GitHub', 'Open Source'],
        postedAt: new Date(Date.now() - i * 86400000).toISOString(),
        applyUrl: `https://github.com/issues/${jobId}`,
        remote: true,
        source: 'GitHub',
        url: sourceUrl
      });
    }
    
    return jobs;
  }

  /**
   * Simulate Monster parsing (for demo purposes)
   */
  private simulateMonsterParsing(html: string, sourceUrl: string, platform: string = 'Monster'): ScrapedJobData[] {
    console.log(`[JobScraper] Simulating parsing for ${platform} from HTML content of ${sourceUrl}. NOTE: This is using mock data generation.`);
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    const jobs: ScrapedJobData[] = [];
    // For demo purposes, we'll create some sample job data
    for (let i = 0; i < 3; i++) { // Example: 3 mock jobs for Monster
      const jobId = `monster-${Date.now()}-${i}`;
      jobs.push({
        id: jobId,
        title: `Marketing Manager ${i+1}`,
        company: `Marketing Agency ${String.fromCharCode(70 + i)}`,
        location: 'Chicago, IL',
        description: 'Seeking an experienced Marketing Manager.',
        salary: { min: 70000, max: 90000, currency: '$' },
        requirements: ['5+ years in marketing', 'Strong communication skills'],
        skills: ['SEO', 'SEM', 'Content Marketing'],
        postedAt: new Date(Date.now() - (i+5) * 86400000).toISOString(),
        applyUrl: `https://www.monster.com/job/${jobId}`,
        remote: Math.random() > 0.8,
        source: 'Monster',
        url: sourceUrl
      });
    }
    return jobs;
  }

  // Placeholder parsing methods for new platforms
  private parseLeverJobs(html: string, sourceUrl: string): ScrapedJobData[] {
    // TODO: Add extensive unit tests for this parser with sample HTML once implemented.
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    return [];
  }

  private parseIcimsJobs(html: string, sourceUrl: string): ScrapedJobData[] {
    // TODO: Add extensive unit tests for this parser with sample HTML once implemented.
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    return [];
  }

  private parseWorkdayJobs(html: string, sourceUrl: string): ScrapedJobData[] {
    // TODO: Add extensive unit tests for this parser with sample HTML once implemented.
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    return [];
  }

  private parseGreenhouseJobs(html: string, sourceUrl: string): ScrapedJobData[] {
    // TODO: Add extensive unit tests for this parser with sample HTML once implemented.
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    return [];
  }

  private parseZipRecruiterJobs(html: string, sourceUrl: string): ScrapedJobData[] {
    // TODO: Add extensive unit tests for this parser with sample HTML once implemented.
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    return [];
  }

  private parseDiceJobs(html: string, sourceUrl: string): ScrapedJobData[] {
    // TODO: Add extensive unit tests for this parser with sample HTML once implemented.
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    return [];
  }

  private parseSimplyHiredJobs(html: string, sourceUrl: string): ScrapedJobData[] {
    // TODO: Add extensive unit tests for this parser with sample HTML once implemented.
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    return [];
  }

  private parseAshbyJobs(html: string, sourceUrl: string): ScrapedJobData[] {
    // TODO: Add extensive unit tests for this parser with sample HTML once implemented.
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    return [];
  }

  private parseRipplingJobs(html: string, sourceUrl: string): ScrapedJobData[] {
    // TODO: Add extensive unit tests for this parser with sample HTML once implemented.
    // TODO: Implement actual HTML parsing using Cheerio or similar.
    // const jobPostingSelector = ".job-item"; // Example
    // const titleSelector = ".job-title"; // Example
    // const companySelector = ".company-name"; // Example
    // const locationSelector = ".location"; // Example
    // const descriptionSelector = ".description"; // Example
    // const salarySelector = ".salary"; // Example
    // const applyUrlSelector = "a.apply-button"; // Example
    // const postedAtSelector = ".date-posted"; // Example
    // const remoteSelector = ".remote-tag"; // Example
    return [];
  }

  /**
   * Construct a URL from a template and parameters
   */
  private constructUrl(urlTemplate: string, params: Record<string, string | number>): string {
    let url = urlTemplate;
    
    // Replace each parameter in the template
    Object.entries(params).forEach(([key, value]) => {
      const encodedValue = typeof value === 'string' ? encodeURIComponent(value) : value;
      url = url.replace(`{${key}}`, String(encodedValue));
    });
    
    return url;
  }
  
  /**
   * Generate a random delay within a range
   */
  private randomDelay(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
  
  /**
   * Fetches HTML content from a given URL using axios.
   */
  private async fetchHtmlContent(
    targetUrl: string,
    currentUserAgent: string,
    currentProxy?: string
  ): Promise<string> {
    console.log(`[JobScraper] Fetching HTML from: ${targetUrl}`);
    const options: AxiosRequestConfig = {
      headers: { 'User-Agent': currentUserAgent },
      timeout: 15000, // 15 seconds timeout
    };

    if (currentProxy) {
      try {
        const proxyUrl = new URL(currentProxy.startsWith('http') ? currentProxy : `http://${currentProxy}`);
        options.proxy = {
          host: proxyUrl.hostname,
          port: parseInt(proxyUrl.port),
          // protocol: proxyUrl.protocol.replace(':', ''), // Useful if your proxy URL includes the protocol
        };
        console.log(`[JobScraper] Axios request for ${targetUrl} configured with proxy: ${options.proxy.host}`);
        // If your proxy requires authentication, you would add it here:
        // options.proxy.auth = { username: 'proxyuser', password: 'proxypassword' };
      } catch (e) {
        console.warn(`[JobScraper] Invalid proxy URL format: ${currentProxy}. Proceeding without proxy. Error: ${(e as Error).message}`);
      }
    }

    try {
      const response = await axios.get(targetUrl, options);
      // Check for non-success status codes that axios might not throw an error for by default
      if (response.status >= 400) {
        throw new Error(`[JobScraper] Request failed with status code ${response.status}`);
      }
      return response.data;
    } catch (error) {
      const axiosError = error as any; // Keep it as any to access response easily
      if (axios.isAxiosError(axiosError)) {
        console.error(`[JobScraper] Axios error fetching ${targetUrl}: ${axiosError.message}. Status: ${axiosError.response?.status}`);
        // Re-throw a generic error or a more specific one to be caught by retry logic
        throw new Error(`[JobScraper] Failed to fetch HTML from ${targetUrl} due to: ${axiosError.message}`);
      } else {
        console.error(`[JobScraper] Unexpected error fetching ${targetUrl}: ${(error as Error).message}`);
        throw error; // Re-throw the original error if it's not an Axios error
      }
    }
  }

  /**
   * Fetches HTML content using a headless browser (Puppeteer).
   * This is a placeholder and needs full implementation and environment setup.
   */
  private async fetchHtmlWithHeadlessBrowser(
    targetUrl: string,
    currentUserAgent: string,
    currentProxy?: string
  ): Promise<string> {
    console.log(`[JobScraper] Attempting to fetch HTML with headless browser from: ${targetUrl}`);
    console.warn(
      `[JobScraper] Headless browsing with Puppeteer is not fully implemented for ${targetUrl}. ` +
      'This is a placeholder. Returning simulated content.'
    );

    // TODO: Full Puppeteer implementation needs a proper environment.
    // const browser: Browser = await puppeteer.launch({
    //   headless: true,
    //   args: currentProxy ? [`--proxy-server=${currentProxy.startsWith('http') ? currentProxy : `http://${currentProxy}`}`] : [],
    // });
    // const page: Page = await browser.newPage();
    // await page.setUserAgent(currentUserAgent);
    // try {
    //   await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 }); // 30 seconds timeout
    //   const htmlContent = await page.content();
    //   return htmlContent;
    // } catch (e) {
    //   console.error(`Puppeteer error navigating to ${targetUrl}: ${(e as Error).message}`);
    //   throw e; // Re-throw to be caught by the caller
    // } finally {
    //   await browser.close();
    // }

    // Simulate a delay and return placeholder content for now
    await this.delay(1000); // Simulate browser rendering time
    return `<html><body>Headless browser content for ${targetUrl} (simulated)</body></html>`;
  }

  /**
   * Check if the response indicates we've been blocked
   */
  private isBlocked(html: string): boolean {
    const blockIndicators = [
      'captcha',
      'access denied',
      'blocked',
      'rate limited',
      'too many requests',
      'security check',
      'verify you are human'
    ];
    
    const lowerHtml = html.toLowerCase();
    return blockIndicators.some(indicator => lowerHtml.includes(indicator));
  }
  
  /**
   * Get a random proxy from the proxy list
   */
  private getRandomProxy(): string | undefined {
    if (this.config.proxyList.length === 0) {
      return undefined;
    }
    
    const randomIndex = Math.floor(Math.random() * this.config.proxyList.length);
    return this.config.proxyList[randomIndex];
  }
  
  /**
   * Get a random user agent from the user agent list
   */
  private getRandomUserAgent(): string {
    const randomIndex = Math.floor(Math.random() * this.config.userAgentList.length);
    return this.config.userAgentList[randomIndex];
  }
  
  /**
   * Extract the domain from a URL
   */
  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      // If URL parsing fails, return the original URL
      return url;
    }
  }
  
  /**
   * Apply rate limiting for a specific domain
   */
  private async applyDomainRateLimit(domain: string): Promise<void> {
    const lastRequestTime = this.domainDelayMap.get(domain);
    
    if (lastRequestTime) {
      const elapsedTime = Date.now() - lastRequestTime;
      const minDelay = this.config.rateLimitDelay * 1000;
      
      if (elapsedTime < minDelay) {
        // Wait for the remaining time
        await this.delay(minDelay - elapsedTime);
      }
    }
  }
  
  /**
   * Update the timestamp for a domain's last request
   */
  private updateDomainTimestamp(domain: string): void {
    this.domainDelayMap.set(domain, Date.now());
  }
  
  /**
   * Utility method to delay execution
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export a singleton instance with default configuration
export const defaultJobScraper = new JobScraper();

// Export an example function to demonstrate how to use the scraper
export async function searchJobs(query: string, location: string = '', platforms: string[] = ['linkedin', 'indeed']): Promise<ScrapedJobData[]> {
  console.log(`Starting job search for: ${query} in ${location || 'any location'}`);
  
  try {
    const scraper = new JobScraper({
      rateLimitDelay: 5,  // Be respectful with rate limiting
      maxRetries: 3
    });
    
    const jobs = await scraper.scrapeJobs(query, location, platforms);
    
    console.log(`Found ${jobs.length} jobs matching "${query}"`);
    return jobs;
  } catch (error) {
    console.error("Error searching for jobs:", error);
    return [];
  }
}

// =====================================================================================
// TESTING STRATEGY FOR JobScraper
// =====================================================================================
//
// The JobScraper class and its associated functions require a multi-faceted testing approach.
//
// 1. Unit Testing - Individual Platform Parsers:
//    - Each platform-specific parsing function (e.g., `simulateLinkedInParsing`,
//      `parseLeverJobs`, `parseIcimsJobs`, etc., once implemented) is a critical
//      candidate for unit tests. These are currently placeholders or simulations.
//    - Strategy:
//      - Create a dedicated test file (e.g., `jobScraper.parsers.test.ts` or separate
//        files per parser if they become complex).
//      - For each parser, use sample static HTML content saved in `.html` files
//        within a test fixtures directory (e.g., `__tests__/fixtures/linkedin_job_page.html`).
//      - The unit test would read this static HTML, pass it to the parsing function,
//        and assert the output.
//    - Key Assertions:
//      - Correct extraction of all fields defined in `ScrapedJobData` (title, company,
//        location, description, salary, applyUrl, postedAt, etc.).
//      - Proper handling of missing optional fields (e.g., if salary is not present,
//        the `salary` field in `ScrapedJobData` should be null or undefined as expected).
//      - Robustness to minor variations in HTML structure (if possible to anticipate).
//      - Graceful failure or return of empty/partial data for significantly malformed
//        or unexpected HTML structures.
//      - Correct identification of remote status if applicable.
//
// 2. Unit Testing - Utility Functions:
//    - Helper functions like `extractDomain`, `constructUrl`, `isBlocked`,
//      `getRandomProxy`, `getRandomUserAgent` should have their own unit tests.
//    - Strategy:
//      - Test with various inputs, including edge cases and invalid inputs.
//    - Key Assertions:
//      - `extractDomain`: Correctly extracts domain from various URL formats.
//      - `constructUrl`: Correctly replaces placeholders and encodes parameters.
//      - `isBlocked`: Accurately identifies blocking keywords in HTML content.
//
// 3. Integration Testing - Core Scraping Workflow:
//    - `scrapeJobsFromUrl`:
//      - Mock `fetchHtmlContent` and `fetchHtmlWithHeadlessBrowser` to return controlled
//        HTML content (or simulate errors).
//      - Mock `parseJobListings` to verify it's called with the correct HTML and parameters.
//      - Test retry logic, proxy rotation (if state can be inspected or mocked), and
//        fallback to headless browser.
//    - `scrapePlatform`:
//      - Mock `scrapeJobsFromUrl` to control the jobs returned per page.
//      - Verify correct URL construction for pagination.
//      - Test `maxPages` and `resultsPerPage` logic.
//      - Test handling of errors from `scrapeJobsFromUrl`.
//    - `scrapeJobs`:
//      - Mock `scrapePlatform` to control jobs returned per platform.
//      - Verify aggregation of results from multiple platforms.
//      - Test handling of errors from `scrapePlatform`.
//
// 4. E2E (End-to-End) Testing Considerations:
//    - True E2E tests would involve running the scraper against live job sites.
//    - Challenges:
//      - Flakiness: Live site structures change frequently, breaking tests.
//      - IP Blocking: Running E2E tests too often can lead to IP blocks.
//      - Resource Intensive: Requires network access, actual browser (for headless).
//      - Ethical Concerns: Avoid overwhelming job sites with requests.
//    - Strategy (if pursued):
//      - Run sparingly, perhaps against a small, controlled set of URLs or a dedicated
//        testing/staging version of a job site if available.
//      - Focus on testing the overall flow for a one or two key platforms rather than
//        comprehensive coverage.
//      - Consider using a library like Nock or MSW (Mock Service Worker) to create
//        mock HTTP servers that simulate real job platforms for more controlled E2E-like tests.
//
// 5. Configuration Testing:
//    - Test behavior with different `ScraperConfig` options (e.g., `headlessBrowserEnabled` true/false,
//      different `maxRetries`, `rateLimitDelay`).
//
// All tests should ideally be located in `__tests__` directory or similar, colocated with
// the source files or in a dedicated test directory structure.
//
//=====================================================================================
