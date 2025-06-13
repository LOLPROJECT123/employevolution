/**
 * Enhanced Job Scraper (Client-Side Utilities / Mock Data)
 *
 * This module provides utility functions related to job scraping, primarily focused on:
 * 1. Generating mock job data for UI development, testing, and demonstration purposes
 *    (see `generateMockJobListings`).
 * 2. Offering a structured interface (`createEnhancedJobScraper`) that could be
 *    adapted for actual client-side scraping tasks or for wrapping API calls to a
 *    backend scraping service.
 *
 * Note: Direct client-side scraping from this module has limitations due to browser
 * security restrictions (CORS, etc.) and the sophistication of anti-scraping measures
 * on many job platforms. For robust, comprehensive scraping, the server-side
 * JobScraper (`src/server/jobScraper.ts`) is recommended.
 */
import { ScrapedJob } from '../../components/resume/job-application/types';
import { ScrapeOptions, ScraperConfig, ScraperResult } from './scraperTypes';
import { createScrapingBrowser, delay, simulateHumanInteraction, extractDomain } from './browserUtils';
import { toast } from "sonner";

// Job site selectors - these would be expanded for different sites
const DEFAULT_SELECTORS = {
  title: ['h1.job-title', 'h2.headline', '[data-automation="job-title"]'],
  company: ['.company-name', '.employer', '[data-automation="employer-name"]'],
  location: ['.location', '.job-location', '[data-automation="job-location"]'],
  description: ['.job-description', '.description', '[data-automation="job-description"]'],
  salary: ['.salary-range', '.compensation', '[data-automation="job-salary"]'],
  requirements: ['.requirements', '.qualifications', '[data-automation="job-requirements"]'],
  applyButton: ['.apply-button', '.apply-now', '[data-automation="apply-button"]']
};

interface JobScraperInstance {
  searchJobs: (query: string, location: string, platforms: string[]) => Promise<ScrapedJob[]>;
  verifyJobs: (jobs: ScrapedJob[]) => Promise<ScrapedJob[]>;
  getJobDetails: (jobId: string, url: string) => Promise<ScrapedJob | null>;
}

/**
 * Create a job scraper instance with enhanced capabilities
 */
export function createEnhancedJobScraper(config?: Partial<ScraperConfig>): JobScraperInstance {
  // This is where we'd initialize our scraper configuration
  // For now, we'll use the existing mock implementation but with better structure

  return {
    /**
     * Search for jobs across multiple platforms
     */
    async searchJobs(query: string, location: string = '', platforms: string[] = []): Promise<ScrapedJob[]> {
      console.log(`Enhanced job search for query: "${query}" in location: "${location}"`);
      console.log('Using platforms:', platforms);
      
      try {
        // TODO: In a production scenario, this might call a backend API:
        // try {
        //   const response = await fetch(`/api/search-jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&platforms=${platforms.join(',')}`);
        //   if (!response.ok) {
        //     throw new Error(`API error: ${response.statusText}`);
        //   }
        //   const jobs = await response.json();
        //   return jobs;
        // } catch (error) {
        //   console.error('Error fetching jobs from API:', error);
        //   toast.error("Error searching for jobs via API", { description: (error as Error).message });
        //   return [];
        // }

        // Simulate the real API calls and processing time
        await delay(1500);
        
        // In a real implementation, we would:
        // 1. Initialize a browser for each platform
        // 2. Navigate to search pages and extract job listings
        // 3. Parse the job data using our selector system
        // 4. Normalize the data and validate against our schema
        
        // For now, we'll use the mock data generator with some enhancements
        const startTime = Date.now();
        const jobs = generateMockJobListings(query, location, platforms);
        const endTime = Date.now();
        
        console.log(`Found ${jobs.length} jobs in ${endTime - startTime}ms`);
        return jobs;
      } catch (error) {
        console.error('Error in enhanced job search:', error);
        toast.error("Error searching for jobs", {
          description: (error as Error).message
        });
        return [];
      }
    },
    
    /**
     * Verify job listings are still active
     */
    async verifyJobs(jobs: ScrapedJob[]): Promise<ScrapedJob[]> {
      console.log(`Verifying ${jobs.length} job listings using enhanced verification`);
      
      try {
        // In a real implementation, we would:
        // 1. Create a browser instance
        // 2. Visit each job URL to verify it's still active
        // 3. Look for indicators that the job is closed or filled
        
        // Simulate the verification process with a delay
        await delay(2000);
        
        // Add more realistic verification (85-90% pass rate)
        const verifiedJobs = jobs.filter(() => Math.random() > 0.12)
          .map(job => ({
            ...job,
            verified: true,
            lastVerified: new Date().toISOString()
          }));
        
        console.log(`Verified ${verifiedJobs.length} active job listings`);
        return verifiedJobs;
      } catch (error) {
        console.error('Error verifying jobs:', error);
        toast.error("Error verifying jobs", {
          description: (error as Error).message
        });
        // If verification fails, return the original jobs but mark them as unverified
        return jobs.map(job => ({
          ...job,
          verified: false
        }));
      }
    },
    
    /**
     * Get detailed information about a specific job
     */
    async getJobDetails(jobId: string, url: string): Promise<ScrapedJob | null> {
      console.log(`Getting enhanced details for job ID: ${jobId} from URL: ${url}`);
      
      try {
        // In a real implementation, we would:
        // 1. Create a browser instance
        // 2. Navigate to the job URL
        // 3. Extract detailed job information
        // 4. Parse requirements, skills, and other rich data
        
        // Simulate the API call
        await delay(1500);
        
        // Get a mock job and enhance it with more details
        const mockJobs = generateMockJobListings('', '', []);
        const job = mockJobs.find(j => j.id === jobId) || mockJobs[0];
        
        if (!job) return null;
        
        // Add enhanced details
        return {
          ...job,
          description: `<h3>About the Role</h3><p>This is a detailed job description for ${job.title} at ${job.company}. The ideal candidate will have experience with web development technologies like React, Node.js, and TypeScript. You'll be working on cutting-edge projects in a fast-paced environment.</p><h3>Requirements</h3><ul><li>Bachelor's degree in Computer Science or related field</li><li>3+ years of experience with JavaScript and modern frameworks</li><li>Experience with cloud platforms like AWS or Azure</li><li>Strong problem-solving skills</li></ul><h3>Benefits</h3><ul><li>Competitive salary and equity package</li><li>Health, dental, and vision insurance</li><li>Flexible work schedule and remote options</li><li>Continuous learning opportunities</li></ul>`,
          detailsFetched: true,
          requirements: [
            'Bachelor\'s degree in Computer Science or related field',
            '3+ years of experience with JavaScript and modern frameworks',
            'Experience with cloud platforms like AWS or Azure',
            'Strong problem-solving skills'
          ],
          benefitsOffered: [
            'Competitive salary and equity package',
            'Health, dental, and vision insurance',
            'Flexible work schedule and remote options',
            'Continuous learning opportunities'
          ]
        };
      } catch (error) {
        console.error('Error getting job details:', error);
        toast.error("Error retrieving job details", {
          description: (error as Error).message
        });
        return null;
      }
    }
  };
}

// Helper function to generate mock job listings (similar to existing one)
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
    'Nexus Technologies',
    // Adding more generic and ATS-specific company names
    'GlobalCorp',
    'Innovate Solutions Ltd.',
    'Alpha Beta Inc.',
    'Lever Demo Company',
    'Greenhouse Test Org',
    'Workday Example Firm',
    'ICIMS Client Services',
    'Ashby Startup Co',
    'Rippling Tech Systems'
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
  
  // Detect if we're scraping ATS platforms and identify them
  const getAtsPlatform = (platformUrl: string): string | null => {
    if (platformUrl.includes('greenhouse.io')) return 'Greenhouse';
    if (platformUrl.includes('lever.co')) return 'Lever';
    if (platformUrl.includes('workdayjobs.com')) return 'Workday'; // More specific for Workday
    if (platformUrl.includes('icims.com')) return 'ICIMS';
    if (platformUrl.includes('ashbyhq.com')) return 'Ashby';
    if (platformUrl.includes('rippling-ats.com')) return 'Rippling'; // Assuming a pattern
    return null;
  };

  const atsPlatformsInQuery = platforms.map(getAtsPlatform).filter(Boolean) as string[];
  const isAtsQuery = atsPlatformsInQuery.length > 0;

  // All possible platforms for random selection if not specified
  const allMockPlatforms = [
    'LinkedIn', 'Indeed', 'Glassdoor', 'Monster', 'GitHub', // Existing
    'Lever', 'ICIMS', 'Workday', 'Greenhouse', 'ZipRecruiter',
    'Dice', 'Simply Hired', 'Ashby', 'Rippling' // New
  ];
  
  // Generate the jobs
  for (let i = 0; i < jobCount; i++) {
    const jobTitleIndex = Math.floor(Math.random() * jobTitles.length);
    const companyIndex = Math.floor(Math.random() * companies.length);
    
    const jobTitle = jobTitles[jobTitleIndex];
    const companyName = companies[Math.min(companyIndex, companies.length - 1)];
    
    // Determine platform for this job
    const jobTitleIndex = Math.floor(Math.random() * jobTitles.length);
    const companyIndex = Math.floor(Math.random() * companies.length);
    
    const jobTitle = jobTitles[jobTitleIndex];
    // Ensure companyName is valid, falling back if necessary
    const companyName = companies[Math.min(companyIndex, companies.length - 1)] || "Generic Company";
    const safeCompanyName = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9-]/g, '');


    // Determine platform for this job
    let platform: string;
    if (isAtsQuery && atsPlatformsInQuery.length > 0) {
      // If the query specified ATS platforms, pick one of them
      platform = atsPlatformsInQuery[Math.floor(Math.random() * atsPlatformsInQuery.length)];
    } else if (platforms.length > 0 && !platforms.some(p => p.includes('.'))) {
      // If platforms are specified by name (not URL), pick one
      platform = platforms[Math.floor(Math.random() * platforms.length)];
    } else {
      // Otherwise, pick a random platform from all available mock platforms
      platform = allMockPlatforms[Math.floor(Math.random() * allMockPlatforms.length)];
    }
    
    // Generate a random ID
    const id = `job-${Date.now()}-${i}-${Math.floor(Math.random() * 10000)}`;
    
    // Generate a URL based on platform
    let applyUrl = '';
    let atsSystem: string | null = null; // Ensure atsSystem is string or null
    
    // Standardize company name for URL generation
    const urlCompanyName = safeCompanyName || 'examplecompany';

    switch (platform) {
      case 'Greenhouse':
        applyUrl = `https://boards.greenhouse.io/${urlCompanyName}/jobs/${Math.floor(Math.random() * 900000) + 100000}`;
        atsSystem = 'Greenhouse';
        break;
      case 'Lever':
        applyUrl = `https://jobs.lever.co/${urlCompanyName}/${Math.random().toString(36).substring(2, 10)}`;
        atsSystem = 'Lever';
        break;
      case 'Workday':
        applyUrl = `https://${urlCompanyName}.wd1.myworkdayjobs.com/en-US/ExternalSite/${jobTitle.replace(/\s+/g, '-')}_${urlCompanyName}_${Math.floor(Math.random() * 100) + 1}`;
        atsSystem = 'Workday';
        break;
      case 'ICIMS':
        applyUrl = `https://careers-${urlCompanyName}.icims.com/jobs/${Math.floor(Math.random() * 9000) + 1000}/job`;
        atsSystem = 'ICIMS';
        break;
      case 'Ashby':
        applyUrl = `https://jobs.ashbyhq.com/${urlCompanyName}/${Math.random().toString(36).substring(2, 12)}`;
        atsSystem = 'Ashby';
        break;
      case 'Rippling':
        applyUrl = `https://${urlCompanyName}.rippling-ats.com/job/${Math.random().toString(36).substring(2, 15)}`;
        atsSystem = 'Rippling';
        break;
      case 'LinkedIn':
        applyUrl = `https://www.linkedin.com/jobs/view/${Math.floor(Math.random() * 900000000) + 100000000}`;
        break;
      case 'Indeed':
        applyUrl = `https://www.indeed.com/viewjob?jk=${Math.random().toString(36).substring(2, 18)}`;
        break;
      case 'Glassdoor':
        applyUrl = `https://www.glassdoor.com/Job/${urlCompanyName}-jobs-SRCH_KO0,${urlCompanyName.length}_IP${i}.htm`;
        break;
      case 'ZipRecruiter':
        applyUrl = `https://www.ziprecruiter.com/c/${urlCompanyName}/Job/${jobTitle.replace(/\s+/g, '-')}/${id}`;
        break;
      case 'Dice':
        applyUrl = `https://www.dice.com/job-detail/${id}_${jobTitle.replace(/\s+/g, '-')}_${urlCompanyName}`;
        break;
      case 'Simply Hired':
        applyUrl = `https://www.simplyhired.com/job/${id}?q=${query}`;
        break;
      case 'Monster':
        applyUrl = `https://job-openings.monster.com/${jobTitle.replace(/\s+/g, '-')}-job-${randomLocation.split(',')[0].replace(/\s+/g, '-')}-${id}`;
        break;
      case 'GitHub': // Assuming GitHub jobs are issue-based or link to external ATS
        applyUrl = `https://github.com/${urlCompanyName}/careers/issues/${Math.floor(Math.random() * 1000) + 1}`;
        break;
      default:
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

function extractCompanyFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    // Remove common domain suffixes and prefixes
    const parts = hostname.split('.');
    
    // Handle common patterns
    if (hostname.includes('careers.') || hostname.includes('jobs.')) {
      // For careers.company.com or jobs.company.com
      return parts[1] || null;
    } else if (hostname.includes('.greenhouse.io')) {
      // For company.greenhouse.io
      return parts[0] || null;
    } else if (hostname.includes('.lever.co')) {
      // For company.lever.co
      return parts[0] || null;
    } else if (hostname.includes('.workday.com')) {
      // For company.workday.com
      return parts[0] || null;
    }
    
    // Default: return the main domain name without TLD
    return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  } catch (e) {
    return null;
  }
}

// =====================================================================================
// TESTING STRATEGY FOR EnhancedJobScraper UTILITIES (Client-Side)
// =====================================================================================
//
// This file primarily contains utility functions for client-side operations,
// especially mock data generation.
//
// 1. Unit Testing - `generateMockJobListings`:
//    - Purpose: Ensure the function generates varied and correctly structured mock data
//      according to the requirements and input parameters.
//    - Strategy:
//      - Test with different inputs for `query`, `location`, and `platforms`.
//      - Verify that the generated `ScrapedJob[]` array and its elements adhere to the
//        `ScrapedJob` interface.
//      - Check for variety:
//        - Ensure different job titles, companies, locations are generated.
//        - If `query` influences job titles (e.g., "quant"), verify this behavior.
//        - If `platforms` influences company names or ATS systems, test this.
//      - URL Generation Logic:
//        - For each platform (especially ATS like Lever, Greenhouse, Workday, ICIMS,
//          Ashby, Rippling and aggregators like ZipRecruiter, Dice), verify that the
//          `applyUrl` follows the expected pattern.
//        - Check that `atsSystem` is correctly set for ATS platforms.
//      - Randomness: While hard to test exact random outputs, test that the number of
//        jobs is within the expected range, salaries are within expected ranges, and
//        `postedAt` dates are reasonable.
//      - Edge Cases: Test with empty `platforms` array, empty `query`, etc.
//
// 2. Unit Testing - `extractCompanyFromUrl`:
//    - Purpose: Ensure correct extraction of company names from various URL patterns.
//    - Strategy:
//      - Test with a diverse set of URLs, including:
//        - Standard domains: `https://www.example.com`
//        - Domains with subdomains: `https://careers.example.com`, `https://jobs.example.org`
//        - ATS specific patterns: `https://company.greenhouse.io`, `https://jobs.lever.co/company`
//          (though the current implementation might simplify these to "company").
//        - URLs with paths, query parameters.
//      - Test edge cases:
//        - Invalid URLs (should return null or handle gracefully).
//        - URLs without typical company patterns.
//        - IP addresses instead of hostnames.
//    - Assertions:
//      - Verify the extracted company name is as expected.
//
// 3. Unit Testing - `browserUtils.ts` (if applicable):
//    - If `src/utils/jobScraper/browserUtils.ts` contains significant, testable,
//      client-side utility functions (beyond simple wrappers for browser APIs that are
//      hard to unit test without a browser environment), they should have their own
//      dedicated test file (e.g., `browserUtils.test.ts`).
//    - Functions like `delay` are simple utilities; testing might be skipped or be
//      very basic (e.g., ensuring it resolves after a certain time, though this can
//      make tests slow).
//    - `extractDomain` (if different from server-side or re-implemented here) should
//      be tested similar to `extractCompanyFromUrl`.
//    - `simulateHumanInteraction` is likely too complex and environment-dependent for
//      simple unit tests and might be better tested as part of integration/E2E tests
//      if it were used for actual scraping.
//
// 4. `createEnhancedJobScraper` - Integration/Behavioral Testing:
//    - Since `searchJobs`, `verifyJobs`, and `getJobDetails` in the current version
//      primarily rely on `generateMockJobListings` and simple logic (like `Math.random`),
//      their testing would largely overlap with testing `generateMockJobListings`.
//    - If these methods were to involve actual client-side fetching or complex state
//      management, they would require more involved integration tests, potentially
//      mocking `fetch` or other browser APIs.
//    - The placeholder for API calls in `searchJobs` would be tested by ensuring
//      `fetch` is called with the correct parameters if that path were active.
//
// All tests should ideally be located in a `__tests__` directory or similar,
// colocated with the source files.
//
// =====================================================================================
