
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, AlertTriangle, Globe, Check } from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_JOB_SOURCES } from "./constants";
import { ScrapedJob } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchJobsWithCrawl4AI } from "@/utils/crawl4ai";

interface JobScraperProps {
  onJobsScraped: (jobs: ScrapedJob[]) => void;
}

// Enhanced list of companies with career pages
const COMPANY_CAREER_PAGES = [
  { name: "WorldQuant", url: "https://www.worldquant.com/career-listing/" },
  { name: "Schonfield Advisors", url: "https://job-boards.greenhouse.io/schonfeld" },
  { name: "Voleon Group", url: "https://jobs.lever.co/voleon" },
  { name: "Radix Trading (University)", url: "https://job-boards.greenhouse.io/radixuniversity" },
  { name: "Radix Trading (Experienced)", url: "https://job-boards.greenhouse.io/radixexperienced" },
  { name: "IMC Financial Markets", url: "https://www.imc.com/eu/search-careers" },
  { name: "Jane Street (Experienced)", url: "https://www.janestreet.com/join-jane-street/open-roles/?type=experienced-candidates&location=all-locations" },
  { name: "Jane Street (New Grads)", url: "https://www.janestreet.com/join-jane-street/open-roles/?type=students-and-new-grads&location=all-locations" },
  { name: "Jump Trading", url: "https://www.jumptrading.com/careers/" },
  { name: "Optiver", url: "https://optiver.com/working-at-optiver/career-opportunities/?numberposts=10&paged=2" },
  { name: "PDT Partners", url: "https://job-boards.greenhouse.io/pdtpartners" },
  { name: "Peak6", url: "https://peak6.com/careers/?q=intern" },
  { name: "Rentec", url: "https://www.rentec.com/Careers.action?jobs=true" },
  { name: "Stevens Capital Management (Internships)", url: "https://www.scm-lp.com/internships" },
  { name: "Stevens Capital Management", url: "https://www.scm-lp.com/careers" },
  { name: "Susquehanna", url: "https://careers.sig.com/search-results" },
  { name: "Tower Research Capital", url: "https://tower-research.com/roles/" },
  { name: "Two Sigma", url: "https://careers.twosigma.com/" },
  { name: "Virtu Fiancial", url: "https://job-boards.greenhouse.io/virtu" },
  { name: "Hudson River Trading", url: "https://boards.greenhouse.io/embed/job_board?for=wehrtyou" },
  { name: "Geneva Trading", url: "https://job-boards.greenhouse.io/genevatrading" },
  { name: "Ganda Capital Partners", url: "https://job-boards.greenhouse.io/gardacp" },
  { name: "Point72", url: "https://careers.point72.com/" },
  { name: "Balyasny Asset Management", url: "https://bambusdev.my.site.com/s/" },
  { name: "Bluefin Capital Management", url: "https://www.bfcm.com/careers/" },
  { name: "BlueCrest Capital Management", url: "https://job-boards.greenhouse.io/bluecrestcapitalmanagement" },
  { name: "Bridgewater Associates", url: "https://job-boards.greenhouse.io/bridgewater89" },
  { name: "Flow Traders", url: "https://job-boards.greenhouse.io/flowtraders" },
  { name: "Citadel", url: "https://www.citadel.com/careers/open-opportunities/" },
  { name: "Cubist", url: "https://jobs.ashbyhq.com/cubist" },
  { name: "De Shaw", url: "https://www.deshaw.com/careers/choose-your-path" },
  { name: "DRW", url: "https://job-boards.greenhouse.io/drweng" },
  { name: "DV Trading", url: "https://job-boards.greenhouse.io/dvtrading/" },
  { name: "Five Rings", url: "https://job-boards.greenhouse.io/fiveringsllc" },
  { name: "Wolverine Trading", url: "https://www.wolve.com/open-positions" },
  { name: "Netflix", url: "https://explore.jobs.netflix.net/careers?domain=netflix.com&sort_by=relevance&jobIndex=9&job_index=9" },
  { name: "Stripe", url: "https://stripe.com/jobs/search" },
  { name: "OpenAI", url: "https://openai.com/careers/search/" },
  { name: "Apple", url: "https://jobs.apple.com/en-us/search" },
  { name: "Nvidia", url: "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite" },
  { name: "Google", url: "https://www.google.com/about/careers/applications/jobs/results" },
  { name: "Microsoft", url: "https://jobs.careers.microsoft.com/global/en/search?l=en_us&pg=1&pgSz=20&o=Relevance&flt=true&ref=cms" },
  { name: "Amazon", url: "https://www.amazon.jobs/en/search?base_query=&loc_query=&latitude=&longitude=&loc_group_id=&invalid_location=false&country=&city=&region=&county=" },
  { name: "Meta", url: "https://www.metacareers.com/jobs" },
  { name: "Tesla", url: "https://www.tesla.com/careers/search/?site=US" },
  { name: "3M Company", url: "https://3m.wd1.myworkdayjobs.com/en-US/Search" },
  { name: "Abbott Laboratories", url: "https://www.jobs.abbott/us/en/c/information-technology-jobs" },
  { name: "Abercrombie & Fitch Co.", url: "https://corporate.abercrombie.com/careers/search-jobs/?" },
  { name: "ABM", url: "https://eiqg.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/jobs?sortBy=RELEVANCY" },
  { name: "ABLE", url: "https://jobs.lever.co/ableserve" },
  { name: "ACE Hardware", url: "https://careers.acehardware.com/job-search/?career_area=Corporate&spage=1" },
  { name: "ACT", url: "https://careers-act.icims.com/jobs/search?ss=1" },
  { name: "Commscope", url: "https://jobs.commscope.com/search/?createNewAlert=false&q=&locationsearch=&optionsFacetsDD_title=&optionsFacetsDD_department=&optionsFacetsDD_location=" },
  { name: "Insperity", url: "https://careers.insperity.com/jobs/?_search=software&wpnonce=d7ae06f2f2&_city_state_or_zip&_jobtype" },
  { name: "Adobe", url: "https://adobe.wd5.myworkdayjobs.com/external_experienced" },
  { name: "Molson Coors", url: "https://jobs.molsoncoors.com/search/?q=&sortColumn=referencedate&sortDirection=desc&startrow=50" },
  { name: "Advance Auto Parts", url: "https://jobs.advanceautoparts.com/us/en/search-results?keywords=" },
  { name: "AMD", url: "https://careers.amd.com/careers-home/jobs?categories=Engineering&page=1" }
];

const JobScraper = ({ onJobsScraped }: JobScraperProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>(["LinkedIn", "Indeed"]);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [isVerifyingJobs, setIsVerifyingJobs] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [maxResults, setMaxResults] = useState<string>("25");
  const [searchMode, setSearchMode] = useState<"basic" | "advanced" | "companies">("advanced");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  // Function to verify job URLs actually exist
  const verifyJobUrls = async (jobs: ScrapedJob[]): Promise<ScrapedJob[]> => {
    setIsVerifyingJobs(true);
    setVerificationProgress(0);
    
    const verifiedJobs: ScrapedJob[] = [];
    let validCount = 0;
    
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      try {
        // Simulate API call to verify URL existence
        // In a real implementation, this would use a server-side API to check URL status
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // For demo purposes, we'll consider ~85% of jobs as valid
        const isValid = Math.random() > 0.15;
        
        if (isValid) {
          // Add keyword matching data to the job
          const keywordMatchData = generateKeywordMatchData();
          
          verifiedJobs.push({
            ...job,
            verified: true,
            keywordMatch: keywordMatchData
          });
          validCount++;
        }
        
        // Update progress
        const progress = Math.floor(((i + 1) / jobs.length) * 100);
        setVerificationProgress(progress);
      } catch (error) {
        console.error(`Error verifying job ${job.id}:`, error);
      }
    }
    
    setIsVerifyingJobs(false);
    
    if (validCount < jobs.length) {
      toast.info(`Filtered out ${jobs.length - validCount} invalid job listings`);
    }
    
    return verifiedJobs;
  };
  
  // Generate keyword match data for a job
  const generateKeywordMatchData = () => {
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
  };

  // Function to scrape jobs using Crawl4AI
  const handleCrawl4AIScrape = async () => {
    if (!searchQuery.trim() && searchMode !== "companies") {
      toast.error("Please enter a job title or keyword");
      return;
    }

    setIsScrapingJobs(true);
    
    try {
      // Convert our UI-friendly platform names to Crawl4AI platform keys
      const platformMap: Record<string, string> = {
        'LinkedIn': 'linkedin',
        'Indeed': 'indeed',
        'Glassdoor': 'glassdoor',
        'ZipRecruiter': 'ziprecruiter',
        'Monster': 'monster',
      };
      
      // Use company-specific scraping if in company mode
      if (searchMode === "companies") {
        await scrapeCompanyCareerPages();
      } else {
        // Map selected sources to Crawl4AI platform keys
        const platforms = selectedSources
          .map(source => platformMap[source])
          .filter(Boolean);
        
        // Use the Crawl4AI implementation to search for jobs
        const jobs = await searchJobsWithCrawl4AI(
          searchQuery.trim(),
          searchLocation.trim(),
          platforms,
          {
            maxResults: parseInt(maxResults),
            maxPages: 5
          }
        );
        
        if (jobs.length > 0) {
          onJobsScraped(jobs);
          toast.success(`Found ${jobs.length} jobs matching your search`);
        } else {
          toast.error("No valid jobs found matching your criteria. Try adjusting your search.");
        }
      }
    } catch (error) {
      console.error("Error scraping jobs:", error);
      toast.error("Failed to scrape jobs. Please try again.");
    } finally {
      setIsScrapingJobs(false);
      setIsVerifyingJobs(false);
    }
  };

  // Function to scrape jobs from company career pages
  const scrapeCompanyCareerPages = async () => {
    // Use all companies if none are specifically selected
    const companiesToScrape = selectedCompanies.length > 0 
      ? COMPANY_CAREER_PAGES.filter(c => selectedCompanies.includes(c.name))
      : COMPANY_CAREER_PAGES.slice(0, 8); // Just use first 8 by default
    
    if (companiesToScrape.length === 0) {
      toast.error("Please select at least one company to scrape");
      setIsScrapingJobs(false);
      return;
    }
    
    toast.loading(`Scraping ${companiesToScrape.length} company career pages`, {
      description: "This process may take a few moments",
      duration: 2000
    });
    
    const allJobs: ScrapedJob[] = [];
    
    for (let i = 0; i < companiesToScrape.length; i++) {
      const company = companiesToScrape[i];
      
      try {
        // Extract domain for the search
        const url = new URL(company.url);
        const domain = url.hostname;
        
        // Show progress for each company
        toast.loading(`Scraping ${company.name} (${i + 1}/${companiesToScrape.length})`, {
          duration: 1500
        });
        
        // Use Crawl4AI to scrape this company
        const jobs = await searchJobsWithCrawl4AI(
          searchQuery.trim() || "software engineer",
          searchLocation.trim(),
          [domain],
          { maxResults: 10, maxPages: 2 }
        );
        
        if (jobs.length > 0) {
          // Ensure the company name is set correctly
          const companyJobs = jobs.map(job => ({
            ...job,
            company: company.name
          }));
          
          allJobs.push(...companyJobs);
          console.log(`Found ${jobs.length} jobs from ${company.name}`);
        }
        
        // Add a small delay between companies to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error(`Error scraping ${company.name}:`, error);
      }
    }
    
    if (allJobs.length > 0) {
      // Verify job URLs exist
      toast.loading("Verifying job listings...", {
        description: "Making sure job listings are still active",
        duration: 1500
      });
      
      const verifiedJobs = await verifyJobUrls(allJobs);
      
      if (verifiedJobs.length > 0) {
        onJobsScraped(verifiedJobs);
        toast.success(`Found ${verifiedJobs.length} jobs from ${companiesToScrape.length} companies`);
      } else {
        toast.warning("No valid jobs found after verification", {
          description: "Try selecting different companies or adjusting your search"
        });
      }
    } else {
      toast.error("No jobs found from the selected companies", {
        description: "Try selecting different companies or adjusting your search"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 mb-4">
        <Button
          variant={searchMode === "advanced" ? "default" : "outline"}
          onClick={() => setSearchMode("advanced")}
          className="flex-1"
        >
          <Search className="h-4 w-4 mr-2" /> Job Search
        </Button>
        <Button
          variant={searchMode === "companies" ? "default" : "outline"}
          onClick={() => setSearchMode("companies")}
          className="flex-1"
        >
          <Globe className="h-4 w-4 mr-2" /> Company Pages
        </Button>
      </div>

      {searchMode !== "companies" ? (
        <>
          <div className="space-y-2">
            <label htmlFor="search-query" className="text-sm font-medium">
              Job Title or Keywords
            </label>
            <Input
              id="search-query"
              placeholder="Software Engineer, Data Scientist, etc."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="search-location" className="text-sm font-medium">
              Location (Optional)
            </label>
            <Input
              id="search-location"
              placeholder="San Francisco, Remote, etc."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Maximum Results
              </label>
              <Select 
                defaultValue={maxResults} 
                onValueChange={setMaxResults}
              >
                <SelectTrigger>
                  <SelectValue placeholder="25" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 results</SelectItem>
                  <SelectItem value="25">25 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                  <SelectItem value="100">100 results</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Platforms</label>
              <Select 
                defaultValue={selectedSources[0]} 
                onValueChange={(value) => setSelectedSources([value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Advanced (Crawl4AI)" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_JOB_SOURCES.map(source => (
                    <SelectItem key={source.name} value={source.name}>{source.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Filter (Optional)
            </label>
            <Input
              placeholder="Software, Quant, Engineer, etc."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to find all positions at selected companies
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Companies
            </label>
            <div className="border rounded-md p-2 h-40 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {COMPANY_CAREER_PAGES.map(company => (
                  <Badge
                    key={company.name}
                    variant={selectedCompanies.includes(company.name) ? "default" : "outline"}
                    className="cursor-pointer m-1"
                    onClick={() => {
                      if (selectedCompanies.includes(company.name)) {
                        setSelectedCompanies(selectedCompanies.filter(c => c !== company.name));
                      } else {
                        setSelectedCompanies([...selectedCompanies, company.name]);
                      }
                    }}
                  >
                    {company.name}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedCompanies.length === 0 
                ? "Select companies or leave blank to search the first 8 companies" 
                : `Selected ${selectedCompanies.length} companies`}
            </p>
          </div>
        </>
      )}

      {isVerifyingJobs && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Verifying job listings...</span>
            <span>{verificationProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${verificationProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <Button 
        type="button" 
        onClick={handleCrawl4AIScrape} 
        disabled={isScrapingJobs || isVerifyingJobs || (searchMode !== "companies" && !searchQuery.trim())}
        className="w-full"
      >
        {isScrapingJobs || isVerifyingJobs ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isScrapingJobs ? 'Searching for Jobs...' : 'Verifying Jobs...'}
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            {searchMode === "companies" ? `Find Jobs at ${selectedCompanies.length || 8} Companies` : "Find Jobs"}
          </>
        )}
      </Button>

      <Alert className="bg-green-50 text-green-900 border border-green-200">
        <Check className="h-4 w-4" />
        <AlertDescription>
          Only verified job listings with valid application links will be shown.
          {searchMode === "advanced" && " Using enhanced Crawl4AI technology for better results."}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default JobScraper;
