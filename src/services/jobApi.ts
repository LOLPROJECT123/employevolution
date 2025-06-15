
import { Job } from '@/types/job';

export interface JobSearchParams {
  query?: string;
  location?: string;
  remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  experience_level?: string;
  page?: number;
  limit?: number;
}

export interface JobSearchResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

class JobApiService {
  private baseUrl = 'https://api.jobs.dev';

  async searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
    try {
      // Generate mock data for now
      const mockJobs: Job[] = Array.from({ length: params.limit || 20 }, (_, i) => ({
        id: `job-${i + 1}`,
        title: `Software Engineer ${i + 1}`,
        company: `Company ${i + 1}`,
        location: params.location || 'Remote',
        description: `Join our team as a Software Engineer and work on cutting-edge technology.`,
        requirements: ['JavaScript', 'React', 'Node.js'],
        salary: {
          min: 70000 + (i * 5000),
          max: 120000 + (i * 5000),
          currency: 'USD'
        },
        type: 'full-time',
        level: 'mid',
        postedAt: new Date().toISOString(),
        skills: ['JavaScript', 'React', 'TypeScript'],
        applyUrl: `https://example.com/apply/${i + 1}`,
        source: 'linkedin.com',
        remote: params.remote || Math.random() > 0.5,
        workModel: Math.random() > 0.5 ? 'remote' : 'hybrid',
        matchPercentage: Math.floor(Math.random() * 30) + 70
      }));

      return {
        jobs: mockJobs,
        total: 100,
        page: params.page || 1,
        totalPages: 5
      };
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw new Error('Failed to search jobs');
    }
  }

  async getJobById(id: string): Promise<Job | null> {
    try {
      // Mock implementation
      return {
        id,
        title: 'Senior Software Engineer',
        company: 'Example Company',
        location: 'San Francisco, CA',
        description: 'We are looking for a senior software engineer...',
        requirements: ['React', 'TypeScript', 'Node.js'],
        salary: {
          min: 120000,
          max: 180000,
          currency: 'USD'
        },
        type: 'full-time',
        level: 'senior',
        postedAt: new Date().toISOString(),
        skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
        applyUrl: 'https://example.com/apply',
        source: 'linkedin.com',
        remote: true,
        workModel: 'remote',
        matchPercentage: 85
      };
    } catch (error) {
      console.error('Error getting job by ID:', error);
      return null;
    }
  }

  async checkJobAvailability(applyUrl: string): Promise<boolean> {
    try {
      // Mock implementation - randomly return true/false
      return Math.random() > 0.1; // 90% chance job is still available
    } catch (error) {
      console.error('Error checking job availability:', error);
      return false;
    }
  }
}

export const jobApi = new JobApiService();
