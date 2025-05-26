
import { Job } from '@/types/job';
import { cacheService } from './cacheService';
import { supabase } from '@/integrations/supabase/client';

interface RealJobSearchParams {
  query: string;
  location?: string;
  page?: number;
  limit?: number;
  remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  experience_level?: string;
  company?: string;
  posted_days?: number;
}

interface JobApiResponse {
  jobs: Job[];
  total: number;
  page: number;
  has_more: boolean;
  source: string;
}

class RealJobApiService {
  async searchJobs(params: RealJobSearchParams): Promise<JobApiResponse[]> {
    const cacheKey = `real_jobs:${JSON.stringify(params)}`;
    const cachedResult = cacheService.get<JobApiResponse[]>(cacheKey);
    
    if (cachedResult) {
      console.log('Returning cached real job results');
      return cachedResult;
    }

    try {
      const results = await Promise.allSettled([
        this.searchJobsFromSource(params, 'adzuna'),
        this.searchJobsFromSource(params, 'google'),
        this.searchJobsFromSource(params, 'themuse')
      ]);

      const validResults = results
        .filter((result): result is PromiseFulfilledResult<JobApiResponse> => 
          result.status === 'fulfilled' && result.value.jobs.length > 0
        )
        .map(result => result.value);

      // Cache results for 10 minutes
      cacheService.set(cacheKey, validResults, 10 * 60 * 1000);
      
      return validResults;
    } catch (error) {
      console.error('Real job search failed:', error);
      return [];
    }
  }

  private async searchJobsFromSource(params: RealJobSearchParams, source: string): Promise<JobApiResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('job-search', {
        body: {
          searchParams: params,
          source: source
        }
      });

      if (error) {
        console.error(`Error searching ${source}:`, error);
        throw error;
      }

      return {
        jobs: data.jobs || [],
        total: data.total || 0,
        page: params.page || 1,
        has_more: (params.page || 1) < Math.ceil((data.total || 0) / (params.limit || 20)),
        source: source
      };
    } catch (error) {
      console.error(`${source} search failed:`, error);
      return {
        jobs: [],
        total: 0,
        page: params.page || 1,
        has_more: false,
        source: source
      };
    }
  }

  async verifyJobAvailability(applyUrl: string): Promise<boolean> {
    try {
      const response = await fetch(applyUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Job availability check failed:', error);
      return false;
    }
  }

  async getJobDetails(jobId: string, source: string): Promise<Job | null> {
    try {
      console.log(`Getting details for job ${jobId} from ${source}`);
      return null;
    } catch (error) {
      console.error('Failed to get job details:', error);
      return null;
    }
  }
}

export const realJobApiService = new RealJobApiService();

// Also export the browser service for Jobs page
export { realBrowserService } from './realBrowserService';
