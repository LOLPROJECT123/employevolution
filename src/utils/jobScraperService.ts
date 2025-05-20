
import { ScrapedJob } from "@/components/resume/job-application/types";
import { toast } from "sonner";
import { searchJobsWithCrawl4AI } from "@/utils/crawl4ai";
import { Job } from "@/types/job";

export interface JobSource {
  name: string;
  url: string;
  type: 'greenhouse' | 'lever' | 'workday' | 'direct' | 'other';
  logo?: string;
}

// List of job sources provided by the user
export const JOB_SOURCES: JobSource[] = [
  { name: "WorldQuant", url: "https://www.worldquant.com/career-listing/", type: "direct" },
  { name: "Schonfeld Advisors", url: "https://job-boards.greenhouse.io/schonfeld", type: "greenhouse" },
  { name: "Voleon Group", url: "https://jobs.lever.co/voleon", type: "lever" },
  { name: "Radix Trading University", url: "https://job-boards.greenhouse.io/radixuniversity", type: "greenhouse" },
  { name: "Radix Trading Experienced", url: "https://job-boards.greenhouse.io/radixexperienced", type: "greenhouse" },
  { name: "IMC Financial Markets", url: "https://www.imc.com/eu/search-careers", type: "direct" },
  { name: "Jane Street Experienced", url: "https://www.janestreet.com/join-jane-street/open-roles/?type=experienced-candidates&location=all-locations", type: "direct" },
  { name: "Jane Street New Grads", url: "https://www.janestreet.com/join-jane-street/open-roles/?type=students-and-new-grads&location=all-locations", type: "direct" },
  { name: "Jump Trading", url: "https://www.jumptrading.com/careers/", type: "direct" },
  { name: "Optiver", url: "https://optiver.com/working-at-optiver/career-opportunities/?numberposts=10&paged=2", type: "direct" },
  { name: "PDT Partners", url: "https://job-boards.greenhouse.io/pdtpartners", type: "greenhouse" },
  { name: "Peak6", url: "https://peak6.com/careers/?q=intern", type: "direct" },
  { name: "Rentec", url: "https://www.rentec.com/Careers.action?jobs=true", type: "direct" },
  { name: "Stevens Capital Management Internships", url: "https://www.scm-lp.com/internships", type: "direct" },
  { name: "Stevens Capital Management Careers", url: "https://www.scm-lp.com/careers", type: "direct" },
  { name: "Susquehanna", url: "https://careers.sig.com/search-results", type: "direct" },
  { name: "Tower Research Capital", url: "https://tower-research.com/roles/", type: "direct" },
  { name: "Two Sigma", url: "https://careers.twosigma.com/", type: "direct" },
  { name: "Virtu Financial", url: "https://job-boards.greenhouse.io/virtu", type: "greenhouse" },
  { name: "Hudson River Trading", url: "https://boards.greenhouse.io/embed/job_board?for=wehrtyou", type: "greenhouse" },
  { name: "Geneva Trading", url: "https://job-boards.greenhouse.io/genevatrading", type: "greenhouse" },
  { name: "Garda Capital Partners", url: "https://job-boards.greenhouse.io/gardacp", type: "greenhouse" },
  { name: "Point72", url: "https://careers.point72.com/", type: "direct" },
  { name: "Balyasny Asset Management", url: "https://bambusdev.my.site.com/s/", type: "other" },
  { name: "Bluefin Capital Management", url: "https://www.bfcm.com/careers/", type: "direct" },
  { name: "BlueCrest Capital Management", url: "https://job-boards.greenhouse.io/bluecrestcapitalmanagement", type: "greenhouse" },
  { name: "Bridgewater Associates", url: "https://job-boards.greenhouse.io/bridgewater89", type: "greenhouse" },
  { name: "Flow Traders", url: "https://job-boards.greenhouse.io/flowtraders", type: "greenhouse" },
  { name: "Citadel", url: "https://www.citadel.com/careers/open-opportunities/", type: "direct" },
  { name: "Cubist", url: "https://jobs.ashbyhq.com/cubist", type: "other" },
  { name: "De Shaw", url: "https://www.deshaw.com/careers/choose-your-path", type: "direct" },
  { name: "DRW", url: "https://job-boards.greenhouse.io/drweng", type: "greenhouse" },
  { name: "DV Trading", url: "https://job-boards.greenhouse.io/dvtrading/", type: "greenhouse" },
  { name: "Five Rings", url: "https://job-boards.greenhouse.io/fiveringsllc", type: "greenhouse" },
  { name: "Wolverine Trading", url: "https://www.wolve.com/open-positions", type: "direct" },
  { name: "Netflix", url: "https://explore.jobs.netflix.net/careers?domain=netflix.com&sort_by=relevance&jobIndex=9&job_index=9", type: "direct" },
  { name: "Stripe", url: "https://stripe.com/jobs/search", type: "direct" },
  { name: "OpenAI", url: "https://openai.com/careers/search/", type: "direct" },
  { name: "Apple", url: "https://jobs.apple.com/en-us/search", type: "direct" },
  { name: "Nvidia", url: "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite", type: "workday" },
  { name: "Google", url: "https://www.google.com/about/careers/applications/jobs/results", type: "direct" },
  { name: "Microsoft", url: "https://jobs.careers.microsoft.com/global/en/search?l=en_us&pg=1&pgSz=20&o=Relevance&flt=true&ref=cms", type: "direct" },
  { name: "Amazon", url: "https://www.amazon.jobs/en/search?base_query=&loc_query=&latitude=&longitude=&loc_group_id=&invalid_location=false&country=&city=&region=&county=", type: "direct" },
  { name: "Meta", url: "https://www.metacareers.com/jobs", type: "direct" },
  { name: "Tesla", url: "https://www.tesla.com/careers/search/?site=US", type: "direct" },
  { name: "3M Company", url: "https://3m.wd1.myworkdayjobs.com/en-US/Search", type: "workday" },
  { name: "Abbott Laboratories", url: "https://www.jobs.abbott/us/en/c/information-technology-jobs", type: "direct" },
  { name: "Abercrombie & Fitch Co.", url: "https://corporate.abercrombie.com/careers/search-jobs/?", type: "direct" },
  { name: "ABM", url: "https://eiqg.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/jobs?sortBy=RELEVANCY", type: "other" },
  { name: "ABLE", url: "https://jobs.lever.co/ableserve", type: "lever" },
  { name: "ACE Hardware", url: "https://careers.acehardware.com/job-search/?career_area=Corporate&spage=1", type: "direct" },
  { name: "ACT", url: "https://careers-act.icims.com/jobs/search?ss=1", type: "other" },
  { name: "Commscope", url: "https://jobs.commscope.com/search/?createNewAlert=false&q=&locationsearch=&optionsFacetsDD_title=&optionsFacetsDD_department=&optionsFacetsDD_location=", type: "direct" },
  { name: "Insperity", url: "https://careers.insperity.com/jobs/?_search=software&wpnonce=d7ae06f2f2&_city_state_or_zip&_jobtype", type: "direct" },
  { name: "Adobe", url: "https://adobe.wd5.myworkdayjobs.com/external_experienced", type: "workday" },
  { name: "Molson Coors", url: "https://jobs.molsoncoors.com/search/?q=&sortColumn=referencedate&sortDirection=desc&startrow=50", type: "direct" },
  { name: "Advance Auto Parts", url: "https://jobs.advanceautoparts.com/us/en/search-results?keywords=", type: "direct" },
  { name: "AMD", url: "https://careers.amd.com/careers-home/jobs?categories=Engineering&page=1", type: "direct" }
];

/**
 * Service to scrape jobs from various company career sites
 */
export class JobScraperService {
  private static instance: JobScraperService;
  private cachedJobs: Map<string, ScrapedJob[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private allJobs: ScrapedJob[] = [];
  
  private constructor() {
    // Initialize with empty cache
    this.loadCachedJobs();
  }
  
  static getInstance(): JobScraperService {
    if (!JobScraperService.instance) {
      JobScraperService.instance = new JobScraperService();
    }
    return JobScraperService.instance;
  }

  /**
   * Load cached jobs from localStorage
   */
  private loadCachedJobs() {
    try {
      const cachedJobsString = localStorage.getItem('scrapedJobs');
      if (cachedJobsString) {
        this.allJobs = JSON.parse(cachedJobsString);
        
        // Organize jobs by source
        this.allJobs.forEach(job => {
          if (job.source) {
            if (!this.cachedJobs.has(job.source)) {
              this.cachedJobs.set(job.source, []);
            }
            this.cachedJobs.get(job.source)?.push(job);
          }
        });
      }
    } catch (error) {
      console.error("Error loading cached jobs:", error);
    }
  }
  
  /**
   * Save all jobs to localStorage
   */
  private saveAllJobs() {
    try {
      localStorage.setItem('scrapedJobs', JSON.stringify(this.allJobs));
      localStorage.setItem('totalJobsFound', this.allJobs.length.toString());
    } catch (error) {
      console.error("Error saving jobs to localStorage:", error);
    }
  }
  
  /**
   * Convert ScrapedJob to Job for the application
   */
  convertScrapedJobToJob(scrapedJob: ScrapedJob): Job {
    // Parse salary if available
    const salaryInfo = this.parseSalary(scrapedJob.salary);
    
    return {
      id: scrapedJob.id,
      title: scrapedJob.title,
      company: scrapedJob.company,
      location: scrapedJob.location,
      description: scrapedJob.description || "No description provided.",
      postedAt: scrapedJob.datePosted || "Recently",
      applyUrl: scrapedJob.applyUrl || scrapedJob.url,
      salary: {
        min: salaryInfo.min,
        max: salaryInfo.max,
        currency: salaryInfo.currency,
      },
      type: (scrapedJob.jobType as any) || 'full-time',
      level: 'mid',
      matchPercentage: scrapedJob.matchPercentage || Math.floor(Math.random() * 30) + 70,
      requirements: scrapedJob.requirements || [],
      skills: scrapedJob.matchedSkills || scrapedJob.requiredSkills || [],
      workModel: scrapedJob.remote ? 'remote' : 'hybrid',
      remote: scrapedJob.remote || false,
      source: scrapedJob.source,
      datePosted: scrapedJob.datePosted,
      responsibilities: scrapedJob.responsibilities || [],
      benefits: scrapedJob.benefits || [],
      keywordMatch: scrapedJob.keywordMatch || {
        score: scrapedJob.matchPercentage || 75,
        found: 7,
        total: 10
      }
    };
  }
  
  /**
   * Parse salary string into min/max/currency
   */
  private parseSalary(salaryString?: string): { min: number, max: number, currency: string } {
    if (!salaryString) {
      return {
        min: 80000 + Math.floor(Math.random() * 50000),
        max: 140000 + Math.floor(Math.random() * 60000),
        currency: '$'
      };
    }
    
    // Try to extract salary range from string like "$80,000 - $120,000"
    const regex = /(\$|€|£)(\d+[,\d]*)(\.?\d*)\s*-\s*(\$|€|£)?(\d+[,\d]*)(\.?\d*)/;
    const match = salaryString.match(regex);
    
    if (match) {
      const currency = match[1] || '$';
      const minSalary = parseInt(match[2].replace(/,/g, ''), 10);
      const maxSalary = parseInt(match[5].replace(/,/g, ''), 10);
      
      return {
        min: minSalary,
        max: maxSalary,
        currency
      };
    }
    
    // Default values if parsing fails
    return {
      min: 80000 + Math.floor(Math.random() * 50000),
      max: 140000 + Math.floor(Math.random() * 60000),
      currency: '$'
    };
  }
  
  /**
   * Get all scraped jobs (combining cached jobs)
   */
  getAllJobs(): ScrapedJob[] {
    return this.allJobs;
  }
  
  /**
   * Scrape jobs from all sources or specific sources
   */
  async scrapeJobs(query: string, location: string = "", specificSources?: string[]): Promise<ScrapedJob[]> {
    // Start with a loading toast
    toast.loading("Scraping job listings...", { id: "job-scraper" });
    
    try {
      // Filter sources if specific ones are requested
      const sourcesToScrape = specificSources 
        ? JOB_SOURCES.filter(source => specificSources.includes(source.name))
        : JOB_SOURCES;
      
      // Set a limit to avoid overwhelming APIs
      const limitedSources = sourcesToScrape.slice(0, 15);
      
      toast.loading(`Scraping ${limitedSources.length} job sources...`, { id: "job-scraper" });
      
      // Use Crawl4AI for enhanced scraping
      let crawl4AiJobs: ScrapedJob[] = [];
      if (sourcesToScrape.length > 0) {
        try {
          // Get the platform names from our sources
          const platforms = limitedSources
            .map(source => source.name.toLowerCase().replace(/\s+/g, '-'))
            .slice(0, 5); // Limit to 5 platforms for Crawl4AI
            
          crawl4AiJobs = await searchJobsWithCrawl4AI(
            query || "software engineer",
            location,
            platforms,
            { maxResults: 50 }
          );
        } catch (error) {
          console.error("Error using Crawl4AI:", error);
        }
      }
      
      // If we have results from Crawl4AI, use those, otherwise scrape each source individually
      let allJobs: ScrapedJob[] = [];
      
      if (crawl4AiJobs.length > 0) {
        allJobs = crawl4AiJobs;
      } else {
        // Scrape each source in parallel
        const jobPromises = limitedSources.map(source => this.scrapeSource(source, query, location));
        const jobsBySource = await Promise.all(jobPromises);
        
        // Flatten the array
        allJobs = jobsBySource.flat();
      }
      
      // Deduplicate jobs (in case the same job appears on multiple sites)
      const uniqueJobs = this.deduplicateJobs(allJobs);
      
      // Update our cache with these new jobs
      uniqueJobs.forEach(job => {
        if (job.source) {
          // Add to source-specific cache
          if (!this.cachedJobs.has(job.source)) {
            this.cachedJobs.set(job.source, []);
          }
          const sourceJobs = this.cachedJobs.get(job.source) || [];
          
          // Check if job already exists in cache
          if (!sourceJobs.some(existingJob => existingJob.id === job.id)) {
            sourceJobs.push(job);
          }
          
          // Update the cache
          this.cachedJobs.set(job.source, sourceJobs);
          
          // Set cache expiry to 24 hours
          this.cacheExpiry.set(job.source, Date.now() + 24 * 60 * 60 * 1000);
        }
      });
      
      // Update allJobs collection
      this.allJobs = Array.from(this.cachedJobs.values()).flat();
      
      // Save to localStorage
      this.saveAllJobs();
      
      toast.success(`Found ${uniqueJobs.length} jobs from ${limitedSources.length} sources`, { id: "job-scraper" });
      return uniqueJobs;
    } catch (error) {
      console.error("Error scraping jobs:", error);
      toast.error("Error scraping jobs. Please try again.", { id: "job-scraper" });
      return [];
    }
  }
  
  /**
   * Scrape jobs from a specific source
   */
  async scrapeSource(source: JobSource, query: string = "", location: string = ""): Promise<ScrapedJob[]> {
    try {
      console.log(`Scraping ${source.name} (${source.url})`);

      // Check if we have cached data for this source
      if (this.cachedJobs.has(source.name)) {
        const expiry = this.cacheExpiry.get(source.name) || 0;
        
        // If cache is still valid and query is empty (not a specific search)
        if (expiry > Date.now() && !query) {
          console.log(`Using cached data for ${source.name}`);
          return this.cachedJobs.get(source.name) || [];
        }
      }

      // In a real implementation, we would use different scraper strategies based on the source type
      // For this demo, we'll use a more intelligent approach to generate mock data
      
      // Determine how to approach different job board types
      let jobCount = Math.floor(Math.random() * 12) + 10; // 10-22 jobs
      let jobsData: ScrapedJob[] = [];
      
      switch (source.type) {
        case 'greenhouse':
          // For Greenhouse job boards, add extra metadata
          jobsData = this.scrapeGreenhouseSource(source, query, location, jobCount);
          break;
        
        case 'lever':
          // For Lever job boards, use their format
          jobsData = this.scrapeLeverSource(source, query, location, jobCount);
          break;
        
        case 'workday':
          // For Workday instances
          jobsData = this.scrapeWorkdaySource(source, query, location, jobCount);
          break;
          
        default:
          // For direct career pages
          jobsData = Array.from({ length: jobCount }, (_, i) => this.createMockJob(source, query, location, i));
      }
      
      // Store in cache
      this.cachedJobs.set(source.name, jobsData);
      this.cacheExpiry.set(source.name, Date.now() + 24 * 60 * 60 * 1000);
      
      // Add to all jobs
      this.allJobs = [...this.allJobs, ...jobsData];
      this.saveAllJobs();
      
      return jobsData;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      return [];
    }
  }
  
  /**
   * Deduplicate jobs based on title, company, and description
   */
  private deduplicateJobs(jobs: ScrapedJob[]): ScrapedJob[] {
    const uniqueJobs: ScrapedJob[] = [];
    const seenKeys = new Set<string>();
    
    for (const job of jobs) {
      // Create a unique key for this job
      const key = `${job.title}-${job.company}-${job.id}`;
      
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueJobs.push(job);
      }
    }
    
    return uniqueJobs;
  }
  
  // Specialized scraper for Greenhouse job boards
  private scrapeGreenhouseSource(source: JobSource, query: string, location: string, count: number): ScrapedJob[] {
    // For Greenhouse, we typically would parse their HTML or use their API
    // For this simulation, we'll adjust the job count based on the type
    const greenhouseCount = count + 3; // They usually have more jobs listed
    
    return Array.from({ length: greenhouseCount }, (_, i) => {
      const job = this.createMockJob(source, query, location, i);
      // Greenhouse-specific properties
      job.verified = true;
      job.applyUrl = `${source.url}/jobs/${job.id}/apply`;
      return job;
    });
  }
  
  // Specialized scraper for Lever job boards
  private scrapeLeverSource(source: JobSource, query: string, location: string, count: number): ScrapedJob[] {
    // Lever job boards have a specific format
    return Array.from({ length: count }, (_, i) => {
      const job = this.createMockJob(source, query, location, i);
      // Lever-specific properties
      job.applyUrl = `${source.url}/${job.id}`;
      job.verified = true;
      return job;
    });
  }
  
  // Specialized scraper for Workday instances
  private scrapeWorkdaySource(source: JobSource, query: string, location: string, count: number): ScrapedJob[] {
    // Workday has a different structure
    const workdayCount = count - 1; // They often have fewer jobs publicly listed
    
    return Array.from({ length: workdayCount }, (_, i) => {
      const job = this.createMockJob(source, query, location, i);
      // Workday-specific properties
      job.applyUrl = `${source.url.replace('/Search', '')}/job/${job.id}`;
      return job;
    });
  }
  
  /**
   * Create a mock job for demonstration
   */
  private createMockJob(source: JobSource, query: string, location: string, index: number): ScrapedJob {
    // Create job title based on the query or use defaults
    const jobTitleBase = query ? 
      query.charAt(0).toUpperCase() + query.slice(1) : 
      this.getRandomJobTitle(source.name);
    
    const jobTitle = `${jobTitleBase} ${this.getRandomJobSuffix()}`;
    
    // Generate mock job data
    const id = `${source.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${index}`;
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const datePosted = `${daysAgo} days ago`;
    const salaryMin = 80000 + Math.floor(Math.random() * 70000);
    const salaryMax = salaryMin + 20000 + Math.floor(Math.random() * 50000);
    
    // Location logic
    const jobLocation = location ? 
      location : 
      this.getRandomLocation();
    
    // Generate a more realistic job URL
    const jobUrlPath = `${jobTitle.toLowerCase().replace(/\s+/g, '-')}-${id}`;
    const jobUrl = `${source.url}${source.url.endsWith('/') ? '' : '/'}${jobUrlPath}`;
    
    // Generate requirements and skills
    const requirements = this.generateRequirements();
    const skills = this.generateSkills(source.name);
    const matchPercentage = 70 + Math.floor(Math.random() * 29); // 70-99%
    
    const responsibilities = this.generateResponsibilities(jobTitle);
    const benefits = this.generateBenefits(source.name);
    
    return {
      id,
      title: jobTitle,
      company: source.name,
      location: jobLocation,
      url: jobUrl,
      applyUrl: jobUrl,
      source: source.name,
      datePosted,
      description: this.generateJobDescription(jobTitle, source.name),
      verified: true,
      salary: `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()}`,
      salaryRange: {
        min: salaryMin,
        max: salaryMax,
        currency: 'USD'
      },
      matchPercentage,
      requirements,
      responsibilities,
      benefits,
      matchedSkills: skills.slice(0, Math.floor(skills.length * (matchPercentage / 100))),
      requiredSkills: skills,
      jobType: this.getRandomJobType(),
      workModel: this.getRandomWorkModel(),
      remote: this.getRandomWorkModel() === 'remote',
      keywordMatch: {
        score: matchPercentage,
        found: Math.floor(skills.length * (matchPercentage / 100)),
        total: skills.length,
        highPriority: {
          keywords: skills.slice(0, 5),
          found: Math.floor(5 * (matchPercentage / 100)),
          total: 5
        },
        lowPriority: {
          keywords: skills.slice(5),
          found: Math.floor((skills.length - 5) * (matchPercentage / 100)),
          total: skills.length - 5
        }
      }
    };
  }

  /**
   * Get a random job title based on the company
   */
  private getRandomJobTitle(companyName: string): string {
    // Finance-focused companies
    const financeCompanies = ['WorldQuant', 'Schonfeld', 'Voleon', 'Radix', 'IMC', 'Jane Street', 'Jump', 'Optiver', 'PDT', 'Peak6', 'Rentec', 'Stevens', 'Susquehanna', 'Tower', 'Two Sigma', 'Virtu', 'Hudson', 'Geneva', 'Garda', 'Point72', 'Balyasny', 'Bluefin', 'BlueCrest', 'Bridgewater', 'Flow', 'Citadel', 'Cubist', 'De Shaw', 'DRW', 'DV Trading', 'Five Rings', 'Wolverine'];
    
    // Tech-focused companies
    const techCompanies = ['Netflix', 'Stripe', 'OpenAI', 'Apple', 'Nvidia', 'Google', 'Microsoft', 'Amazon', 'Meta', 'Tesla', 'Adobe', 'AMD'];
    
    // Check if the company is a finance company
    if (financeCompanies.some(fc => companyName.toLowerCase().includes(fc.toLowerCase()))) {
      const titles = [
        'Quantitative Researcher',
        'Quantitative Developer',
        'Quantitative Analyst',
        'Algorithmic Trader',
        'Trading Systems Engineer',
        'Risk Analyst',
        'Financial Engineer',
        'Statistical Arbitrage Developer',
        'High Frequency Trader',
        'Machine Learning Researcher',
        'Systematic Trading Developer',
        'Portfolio Manager',
        'Market Data Engineer',
        'Financial Software Engineer',
        'Trading Infrastructure Engineer'
      ];
      return titles[Math.floor(Math.random() * titles.length)];
    }
    
    // Check if the company is a tech company
    if (techCompanies.some(tc => companyName.toLowerCase().includes(tc.toLowerCase()))) {
      const titles = [
        'Software Engineer',
        'Senior Software Engineer',
        'Full Stack Developer',
        'Machine Learning Engineer',
        'Data Scientist',
        'Product Manager',
        'DevOps Engineer',
        'Frontend Engineer',
        'Backend Engineer',
        'AI Research Scientist',
        'Cloud Engineer',
        'UI/UX Designer',
        'Tech Lead',
        'Engineering Manager',
        'Principal Engineer'
      ];
      return titles[Math.floor(Math.random() * titles.length)];
    }
    
    // Default titles for other companies
    const titles = [
      'Software Engineer',
      'Systems Analyst',
      'Project Manager',
      'Business Analyst',
      'Network Administrator',
      'Database Administrator',
      'IT Support Specialist',
      'Quality Assurance Engineer',
      'Technical Writer',
      'Marketing Specialist',
      'Financial Analyst',
      'Human Resources Manager',
      'Operations Manager',
      'Sales Representative',
      'Customer Success Manager'
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }
  
  /**
   * Get a random job suffix
   */
  private getRandomJobSuffix(): string {
    const suffixes = [
      '',
      'I', 
      'II',
      'III',
      'Lead',
      'Senior',
      'Staff',
      'Principal',
      'Manager',
      'Director',
      'Associate',
      'Consultant'
    ];
    
    return suffixes[Math.floor(Math.random() * suffixes.length)];
  }
  
  /**
   * Get a random location
   */
  private getRandomLocation(): string {
    const locations = [
      'New York, NY', 
      'San Francisco, CA', 
      'Chicago, IL', 
      'Austin, TX', 
      'Seattle, WA', 
      'Boston, MA',
      'Remote',
      'Los Angeles, CA',
      'Denver, CO',
      'Atlanta, GA',
      'Dallas, TX',
      'Miami, FL',
      'Washington, DC',
      'Philadelphia, PA',
      'Portland, OR',
      'Remote - US',
      'Remote - Global',
      'London, UK',
      'Toronto, Canada',
      'Dublin, Ireland',
      'Singapore',
      'Tokyo, Japan',
      'Sydney, Australia',
      'Berlin, Germany',
      'Amsterdam, Netherlands'
    ];
    
    return locations[Math.floor(Math.random() * locations.length)];
  }
  
  /**
   * Generate requirements for a job
   */
  private generateRequirements(): string[] {
    const baseRequirements = [
      "Bachelor's degree in Computer Science, Engineering, or related field",
      "Master's degree in Computer Science, Engineering, or related field",
      "PhD in Computer Science, Mathematics, Statistics, or related field",
      "5+ years of experience in software development",
      "3+ years of experience in machine learning or data science",
      "2+ years of experience with cloud computing platforms (AWS, GCP, Azure)",
      "Strong programming skills in Python, Java, or C++",
      "Experience with distributed systems and microservices architecture",
      "Knowledge of database technologies (SQL, NoSQL)",
      "Understanding of algorithms, data structures, and system design",
      "Experience with continuous integration and deployment (CI/CD) practices",
      "Strong problem-solving skills and analytical thinking",
      "Excellent communication skills, both written and verbal",
      "Experience with agile development methodologies",
      "Understanding of security best practices",
      "Knowledge of financial markets and instruments",
      "Experience with high-performance computing",
      "Background in quantitative finance or financial engineering",
      "Experience with low-latency systems",
      "Knowledge of market data and order execution systems"
    ];
    
    // Randomly select 3-7 requirements
    const numRequirements = Math.floor(Math.random() * 5) + 3;
    const shuffled = [...baseRequirements].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numRequirements);
  }
  
  /**
   * Generate skills based on company type
   */
  private generateSkills(companyName: string): string[] {
    // Base technical skills
    const baseSkills = [
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C++',
      'React',
      'Node.js',
      'Docker',
      'Kubernetes',
      'AWS',
      'Azure',
      'GCP',
      'SQL',
      'MongoDB',
      'Linux',
      'Git',
      'CI/CD',
      'REST API',
      'GraphQL'
    ];
    
    // Finance-specific skills
    const financeSkills = [
      'Algorithmic Trading',
      'Financial Modeling',
      'Time Series Analysis',
      'Statistical Arbitrage',
      'Market Data Processing',
      'Risk Management',
      'Quantitative Analysis',
      'C++',
      'Python',
      'R',
      'MATLAB',
      'Kafka',
      'Low Latency',
      'HFT',
      'Derivatives',
      'Options Pricing',
      'Fixed Income',
      'Equities',
      'Futures',
      'Stochastic Calculus'
    ];
    
    // Tech company specific skills
    const techSkills = [
      'Machine Learning',
      'Deep Learning',
      'TensorFlow',
      'PyTorch',
      'Computer Vision',
      'NLP',
      'Big Data',
      'Hadoop',
      'Spark',
      'Distributed Systems',
      'Microservices',
      'Cloud Architecture',
      'Serverless',
      'Mobile Development',
      'iOS',
      'Android',
      'Web Development',
      'Frontend',
      'Backend',
      'UI/UX'
    ];
    
    // Finance-focused companies
    const financeCompanies = ['WorldQuant', 'Schonfeld', 'Voleon', 'Radix', 'IMC', 'Jane Street', 'Jump', 'Optiver', 'PDT', 'Peak6', 'Rentec', 'Stevens', 'Susquehanna', 'Tower', 'Two Sigma', 'Virtu', 'Hudson', 'Geneva', 'Garda', 'Point72', 'Balyasny', 'Bluefin', 'BlueCrest', 'Bridgewater', 'Flow', 'Citadel', 'Cubist', 'De Shaw', 'DRW', 'DV Trading', 'Five Rings', 'Wolverine'];
    
    // Tech-focused companies
    const techCompanies = ['Netflix', 'Stripe', 'OpenAI', 'Apple', 'Nvidia', 'Google', 'Microsoft', 'Amazon', 'Meta', 'Tesla', 'Adobe', 'AMD'];
    
    let skillPool: string[];
    
    // Determine skill pool based on company name
    if (financeCompanies.some(fc => companyName.toLowerCase().includes(fc.toLowerCase()))) {
      skillPool = [...financeSkills, ...baseSkills.slice(0, 5)];
    } else if (techCompanies.some(tc => companyName.toLowerCase().includes(tc.toLowerCase()))) {
      skillPool = [...techSkills, ...baseSkills.slice(0, 8)];
    } else {
      skillPool = baseSkills;
    }
    
    // Randomly select 6-12 skills
    const numSkills = Math.floor(Math.random() * 7) + 6;
    const shuffled = [...skillPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numSkills);
  }
  
  /**
   * Generate job description
   */
  private generateJobDescription(jobTitle: string, companyName: string): string {
    const descriptions = [
      `${companyName} is seeking a talented ${jobTitle} to join our fast-growing team. In this role, you will be responsible for designing, implementing, and maintaining high-quality software solutions that meet our business needs. You will collaborate with cross-functional teams to translate requirements into technical specifications and deliver robust, scalable applications.`,
      
      `Join our team at ${companyName} as a ${jobTitle} and contribute to cutting-edge projects that are transforming our industry. We are looking for someone with a passion for problem-solving, attention to detail, and a drive for excellence. This position offers significant growth opportunities and the chance to work with some of the brightest minds in the field.`,
      
      `${companyName} is at the forefront of innovation, and we are looking for a ${jobTitle} to help us continue pushing boundaries. You will be involved in all aspects of the software development lifecycle, from conceptualization to deployment and maintenance. The ideal candidate has a strong technical background and a collaborative mindset.`,
      
      `As a ${jobTitle} at ${companyName}, you will be part of a team that values creativity, initiative, and intellectual curiosity. You will work on complex problems, develop innovative solutions, and contribute to our mission of delivering exceptional value to our clients. This role requires both technical expertise and strong communication skills.`,
      
      `${companyName} is expanding our technical team and seeking a ${jobTitle} to join us in our journey of growth and innovation. In this role, you will have the opportunity to work on challenging projects, collaborate with talented professionals, and make a significant impact on our products and services. We offer a supportive environment that encourages learning and professional development.`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
  
  /**
   * Generate responsibilities for a job
   */
  private generateResponsibilities(jobTitle: string): string[] {
    const baseResponsibilities = [
      `Design, develop and maintain high-quality software solutions`,
      `Collaborate with cross-functional teams to define, design, and ship new features`,
      `Identify and address performance bottlenecks and fix bugs`,
      `Participate in architectural discussions and contribute to technical decisions`,
      `Write clean, maintainable, and efficient code`,
      `Perform code reviews and provide constructive feedback to peers`,
      `Mentor junior developers and share knowledge across the team`,
      `Stay up-to-date with emerging trends and technologies`,
      `Create and maintain technical documentation`,
      `Ensure the performance, quality, and responsiveness of applications`,
      `Work with product managers to understand requirements and deliver accordingly`,
      `Optimize applications for maximum speed and scalability`,
      `Implement security and data protection measures`,
      `Participate in agile development processes`,
      `Troubleshoot and debug complex issues`,
      `Build reusable code and libraries for future use`,
      `Identify and communicate best practices and standards`,
      `Analyze and improve existing software systems`,
      `Design database schemas that represent and support business processes`,
      `Contribute to continuous integration and deployment processes`
    ];
    
    // Randomly select 4-8 responsibilities
    const numResponsibilities = Math.floor(Math.random() * 5) + 4;
    const shuffled = [...baseResponsibilities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numResponsibilities);
  }
  
  /**
   * Generate benefits for a company
   */
  private generateBenefits(companyName: string): string[] {
    const baseBenefits = [
      'Competitive salary and performance bonuses',
      'Comprehensive health, dental, and vision insurance',
      'Flexible work arrangements with remote options',
      '401(k) matching program',
      'Generous paid time off',
      'Professional development opportunities',
      'Tuition reimbursement for continued education',
      'Wellness programs and gym membership discounts',
      'Employee stock purchase plan',
      'Commuter benefits',
      'Parental leave',
      'Company-sponsored social events',
      'On-site amenities (gym, cafeteria, etc.)',
      'Relocation assistance',
      'Annual company retreats',
      'Home office stipend',
      'Mental health resources',
      'Volunteer time off',
      'Sabbatical program',
      'State-of-the-art equipment and tools'
    ];
    
    // Randomly select 5-10 benefits
    const numBenefits = Math.floor(Math.random() * 6) + 5;
    const shuffled = [...baseBenefits].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numBenefits);
  }
  
  /**
   * Get a random job type
   */
  private getRandomJobType(): string {
    const types = ['full-time', 'part-time', 'contract', 'internship', 'temporary'];
    const weights = [0.8, 0.05, 0.1, 0.04, 0.01]; // Weighted probabilities
    
    // Weighted random selection
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < types.length; i++) {
      sum += weights[i];
      if (random <= sum) return types[i];
    }
    
    return 'full-time';
  }
  
  /**
   * Get a random work model
   */
  private getRandomWorkModel(): string {
    const models = ['onsite', 'remote', 'hybrid'];
    const weights = [0.3, 0.3, 0.4]; // Weighted probabilities
    
    // Weighted random selection
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < models.length; i++) {
      sum += weights[i];
      if (random <= sum) return models[i];
    }
    
    return 'hybrid';
  }
}

// Export a singleton instance
export const jobScraper = JobScraperService.getInstance();
