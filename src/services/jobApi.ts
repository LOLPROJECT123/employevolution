
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

class JobApiService {
  async searchJobs(params: JobSearchParams): Promise<{ jobs: Job[] }> {
    // Mock job data
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        salary: { min: 120000, max: 180000, currency: '$' },
        type: 'full-time',
        level: 'senior',
        description: 'We are looking for a senior software engineer to join our team...',
        requirements: ['5+ years experience', 'React', 'TypeScript'],
        postedAt: new Date().toISOString(),
        skills: ['React', 'TypeScript', 'Node.js'],
        remote: true,
        workModel: 'remote',
        matchPercentage: 85,
        applicationDetails: { isAvailable: true, applicantCount: 25 }
      },
      {
        id: '2',
        title: 'Frontend Developer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        salary: { min: 80000, max: 120000, currency: '$' },
        type: 'full-time',
        level: 'mid',
        description: 'Join our growing frontend team...',
        requirements: ['3+ years experience', 'React', 'CSS'],
        postedAt: new Date().toISOString(),
        skills: ['React', 'CSS', 'JavaScript'],
        remote: false,
        workModel: 'hybrid',
        matchPercentage: 72,
        applicationDetails: { isAvailable: true, applicantCount: 15 }
      }
    ];

    return { jobs: mockJobs };
  }

  async checkJobAvailability(url: string): Promise<boolean> {
    return true;
  }
}

export const jobApi = new JobApiService();
