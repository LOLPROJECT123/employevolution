
import { Job } from '@/types/job';
import { cacheService } from './cacheService';

export interface JobSearchParams {
  query: string;
  location?: string;
  remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  experience_level?: string;
  company?: string;
  posted_days?: number;
  page?: number;
  limit?: number;
}

export interface JobApiResponse {
  jobs: Job[];
  total: number;
  page: number;
  has_more: boolean;
}

class JobApiService {
  private baseUrl = '/api/jobs'; // This would be your backend API

  async searchJobs(params: JobSearchParams): Promise<JobApiResponse> {
    try {
      // Create a cache key based on search parameters
      const cacheKey = this.createCacheKey(params);
      
      // Check if we have cached results
      const cachedResult = cacheService.get<JobApiResponse>(cacheKey);
      if (cachedResult) {
        console.log('Returning cached job results for:', cacheKey);
        return cachedResult;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockJobs = this.generateDeterministicMockJobs(params);
      
      const response: JobApiResponse = {
        jobs: mockJobs,
        total: mockJobs.length,
        page: params.page || 1,
        has_more: mockJobs.length >= (params.limit || 20)
      };

      // Cache the results for 5 minutes
      cacheService.set(cacheKey, response, 5 * 60 * 1000);
      
      return response;
    } catch (error) {
      console.error('Job search failed:', error);
      throw new Error('Failed to fetch jobs. Please try again.');
    }
  }

  async getJobDetails(jobId: string): Promise<Job | null> {
    try {
      // Check cache first
      const cachedJob = cacheService.get<Job>(`job_details:${jobId}`);
      if (cachedJob) {
        return cachedJob;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      
      const job = this.generateDetailedMockJob(jobId);
      
      // Cache job details for 10 minutes
      cacheService.set(`job_details:${jobId}`, job, 10 * 60 * 1000);
      
      return job;
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      return null;
    }
  }

  async checkJobAvailability(jobUrl: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return Math.random() > 0.05; // 95% availability
    } catch (error) {
      console.error('Failed to check job availability:', error);
      return false;
    }
  }

  private createCacheKey(params: JobSearchParams): string {
    const key = `jobs:${params.query || 'all'}:${params.location || 'any'}:${params.page || 1}:${params.limit || 20}:${params.remote || false}`;
    return key;
  }

  private generateDeterministicMockJobs(params: JobSearchParams): Job[] {
    // Use search parameters to create a deterministic seed
    const seed = this.createSeed(params.query || '', params.location || '');
    
    const companies = [
      { name: 'Google', rating: 4.5, size: 'large' },
      { name: 'Microsoft', rating: 4.4, size: 'large' },
      { name: 'Apple', rating: 4.3, size: 'large' },
      { name: 'Amazon', rating: 4.1, size: 'large' },
      { name: 'Meta', rating: 4.2, size: 'large' },
      { name: 'Netflix', rating: 4.3, size: 'mid-size' },
      { name: 'Uber', rating: 3.9, size: 'mid-size' },
      { name: 'Airbnb', rating: 4.2, size: 'mid-size' },
      { name: 'Stripe', rating: 4.6, size: 'mid-size' },
      { name: 'Figma', rating: 4.7, size: 'early' }
    ];

    let jobTitles = [
      'Software Engineer',
      'Senior Developer',
      'Full Stack Engineer',
      'Frontend Developer',
      'Backend Engineer',
      'Data Scientist',
      'Machine Learning Engineer',
      'DevOps Engineer',
      'QA Engineer',
      'Product Manager'
    ];

    // Filter job titles based on query
    if (params.query && params.query.toLowerCase().includes('quant')) {
      jobTitles = [
        'Quantitative Developer',
        'Quant Researcher',
        'Quantitative Analyst',
        'Quantitative Strategist',
        'Algorithmic Trader'
      ];
    }

    const skills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
      'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'PostgreSQL', 'MongoDB'
    ];

    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
      'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO',
      'Atlanta, GA', 'Remote'
    ];

    const jobs: Job[] = [];
    const jobCount = params.limit || 20;

    // Use deterministic random generation
    let currentSeed = seed;

    for (let i = 0; i < jobCount; i++) {
      currentSeed = this.nextSeed(currentSeed);
      
      const jobTitleIndex = currentSeed % jobTitles.length;
      const companyIndex = currentSeed % companies.length;
      const company = companies[companyIndex];
      const title = jobTitles[jobTitleIndex];
      
      // Create deterministic job ID
      const jobId = `job-${company.name.toLowerCase().replace(/\s+/g, '')}-${title.toLowerCase().replace(/\s+/g, '-')}-${i}`;
      
      const locationIndex = currentSeed % locations.length;
      let location = params.location || locations[locationIndex];
      const isRemote = location === 'Remote' || params.remote;
      
      const baseSalary = 80000 + ((currentSeed % 100) * 1000);
      const salaryRange = {
        min: baseSalary,
        max: baseSalary + 50000,
        currency: '$'
      };

      const jobSkills = skills.slice(0, (currentSeed % 4) + 3);
      
      const postedDaysAgo = currentSeed % 30;
      const postedAt = new Date();
      postedAt.setDate(postedAt.getDate() - postedDaysAgo);

      const job: Job = {
        id: jobId,
        title,
        company: company.name,
        location,
        salary: salaryRange,
        type: ['full-time', 'part-time', 'contract'][currentSeed % 3] as Job['type'],
        level: ['entry', 'mid', 'senior', 'lead'][currentSeed % 4] as Job['level'],
        description: `We are looking for a talented ${title} to join our ${company.name} team. This role offers exciting opportunities to work on cutting-edge projects.`,
        requirements: [
          `Bachelor's degree in Computer Science or related field`,
          `${(currentSeed % 5) + 1}+ years of experience`,
          `Proficiency in ${jobSkills.slice(0, 3).join(', ')}`,
          `Strong problem-solving skills`
        ],
        postedAt: postedAt.toISOString(),
        skills: jobSkills,
        matchPercentage: 60 + (currentSeed % 40), // 60-100% match
        remote: isRemote,
        applyUrl: `https://${company.name.toLowerCase()}.com/jobs/${jobId}`,
        source: ['LinkedIn', 'Indeed', 'Glassdoor', 'Company Website'][currentSeed % 4],
        applicationDetails: {
          applicantCount: 10 + (currentSeed % 200),
          isAvailable: true,
          platform: 'web'
        },
        companyType: 'private',
        companySize: company.size as Job['companySize'],
        workModel: isRemote ? 'remote' : 'onsite',
        benefits: [
          'Health Insurance',
          'Dental Insurance',
          '401(k) Matching',
          'Flexible PTO',
          'Remote Work Options',
          'Professional Development Budget'
        ].slice(0, (currentSeed % 4) + 2),
        responsibilities: [
          `Design and develop ${jobSkills[0]} applications`,
          `Collaborate with cross-functional teams`,
          `Participate in code reviews`,
          `Mentor junior team members`
        ]
      };

      jobs.push(job);
    }

    return this.applyFilters(jobs, params);
  }

  private createSeed(query: string, location: string): number {
    let hash = 0;
    const str = `${query}${location}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private nextSeed(seed: number): number {
    // Linear congruential generator for deterministic pseudo-random numbers
    return (seed * 1664525 + 1013904223) % Math.pow(2, 32);
  }

  private applyFilters(jobs: Job[], params: JobSearchParams): Job[] {
    return jobs.filter(job => {
      if (params.query && !job.title.toLowerCase().includes(params.query.toLowerCase()) &&
          !job.company.toLowerCase().includes(params.query.toLowerCase())) {
        return false;
      }
      
      if (params.location && !job.location.toLowerCase().includes(params.location.toLowerCase())) {
        return false;
      }
      
      if (params.remote && !job.remote) {
        return false;
      }
      
      if (params.salary_min && job.salary.min < params.salary_min) {
        return false;
      }
      
      return true;
    });
  }

  private generateDetailedMockJob(jobId: string): Job {
    const company = 'Google';
    return {
      id: jobId,
      title: 'Senior Software Engineer',
      company,
      location: 'San Francisco, CA',
      salary: { min: 150000, max: 200000, currency: '$' },
      type: 'full-time',
      level: 'senior',
      description: `Join Google's world-class engineering team and help build products that impact billions of users worldwide.`,
      requirements: [
        "Bachelor's degree in Computer Science or equivalent",
        "5+ years of software development experience",
        "Experience with distributed systems",
        "Strong problem-solving skills"
      ],
      postedAt: new Date().toISOString(),
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'GCP'],
      matchPercentage: 85,
      remote: false,
      applyUrl: `https://careers.google.com/jobs/results/${jobId}`,
      source: 'Company Website',
      companyType: 'public',
      companySize: 'large',
      workModel: 'hybrid',
      sponsorH1b: true,
      applicationDetails: {
        applicantCount: 157,
        isAvailable: true,
        platform: 'web'
      },
      benefits: [
        'Comprehensive health insurance',
        'Retirement savings plan',
        'Flexible time off',
        'Professional development'
      ],
      responsibilities: [
        'Design and develop software solutions',
        'Participate in code reviews',
        'Collaborate with cross-functional teams',
        'Mentor junior developers'
      ]
    };
  }
}

export const jobApi = new JobApiService();
