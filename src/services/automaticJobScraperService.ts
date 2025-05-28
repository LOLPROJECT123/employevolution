
import { Job } from '@/types/job';
import { ScrapedJob } from '@/components/resume/job-application/types';
import { jobAPIService } from '@/services/jobApiService';
import { realJobApiService } from '@/services/realJobApiService';
import { convertScrapedJobToJob } from '@/utils/jobApplicationUtils';
import { supabase } from '@/integrations/supabase/client';

interface AutoScrapingConfig {
  maxJobs: number;
  platforms: string[];
  query: string;
  location: string;
  delayBetweenPlatforms: number;
}

class AutomaticJobScraperService {
  private isRunning = false;
  private config: AutoScrapingConfig = {
    maxJobs: 100,
    platforms: ['adzuna', 'google', 'themuse', 'indeed', 'linkedin'],
    query: 'Software Engineer',
    location: 'Austin, TX',
    delayBetweenPlatforms: 5000
  };

  async startAutoScraping(userQuery?: string, userLocation?: string): Promise<Job[]> {
    if (this.isRunning) {
      console.log('Auto scraping already in progress');
      return [];
    }

    this.isRunning = true;
    const allJobs: Job[] = [];

    try {
      console.log('Starting automatic job scraping...');

      // Update config if user provided specific search terms
      if (userQuery) this.config.query = userQuery;
      if (userLocation) this.config.location = userLocation;

      // 1. Search using existing job API service
      const jobApiJobs = await this.searchWithJobAPI();
      allJobs.push(...jobApiJobs);

      // 2. Search using real job API service for multiple sources
      const realApiJobs = await this.searchWithRealJobAPI();
      allJobs.push(...realApiJobs);

      // 3. Search ATS systems
      const atsJobs = await this.searchATSSystems();
      allJobs.push(...atsJobs);

      // 4. Deduplicate jobs
      const uniqueJobs = this.deduplicateJobs(allJobs);

      // 5. Enhance jobs with additional data
      const enhancedJobs = await this.enhanceJobData(uniqueJobs);

      console.log(`Auto scraping completed. Found ${enhancedJobs.length} unique jobs`);
      return enhancedJobs;

    } catch (error) {
      console.error('Error in automatic job scraping:', error);
      return [];
    } finally {
      this.isRunning = false;
    }
  }

  private async searchWithJobAPI(): Promise<Job[]> {
    try {
      console.log('Searching with job API service...');
      const response = await jobAPIService.searchJobs({
        query: this.config.query,
        location: this.config.location,
        page: 1,
        limit: 20
      });
      return response.jobs;
    } catch (error) {
      console.error('Job API search failed:', error);
      return [];
    }
  }

  private async searchWithRealJobAPI(): Promise<Job[]> {
    try {
      console.log('Searching with real job API service...');
      const responses = await realJobApiService.searchJobs({
        query: this.config.query,
        location: this.config.location,
        page: 1,
        limit: 15
      });

      const allJobs: Job[] = [];
      for (const response of responses) {
        allJobs.push(...response.jobs);
      }
      return allJobs;
    } catch (error) {
      console.error('Real job API search failed:', error);
      return [];
    }
  }

  private async searchATSSystems(): Promise<Job[]> {
    const atsCompanies = {
      greenhouse: ['airbnb', 'stripe', 'coinbase', 'notion', 'dropbox'],
      lever: ['netflix', 'uber', 'pinterest', 'github', 'figma'],
      icims: ['amazon', 'microsoft', 'google', 'meta', 'apple'],
      workday: ['salesforce', 'oracle', 'adobe', 'nvidia', 'tesla']
    };

    const allATSJobs: Job[] = [];

    try {
      console.log('Searching ATS systems...');
      
      for (const [atsType, companies] of Object.entries(atsCompanies)) {
        await this.delay(this.config.delayBetweenPlatforms);
        
        for (const company of companies.slice(0, 3)) { // Limit to 3 companies per ATS
          try {
            const jobs = await this.searchATSCompany(company, atsType);
            allATSJobs.push(...jobs);
          } catch (error) {
            console.error(`Failed to search ${company} on ${atsType}:`, error);
          }
        }
      }
      
      return allATSJobs;
    } catch (error) {
      console.error('ATS search failed:', error);
      return [];
    }
  }

  private async searchATSCompany(company: string, atsType: string): Promise<Job[]> {
    try {
      // Use Supabase edge function to search specific ATS
      const { data, error } = await supabase.functions.invoke('job-search', {
        body: {
          searchParams: {
            query: this.config.query,
            location: this.config.location,
            company: company,
            atsType: atsType,
            limit: 5
          },
          source: 'ats'
        }
      });

      if (error) {
        console.error(`ATS search error for ${company}:`, error);
        return [];
      }

      return (data.jobs || []).map((job: any) => ({
        ...job,
        source: `${company} (${atsType})`,
        atsSystem: atsType
      }));
    } catch (error) {
      console.error(`Error searching ${company} ATS:`, error);
      return [];
    }
  }

  private deduplicateJobs(jobs: Job[]): Job[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}-${job.location.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private async enhanceJobData(jobs: Job[]): Promise<Job[]> {
    return jobs.map(job => ({
      ...job,
      applicantCount: Math.floor(Math.random() * 200) + 10, // Simulate applicant count
      matchPercentage: job.matchPercentage || Math.floor(Math.random() * 40) + 60,
      postedAt: job.postedAt || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  updateConfig(newConfig: Partial<AutoScrapingConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  isScrapingActive(): boolean {
    return this.isRunning;
  }
}

export const automaticJobScraperService = new AutomaticJobScraperService();
