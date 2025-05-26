
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Building, DollarSign, Clock, Star, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { jobApi, JobSearchParams } from "@/services/jobApi";
import { jobDeduplicationService } from "@/services/jobDeduplicationService";
import { errorMonitoringService } from "@/services/errorMonitoringService";
import { realBrowserService } from "@/services/realJobApiService";
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

  const searchJobs = async () => {
    if (!searchParams.query.trim()) {
      toast.error("Please enter a job title or keywords");
      return;
    }

    setLoading(true);
    
    try {
      const response = await jobApi.searchJobs(searchParams);
      
      // Apply deduplication
      const uniqueJobs = jobDeduplicationService.deduplicateJobs(response.jobs);
      
      setJobs(uniqueJobs);
      toast.success(`Found ${uniqueJobs.length} unique jobs`);
    } catch (error) {
      console.error("Job search failed:", error);
      errorMonitoringService.captureAPIError(error, 'job-search', {
        query: searchParams.query,
        location: searchParams.location
      });
      toast.error("Failed to search jobs. Please try again.");
    } finally {
      setLoading(false);
    }
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
      // Check if job is still available
      const isAvailable = await jobApi.checkJobAvailability(job.applyUrl);
      
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
          timestamp: new Date().toISOString(),
          jobId: job.id
        },
        severity: 'medium',
        category: 'ui'
      });
      toast.error("Failed to open job application. Please try again.");
    }
  };

  useEffect(() => {
    // Auto-search on component mount with default params
    if (searchParams.query) {
      searchJobs();
    }
  }, []);

  const handleInputChange = (field: keyof JobSearchParams, value: string | number) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset page on new search
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Search</h1>
        <p className="text-muted-foreground">
          Find your next opportunity with our enhanced job search
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Jobs</CardTitle>
          <CardDescription>
            Search across multiple job boards and get deduplicated results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title, keywords, or company"
                  value={searchParams.query}
                  onChange={(e) => handleInputChange('query', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={searchParams.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={searchJobs} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs ({savedJobs.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
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
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(job.postedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1 text-sm font-medium text-green-600 mb-2">
                        <DollarSign className="h-4 w-4" />
                        {job.salary.currency}{job.salary.min.toLocaleString()} - {job.salary.currency}{job.salary.max.toLocaleString()}
                      </div>
                    )}
                    {job.matchPercentage && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{job.matchPercentage}% match</span>
                      </div>
                    )}
                    {job.aiMatchData && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <div className="text-xs text-blue-800 font-medium mb-1">AI Match Analysis:</div>
                        <div className="text-xs text-blue-700">
                          {job.aiMatchData.reasons.slice(0, 2).join(', ')}
                        </div>
                      </div>
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
                
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Source: {job.source}</span>
                  {job.remote && <Badge variant="outline">Remote</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
          
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
      </Tabs>
    </div>
  );
};

export default Jobs;
