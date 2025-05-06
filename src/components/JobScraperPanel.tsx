
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, Search, ChevronRight, Download } from "lucide-react";
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';

import { jobScraperService, JobScraperConfig, JobSource } from '@/services/jobScraper/scraperManager';
import { ExtendedJob } from '@/types/jobExtensions';
import { getParsedResumeFromProfile } from '@/utils/profileUtils';
import { enhanceJobWithMatchData } from '@/utils/jobMatching';

// Create our own hook to replace the missing useJobScraper
const useJobScraping = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState({ jobsProcessed: 0, jobsFound: 0 });
  const [results, setResults] = useState<{jobs: ExtendedJob[]} | null>(null);
  const [filters, setFilters] = useState({ keywords: [], location: '', remote: false, jobType: [] });

  const startScraping = async (config: JobScraperConfig) => {
    setIsRunning(true);
    setIsComplete(false);
    setProgress({ jobsProcessed: 0, jobsFound: 0 });

    try {
      // Simulate progress
      const totalJobs = Math.floor(Math.random() * 20) + 10;
      setProgress({ jobsProcessed: 0, jobsFound: totalJobs });
      
      for (let i = 0; i < totalJobs; i++) {
        await new Promise(resolve => setTimeout(resolve, 150));
        setProgress(prev => ({ ...prev, jobsProcessed: i + 1 }));
      }

      // Use the service to get jobs
      const jobs = await jobScraperService.searchJobs(
        config.filters.keywords.join(' '),
        config.filters.location || '',
        config.sources as JobSource[],
        config.filters
      );
      
      setResults({ jobs });
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      toast.error("Error scraping jobs");
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
};

// Create our own conversion function to replace the missing convertScrapedToJob
const convertScrapedToJob = (job: ExtendedJob): ExtendedJob => {
  return job;
};

const SUPPORTED_SOURCES: JobSource[] = [
  'LinkedIn',
  'Indeed',
  'Glassdoor',
  'ZipRecruiter',
  'AngelList',
  'Monster'
];

const JobScraperPanel = () => {
  const [jobKeywords, setJobKeywords] = useState<string>('');
  const [jobLocation, setJobLocation] = useState<string>('');
  const [selectedSources, setSelectedSources] = useState<JobSource[]>(['LinkedIn', 'Indeed']);
  const [isRemote, setIsRemote] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('configure');
  const [jobsFound, setJobsFound] = useState<ExtendedJob[]>([]);
  const [enhancedJobs, setEnhancedJobs] = useState<ExtendedJob[]>([]);
  const [matchedJobs, setMatchedJobs] = useState<boolean>(false);
  const [maxResults, setMaxResults] = useState<string>("25");

  const { filters, setFilters, progress, results, startScraping, isRunning, isComplete } = useJobScraping();

  useEffect(() => {
    // When scraping is complete, process the results
    if (isComplete && results) {
      // If match to resume is enabled, enhance jobs with match data
      if (matchedJobs) {
        const resumeData = getParsedResumeFromProfile();
        const enhanced = results.jobs.map(job => enhanceJobWithMatchData(job, resumeData));
        setEnhancedJobs(enhanced);
        
        // Sort by match percentage
        const sorted = [...enhanced].sort((a, b) => {
          return (b.matchPercentage || 0) - (a.matchPercentage || 0);
        });
        
        setJobsFound(sorted);
      } else {
        setJobsFound(results.jobs);
      }
      
      // Move to results tab
      setActiveTab('results');
      
      // Show success notification
      toast.success(`Found ${results.jobs.length} jobs matching your search`);
    }
  }, [isComplete, results, matchedJobs]);

  const handleStartScraping = async () => {
    if (!jobKeywords.trim()) {
      toast.error("Please enter job keywords");
      return;
    }
    
    if (selectedSources.length === 0) {
      toast.error("Please select at least one job source");
      return;
    }
    
    const keywords = jobKeywords.split(',').map(k => k.trim());
    
    // Update filters
    setFilters({
      keywords,
      location: jobLocation,
      remote: isRemote,
      jobType: [],
    });
    
    // Create scraper config
    const config: JobScraperConfig = {
      sources: selectedSources,
      maxJobsPerSource: parseInt(maxResults),
      filters: {
        keywords,
        location: jobLocation,
        remote: isRemote,
        jobType: [],
      },
      useProxy: false,
      excludeDuplicates: true,
    };
    
    // Start scraping
    try {
      toast.loading("Searching for jobs...");
      await startScraping(config);
    } catch (error) {
      toast.error("Error searching for jobs");
      console.error(error);
    }
  };

  const handleExportJobs = () => {
    try {
      const dataStr = JSON.stringify(jobsFound, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `job-search-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Jobs exported successfully");
    } catch (error) {
      toast.error("Failed to export jobs");
      console.error(error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Job Search Automation</CardTitle>
        <CardDescription>
          Search multiple job boards at once with keyword matching
        </CardDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="results" disabled={jobsFound.length === 0}>
              Results ({jobsFound.length})
            </TabsTrigger>
            <TabsTrigger value="saved" disabled>
              Saved Jobs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="configure" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="keywords">Job Title or Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., Frontend Developer, React, JavaScript"
                  value={jobKeywords}
                  onChange={(e) => setJobKeywords(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA or Remote"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remote" 
                  checked={isRemote} 
                  onCheckedChange={(checked) => setIsRemote(checked as boolean)}
                />
                <Label htmlFor="remote">Remote Only</Label>
              </div>
              
              <div className="grid gap-2">
                <Label>Job Sources</Label>
                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_SOURCES.map((source) => (
                    <Badge
                      key={source}
                      variant={selectedSources.includes(source) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (selectedSources.includes(source)) {
                          setSelectedSources(selectedSources.filter((s) => s !== source));
                        } else {
                          setSelectedSources([...selectedSources, source]);
                        }
                      }}
                    >
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max-results">Maximum Results</Label>
                <Select defaultValue={maxResults} onValueChange={setMaxResults}>
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
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="match-resume" 
                  checked={matchedJobs}
                  onCheckedChange={setMatchedJobs}
                />
                <Label htmlFor="match-resume">Match to my resume</Label>
              </div>
              
              <Button 
                onClick={handleStartScraping} 
                disabled={isRunning || !jobKeywords.trim() || selectedSources.length === 0}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search Jobs
                  </>
                )}
              </Button>
              
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Searching for jobs...</span>
                    <span>{progress.jobsProcessed}/{progress.jobsFound || '?'}</span>
                  </div>
                  <Progress value={progress.jobsProcessed / (progress.jobsFound || 1) * 100} />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4 mt-4">
            {jobsFound.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Found {jobsFound.length} jobs matching your search
                  </span>
                  <Button variant="outline" size="sm" onClick={handleExportJobs}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
                
                <Separator />
                
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {jobsFound.map((job) => (
                      <Card key={job.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{job.title}</CardTitle>
                              <CardDescription>
                                {job.company} • {job.location}
                              </CardDescription>
                            </div>
                            {job.matchPercentage !== undefined && (
                              <Badge className={
                                job.matchPercentage >= 80 
                                  ? "bg-green-100 text-green-800" 
                                  : job.matchPercentage >= 60
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }>
                                {job.matchPercentage}% Match
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {job.skills?.slice(0, 5).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {(job.skills?.length || 0) > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(job.skills?.length || 0) - 5} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                              {job.salary && job.salary.min > 0 && job.salary.max > 0
                                ? `$${Math.round(job.salary.min / 1000)}k - $${Math.round(job.salary.max / 1000)}k`
                                : "Salary not disclosed"}
                            </span>
                            <span>{job.datePosted}</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="w-full flex justify-between">
                            <Badge variant="outline">{job.source}</Badge>
                            <Button size="sm" asChild>
                              <a href={job.applyUrl} target="_blank" rel="noreferrer">
                                Apply
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No jobs found yet. Configure and start a search first.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved">
            <div className="text-center py-8 text-muted-foreground">
              <p>Saved jobs will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default JobScraperPanel;
