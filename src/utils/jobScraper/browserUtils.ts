
/**
 * Browser utilities for job scraping
 * This is a mock implementation - in a real app, this would use Puppeteer or Playwright
 */

import { ScraperConfig } from './scraperTypes';

const DEFAULT_CONFIG: ScraperConfig = {
  userAgentList: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0'
  ],
  rateLimitDelay: 3,
  maxRetries: 3,
  headlessBrowserEnabled: true
};

/**
 * Create a browser instance with stealth features to avoid detection
 * In a real implementation, this would initialize Puppeteer
 */
export const createScrapingBrowser = async (config: Partial<ScraperConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  console.log('Creating scraping browser with config:', fullConfig);
  
  // This is a mock implementation - in a real app, this would launch a headless browser
  // Here we just simulate the browser creation delay
  await delay(1000);
  
  return {
    browser: {
      close: async () => console.log('Browser closed')
    },
    page: {
      goto: async (url: string) => {
        console.log(`Navigating to ${url}`);
        return { status: 200 };
      },
      evaluate: async <T>(fn: () => T): Promise<T> => {
        // This is where the actual DOM parsing would happen in a real implementation
        // For now we return mock data based on the URL
        const mockData = {
          title: 'Software Engineer',
          company: 'Tech Company',
          location: 'San Francisco, CA',
          description: 'We are looking for a talented software engineer...',
          salary: '$120,000 - $160,000',
          requirements: 'Bachelor\'s degree in Computer Science, 3+ years of experience with JavaScript, Experience with React',
          url: 'https://example.com/jobs/123'
        };
        
        return mockData as unknown as T;
      },
      setUserAgent: async (userAgent: string) => console.log(`Setting user agent: ${userAgent}`),
      setExtraHTTPHeaders: async (headers: Record<string, string>) => console.log('Setting headers:', headers),
      waitForSelector: async (selector: string, options?: { timeout?: number }) => {
        console.log(`Waiting for selector: ${selector}`);
        await delay(500);
        return true;
      },
      close: async () => console.log('Page closed')
    },
    userAgent: getRandomUserAgent(fullConfig)
  };
};

/**
 * Get a random user agent from the user agent list
 */
export const getRandomUserAgent = (config: ScraperConfig): string => {
  const index = Math.floor(Math.random() * config.userAgentList.length);
  return config.userAgentList[index];
};

/**
 * Add a delay to simulate network latency and avoid rate limiting
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Simulate human-like interaction with the page to avoid bot detection
 * In a real implementation, this would move the mouse and scroll the page
 */
export const simulateHumanInteraction = async (page: any): Promise<void> => {
  console.log('Simulating human interaction');
  await delay(Math.random() * 1000 + 500);
};

/**
 * Extract domain from URL
 */
export const extractDomain = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    return url;
  }
};
