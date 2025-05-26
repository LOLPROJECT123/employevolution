
import { Job } from '@/types/job';
import { supabase } from '@/integrations/supabase/client';

interface JobAPIResponse {
  jobs: Job[];
  total: number;
  page: number;
  hasNext: boolean;
}

interface JobSearchParams {
  query?: string;
  location?: string;
  page?: number;
  limit?: number;
  remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  experience_level?: string;
}

class JobAPIService {
  async searchJobs(params: JobSearchParams): Promise<JobAPIResponse> {
    try {
      // Use the edge function to search jobs with real API data
      const { data, error } = await supabase.functions.invoke('job-search', {
        body: {
          searchParams: params,
          source: 'adzuna' // Default to Adzuna for main search
        }
      });

      if (error) {
        console.error('Job search API error:', error);
        // Fallback to mock data
        return this.getMockJobs(params);
      }

      return {
        jobs: data.jobs || [],
        total: data.total || 0,
        page: params.page || 1,
        hasNext: (params.page || 1) < Math.ceil((data.total || 0) / (params.limit || 20))
      };
    } catch (error) {
      console.error('Job search failed:', error);
      // Fallback to mock data
      return this.getMockJobs(params);
    }
  }

  async verifyJobAvailability(jobUrl: string): Promise<boolean> {
    try {
      const response = await fetch(jobUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Job verification failed:', error);
      return false;
    }
  }

  async getJobDetails(jobId: string): Promise<Job | null> {
    try {
      // In a real implementation, this would fetch specific job details
      console.log(`Getting details for job: ${jobId}`);
      return null;
    } catch (error) {
      console.error('Failed to get job details:', error);
      return null;
    }
  }

  private getMockJobs(params: JobSearchParams): JobAPIResponse {
    const mockJobs: Job[] = Array.from({ length: params.limit || 20 }, (_, i) => ({
      id: `mock-job-${Date.now()}-${i}`,
      title: `Software Engineer ${i + 1}`,
      company: `Tech Company ${i + 1}`,
      location: params.location || 'San Francisco, CA',
      description: 'Exciting opportunity to work with cutting-edge technology.',
      requirements: ["Bachelor's degree in Computer Science", "3+ years experience"],
      salary: {
        min: 80000 + (i * 5000),
        max: 120000 + (i * 5000),
        currency: 'USD'
      },
      type: 'full-time',
      level: 'mid',
      postedAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
      skills: ['JavaScript', 'React', 'TypeScript'],
      remote: Math.random() > 0.5,
      applyUrl: `https://example.com/apply/mock-job-${i}`,
      source: 'Mock API',
      matchPercentage: Math.floor(Math.random() * 40) + 60
    }));

    return {
      jobs: mockJobs,
      total: 100,
      page: params.page || 1,
      hasNext: (params.page || 1) < 5
    };
  }
}

export const jobAPIService = new JobAPIService();
