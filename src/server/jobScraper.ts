
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

/**
 * JobScraper class that implements the comprehensive scraping workflow
 */
export class JobScraper {
  private config: ScraperConfig;
  private schema: JobDataSchema;
  private domainDelayMap: Map<string, number>;

  constructor(config: Partial<ScraperConfig> = {}, schema: Partial<JobDataSchema> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.schema = { ...DEFAULT_SCHEMA, ...schema };
    this.domainDelayMap = new Map<string, number>();
  }

  /**
   * Main method to scrape job data from a URL
   */
  async scrapeJob(targetUrl: string): Promise<ScrapedJobData> {
    // Step 1: Check for Official API (Manual Pre-check Recommended)
    // In a real implementation, this would be a separate method to check and use official APIs if available
    
    // Extract domain for rate limiting
    const domain = this.extractDomain(targetUrl);
    
    // Apply domain-specific rate limiting
    await this.applyDomainRateLimit(domain);

    // Step 2: Prepare for Request
    const currentProxy = this.getRandomProxy();
    const currentUserAgent = this.getRandomUserAgent();
    
    // Step 3: Attempt Static Scrape
    let htmlContent: string | null = null;
    let error: Error | null = null;
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        // This would be a real HTTP request in a server environment
        // Using fetch or another HTTP client
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
      return {
        error: `Failed to retrieve page after ${this.config.maxRetries} attempts: ${error?.message}`,
        url: targetUrl
      };
    }
    
    // Step 4: Parse Static HTML
    let extractedData = this.parseHtml(htmlContent, this.schema);
    
    // Check if we found all essential data
    if (this.allEssentialDataFound(extractedData, this.schema)) {
      console.log("Static scrape successful");
      
      // Update the rate limiting timestamp for this domain
      this.updateDomainTimestamp(domain);
      
      return this.structureData(extractedData, targetUrl);
    }
    
    // Step 5 & 6: Handle Dynamic Content with Headless Browser (if enabled)
    if (this.config.headlessBrowserEnabled) {
      try {
        console.log("Static scrape insufficient, attempting dynamic scrape");
        
        // In a real implementation, this would initialize a headless browser
        // using Playwright or Puppeteer
        const renderedHtml = await this.simulateHeadlessBrowsing(targetUrl, currentUserAgent, currentProxy);
        
        // Parse the rendered HTML
        extractedData = this.parseHtml(renderedHtml, this.schema);
      } catch (e) {
        error = e as Error;
        console.error(`Headless browser failed: ${error.message}`);
        
        // If dynamic scraping fails, we'll return whatever we got from static scraping
        // or an error if nothing was found
      }
    }
    
    // Step 7: Structure and Return Data
    if (this.anyDataFound(extractedData)) {
      console.log("Dynamic scrape successful");
      
      // Update the rate limiting timestamp for this domain
      this.updateDomainTimestamp(domain);
      
      return this.structureData(extractedData, targetUrl);
    }
    
    return {
      error: 'No data found even after all scraping attempts',
      url: targetUrl
    };
  }
  
  /**
   * Batch scrape multiple URLs
   */
  async scrapeMultipleJobs(urls: string[]): Promise<ScrapedJobData[]> {
    const results: ScrapedJobData[] = [];
    
    // Process URLs sequentially to respect rate limits
    for (const url of urls) {
      const jobData = await this.scrapeJob(url);
      results.push(jobData);
    }
    
    return results;
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
   * Parse HTML content to extract job data
   */
  private parseHtml(html: string, schema: JobDataSchema): Partial<ScrapedJobData> {
    // In a real implementation, this would use a library like Cheerio (Node.js)
    // or BeautifulSoup (Python) to parse the HTML and extract data
    
    // For this example, we'll simulate extracting data from our fake HTML
    const data: Partial<ScrapedJobData> = {};
    
    if (html.includes('job-title')) data.title = 'Software Engineer';
    if (html.includes('company-name')) data.company = 'Example Corp';
    if (html.includes('location')) data.location = 'San Francisco, CA';
    if (html.includes('description')) data.description = 'We are looking for a talented software engineer to join our team.';
    
    if (html.includes('salary')) {
      data.salary = {
        min: 100000,
        max: 150000,
        currency: '$'
      };
    }
    
    if (html.includes('requirements')) {
      data.requirements = [
        '5+ years of experience in web development',
        'Bachelor\'s degree in Computer Science or related field',
        'Experience with React and TypeScript',
        'Knowledge of backend technologies'
      ];
    }
    
    if (html.includes('skills')) {
      data.skills = ['JavaScript', 'React', 'TypeScript', 'Node.js', 'GraphQL'];
    }
    
    if (html.includes('posted-date')) data.postedAt = new Date(Date.now() - 3 * 86400000).toISOString();
    if (html.includes('apply-button')) data.applyUrl = 'https://example.com/apply';
    if (html.includes('remote-badge')) data.remote = true;
    
    return data;
  }
  
  /**
   * Structure the final data according to our schema
   */
  private structureData(data: Partial<ScrapedJobData>, url: string): ScrapedJobData {
    const result: ScrapedJobData = {
      ...data,
      id: `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      source: this.extractDomain(url),
      url
    };
    
    return result;
  }
  
  /**
   * Check if all essential data defined in the schema was found
   */
  private allEssentialDataFound(data: Partial<ScrapedJobData>, schema: JobDataSchema): boolean {
    // Essential fields are the ones that are required in our schema
    const essentialFields: (keyof JobDataSchema)[] = ['title', 'company', 'description'];
    
    for (const field of essentialFields) {
      if (schema[field] && !data[field as keyof ScrapedJobData]) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Check if any data was found at all
   */
  private anyDataFound(data: Partial<ScrapedJobData>): boolean {
    return Object.keys(data).length > 0;
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

// Usage example:
// const scraper = new JobScraper();
// const jobData = await scraper.scrapeJob('https://example.com/jobs/software-engineer');
// console.log(jobData);
