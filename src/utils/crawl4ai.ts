
import { ScrapedJob } from "@/components/resume/job-application/types";
import { detectPlatform, extractCompanyFromUrl } from "./jobValidationUtils";

// Interface for the scraper options
interface ScrapeOptions {
  maxResults: number;
  maxPages?: number;
  keywords?: string[];
  location?: string;
}

// Mock implementation of the Crawl4AI API for job searching
export function createJobScraper() {
  return {
    // Main method for searching jobs
    async searchJobs(query: string, location: string = '', platforms: string[] = []): Promise<ScrapedJob[]> {
      console.log(`Searching for jobs with query: "${query}" in location: "${location}"`);
      console.log('Using platforms:', platforms);
      
      // This would be a real API call in production
      // For now, we'll generate mock results
      return generateMockJobListings(query, location, platforms);
    },
    
    // Verify job URLs are valid
    async verifyJobs(jobs: ScrapedJob[]): Promise<ScrapedJob[]> {
      console.log(`Verifying ${jobs.length} job listings`);
      
      // Add small delay to simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, we would check if each URL is still valid
      // For this mock, we'll assume 85% of jobs are valid
      return jobs.filter(() => Math.random() > 0.15)
        .map(job => ({
          ...job,
          verified: true
        }));
    },
    
    // Get details for a specific job
    async getJobDetails(jobId: string, url: string): Promise<ScrapedJob | null> {
      console.log(`Getting details for job ID: ${jobId} from URL: ${url}`);
      
      // Add small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would scrape the job page
      // For now, we'll return a detailed mock job
      const mockJobs = generateMockJobListings('', '', []);
      const job = mockJobs.find(j => j.id === jobId) || mockJobs[0];
      
      if (!job) return null;
      
      return {
        ...job,
        description: `This is a detailed job description for ${job.title} at ${job.company}. The ideal candidate will have experience with web development technologies like React, Node.js, and TypeScript. You'll be working on cutting-edge projects in a fast-paced environment.`,
      };
    }
  };
}

// Helper function to generate mock job listings
function generateMockJobListings(query: string, location: string, platforms: string[]): ScrapedJob[] {
  const jobs: ScrapedJob[] = [];
  
  // Number of jobs to generate
  const jobCount = Math.floor(Math.random() * 20) + 5; // 5-25 jobs
  
  // Job titles to use based on query
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
  
  if (query.toLowerCase().includes('quant')) {
    jobTitles = [
      'Quantitative Developer',
      'Quant Researcher',
      'Quantitative Analyst',
      'Quantitative Strategist',
      'Algorithmic Trader',
      'Quant Software Engineer',
      'Systematic Trader',
      'Research Scientist',
      'Quantitative Portfolio Manager',
      'Machine Learning Quant'
    ];
  }
  
  // Companies to use based on platforms
  let companies = [
    'TechCorp', 
    'Innovate Inc', 
    'ByteWorks',
    'DataSys',
    'FutureTech',
    'CloudNine',
    'CoreLogic',
    'Quantum Solutions',
    'PrimeSoft',
    'Nexus Technologies'
  ];
  
  // If we're targeting finance platforms
  if (platforms.some(p => 
    p.includes('citadel') || 
    p.includes('jane') || 
    p.includes('two-sigma') || 
    p.includes('optiver') || 
    p.includes('hrt') || 
    p.includes('jump')
  )) {
    companies = [
      'Citadel Securities',
      'Jane Street',
      'Two Sigma',
      'Optiver',
      'Hudson River Trading',
      'Jump Trading',
      'IMC Trading',
      'DRW',
      'Virtu Financial',
      'Tower Research'
    ];
  }
  
  // If we're targeting specific domains
  if (platforms.length > 0) {
    // Replace companies with extracted names from URLs if possible
    companies = platforms.map(platform => {
      if (platform.includes('.')) {
        // If platform is a URL
        try {
          const extractedCompany = extractCompanyFromUrl(`https://${platform}`);
          return extractedCompany || platform;
        } catch {
          return platform;
        }
      }
      return platform;
    });
  }
  
  // Detect if we're scraping ATS platforms
  const isAts = platforms.some(p => 
    p.includes('greenhouse.io') || 
    p.includes('lever.co') || 
    p.includes('workday') || 
    p.includes('icims.com')
  );
  
  // Generate the jobs
  for (let i = 0; i < jobCount; i++) {
    const jobTitleIndex = Math.floor(Math.random() * jobTitles.length);
    const companyIndex = Math.floor(Math.random() * companies.length);
    
    const jobTitle = jobTitles[jobTitleIndex];
    const companyName = companies[Math.min(companyIndex, companies.length - 1)];
    
    // Determine platform for this job
    let platform = '';
    
    if (isAts) {
      // Use the ATS platform
      if (platforms.find(p => p.includes('greenhouse.io'))) platform = 'Greenhouse';
      else if (platforms.find(p => p.includes('lever.co'))) platform = 'Lever';
      else if (platforms.find(p => p.includes('workday'))) platform = 'Workday';
      else if (platforms.find(p => p.includes('icims.com'))) platform = 'iCims';
      else platform = 'LinkedIn'; // Default
    } else {
      // Use a random platform
      const platformOptions = ['LinkedIn', 'Indeed', 'Glassdoor', 'ZipRecruiter'];
      platform = platformOptions[Math.floor(Math.random() * platformOptions.length)];
    }
    
    // Generate a random ID
    const id = `job-${Date.now()}-${i}-${Math.floor(Math.random() * 10000)}`;
    
    // Generate a URL based on platform
    let applyUrl = '';
    let atsSystem = null;
    
    if (platform === 'Greenhouse') {
      applyUrl = `https://boards.greenhouse.io/${companyName.toLowerCase().replace(/\s+/g, '')}/jobs/123456`;
      atsSystem = 'Greenhouse';
    } else if (platform === 'Lever') {
      applyUrl = `https://jobs.lever.co/${companyName.toLowerCase().replace(/\s+/g, '')}/abcdef-123456`;
      atsSystem = 'Lever';
    } else if (platform === 'Workday') {
      applyUrl = `https://${companyName.toLowerCase().replace(/\s+/g, '')}.wd5.myworkdayjobs.com/en-US/External/job/Location/${jobTitle.replace(/\s+/g, '-')}_JR-12345`;
      atsSystem = 'Workday';
    } else if (platform === 'iCims') {
      applyUrl = `https://careers-${companyName.toLowerCase().replace(/\s+/g, '')}.icims.com/jobs/12345/job`;
      atsSystem = 'iCims';
    } else if (platform === 'LinkedIn') {
      applyUrl = `https://www.linkedin.com/jobs/view/123456789`;
    } else if (platform === 'Indeed') {
      applyUrl = `https://www.indeed.com/viewjob?jk=abcdef123456`;
    } else {
      applyUrl = `https://example.com/jobs/${id}`;
    }
    
    // Generate random salary
    const baseMin = 90000;
    const baseMax = 150000;
    const salaryMin = baseMin + (Math.floor(Math.random() * 30000));
    const salaryMax = salaryMin + (Math.floor(Math.random() * 50000));
    
    // Generate posted date (random within last 30 days)
    const daysAgo = Math.floor(Math.random() * 30);
    const postedAt = new Date();
    postedAt.setDate(postedAt.getDate() - daysAgo);
    
    // Generate random locations
    const locations = [
      'San Francisco, CA',
      'New York, NY',
      'Seattle, WA',
      'Austin, TX',
      'Boston, MA',
      'Chicago, IL',
      'Remote'
    ];
    const randomLocation = location || locations[Math.floor(Math.random() * locations.length)];
    
    // Generate keyword match data
    const keywordData = generateKeywordMatchData();
    
    // Create the job object
    const job: ScrapedJob = {
      id,
      title: jobTitle,
      company: companyName,
      location: randomLocation,
      description: `${companyName} is seeking a talented ${jobTitle} to join our team. This position requires experience with [requirements].`,
      salary: {
        min: salaryMin,
        max: salaryMax,
        currency: '$'
      },
      applyUrl,
      postedAt: postedAt.toISOString(),
      keywordMatch: keywordData,
      source: platform,
      verified: false,
      remote: randomLocation.toLowerCase().includes('remote'),
      atsSystem: atsSystem
    };
    
    jobs.push(job);
  }
  
  return jobs;
}

// Generate mock keyword match data for a job
function generateKeywordMatchData() {
  // Create mock high priority keywords
  const highPriorityKeywords = ["Python", "JavaScript", "React", "AWS", "Docker", "Node.js", "TypeScript", "MongoDB", "Git", "CI/CD", "Kubernetes"];
  const highPriorityCount = Math.floor(Math.random() * 5) + 6; // 6-11 keywords
  const highPrioritySelected = highPriorityKeywords.slice(0, highPriorityCount);
  const highPriorityFound = Math.floor(Math.random() * highPriorityCount);
  
  // Create mock low priority keywords
  const lowPriorityKeywords = ["Agile", "Scrum", "REST API", "GraphQL", "Testing", "DevOps", "Linux", "SQL", "NoSQL"];
  const lowPriorityCount = Math.floor(Math.random() * 5) + 4; // 4-9 keywords
  const lowPrioritySelected = lowPriorityKeywords.slice(0, lowPriorityCount);
  const lowPriorityFound = Math.floor(Math.random() * lowPriorityCount);
  
  const totalKeywords = highPriorityCount + lowPriorityCount;
  const foundKeywords = highPriorityFound + lowPriorityFound;
  
  // Weight high priority keywords more than low priority
  const score = Math.round(
    ((highPriorityFound * 1.5) + (lowPriorityFound * 0.5)) / 
    ((highPriorityCount * 1.5) + (lowPriorityCount * 0.5)) * 100
  );
  
  return {
    score,
    total: totalKeywords,
    found: foundKeywords,
    highPriority: {
      keywords: highPrioritySelected,
      found: highPriorityFound,
      total: highPriorityCount
    },
    lowPriority: {
      keywords: lowPrioritySelected,
      found: lowPriorityFound,
      total: lowPriorityCount
    }
  };
}

// Export the main function for using Crawl4AI for job searches
export async function searchJobsWithCrawl4AI(
  query: string,
  location: string = '',
  platforms: string[] = [],
  options: Partial<ScrapeOptions> = {}
): Promise<ScrapedJob[]> {
  const scraper = createJobScraper();
  return scraper.searchJobs(query, location, platforms);
}
