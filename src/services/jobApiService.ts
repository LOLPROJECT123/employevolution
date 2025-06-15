
import { Job } from '@/types/job';

interface JobApiResponse {
  jobs: Job[];
  total: number;
}

export class JobApiService {
  private static instance: JobApiService;
  private cache = new Map<string, { data: Job[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): JobApiService {
    if (!JobApiService.instance) {
      JobApiService.instance = new JobApiService();
    }
    return JobApiService.instance;
  }

  async searchJobs(query: string, location?: string, filters?: any): Promise<JobApiResponse> {
    const cacheKey = `${query}-${location || ''}-${JSON.stringify(filters || {})}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return { jobs: cached.data, total: cached.data.length };
    }

    try {
      // Mock data for demonstration
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Software Engineer',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          description: 'We are looking for a senior software engineer to join our team.',
          requirements: ['React', 'TypeScript', 'Node.js'],
          salary: { min: 120000, max: 180000, currency: 'USD' },
          type: 'full-time',
          level: 'senior',
          postedAt: new Date().toISOString(),
          skills: ['React', 'TypeScript', 'Node.js'],
          applyUrl: 'https://example.com/apply/1',
          source: 'linkedin.com',
          remote: true,
          workModel: 'remote',
          matchPercentage: 95
        },
        {
          id: '2',
          title: 'Frontend Developer',
          company: 'StartupXYZ',
          location: 'Austin, TX',
          description: 'Join our frontend team and build amazing user experiences.',
          requirements: ['React', 'JavaScript', 'CSS'],
          salary: { min: 80000, max: 120000, currency: 'USD' },
          type: 'full-time',
          level: 'mid',
          postedAt: new Date().toISOString(),
          skills: ['React', 'JavaScript', 'CSS'],
          applyUrl: 'https://example.com/apply/2',
          source: 'indeed.com',
          remote: false,
          workModel: 'hybrid',
          matchPercentage: 88
        }
      ];

      this.cache.set(cacheKey, { data: mockJobs, timestamp: Date.now() });
      return { jobs: mockJobs, total: mockJobs.length };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw new Error('Failed to fetch jobs');
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const jobApiService = JobApiService.getInstance();
