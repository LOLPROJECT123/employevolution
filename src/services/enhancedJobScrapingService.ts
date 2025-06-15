
import { Job } from '@/types/job';
import { supabase } from '@/integrations/supabase/client';

interface ScrapingConfig {
  platforms: string[];
  query: string;
  location: string;
  maxResultsPerPlatform: number;
  useProxy: boolean;
  rateLimitDelay: number;
}

interface ScrapedJobData {
  platform: string;
  jobs: Job[];
  totalFound: number;
  success: boolean;
  error?: string;
}

class EnhancedJobScrapingService {
  private config: ScrapingConfig = {
    platforms: [
      'linkedin', 'indeed', 'glassdoor', 'handshake', 'ziprecruiter',
      'dice', 'simplyhired', 'lever', 'icims', 'workday', 'greenhouse',
      'ashby', 'rippling', 'simplify', 'offerpilot', 'jobright'
    ],
    query: '',
    location: '',
    maxResultsPerPlatform: 50,
    useProxy: true,
    rateLimitDelay: 2000
  };

  async scrapeAllPlatforms(query: string, location: string, userPreferences?: any): Promise<ScrapedJobData[]> {
    console.log(`Starting enhanced job scraping for: ${query} in ${location}`);
    
    const results: ScrapedJobData[] = [];
    
    // Process platforms in batches to avoid overwhelming servers
    const batchSize = 3;
    const platformBatches = this.chunkArray(this.config.platforms, batchSize);
    
    for (const batch of platformBatches) {
      const batchPromises = batch.map(platform => 
        this.scrapePlatform(platform, query, location, userPreferences)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        const platform = batch[index];
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            platform,
            jobs: [],
            totalFound: 0,
            success: false,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });
      
      // Rate limiting between batches
      if (platformBatches.indexOf(batch) < platformBatches.length - 1) {
        await this.delay(this.config.rateLimitDelay);
      }
    }
    
    return results;
  }

  private async scrapePlatform(platform: string, query: string, location: string, userPreferences?: any): Promise<ScrapedJobData> {
    try {
      console.log(`Scraping ${platform}...`);
      
      const { data, error } = await supabase.functions.invoke('enhanced-job-scraper', {
        body: {
          platform,
          query,
          location,
          maxResults: this.config.maxResultsPerPlatform,
          userPreferences,
          useProxy: this.config.useProxy
        }
      });

      if (error) {
        throw new Error(`Error scraping ${platform}: ${error.message}`);
      }

      return {
        platform,
        jobs: data.jobs || [],
        totalFound: data.totalFound || 0,
        success: true
      };
    } catch (error) {
      console.error(`Failed to scrape ${platform}:`, error);
      return {
        platform,
        jobs: [],
        totalFound: 0,
        success: false,
        error: (error as Error).message
      };
    }
  }

  async scrapeHandshakeWithScript(query: string, location: string, credentials: any): Promise<ScrapedJobData> {
    try {
      console.log('Scraping Handshake with enhanced script...');
      
      const { data, error } = await supabase.functions.invoke('handshake-scraper', {
        body: {
          query,
          location,
          credentials,
          scriptType: 'enhanced'
        }
      });

      if (error) {
        throw new Error(`Handshake scraping error: ${error.message}`);
      }

      return {
        platform: 'handshake',
        jobs: data.jobs || [],
        totalFound: data.totalFound || 0,
        success: true
      };
    } catch (error) {
      console.error('Handshake scraping failed:', error);
      return {
        platform: 'handshake',
        jobs: [],
        totalFound: 0,
        success: false,
        error: (error as Error).message
      };
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const enhancedJobScrapingService = new EnhancedJobScrapingService();
