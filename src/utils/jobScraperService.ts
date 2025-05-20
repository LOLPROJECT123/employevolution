
import { ScrapedJob } from "@/components/resume/job-application/types";
import { toast } from "sonner";

export interface JobSource {
  name: string;
  url: string;
  type: 'greenhouse' | 'lever' | 'workday' | 'direct' | 'other';
  logo?: string;
}

// List of job sources provided by the user
export const JOB_SOURCES: JobSource[] = [
  { name: "WorldQuant", url: "https://www.worldquant.com/career-listing/", type: "direct" },
  { name: "Schonfield Advisors", url: "https://job-boards.greenhouse.io/schonfeld", type: "greenhouse" },
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
  { name: "Ganda Capital Partners", url: "https://job-boards.greenhouse.io/gardacp", type: "greenhouse" },
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
  { name: "Tesla", url: "https://www.tesla.com/careers/search", type: "direct" },
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
  
  private constructor() {}
  
  static getInstance(): JobScraperService {
    if (!JobScraperService.instance) {
      JobScraperService.instance = new JobScraperService();
    }
    return JobScraperService.instance;
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
      const limitedSources = sourcesToScrape.slice(0, 10);
      
      toast.loading(`Scraping ${limitedSources.length} job sources...`, { id: "job-scraper" });
      
      // Scrape each source in parallel
      const jobPromises = limitedSources.map(source => this.scrapeSource(source, query, location));
      const jobsBySource = await Promise.all(jobPromises);
      
      // Flatten the array
      const allJobs = jobsBySource.flat();
      
      // Deduplicate jobs (in case the same job appears on multiple sites)
      const uniqueJobs = this.deduplicateJobs(allJobs);
      
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
  private async scrapeSource(source: JobSource, query: string, location: string): Promise<ScrapedJob[]> {
    try {
      console.log(`Scraping ${source.name} (${source.url})`);
      
      // In a real implementation, we would use different scraper strategies based on the source type
      // For this demo, we'll generate mock data
      
      // Add a small delay to simulate real scraping time
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500));
      
      // Generate between 3-8 jobs per source
      const jobCount = Math.floor(Math.random() * 6) + 3;
      
      return Array.from({ length: jobCount }, (_, i) => this.createMockJob(source, query, location, i));
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      return [];
    }
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
    const skills = this.generateSkills();
    const matchPercentage = 70 + Math.floor(Math.random() * 29); // 70-99%
    
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
      matchedSkills: skills.slice(0, Math.floor(skills.length * (matchPercentage / 100))),
      requiredSkills: skills,
      jobType: this.getRandomJobType(),
      workModel: this.getRandomWorkModel() as 'onsite' | 'remote' | 'hybrid',
      experienceLevel: this.getRandomExperienceLevel(),
      keywordMatch: {
        score: matchPercentage,
        total: skills.length,
        found: Math.floor(skills.length * (matchPercentage / 100)),
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
   * Remove duplicate jobs based on title and company
   */
  private deduplicateJobs(jobs: ScrapedJob[]): ScrapedJob[] {
    const uniqueJobs: ScrapedJob[] = [];
    const seenKeys = new Set<string>();
    
    for (const job of jobs) {
      const key = `${job.company}|${job.title}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueJobs.push(job);
      }
    }
    
    return uniqueJobs;
  }
  
  /**
   * Generate a random job title based on the company
   */
  private getRandomJobTitle(companyName: string): string {
    const techjobTitles = [
      "Software Engineer",
      "Data Scientist",
      "Product Manager",
      "DevOps Engineer",
      "Machine Learning Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Engineer",
      "UX Designer",
      "Blockchain Developer"
    ];
    
    const financeJobTitles = [
      "Quantitative Researcher",
      "Quantitative Developer",
      "Quantitative Analyst",
      "Quantitative Trader",
      "Algo Developer",
      "Trading Systems Developer",
      "Risk Analyst",
      "Financial Strategist",
      "Trading Infrastructure Engineer",
      "Market Data Engineer"
    ];
    
    // Use finance job titles for finance companies, otherwise tech
    const isFinanceCompany = companyName.toLowerCase().includes("trading") || 
      companyName.toLowerCase().includes("capital") || 
      companyName.toLowerCase().includes("financial") ||
      companyName.toLowerCase().includes("asset");
    
    const titles = isFinanceCompany ? financeJobTitles : techjobTitles;
    return titles[Math.floor(Math.random() * titles.length)];
  }
  
  /**
   * Get a random job title suffix
   */
  private getRandomJobSuffix(): string {
    const suffixes = [
      "",
      "I",
      "II", 
      "III",
      "Senior",
      "Lead",
      "Principal",
      "Staff"
    ];
    
    return suffixes[Math.floor(Math.random() * suffixes.length)];
  }
  
  /**
   * Generate a random location
   */
  private getRandomLocation(): string {
    const locations = [
      "San Francisco, CA",
      "New York, NY",
      "Seattle, WA",
      "Austin, TX",
      "Boston, MA",
      "Chicago, IL",
      "Dallas, TX",
      "Remote",
      "Hybrid - Chicago, IL",
      "Hybrid - New York, NY"
    ];
    
    return locations[Math.floor(Math.random() * locations.length)];
  }
  
  /**
   * Generate requirements for the job
   */
  private generateRequirements(): string[] {
    const allRequirements = [
      "Bachelor's degree in Computer Science or related field",
      "Master's degree in Computer Science, Statistics, or Mathematics",
      "3+ years of experience in software development",
      "5+ years of experience in quantitative research",
      "Experience with Python and data science libraries",
      "Experience with C++ in a production environment",
      "Strong understanding of algorithms and data structures",
      "Experience with cloud platforms (AWS, GCP, Azure)",
      "Knowledge of machine learning frameworks",
      "Experience with distributed systems",
      "Experience with financial markets",
      "Strong problem-solving skills",
      "Excellent communication and teamwork abilities",
      "Experience with JavaScript and modern frontend frameworks",
      "Understanding of database design and optimization",
      "Experience with CI/CD pipelines and DevOps practices",
      "Knowledge of security best practices"
    ];
    
    // Shuffle the array and take a random number of items
    const shuffled = [...allRequirements].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4 + Math.floor(Math.random() * 4)); // 4-8 requirements
  }
  
  /**
   * Generate skills for the job
   */
  private generateSkills(): string[] {
    const allSkills = [
      "Python",
      "Java",
      "C++",
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "AWS",
      "Docker",
      "Kubernetes",
      "SQL",
      "MongoDB",
      "Redis",
      "Git",
      "Machine Learning",
      "Data Analysis",
      "CI/CD",
      "Microservices",
      "REST API",
      "GraphQL",
      "TensorFlow",
      "PyTorch"
    ];
    
    // Shuffle the array and take a random number of items
    const shuffled = [...allSkills].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5 + Math.floor(Math.random() * 7)); // 5-12 skills
  }
  
  /**
   * Generate a detailed job description
   */
  private generateJobDescription(title: string, company: string): string {
    return `${company} is seeking a talented ${title} to join our growing team. You will be responsible for designing, developing, and maintaining software systems that power our business. The ideal candidate has strong technical skills and works well in a team environment.

In this role, you will collaborate with cross-functional teams to deliver high-quality solutions. You'll have the opportunity to work on challenging problems and make a significant impact on our products.

As a ${title}, you'll be at the forefront of innovation, working with cutting-edge technologies to solve complex problems. This is a great opportunity to grow your skills and advance your career in a supportive and dynamic environment.`;
  }
  
  /**
   * Get a random job type
   */
  private getRandomJobType(): string {
    const jobTypes = ["full-time", "part-time", "contract", "internship"];
    return jobTypes[Math.floor(Math.random() * jobTypes.length)];
  }
  
  /**
   * Get a random work model
   */
  private getRandomWorkModel(): string {
    const workModels = ["remote", "onsite", "hybrid"];
    return workModels[Math.floor(Math.random() * workModels.length)];
  }
  
  /**
   * Get a random experience level
   */
  private getRandomExperienceLevel(): string {
    const levels = ["entry", "mid", "senior", "lead", "manager"];
    return levels[Math.floor(Math.random() * levels.length)];
  }
}

// Export a singleton instance
export const jobScraper = JobScraperService.getInstance();
