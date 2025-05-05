
/**
 * Manager for job scraping operations
 */
import { useState } from "react";
import { 
  ScraperFilters, 
  JobSource, 
  ScraperProgress, 
  ScrapedJobListing,
  JobScraperConfig,
  JobScraperResult 
} from "./types";
import { mockScrapedJobs } from "./mockData";
import { ExtendedJob } from "@/types/jobExtensions";
import { Job } from "@/types/job";

/**
 * Parse salary string to get min and max values
 * @param salaryStr Salary string like "$50K-$70K/year" or "$25/hr"
 */
export function parseSalary(salaryStr: string): { min: number, max: number, currency: string } | undefined {
  if (!salaryStr) return undefined;
  
  // Default values
  let min = 0;
  let max = 0;
  let currency = "USD";
  
  try {
    // Extract currency symbol
    const currencyMatch = salaryStr.match(/[$€£¥]/);
    if (currencyMatch) {
      const symbol = currencyMatch[0];
      switch(symbol) {
        case "€": currency = "EUR"; break;
        case "£": currency = "GBP"; break;
        case "¥": currency = "JPY"; break;
        default: currency = "USD";
      }
    }
    
    // Extract numbers
    const numberMatches = salaryStr.match(/\d+\.?\d*/g);
    if (!numberMatches || numberMatches.length === 0) return undefined;
    
    // Check if it's per hour
    const isHourly = salaryStr.toLowerCase().includes('/hr') || 
                     salaryStr.toLowerCase().includes('per hour') || 
                     salaryStr.toLowerCase().includes('hourly');

    // Parse numbers
    if (numberMatches.length >= 2) {
      min = parseFloat(numberMatches[0]);
      max = parseFloat(numberMatches[1]);
      
      // Check if values are in thousands (K)
      if (salaryStr.includes('K')) {
        min *= 1000;
        max *= 1000;
      }
      
      // Convert hourly to annual (assuming 2080 hours per year)
      if (isHourly) {
        min *= 2080;
        max *= 2080;
      }
    } else if (numberMatches.length === 1) {
      const value = parseFloat(numberMatches[0]);
      
      // Check if values are in thousands (K)
      const multiplier = salaryStr.includes('K') ? 1000 : 1;
      
      if (salaryStr.includes('+') || salaryStr.includes('up to')) {
        min = value * multiplier;
        max = value * multiplier * 1.5; // Estimate max as 50% higher
      } else if (salaryStr.includes('from')) {
        min = value * multiplier;
        max = value * multiplier * 1.5; // Estimate max as 50% higher
      } else {
        min = value * multiplier * 0.9; // Estimate min as 10% lower
        max = value * multiplier * 1.1; // Estimate max as 10% higher
      }
      
      // Convert hourly to annual (assuming 2080 hours per year)
      if (isHourly) {
        min *= 2080;
        max *= 2080;
      }
    }
    
    return { min, max, currency };
  } catch (e) {
    console.error("Error parsing salary:", e);
    return undefined;
  }
}

/**
 * Convert scraped job listings to application job format
 */
export function convertScrapedToJob(scraped: ScrapedJobListing): ExtendedJob {
  const salary = scraped.salary ? parseSalary(scraped.salary) : { min: 0, max: 0, currency: "USD" };
  
  const job: ExtendedJob = {
    id: `${scraped.source}-${scraped.sourceId}`,
    title: scraped.title,
    company: scraped.company,
    location: scraped.location,
    salary: salary || { min: 0, max: 0, currency: "USD" },
    description: scraped.description || "",
    postedAt: scraped.datePosted,
    datePosted: scraped.datePosted,
    requirements: scraped.requirements || [],
    skills: scraped.skills || [],
    remote: scraped.location.toLowerCase().includes('remote'),
    type: determineJobType(scraped),
    level: determineJobLevel(scraped),
    applyUrl: scraped.jobUrl,
    source: scraped.source,
    logo: getCompanyLogo(scraped.company),
    jobType: determineJobTypeString(scraped)
  };
  
  return job;
}

/**
 * Determine job type based on title and description
 */
function determineJobType(job: ScrapedJobListing): 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary' | 'volunteer' | 'other' {
  const title = job.title.toLowerCase();
  const description = job.description?.toLowerCase() || '';
  
  if (title.includes('intern') || title.includes('internship')) {
    return 'internship';
  }
  
  if (title.includes('contract') || title.includes('contractor') || 
      description.includes('contract position') || description.includes('contract role')) {
    return 'contract';
  }
  
  if (title.includes('part-time') || title.includes('part time') || 
      description.includes('part-time') || description.includes('part time')) {
    return 'part-time';
  }
  
  if (title.includes('temp') || title.includes('temporary') || 
      description.includes('temporary position')) {
    return 'temporary';
  }
  
  if (title.includes('volunteer') || description.includes('volunteer position')) {
    return 'volunteer';
  }
  
  return 'full-time'; // Default assumption
}

/**
 * Convert job type to display string
 */
function determineJobTypeString(job: ScrapedJobListing): string {
  const type = determineJobType(job);
  
  switch(type) {
    case 'full-time': return 'Full-time';
    case 'part-time': return 'Part-time';
    case 'contract': return 'Contract';
    case 'internship': return 'Internship';
    case 'temporary': return 'Temporary';
    case 'volunteer': return 'Volunteer';
    default: return 'Full-time';
  }
}

/**
 * Determine job level based on title and requirements
 */
function determineJobLevel(job: ScrapedJobListing): 'intern' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'manager' | 'director' {
  const title = job.title.toLowerCase();
  const requirements = job.requirements?.join(' ').toLowerCase() || '';
  
  if (title.includes('intern') || title.includes('internship')) {
    return 'intern';
  }
  
  if (title.includes('senior') || title.includes('sr.') || title.includes('sr ')) {
    return 'senior';
  }
  
  if (title.includes('lead') || title.includes('principal')) {
    return 'lead';
  }
  
  if (title.includes('manager') || title.includes('mgr')) {
    return 'manager';
  }
  
  if (title.includes('director')) {
    return 'director';
  }
  
  if (title.includes('executive') || title.includes('chief') || 
      title.includes('ceo') || title.includes('cto') || title.includes('cfo')) {
    return 'executive';
  }
  
  if (title.includes('junior') || title.includes('jr.') || title.includes('jr ') || 
      title.includes('entry') || title.includes('associate') ||
      requirements.includes('0-2 years') || requirements.includes('less than 2 years') ||
      requirements.includes('entry level')) {
    return 'entry';
  }
  
  return 'mid'; // Default assumption
}

/**
 * Get company logo (placeholder implementation)
 */
function getCompanyLogo(companyName: string): string {
  // In a real implementation, you would use a logo API or database
  // For now, just return a placeholder
  return `https://logo.clearbit.com/${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
}

/**
 * Hook for job scraping functionality
 */
export function useJobScraper(initialFilters?: ScraperFilters) {
  const [filters, setFilters] = useState<ScraperFilters>(initialFilters || {
    keywords: [],
    location: '',
    jobType: [],
    remote: false,
  });
  
  const [progress, setProgress] = useState<ScraperProgress>({
    currentPage: 0,
    jobsFound: 0,
    jobsProcessed: 0,
    jobsFiltered: 0,
    remainingSources: [],
    status: 'idle'
  });
  
  const [results, setResults] = useState<JobScraperResult | null>(null);
  
  /**
   * Start scraping jobs based on filters
   */
  const startScraping = async (config: JobScraperConfig) => {
    try {
      // Reset previous results
      setResults(null);
      
      // Update progress to running state
      setProgress({
        currentPage: 1,
        jobsFound: 0,
        jobsProcessed: 0,
        jobsFiltered: 0,
        remainingSources: [...config.sources],
        currentSource: config.sources[0],
        status: 'running',
        startTime: new Date()
      });
      
      // In a real implementation, this would make API calls or run puppeteer
      // For demo purposes, we'll simulate scraping with a delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate scraping by generating mock jobs
      let mockJobs = mockScrapedJobs;
      
      // Update progress
      setProgress(prev => ({
        ...prev,
        jobsFound: mockJobs.length,
        jobsProcessed: mockJobs.length,
        status: 'complete',
        endTime: new Date()
      }));
      
      // Create result object
      const scrapingResult: JobScraperResult = {
        jobs: mockJobs,
        stats: {
          totalJobs: mockJobs.length,
          sourceCounts: mockJobs.reduce((acc, job) => {
            acc[job.source] = (acc[job.source] || 0) + 1;
            return acc;
          }, {} as Record<JobSource, number>),
          matchRatingDistribution: {
            excellent: Math.floor(mockJobs.length * 0.2),
            good: Math.floor(mockJobs.length * 0.3),
            fair: Math.floor(mockJobs.length * 0.4),
            poor: Math.floor(mockJobs.length * 0.1)
          },
          dateRange: {
            oldest: '30 days ago',
            newest: 'today'
          },
          mostCommonSkills: [
            {skill: 'JavaScript', count: 24},
            {skill: 'React', count: 20},
            {skill: 'TypeScript', count: 15},
            {skill: 'Node.js', count: 12},
            {skill: 'AWS', count: 8}
          ],
          remoteJobs: mockJobs.filter(job => job.location.toLowerCase().includes('remote')).length,
          localJobs: mockJobs.filter(job => !job.location.toLowerCase().includes('remote')).length
        },
        runtime: 2500, // milliseconds
        timestamp: new Date().toISOString(),
        filters: config.filters,
        sources: config.sources,
        successful: true
      };
      
      setResults(scrapingResult);
      return scrapingResult;
      
    } catch (error) {
      console.error('Error during job scraping:', error);
      setProgress(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        endTime: new Date()
      }));
      
      return {
        jobs: [],
        stats: {
          totalJobs: 0,
          sourceCounts: {} as Record<JobSource, number>,
          matchRatingDistribution: {
            excellent: 0,
            good: 0,
            fair: 0,
            poor: 0
          },
          dateRange: {
            oldest: '',
            newest: ''
          },
          mostCommonSkills: [],
          remoteJobs: 0,
          localJobs: 0
        },
        runtime: 0,
        timestamp: new Date().toISOString(),
        filters: config.filters,
        sources: config.sources,
        successful: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      } as JobScraperResult;
    }
  };
  
  /**
   * Pause scraping operation
   */
  const pauseScraping = () => {
    setProgress(prev => ({
      ...prev,
      status: 'paused'
    }));
  };
  
  /**
   * Resume paused scraping operation
   */
  const resumeScraping = () => {
    setProgress(prev => ({
      ...prev,
      status: 'running'
    }));
  };
  
  /**
   * Cancel scraping operation
   */
  const cancelScraping = () => {
    setProgress({
      currentPage: 0,
      jobsFound: 0,
      jobsProcessed: 0,
      jobsFiltered: 0,
      remainingSources: [],
      status: 'idle'
    });
  };
  
  return {
    filters,
    setFilters,
    progress,
    results,
    startScraping,
    pauseScraping,
    resumeScraping,
    cancelScraping,
    isRunning: progress.status === 'running',
    isPaused: progress.status === 'paused',
    isComplete: progress.status === 'complete',
    hasError: progress.status === 'error'
  };
}

/**
 * Mock function to send a batch of jobs to backend for storage
 * In a real implementation, this would be an API call
 */
export async function saveScrapedJobs(jobs: ExtendedJob[]): Promise<boolean> {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Successfully saved ${jobs.length} jobs`);
    return true;
  } catch (error) {
    console.error('Error saving jobs:', error);
    return false;
  }
}
