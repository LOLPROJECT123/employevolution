
import { Job } from '@/types/job';
import { cacheService } from './cacheService';

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
  private readonly apis = {
    adzuna: {
      baseUrl: 'https://api.adzuna.com/v1/api/jobs',
      appId: process.env.VITE_ADZUNA_APP_ID,
      appKey: process.env.VITE_ADZUNA_APP_KEY
    },
    serpApi: {
      baseUrl: 'https://serpapi.com/search',
      apiKey: process.env.VITE_SERPAPI_KEY
    },
    theMuseApi: {
      baseUrl: 'https://www.themuse.com/api/public',
      apiKey: process.env.VITE_THEMUSE_API_KEY
    }
  };

  async searchJobs(params: RealJobSearchParams): Promise<JobApiResponse[]> {
    const cacheKey = `real_jobs:${JSON.stringify(params)}`;
    const cachedResult = cacheService.get<JobApiResponse[]>(cacheKey);
    
    if (cachedResult) {
      console.log('Returning cached real job results');
      return cachedResult;
    }

    try {
      const results = await Promise.allSettled([
        this.searchAdzunaJobs(params),
        this.searchGoogleJobs(params),
        this.searchTheMuseJobs(params)
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

  private async searchAdzunaJobs(params: RealJobSearchParams): Promise<JobApiResponse> {
    if (!this.apis.adzuna.appId || !this.apis.adzuna.appKey) {
      throw new Error('Adzuna API credentials not configured');
    }

    const url = new URL(`${this.apis.adzuna.baseUrl}/us/search/${params.page || 1}`);
    url.searchParams.append('app_id', this.apis.adzuna.appId);
    url.searchParams.append('app_key', this.apis.adzuna.appKey);
    
    if (params.query) url.searchParams.append('what', params.query);
    if (params.location) url.searchParams.append('where', params.location);
    if (params.limit) url.searchParams.append('results_per_page', params.limit.toString());
    if (params.salary_min) url.searchParams.append('salary_min', params.salary_min.toString());
    if (params.salary_max) url.searchParams.append('salary_max', params.salary_max.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      jobs: this.transformAdzunaJobs(data.results || []),
      total: data.count || 0,
      page: params.page || 1,
      has_more: (params.page || 1) < Math.ceil((data.count || 0) / (params.limit || 20)),
      source: 'Adzuna'
    };
  }

  private async searchGoogleJobs(params: RealJobSearchParams): Promise<JobApiResponse> {
    if (!this.apis.serpApi.apiKey) {
      throw new Error('SerpAPI credentials not configured');
    }

    const url = new URL(this.apis.serpApi.baseUrl);
    url.searchParams.append('engine', 'google_jobs');
    url.searchParams.append('api_key', this.apis.serpApi.apiKey);
    url.searchParams.append('q', params.query || 'software engineer');
    if (params.location) url.searchParams.append('location', params.location);
    if (params.remote) url.searchParams.append('chips', 'employment_type:FULLTIME,date_posted:month');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Google Jobs API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      jobs: this.transformGoogleJobs(data.jobs_results || []),
      total: data.jobs_results?.length || 0,
      page: params.page || 1,
      has_more: false,
      source: 'Google Jobs'
    };
  }

  private async searchTheMuseJobs(params: RealJobSearchParams): Promise<JobApiResponse> {
    const url = new URL(`${this.apis.theMuseApi.baseUrl}/jobs`);
    if (params.query) url.searchParams.append('category', params.query);
    if (params.location) url.searchParams.append('location', params.location);
    url.searchParams.append('page', (params.page || 1).toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`The Muse API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      jobs: this.transformTheMuseJobs(data.results || []),
      total: data.total || 0,
      page: data.page || 1,
      has_more: data.page < data.page_count,
      source: 'The Muse'
    };
  }

  private transformAdzunaJobs(jobs: any[]): Job[] {
    return jobs.map(job => ({
      id: job.id?.toString() || `adzuna-${Date.now()}-${Math.random()}`,
      title: job.title || 'Unknown Position',
      company: job.company?.display_name || 'Unknown Company',
      location: job.location?.display_name || 'Remote',
      description: job.description || 'No description available',
      requirements: this.extractRequirements(job.description || ''),
      salary: {
        min: job.salary_min || 0,
        max: job.salary_max || 0,
        currency: 'USD'
      },
      type: 'full-time',
      level: this.inferLevel(job.title || ''),
      postedAt: job.created || new Date().toISOString(),
      skills: this.extractSkills(job.description || ''),
      remote: this.isRemote(job.location?.display_name || ''),
      applyUrl: job.redirect_url,
      source: 'Adzuna',
      matchPercentage: this.calculateMatchPercentage(job),
      companyType: 'private',
      companySize: 'mid-size',
      workModel: this.isRemote(job.location?.display_name || '') ? 'remote' : 'onsite'
    }));
  }

  private transformGoogleJobs(jobs: any[]): Job[] {
    return jobs.map(job => ({
      id: `google-${job.job_id || Date.now()}-${Math.random()}`,
      title: job.title || 'Unknown Position',
      company: job.company_name || 'Unknown Company',
      location: job.location || 'Remote',
      description: job.description || 'No description available',
      requirements: this.extractRequirements(job.description || ''),
      salary: this.parseSalary(job.salary),
      type: this.parseJobType(job.schedule_type),
      level: this.inferLevel(job.title || ''),
      postedAt: job.detected_extensions?.posted_at || new Date().toISOString(),
      skills: this.extractSkills(job.description || ''),
      remote: this.isRemote(job.location || ''),
      applyUrl: job.apply_link,
      source: 'Google Jobs',
      matchPercentage: this.calculateMatchPercentage(job),
      companyType: 'private',
      companySize: 'mid-size',
      workModel: this.isRemote(job.location || '') ? 'remote' : 'onsite'
    }));
  }

  private transformTheMuseJobs(jobs: any[]): Job[] {
    return jobs.map(job => ({
      id: `themuse-${job.id || Date.now()}-${Math.random()}`,
      title: job.name || 'Unknown Position',
      company: job.company?.name || 'Unknown Company',
      location: job.locations?.[0]?.name || 'Remote',
      description: job.contents || 'No description available',
      requirements: this.extractRequirements(job.contents || ''),
      salary: { min: 0, max: 0, currency: 'USD' },
      type: 'full-time',
      level: this.inferLevel(job.name || ''),
      postedAt: job.publication_date || new Date().toISOString(),
      skills: this.extractSkills(job.contents || ''),
      remote: job.locations?.some((loc: any) => loc.name.toLowerCase().includes('remote')),
      applyUrl: job.refs?.landing_page,
      source: 'The Muse',
      matchPercentage: this.calculateMatchPercentage(job),
      companyType: 'private',
      companySize: 'mid-size',
      workModel: job.locations?.some((loc: any) => loc.name.toLowerCase().includes('remote')) ? 'remote' : 'onsite'
    }));
  }

  private extractRequirements(description: string): string[] {
    const requirements = [];
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('bachelor') || lowerDesc.includes('degree')) {
      requirements.push("Bachelor's degree required");
    }
    if (lowerDesc.includes('experience')) {
      const match = description.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i);
      if (match) {
        requirements.push(`${match[1]}+ years of experience required`);
      } else {
        requirements.push("Previous experience required");
      }
    }
    if (lowerDesc.includes('remote')) {
      requirements.push("Remote work available");
    }
    
    return requirements;
  }

  private extractSkills(description: string): string[] {
    const skillKeywords = [
      'javascript', 'typescript', 'python', 'java', 'react', 'node.js', 
      'aws', 'docker', 'kubernetes', 'sql', 'postgresql', 'mongodb',
      'vue', 'angular', 'express', 'django', 'flask', 'spring',
      'git', 'agile', 'scrum', 'ci/cd', 'devops', 'terraform'
    ];
    
    const foundSkills = skillKeywords.filter(skill => 
      description.toLowerCase().includes(skill)
    );
    
    return foundSkills.map(skill => 
      skill.charAt(0).toUpperCase() + skill.slice(1)
    ).slice(0, 8);
  }

  private inferLevel(title: string): Job['level'] {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('senior') || lowerTitle.includes('sr.')) return 'senior';
    if (lowerTitle.includes('junior') || lowerTitle.includes('jr.')) return 'entry';
    if (lowerTitle.includes('lead') || lowerTitle.includes('principal')) return 'lead';
    if (lowerTitle.includes('manager') || lowerTitle.includes('head')) return 'manager';
    if (lowerTitle.includes('director') || lowerTitle.includes('vp')) return 'director';
    if (lowerTitle.includes('intern')) return 'intern';
    if (lowerTitle.includes('entry') || lowerTitle.includes('associate')) return 'entry';
    return 'mid';
  }

  private isRemote(location: string): boolean {
    const lowerLocation = location.toLowerCase();
    return lowerLocation.includes('remote') || 
           lowerLocation.includes('anywhere') || 
           lowerLocation.includes('work from home') ||
           lowerLocation.includes('wfh');
  }

  private parseSalary(salaryText: string | undefined): { min: number; max: number; currency: string } {
    if (!salaryText) return { min: 0, max: 0, currency: 'USD' };
    
    const numbers = salaryText.match(/\$?([\d,]+)/g);
    if (numbers && numbers.length >= 2) {
      const min = parseInt(numbers[0].replace(/[,$]/g, ''));
      const max = parseInt(numbers[1].replace(/[,$]/g, ''));
      return { min, max, currency: 'USD' };
    } else if (numbers && numbers.length === 1) {
      const salary = parseInt(numbers[0].replace(/[,$]/g, ''));
      return { min: salary * 0.9, max: salary * 1.1, currency: 'USD' };
    }
    
    return { min: 0, max: 0, currency: 'USD' };
  }

  private parseJobType(scheduleType: string | undefined): Job['type'] {
    if (!scheduleType) return 'full-time';
    
    const lower = scheduleType.toLowerCase();
    if (lower.includes('part')) return 'part-time';
    if (lower.includes('contract')) return 'contract';
    if (lower.includes('intern')) return 'internship';
    if (lower.includes('temp')) return 'temporary';
    
    return 'full-time';
  }

  private calculateMatchPercentage(job: any): number {
    // Basic scoring algorithm - can be enhanced with AI
    let score = 50; // Base score
    
    if (job.description) {
      const description = job.description.toLowerCase();
      // Add points for desirable keywords
      if (description.includes('remote')) score += 10;
      if (description.includes('benefits')) score += 5;
      if (description.includes('growth')) score += 5;
      if (description.includes('competitive')) score += 5;
    }
    
    return Math.min(100, score + Math.floor(Math.random() * 25));
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
      // Implementation would depend on the specific API
      // For now, return null and let the calling code handle it
      console.log(`Getting details for job ${jobId} from ${source}`);
      return null;
    } catch (error) {
      console.error('Failed to get job details:', error);
      return null;
    }
  }
}

export const realJobApiService = new RealJobApiService();
