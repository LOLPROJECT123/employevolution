
import { Job } from '@/types/job';

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
  private readonly baseURL = 'https://api.adzuna.com/v1/api/jobs';
  private readonly appId = process.env.VITE_ADZUNA_APP_ID;
  private readonly appKey = process.env.VITE_ADZUNA_APP_KEY;

  // Rate limiting
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;
  private requestCount = 0;
  private resetTime = Date.now() + 60000; // Reset every minute

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0 && this.requestCount < 100) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
          this.requestCount++;
        } catch (error) {
          console.error('API request failed:', error);
        }
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    this.isProcessing = false;
    
    // Reset rate limit counter
    if (Date.now() > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = Date.now() + 60000;
    }
  }

  private addToQueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  async searchJobs(params: JobSearchParams): Promise<JobAPIResponse> {
    return this.addToQueue(async () => {
      try {
        // If no API keys, use mock data
        if (!this.appId || !this.appKey) {
          return this.getMockJobs(params);
        }

        const url = new URL(`${this.baseURL}/us/search/${params.page || 1}`);
        url.searchParams.append('app_id', this.appId);
        url.searchParams.append('app_key', this.appKey);
        
        if (params.query) url.searchParams.append('what', params.query);
        if (params.location) url.searchParams.append('where', params.location);
        if (params.limit) url.searchParams.append('results_per_page', params.limit.toString());
        if (params.salary_min) url.searchParams.append('salary_min', params.salary_min.toString());
        if (params.salary_max) url.searchParams.append('salary_max', params.salary_max.toString());

        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        return {
          jobs: this.transformJobData(data.results || []),
          total: data.count || 0,
          page: params.page || 1,
          hasNext: (params.page || 1) < Math.ceil((data.count || 0) / (params.limit || 20))
        };
      } catch (error) {
        console.error('Job search failed:', error);
        // Fallback to mock data
        return this.getMockJobs(params);
      }
    });
  }

  async verifyJobAvailability(jobUrl: string): Promise<boolean> {
    return this.addToQueue(async () => {
      try {
        const response = await fetch(jobUrl, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        console.error('Job verification failed:', error);
        return false;
      }
    });
  }

  async getJobDetails(jobId: string): Promise<Job | null> {
    return this.addToQueue(async () => {
      try {
        if (!this.appId || !this.appKey) {
          return this.getMockJobDetails(jobId);
        }

        const url = `${this.baseURL}/us/job/${jobId}`;
        const response = await fetch(`${url}?app_id=${this.appId}&app_key=${this.appKey}`);
        
        if (!response.ok) {
          throw new Error(`Failed to get job details: ${response.status}`);
        }

        const data = await response.json();
        return this.transformSingleJob(data);
      } catch (error) {
        console.error('Failed to get job details:', error);
        return this.getMockJobDetails(jobId);
      }
    });
  }

  private transformJobData(jobs: any[]): Job[] {
    return jobs.map(job => this.transformSingleJob(job));
  }

  private transformSingleJob(job: any): Job {
    return {
      id: job.id || `job-${Date.now()}-${Math.random()}`,
      title: job.title || 'Software Engineer',
      company: job.company?.display_name || 'Tech Company',
      location: job.location?.display_name || 'Remote',
      description: job.description || 'Job description not available',
      requirements: this.extractRequirements(job.description || ''),
      salary: {
        min: job.salary_min || 60000,
        max: job.salary_max || 120000,
        currency: 'USD'
      },
      type: 'full-time',
      level: this.inferLevel(job.title || ''),
      postedAt: job.created || new Date().toISOString(),
      skills: this.extractSkills(job.description || ''),
      remote: this.isRemote(job.location?.display_name || ''),
      applyUrl: job.redirect_url || `https://example.com/apply/${job.id}`,
      source: 'Adzuna',
      matchPercentage: Math.floor(Math.random() * 40) + 60
    };
  }

  private extractRequirements(description: string): string[] {
    const requirements = [];
    if (description.toLowerCase().includes('bachelor')) {
      requirements.push("Bachelor's degree required");
    }
    if (description.toLowerCase().includes('experience')) {
      requirements.push("Previous experience required");
    }
    return requirements;
  }

  private extractSkills(description: string): string[] {
    const skillKeywords = ['javascript', 'react', 'python', 'java', 'typescript', 'node.js', 'aws', 'docker'];
    const skills = [];
    
    for (const skill of skillKeywords) {
      if (description.toLowerCase().includes(skill)) {
        skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    }
    
    return skills.slice(0, 5);
  }

  private inferLevel(title: string): Job['level'] {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('senior') || lowerTitle.includes('sr.')) return 'senior';
    if (lowerTitle.includes('junior') || lowerTitle.includes('jr.')) return 'entry';
    if (lowerTitle.includes('lead')) return 'lead';
    if (lowerTitle.includes('manager')) return 'manager';
    if (lowerTitle.includes('director')) return 'director';
    if (lowerTitle.includes('intern')) return 'intern';
    return 'mid';
  }

  private isRemote(location: string): boolean {
    return location.toLowerCase().includes('remote') || location.toLowerCase().includes('anywhere');
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

  private getMockJobDetails(jobId: string): Job {
    return {
      id: jobId,
      title: 'Senior Software Engineer',
      company: 'Tech Innovators Inc.',
      location: 'San Francisco, CA',
      description: 'Join our team as a Senior Software Engineer and help build the future of technology.',
      requirements: ["Bachelor's degree in Computer Science", "5+ years of experience", "Expert in React and TypeScript"],
      salary: { min: 120000, max: 160000, currency: 'USD' },
      type: 'full-time',
      level: 'senior',
      postedAt: new Date().toISOString(),
      skills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'AWS'],
      remote: true,
      applyUrl: `https://example.com/apply/${jobId}`,
      source: 'Mock API',
      matchPercentage: 85
    };
  }
}

export const jobAPIService = new JobAPIService();
