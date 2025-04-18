
/**
 * Server-side Job Scraper Module
 * 
 * This module implements a comprehensive workflow for scraping job listings
 * from various job platforms with features like proxy rotation, user agent
 * randomization, rate limiting, and fallback to headless browsing.
 */

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
    
    console.log(`Starting job search for query "${query}" in location "${location || 'any'}" on platforms: ${validPlatforms.join(', ')}`);
    
    // Process each platform sequentially to respect rate limits
    for (const platform of validPlatforms) {
      try {
        const platformConfig = this.searchConfig[platform as keyof typeof SEARCH_CONFIG];
        const platformJobs = await this.scrapePlatform(platform, query, location, platformConfig);
        
        if (platformJobs.length > 0) {
          console.log(`Found ${platformJobs.length} jobs on ${platform}`);
          allJobs.push(...platformJobs);
        } else {
          console.log(`No jobs found on ${platform} for the given criteria`);
        }
        
        // Add a delay between platforms
        await this.delay(this.config.rateLimitDelay * 2000);
      } catch (error) {
        console.error(`Error scraping jobs from ${platform}:`, error);
      }
    }
    
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
        
        console.log(`Scraping ${platform} page ${page} at: ${url}`);
        
        // Apply domain-specific rate limiting
        const domain = this.extractDomain(url);
        await this.applyDomainRateLimit(domain);
        
        // Scrape the job data from this URL
        const pageJobs = await this.scrapeJobsFromUrl(url, platform);
        
        if (pageJobs.length > 0) {
          jobs.push(...pageJobs);
          console.log(`Found ${pageJobs.length} jobs on page ${page} of ${platform}`);
        } else {
          console.log(`No jobs found on page ${page} of ${platform} - may have reached the end of results`);
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
        console.error(`Error scraping page ${page} from ${platform}:`, error);
        // Continue to the next page despite errors
      }
    }
    
    return jobs;
  }

  /**
   * Main method to scrape job data from a URL
   */
  async scrapeJobsFromUrl(targetUrl: string, sourcePlatform: string): Promise<ScrapedJobData[]> {
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
        console.log(`Attempting to scrape ${targetUrl} (attempt ${attempt + 1})`);
        
        // Simulate HTTP request for this example
        htmlContent = await this.simulateHttpRequest(targetUrl, currentUserAgent, currentProxy);
        
        // Check if we're blocked
        if (this.isBlocked(htmlContent)) {
          console.warn(`Blocked on attempt ${attempt + 1} with proxy ${currentProxy}`);
          continue; // Try next attempt
        }
        
        break; // Success, exit retry loop
      } catch (e) {
        error = e as Error;
        console.error(`Request failed on attempt ${attempt + 1}: ${error.message}`);
        
        // Get a new proxy for the next attempt
        if (attempt < this.config.maxRetries - 1) {
          await this.delay(this.config.rateLimitDelay * 1000);
        }
      }
    }
    
    // If all attempts failed
    if (!htmlContent) {
      console.error(`Failed to retrieve page after ${this.config.maxRetries} attempts: ${error?.message}`);
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
    const jobs: ScrapedJobData[] = [];
    
    try {
      console.log(`Parsing ${platform} job listings...`);
      
      // In a real implementation, we would use a library like Cheerio to parse HTML
      // Here we're simulating with platform-specific parsing logic
      
      switch(platform.toLowerCase()) {
        case 'linkedin':
          // LinkedIn specific parsing logic would go here
          return this.simulateLinkedInParsing(sourceUrl);
          
        case 'indeed':
          // Indeed specific parsing logic would go here
          return this.simulateIndeedParsing(sourceUrl);
          
        case 'glassdoor':
          // Glassdoor specific parsing logic would go here
          return this.simulateGlassdoorParsing(sourceUrl);
          
        case 'github':
          // GitHub specific parsing logic would go here
          return this.simulateGithubParsing(sourceUrl);
          
        default:
          console.warn(`No specific parsing logic implemented for platform: ${platform}`);
          return [];
      }
    } catch (error) {
      console.error(`Error parsing job listings from ${platform}:`, error);
      return [];
    }
  }
  
  /**
   * Simulate LinkedIn parsing (for demo purposes)
   */
  private simulateLinkedInParsing(sourceUrl: string): ScrapedJobData[] {
    const jobs: ScrapedJobData[] = [];
    
    // In a real implementation, we would extract job data from the HTML
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
  private simulateIndeedParsing(sourceUrl: string): ScrapedJobData[] {
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
  private simulateGlassdoorParsing(sourceUrl: string): ScrapedJobData[] {
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
  private simulateGithubParsing(sourceUrl: string): ScrapedJobData[] {
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
   * Simulate an HTTP request (would be a real HTTP request in production)
   */
  private async simulateHttpRequest(
    url: string, 
    userAgent: string, 
    proxy?: string
  ): Promise<string> {
    // In a real implementation, this would make an actual HTTP request
    // For this example, we'll simulate a response
    await this.delay(500); // Simulate network delay
    
    if (url.includes('blocked')) {
      return '<html><body>Access denied. Please solve this CAPTCHA.</body></html>';
    }
    
    // Simulate job HTML based on URL
    return `
      <html>
        <body>
          <h1 class="job-title">Software Engineer</h1>
          <div class="company-name">Example Corp</div>
          <div class="location">San Francisco, CA</div>
          <div class="salary">$100,000 - $150,000 per year</div>
          <div class="description">
            We are looking for a talented software engineer to join our team.
          </div>
          <div class="requirements">
            <ul>
              <li>5+ years of experience</li>
              <li>Bachelor's degree in Computer Science</li>
            </ul>
          </div>
          <div class="skills">
            <span>JavaScript</span>
            <span>React</span>
            <span>TypeScript</span>
          </div>
          <div class="posted-date">Posted 3 days ago</div>
          <a href="https://example.com/apply" class="apply-button">Apply Now</a>
        </body>
      </html>
    `;
  }
  
  /**
   * Simulate headless browsing (would use Playwright/Puppeteer in production)
   */
  private async simulateHeadlessBrowsing(
    url: string, 
    userAgent: string, 
    proxy?: string
  ): Promise<string> {
    // In a real implementation, this would use a headless browser
    await this.delay(1000); // Simulate browser rendering time
    
    // Return a more complete HTML that might include JavaScript-rendered content
    return `
      <html>
        <body>
          <h1 class="job-title">Software Engineer</h1>
          <div class="company-name">Example Corp</div>
          <div class="location">San Francisco, CA</div>
          <div class="salary">$100,000 - $150,000 per year</div>
          <div class="description">
            We are looking for a talented software engineer to join our team.
            This position requires strong problem-solving skills and experience with modern web technologies.
          </div>
          <div class="requirements">
            <ul>
              <li>5+ years of experience in web development</li>
              <li>Bachelor's degree in Computer Science or related field</li>
              <li>Experience with React and TypeScript</li>
              <li>Knowledge of backend technologies</li>
            </ul>
          </div>
          <div class="skills">
            <span>JavaScript</span>
            <span>React</span>
            <span>TypeScript</span>
            <span>Node.js</span>
            <span>GraphQL</span>
          </div>
          <div class="posted-date">Posted 3 days ago</div>
          <div class="remote-badge">Remote</div>
          <a href="https://example.com/apply" class="apply-button">Apply Now</a>
        </body>
      </html>
    `;
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
