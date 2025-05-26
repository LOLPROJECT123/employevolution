import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Building, DollarSign, Clock, Star, ExternalLink, Zap, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { jobApi, JobSearchParams } from "@/services/jobApi";
import { jobDeduplicationService } from "@/services/jobDeduplicationService";
import { errorMonitoringService } from "@/services/errorMonitoringService";
import { realBrowserService } from "@/services/realJobApiService";
import { aiMatchingService } from "@/services/aiMatchingService";
import { Job } from "@/types/job";

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<JobSearchParams>({
    query: "",
    location: "",
    page: 1,
    limit: 20
  });
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [realTimeScrapingEnabled, setRealTimeScrapingEnabled] = useState(false);
  const [aiMatchingEnabled, setAiMatchingEnabled] = useState(true);

  // Mock user profile for AI matching
  const userProfile = {
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
    experience: 5,
    education: ['Computer Science'],
    preferences: {
      salaryRange: { min: 120000, max: 180000 },
      locations: ['San Francisco', 'New York', 'Remote'],
      remotePreference: 'hybrid' as const,
      jobTypes: ['full-time'],
      industries: ['technology']
    },
    workHistory: [
      {
        title: 'Software Engineer',
        company: 'Tech Corp',
        duration: 3,
        skills: ['JavaScript', 'React', 'Node.js']
      }
    ]
  };

  const searchJobs = async () => {
    if (!searchParams.query.trim()) {
      toast.error("Please enter a job title or keywords");
      return;
    }

    setLoading(true);
    
    try {
      let jobResults: Job[] = [];

      if (realTimeScrapingEnabled) {
        // Use real browser scraping
        toast.loading("Using advanced job scraping...", { duration: 2000 });
        
        const scrapingResult = await realBrowserService.searchJobs({
          query: searchParams.query,
          location: searchParams.location,
          page: searchParams.page,
          limit: searchParams.limit,
          remote: searchParams.remote,
          salary_min: searchParams.salary_min,
          salary_max: searchParams.salary_max,
          job_type: searchParams.job_type,
          experience_level: searchParams.experience_level
        });

        if (scrapingResult && scrapingResult.length > 0) {
          jobResults = scrapingResult.flatMap(result => result.jobs).map(job => ({
            ...job,
            source: 'Real-time Scraping'
          }));
          
          toast.success(`Scraped ${jobResults.length} jobs`);
        } else {
          toast.error("Real-time scraping failed, falling back to API");
          const response = await jobApi.searchJobs(searchParams);
          jobResults = response.jobs;
        }
      } else {
        // Use regular API
        const response = await jobApi.searchJobs(searchParams);
        jobResults = response.jobs;
      }
      
      // Apply deduplication
      const uniqueJobs = jobDeduplicationService.deduplicateJobs(jobResults);
      
      // Apply AI matching if enabled
      if (aiMatchingEnabled) {
        const jobsWithMatching = uniqueJobs.map(job => {
          const matchScore = aiMatchingService.calculateJobMatch(job, userProfile);
          return {
            ...job,
            matchPercentage: matchScore.overall,
            aiMatchData: matchScore
          };
        }).sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
        
        setJobs(jobsWithMatching);
        toast.success(`Found ${jobsWithMatching.length} unique jobs with AI matching`);
      } else {
        setJobs(uniqueJobs);
        toast.success(`Found ${uniqueJobs.length} unique jobs`);
      }
    } catch (error) {
      console.error("Job search failed:", error);
      errorMonitoringService.captureAPIError(error, 'job-search', {
        searchParams: JSON.stringify(searchParams)
      });
      toast.error("Failed to search jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSalaryPrediction = (job: Job) => {
    if (!aiMatchingEnabled) return null;
    
    return aiMatchingService.predictSalary(
      job.title,
      job.location,
      job.skills || [],
      5 // Default experience
    );
  };

  const saveJob = (jobId: string) => {
    setSavedJobs(prev => [...prev, jobId]);
    toast.success("Job saved successfully!");
  };

  const unsaveJob = (jobId: string) => {
    setSavedJobs(prev => prev.filter(id => id !== jobId));
    toast.success("Job removed from saved list");
  };

  const applyToJob = async (job: Job) => {
    try {
      let isAvailable = true;
      
      // Use real URL verification if available
      if (realTimeScrapingEnabled) {
        isAvailable = await realBrowserService.verifyJobAvailability(job.applyUrl);
      } else {
        isAvailable = await jobApi.checkJobAvailability(job.applyUrl);
      }
      
      if (!isAvailable) {
        toast.error("This job is no longer available");
        return;
      }

      // Open job application URL
      window.open(job.applyUrl, '_blank');
      toast.success("Opening job application page...");
    } catch (error) {
      console.error("Error applying to job:", error);
      errorMonitoringService.captureError({
        message: `Failed to apply to job: ${error.message}`,
        stack: error.stack,
        context: {
          route: window.location.pathname,
          timestamp: new Date().toISOString()
        },
        severity: 'medium',
        category: 'ui'
      });
      toast.error("Failed to open job application. Please try again.");
    }
  };

  useEffect(() => {
    searchJobs();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
      page: 1 // Reset page on new search
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Enhanced Job Search</h1>
        <p className="text-muted-foreground">
          Advanced job search with AI matching, real-time scraping, and salary predictions
        </p>
      </div>

      {/* Advanced Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="realTimeScrapingEnabled"
                checked={realTimeScrapingEnabled}
                onChange={(e) => setRealTimeScrapingEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="realTimeScrapingEnabled" className="text-sm">
                Real-time scraping (slower but more comprehensive)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="aiMatchingEnabled"
                checked={aiMatchingEnabled}
                onChange={(e) => setAiMatchingEnabled(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="aiMatchingEnabled" className="text-sm">
                AI job matching and salary predictions
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Jobs
          </CardTitle>
          <CardDescription>
            Search across multiple job boards with AI-powered matching and deduplication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title, keywords, or company"
                  name="query"
                  value={searchParams.query}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  name="location"
                  value={searchParams.location}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={searchJobs} disabled={loading} className="min-w-[120px]">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  {realTimeScrapingEnabled ? <Zap className="h-4 w-4 mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs ({savedJobs.length})</TabsTrigger>
          {aiMatchingEnabled && (
            <TabsTrigger value="top-matches">
              <Star className="h-4 w-4 mr-1" />
              Top Matches
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {jobs.map((job) => {
            const salaryPrediction = getSalaryPrediction(job);
            
            return (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        {aiMatchingEnabled && job.matchPercentage && (
                          <Badge variant={job.matchPercentage >= 80 ? "default" : job.matchPercentage >= 60 ? "secondary" : "outline"}>
                            <Star className="h-3 w-3 mr-1" />
                            {job.matchPercentage}% match
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(job.postedAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {job.salary && (
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600 mb-2">
                          <DollarSign className="h-4 w-4" />
                          {job.salary.currency}{job.salary.min.toLocaleString()} - {job.salary.currency}{job.salary.max.toLocaleString()}
                          {salaryPrediction && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Predicted: ${salaryPrediction.predictedSalary.median.toLocaleString()})
                            </span>
                          )}
                        </div>
                      )}
                      
                      {realTimeScrapingEnabled && job.source === 'Real-time Scraping' && (
                        <Badge variant="outline" className="mb-2">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Live Data
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={savedJobs.includes(job.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => savedJobs.includes(job.id) ? unsaveJob(job.id) : saveJob(job.id)}
                      >
                        {savedJobs.includes(job.id) ? "Saved" : "Save"}
                      </Button>
                      <Button size="sm" onClick={() => applyToJob(job)}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.skills?.slice(0, 5).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills && job.skills.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.skills.length - 5} more
                      </Badge>
                    )}
                  </div>
                  
                  {aiMatchingEnabled && job.aiMatchData && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <div className="text-xs text-blue-800 font-medium mb-1">AI Match Analysis:</div>
                      <div className="text-xs text-blue-700">
                        {job.aiMatchData.reasons.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Source: {job.source}</span>
                    <div className="flex gap-2">
                      {job.remote && <Badge variant="outline">Remote</Badge>}
                      <Badge variant="outline">{job.type}</Badge>
                      <Badge variant="outline">{job.level}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {jobs.length === 0 && !loading && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No jobs found. Try adjusting your search criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="saved" className="space-y-4">
          {jobs.filter(job => savedJobs.includes(job.id)).map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {/* Same job card content as above but with Remove button */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unsaveJob(job.id)}
                    >
                      Remove
                    </Button>
                    <Button size="sm" onClick={() => applyToJob(job)}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {savedJobs.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No saved jobs yet. Save jobs from the search results to see them here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {aiMatchingEnabled && (
          <TabsContent value="top-matches" className="space-y-4">
            {jobs.filter(job => (job.matchPercentage || 0) >= 70).map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow border-green-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <Badge variant="default" className="bg-green-600">
                          <Star className="h-3 w-3 mr-1" />
                          {job.matchPercentage}% match
                        </Badge>
                      </div>
                      
                      {job.aiMatchData && (
                        <div className="bg-green-50 p-3 rounded-lg mb-3">
                          <div className="text-sm font-medium text-green-800 mb-2">Why this is a great match:</div>
                          <ul className="text-sm text-green-700 space-y-1">
                            {job.aiMatchData.reasons.map((reason, index) => (
                              <li key={index}>• {reason}</li>
                            ))}
                          </ul>
                          {job.aiMatchData.suggestions.length > 0 && (
                            <div className="mt-2">
                              <div className="text-sm font-medium text-blue-800 mb-1">To improve your match:</div>
                              <ul className="text-sm text-blue-700 space-y-1">
                                {job.aiMatchData.suggestions.map((suggestion, index) => (
                                  <li key={index}>• {suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Rest of job details */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={savedJobs.includes(job.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => savedJobs.includes(job.id) ? unsaveJob(job.id) : saveJob(job.id)}
                      >
                        {savedJobs.includes(job.id) ? "Saved" : "Save"}
                      </Button>
                      <Button size="sm" onClick={() => applyToJob(job)} className="bg-green-600 hover:bg-green-700">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {jobs.filter(job => (job.matchPercentage || 0) >= 70).length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No high-match jobs found. Try broadening your search criteria or updating your profile.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Jobs;
