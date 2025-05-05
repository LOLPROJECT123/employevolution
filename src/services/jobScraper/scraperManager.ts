
import { toast } from "sonner";
import { Job } from "@/types/job";
import { ExtendedJob } from "@/types/jobExtensions";
import { useState } from "react";

// Types for the API response from our scraper
interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  link: string;
  applyLink?: string;
  source: string;
  postedDate?: string;
  scrapedAt: string;
  requirements?: string[];
  skills?: string[];
  jobType?: string;
}

interface ScrapeResponse {
  success: boolean;
  jobs: ScrapedJob[];
  error?: string;
}

// Job scraper progress tracking
interface ScraperProgress {
  jobsFound: number;
  jobsProcessed: number;
  currentSource?: string;
}

// JobScraper configurations
export interface JobScraperConfig {
  sources: string[];
  maxJobsPerSource: number;
  filters: JobSearchFilters;
  useProxy: boolean;
  excludeDuplicates: boolean;
}

// Supported job sources
export type JobSource = 'LinkedIn' | 'Indeed' | 'Glassdoor' | 'ZipRecruiter' | 'AngelList' | 'Monster';

interface JobSearchFilters {
  keywords: string[];
  location?: string;
  remote?: boolean;
  datePosted?: 'today' | 'week' | 'month' | 'any';
  jobType?: string[];
  experience?: 'entry' | 'midlevel' | 'senior' | 'executive';
  salary?: string;
  distance?: number;
}

// Hook for job scraping functionality
export const useJobScraper = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [filters, setFilters] = useState<JobSearchFilters>({
    keywords: [],
    location: '',
    remote: false,
    jobType: [],
  });
  const [progress, setProgress] = useState<ScraperProgress>({
    jobsFound: 0,
    jobsProcessed: 0,
  });
  const [results, setResults] = useState<ScrapeResponse | null>(null);

  // Start the scraper with given configuration
  const startScraping = async (config: JobScraperConfig) => {
    setIsRunning(true);
    setIsComplete(false);
    setProgress({ jobsFound: 0, jobsProcessed: 0 });
    
    try {
      // Simulate scraping process
      await simulateScraping(config, setProgress);
      
      // Get results from jobScraperService
      const jobResults = await jobScraperService.searchJobs(
        config.filters.keywords.join(' '),
        config.filters.location || '',
        config.sources as JobSource[],
        config.filters
      );
      
      setResults({
        success: true,
        jobs: jobResults.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          salary: job.salary,
          link: job.applyUrl,
          applyLink: job.applyUrl,
          source: job.source,
          postedDate: job.datePosted,
          scrapedAt: new Date().toISOString(),
          skills: job.skills,
          jobType: job.jobType
        }))
      });
      
      setIsComplete(true);
    } catch (error) {
      setResults({
        success: false,
        jobs: [],
        error: "Failed to scrape jobs"
      });
      console.error("Error during job scraping:", error);
      toast.error("Failed to complete job search");
    } finally {
      setIsRunning(false);
    }
  };
  
  return {
    isRunning,
    isComplete,
    progress,
    results,
    filters,
    setFilters,
    startScraping
  };
}

// Function to convert scraped job format to application job format
export const convertScrapedToJob = (scrapedJob: ScrapedJob): ExtendedJob => {
  return {
    id: scrapedJob.id,
    title: scrapedJob.title,
    company: scrapedJob.company,
    location: scrapedJob.location,
    description: scrapedJob.description,
    applyUrl: scrapedJob.applyLink || scrapedJob.link,
    source: scrapedJob.source,
    datePosted: scrapedJob.postedDate || new Date().toLocaleDateString(),
    postedAt: new Date().toISOString(),
    salary: scrapedJob.salary || { min: 0, max: 0, currency: 'USD' },
    skills: scrapedJob.skills || [],
    status: 'saved',
    savedAt: new Date().toISOString(),
    logo: getCompanyLogo(scrapedJob.company),
    remote: scrapedJob.location?.toLowerCase().includes('remote') || false,
    jobType: scrapedJob.jobType || 'Full-time',
    // Add required Job properties
    type: 'full-time',
    level: 'mid',
    requirements: scrapedJob.requirements || []
  };
};

/**
 * Helper function to simulate scraping process progress
 */
const simulateScraping = async (
  config: JobScraperConfig, 
  setProgress: (progress: ScraperProgress) => void
) => {
  const totalSources = config.sources.length;
  const jobsPerSource = config.maxJobsPerSource;
  const totalJobs = totalSources * Math.floor(Math.random() * jobsPerSource) + 5;
  
  setProgress({
    jobsFound: totalJobs,
    jobsProcessed: 0
  });
  
  // Simulate progress for each source
  for (let i = 0; i < totalSources; i++) {
    const source = config.sources[i];
    setProgress(prev => ({
      ...prev,
      currentSource: source
    }));
    
    // Simulate processing jobs from this source
    const sourceJobs = Math.floor(totalJobs / totalSources);
    for (let j = 0; j < sourceJobs; j++) {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      setProgress(prev => ({
        ...prev,
        jobsProcessed: prev.jobsProcessed + 1
      }));
    }
  }
};

/**
 * Get company logo URL (mock function)
 */
const getCompanyLogo = (company: string): string => {
  // In a real app, this would use a logo API or database
  // For now, return a placeholder
  return '/placeholder.svg';
};

// Main class for job scraping functionality
export class JobScraperService {
  private apiUrl: string;
  
  constructor() {
    // In a real app, this would come from environment variables
    this.apiUrl = 'https://api.streamline.example/scraper';
  }
  
  /**
   * Search for jobs across multiple job boards
   */
  public async searchJobs(
    query: string,
    location: string,
    sources: JobSource[] = ['LinkedIn', 'Indeed'],
    filters: JobSearchFilters = { keywords: [] }
  ): Promise<ExtendedJob[]> {
    try {
      // In a real app, this would call an actual API
      // For now, we'll simulate with mock data
      const mockResponse = await this.mockScrapeRequest(query, location, sources, filters);
      
      if (!mockResponse.success) {
        toast.error(`Job search failed: ${mockResponse.error || 'Unknown error'}`);
        return [];
      }
      
      // Convert scraped jobs to our application's Job type
      const jobs: ExtendedJob[] = mockResponse.jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        applyUrl: job.applyLink || job.link,
        source: job.source,
        datePosted: job.postedDate || new Date().toLocaleDateString(),
        salary: job.salary || { min: 0, max: 0, currency: 'USD' },
        skills: job.skills || [],
        status: 'saved',
        savedAt: new Date().toISOString(),
        logo: this.getCompanyLogo(job.company),
        remote: job.location?.toLowerCase().includes('remote') || false,
        jobType: job.jobType || 'Full-time',
        // Add required Job properties
        type: 'full-time',
        level: 'mid',
        postedAt: job.scrapedAt,
        requirements: job.requirements || []
      }));
      
      return jobs;
    } catch (error) {
      console.error('Error searching for jobs:', error);
      toast.error('Failed to search for jobs. Please try again later.');
      return [];
    }
  }
  
  /**
   * Mock function to simulate job scraping API call
   */
  private async mockScrapeRequest(
    query: string,
    location: string,
    sources: JobSource[],
    filters: JobSearchFilters
  ): Promise<ScrapeResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate random job listings based on the query
    const mockJobs: ScrapedJob[] = [];
    const jobCount = Math.floor(Math.random() * 10) + 5; // 5-15 jobs
    
    const companies = [
      'Tech Innovations Inc', 'Global Software', 'Digital Solutions',
      'Next Level Technologies', 'Cloud Systems', 'Data Dynamics',
      'Future Technologies', 'Smart Applications', 'Elite Software',
      'Innovative Tech Co', 'Digital Frontiers', 'Code Masters'
    ];
    
    const locations = [
      location,
      `Remote`,
      `${location} (Remote)`,
      `Anywhere`,
      `${location} (Hybrid)`
    ];
    
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];
    
    const skills = [
      'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 
      'Node.js', 'Python', 'Java', 'C#', '.NET', 'AWS', 'Azure',
      'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'GraphQL', 'REST API'
    ];
    
    for (let i = 0; i < jobCount; i++) {
      const source = sources[Math.floor(Math.random() * sources.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
      
      // Select 3-7 random skills
      const jobSkills = [];
      const skillCount = Math.floor(Math.random() * 5) + 3;
      for (let j = 0; j < skillCount; j++) {
        const skill = skills[Math.floor(Math.random() * skills.length)];
        if (!jobSkills.includes(skill)) {
          jobSkills.push(skill);
        }
      }
      
      const randomSalaryMin = Math.floor(Math.random() * 50000) + 50000;
      const randomSalaryMax = randomSalaryMin + Math.floor(Math.random() * 50000);
      
      mockJobs.push({
        id: `job_${Date.now()}_${i}`,
        title: `${query} ${i + 1}`,
        company,
        location: randomLocation,
        description: `We are looking for a talented ${query} to join our team. The ideal candidate will have experience with ${jobSkills.slice(0, 3).join(', ')} and a passion for technology.`,
        salary: {
          min: randomSalaryMin,
          max: randomSalaryMax,
          currency: 'USD'
        },
        link: `https://${source}.com/jobs/${i}`,
        applyLink: `https://${source}.com/jobs/${i}/apply`,
        source: this.capitalizeSource(source),
        postedDate: this.getRandomPostedDate(),
        scrapedAt: new Date().toISOString(),
        skills: jobSkills,
        jobType
      });
    }
    
    return {
      success: true,
      jobs: mockJobs
    };
  }
  
  /**
   * Get company logo URL (mock function)
   */
  private getCompanyLogo(company: string): string {
    // In a real app, this would use a logo API or database
    // For now, return a placeholder
    return '/placeholder.svg';
  }
  
  /**
   * Capitalize job source name
   */
  private capitalizeSource(source: string): string {
    if (source === 'LinkedIn') return 'LinkedIn';
    if (source === 'ZipRecruiter') return 'ZipRecruiter';
    return source.charAt(0).toUpperCase() + source.slice(1);
  }
  
  /**
   * Generate a random posted date within the last month
   */
  private getRandomPostedDate(): string {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30); // 0-30 days ago
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString();
  }
}

export const jobScraperService = new JobScraperService();
