
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, ExternalLink, Info, FileText, Search, Check, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Job source sites supported for scraping
const SUPPORTED_JOB_SOURCES = [
  { name: "LinkedIn", supported: true },
  { name: "Levels.fyi", supported: true },
  { name: "Handshake", supported: true },
  { name: "OfferPilotAI", supported: true },
  { name: "Simplify.jobs", supported: true },
  { name: "Jobright.ai", supported: true },
  { name: "Indeed", supported: true },
  { name: "Glassdoor", supported: true },
  { name: "Company websites", supported: true },
];

// Job Application Sources Tabs
const JOB_TABS = [
  { value: "manual", label: "Manual Apply" },
  { value: "auto", label: "Auto Fill" },
  { value: "scraper", label: "Job Scraper" },
];

interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  datePosted?: string;
  description?: string;
  applyUrl?: string;
}

const JobApplicationAutomation = () => {
  const [jobUrl, setJobUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const navigate = useNavigate();
  
  // Job scraping state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>(["LinkedIn", "Indeed"]);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [scrapedJobs, setScrapedJobs] = useState<ScrapedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ScrapedJob | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedResume = localStorage.getItem('userResume');
      if (savedResume) {
        setResumeText(savedResume);
      }
      
      const savedCoverLetter = localStorage.getItem('userCoverLetter');
      if (savedCoverLetter) {
        setCoverLetterText(savedCoverLetter);
      }

      const savedTab = localStorage.getItem('preferredApplicationTab');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    } catch (error) {
      console.error("Error loading saved resume:", error);
    }
  }, []);

  const validateUrl = (url) => {
    if (!url) return false;
    
    try {
      // Try to create a URL object to validate
      new URL(url);
      return true;
    } catch (e) {
      // If it fails, check if it might be missing the protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        try {
          new URL('https://' + url);
          return 'https://' + url;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
  };

  // Extract job ID from URL if present
  const extractJobId = (url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Look for "job" or "jobs" in the path
      const jobIndex = pathParts.findIndex(part => 
        part === 'job' || part === 'jobs' || part === 'position' || part === 'posting');
      
      if (jobIndex >= 0 && jobIndex < pathParts.length - 1) {
        return pathParts[jobIndex + 1];
      }
      
      // Try to extract from query params
      const jobId = urlObj.searchParams.get('jobId') || 
                   urlObj.searchParams.get('id') || 
                   urlObj.searchParams.get('job');
      
      if (jobId) return jobId;
      
      // Last resort: just return the last part of the path
      return pathParts[pathParts.length - 1];
    } catch (e) {
      console.error("Error extracting job ID:", e);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobUrl.trim()) {
      toast.error("Please enter a job URL");
      return;
    }
    
    if (activeTab === "manual" && !resumeText.trim()) {
      toast.error("Please enter your resume text");
      return;
    }
    
    // Validate and potentially fix the URL
    const validatedUrl = validateUrl(jobUrl);
    if (!validatedUrl) {
      toast.error("Please enter a valid job URL", {
        description: "The URL should start with http:// or https://"
      });
      return;
    }
    
    // Use the fixed URL if needed
    const finalUrl = typeof validatedUrl === 'string' ? validatedUrl : jobUrl;
    setIsSubmitting(true);
    
    try {
      // Save the resume to localStorage for future use
      if (resumeText.trim()) {
        localStorage.setItem('userResume', resumeText);
      }
      
      if (coverLetterText.trim()) {
        localStorage.setItem('userCoverLetter', coverLetterText);
      }
      
      // Save the active tab preference
      localStorage.setItem('preferredApplicationTab', activeTab);
      
      // Extract job ID for potential future reference
      const jobId = extractJobId(finalUrl);
      console.log("Extracted job ID:", jobId);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Application prepared successfully!", {
        description: "Your application will open in a new tab"
      });
      
      // Always open in a new tab for better user experience
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      
      // Don't clear inputs after submission so they can be reused
      setJobUrl("");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Function to scrape jobs based on search criteria
  const handleScrapeJobs = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a job title or keyword");
      return;
    }

    setIsScrapingJobs(true);
    setScrapedJobs([]);
    
    try {
      // Simulate API call to scrape jobs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock job results
      const generateMockJobs = (): ScrapedJob[] => {
        const companies = ['Google', 'Microsoft', 'Apple', 'Meta', 'Amazon', 'Netflix', 'Spotify', 'Airbnb', 'Uber', 'Twitter'];
        const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Remote', 'Boston, MA', 'Chicago, IL'];
        const sources = ['LinkedIn', 'Indeed', 'Levels.fyi', 'Handshake', 'Company Website'];
        
        const titlePrefix = searchQuery.trim();
        
        return Array(12).fill(0).map((_, index) => {
          const company = companies[Math.floor(Math.random() * companies.length)];
          const location = searchLocation.trim() || locations[Math.floor(Math.random() * locations.length)];
          const source = sources[Math.floor(Math.random() * sources.length)];
          const daysAgo = Math.floor(Math.random() * 14) + 1;
          
          return {
            id: `job-${index + 1}`,
            title: `${titlePrefix} ${['Engineer', 'Developer', 'Specialist', 'Analyst', 'Manager'][Math.floor(Math.random() * 5)]}`,
            company,
            location,
            url: `https://example.com/jobs/${company.toLowerCase().replace(/\s/g, '-')}/${index + 1}`,
            source,
            datePosted: `${daysAgo} days ago`,
            description: "This is a sample job description that would contain details about the role, responsibilities, and requirements.",
            applyUrl: `https://example.com/jobs/${company.toLowerCase().replace(/\s/g, '-')}/${index + 1}/apply`
          };
        });
      };
      
      const mockJobs = generateMockJobs();
      
      // Filter by selected sources
      const filteredJobs = selectedSources.length > 0 
        ? mockJobs.filter(job => selectedSources.some(source => job.source.includes(source)))
        : mockJobs;
      
      setScrapedJobs(filteredJobs);
      
      if (filteredJobs.length > 0) {
        toast.success(`Found ${filteredJobs.length} jobs matching your search`);
      } else {
        toast.error("No jobs found matching your criteria. Try adjusting your search.");
      }
    } catch (error) {
      console.error("Error scraping jobs:", error);
      toast.error("Failed to scrape jobs. Please try again.");
    } finally {
      setIsScrapingJobs(false);
    }
  };

  // Handle job selection for application
  const handleSelectJob = (job: ScrapedJob) => {
    setSelectedJob(job);
    setJobUrl(job.applyUrl || job.url);
    setShowConfirmation(true);
  };

  // Handle auto-application with confirmation
  const handleAutoApply = async () => {
    if (!selectedJob) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call for auto-application
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Application submitted successfully!", {
        description: `Your application to ${selectedJob.company} for ${selectedJob.title} has been sent.`
      });
      
      // Reset form
      setSelectedJob(null);
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error auto-applying:", error);
      toast.error("Failed to submit application automatically. Try manual application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Automated Job Application</CardTitle>
        <CardDescription>
          Scrape jobs from multiple sources and apply with your resume
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              {JOB_TABS.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="scraper" className="space-y-4 pt-4">
              <div className="space-y-4">
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
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Job Sources
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_JOB_SOURCES.map(source => (
                      <Badge
                        key={source.name}
                        variant={selectedSources.includes(source.name) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (selectedSources.includes(source.name)) {
                            setSelectedSources(selectedSources.filter(s => s !== source.name));
                          } else {
                            setSelectedSources([...selectedSources, source.name]);
                          }
                        }}
                      >
                        {source.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  onClick={handleScrapeJobs} 
                  disabled={isScrapingJobs || !searchQuery.trim()}
                  className="w-full"
                >
                  {isScrapingJobs ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching for Jobs...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Find Jobs
                    </>
                  )}
                </Button>
                
                {/* Scraped job results */}
                {scrapedJobs.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h3 className="text-sm font-medium">Results ({scrapedJobs.length})</h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {scrapedJobs.map((job) => (
                        <div 
                          key={job.id} 
                          className="p-3 border rounded-md hover:bg-accent transition-colors cursor-pointer"
                          onClick={() => handleSelectJob(job)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{job.title}</div>
                              <div className="text-sm text-muted-foreground">{job.company}</div>
                              <div className="text-sm text-muted-foreground">{job.location}</div>
                              <div className="flex items-center mt-1 space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {job.source}
                                </Badge>
                                {job.datePosted && (
                                  <span className="text-xs text-muted-foreground">
                                    {job.datePosted}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Apply
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="job-url" className="text-sm font-medium">
                  Job URL
                </label>
                <Input
                  id="job-url"
                  placeholder="https://www.example.com/job/12345"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                  <Info className="h-3 w-3" />
                  <p>Paste the full URL of the job posting you want to apply to</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="resume" className="text-sm font-medium">
                  Resume Text
                </label>
                <Textarea
                  id="resume"
                  placeholder="Paste your resume text here..."
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  icon={<FileText className="h-4 w-4" />}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="cover-letter" className="text-sm font-medium">
                  Cover Letter (Optional)
                </label>
                <Textarea
                  id="cover-letter"
                  placeholder="Paste your cover letter here..."
                  rows={6}
                  value={coverLetterText}
                  onChange={(e) => setCoverLetterText(e.target.value)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="auto" className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="auto-job-url" className="text-sm font-medium">
                  Job URL
                </label>
                <Input
                  id="auto-job-url"
                  placeholder="https://www.example.com/job/12345"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-center py-6 border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <p className="mb-4 text-muted-foreground">
                    Auto-fill uses your saved profile information to apply to jobs without manual entry
                  </p>
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => {
                      toast.info("Profile settings will open in a new tab");
                      navigate("/profile", { state: { returnTo: "/resume-tools" } });
                    }}
                  >
                    Configure Auto-fill Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Confirmation modal for auto-apply */}
          {showConfirmation && selectedJob && (
            <div className="p-4 border rounded-md bg-muted/30">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium">Confirm Application</h4>
                  <p className="text-sm text-muted-foreground">
                    You're about to apply for <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company}</strong>. 
                    Your profile and resume will be used to fill out the application form.
                  </p>
                  <div className="flex items-center space-x-3 mt-3">
                    <Button 
                      type="button" 
                      onClick={handleAutoApply} 
                      disabled={isSubmitting}
                      size="sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-3 w-3" />
                          Confirm & Apply
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setShowConfirmation(false);
                        setSelectedJob(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          {!showConfirmation && (
            <Button 
              type="submit" 
              disabled={isSubmitting || (activeTab === "scraper" && scrapedJobs.length === 0)} 
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Preparing Application...
                </>
              ) : (
                <>
                  Apply to Job <ExternalLink className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};

export default JobApplicationAutomation;
