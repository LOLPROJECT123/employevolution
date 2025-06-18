
import { supabase } from '@/integrations/supabase/client';

export interface ScrapedJobData {
  title: string;
  company: string;
  location?: string;
  remote: boolean;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  skills: string[];
  salary_min?: number;
  salary_max?: number;
  apply_url: string;
  source_platform: string;
  expires_at?: string;
}

export interface JobScrapingTarget {
  platform: string;
  baseUrl: string;
  searchPaths: string[];
  selectors: {
    jobContainer: string;
    title: string;
    company: string;
    location: string;
    description: string;
    applyUrl: string;
    salary?: string;
    remote?: string;
  };
}

class EnhancedJobScrapingService {
  private scrapingTargets: JobScrapingTarget[] = [
    {
      platform: 'linkedin',
      baseUrl: 'https://www.linkedin.com',
      searchPaths: ['/jobs/search'],
      selectors: {
        jobContainer: '.job-search-card',
        title: '.base-search-card__title',
        company: '.base-search-card__subtitle',
        location: '.job-search-card__location',
        description: '.show-more-less-html__markup',
        applyUrl: '.jobs-s-apply button',
        salary: '.job-details-jobs-unified-top-card__job-insight',
        remote: '.job-search-card__benefits'
      }
    },
    {
      platform: 'indeed',
      baseUrl: 'https://www.indeed.com',
      searchPaths: ['/jobs'],
      selectors: {
        jobContainer: '.jobsearch-SerpJobCard',
        title: '.jobTitle',
        company: '.companyName',
        location: '.companyLocation',
        description: '.summary',
        applyUrl: '.jobTitle a',
        salary: '.salaryText'
      }
    },
    {
      platform: 'glassdoor',
      baseUrl: 'https://www.glassdoor.com',
      searchPaths: ['/Job/jobs.htm'],
      selectors: {
        jobContainer: '.react-job-listing',
        title: '.jobLink',
        company: '.employerName',
        location: '.loc',
        description: '.jobDescriptionContent',
        applyUrl: '.jobLink'
      }
    }
  ];

  async scrapeJobs(
    query: string = 'software engineer',
    location: string = 'remote',
    platforms: string[] = ['linkedin', 'indeed', 'glassdoor']
  ): Promise<ScrapedJobData[]> {
    const allJobs: ScrapedJobData[] = [];

    for (const platform of platforms) {
      try {
        console.log(`Starting to scrape ${platform}...`);
        const jobs = await this.scrapePlatform(platform, query, location);
        allJobs.push(...jobs);
        
        // Add delay between platforms to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error scraping ${platform}:`, error);
      }
    }

    // Remove duplicates based on title and company
    const uniqueJobs = this.removeDuplicates(allJobs);
    
    // Save to database
    await this.saveJobsToDatabase(uniqueJobs);
    
    return uniqueJobs;
  }

  private async scrapePlatform(
    platform: string,
    query: string,
    location: string
  ): Promise<ScrapedJobData[]> {
    // This would typically use Playwright or similar for real scraping
    // For now, I'll simulate with sample data generation
    return this.generateSampleJobs(platform, query, 10);
  }

  private generateSampleJobs(platform: string, query: string, count: number): ScrapedJobData[] {
    const companies = [
      'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 
      'Uber', 'Airbnb', 'Stripe', 'Coinbase', 'Notion', 'Figma', 'Slack'
    ];
    
    const jobTitles = [
      'Software Engineer', 'Frontend Developer', 'Backend Developer', 
      'Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 
      'Product Manager', 'UX Designer', 'Machine Learning Engineer'
    ];
    
    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
      'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Remote'
    ];
    
    const skills = [
      'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++', 
      'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'GraphQL'
    ];

    return Array.from({ length: count }, (_, i) => {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const isRemote = location === 'Remote' || Math.random() > 0.7;
      const jobType = Math.random() > 0.8 ? 'internship' : 'full-time';
      
      const jobSkills = Array.from(
        { length: Math.floor(Math.random() * 5) + 3 },
        () => skills[Math.floor(Math.random() * skills.length)]
      ).filter((skill, index, arr) => arr.indexOf(skill) === index);

      return {
        title,
        company,
        location,
        remote: isRemote,
        job_type: jobType as 'full-time' | 'part-time' | 'contract' | 'internship',
        description: `We are looking for a talented ${title} to join our ${company} team. This role involves working with cutting-edge technologies and collaborating with cross-functional teams.`,
        requirements: [
          `3+ years of experience in ${jobSkills[0]}`,
          `Strong knowledge of ${jobSkills[1]} and ${jobSkills[2]}`,
          'Excellent problem-solving skills',
          'Strong communication skills'
        ],
        skills: jobSkills,
        salary_min: Math.floor(Math.random() * 50000) + 80000,
        salary_max: Math.floor(Math.random() * 50000) + 130000,
        apply_url: `https://${platform}.com/jobs/apply/${company.toLowerCase()}-${i}`,
        source_platform: platform,
        expires_at: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    });
  }

  private removeDuplicates(jobs: ScrapedJobData[]): ScrapedJobData[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}`.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private async saveJobsToDatabase(jobs: ScrapedJobData[]): Promise<void> {
    for (const job of jobs) {
      try {
        const { error } = await supabase
          .from('scraped_jobs')
          .upsert({
            title: job.title,
            company: job.company,
            location: job.location,
            remote: job.remote,
            job_type: job.job_type,
            description: job.description,
            requirements: job.requirements,
            skills: job.skills,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            apply_url: job.apply_url,
            source_platform: job.source_platform,
            expires_at: job.expires_at,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'title,company',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Error saving job:', error);
        }
      } catch (error) {
        console.error('Error in saveJobsToDatabase:', error);
      }
    }
  }

  async deactivateExpiredJobs(): Promise<number> {
    const { data, error } = await supabase
      .from('scraped_jobs')
      .update({ is_active: false })
      .lt('expires_at', new Date().toISOString())
      .eq('is_active', true)
      .select('id');

    if (error) {
      console.error('Error deactivating expired jobs:', error);
      return 0;
    }

    return data?.length || 0;
  }

  async getActiveJobs(filters?: {
    remote?: boolean;
    jobType?: string;
    location?: string;
    skills?: string[];
    salaryMin?: number;
  }): Promise<ScrapedJobData[]> {
    let query = supabase
      .from('scraped_jobs')
      .select('*')
      .eq('is_active', true)
      .order('scraped_at', { ascending: false });

    if (filters?.remote) {
      query = query.eq('remote', true);
    }

    if (filters?.jobType) {
      query = query.eq('job_type', filters.jobType);
    }

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters?.salaryMin) {
      query = query.gte('salary_min', filters.salaryMin);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }

    let filteredJobs = data || [];

    // Filter by skills if provided
    if (filters?.skills && filters.skills.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        job.skills && filters.skills!.some(skill => 
          job.skills.some((jobSkill: string) => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    return filteredJobs;
  }
}

export const enhancedJobScrapingService = new EnhancedJobScrapingService();
