
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  MapPin, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Building,
  Users,
  TrendingUp
} from 'lucide-react';
import { createEnhancedJobScraper } from '@/utils/jobScraper/jobScraper';
import { ScrapedJob } from '@/components/resume/job-application/types';

interface ScrapingProgress {
  platform: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  jobsFound: number;
  progress: number;
  message: string;
}

interface EnhancedJobScraperProps {
  onJobsFound: (jobs: ScrapedJob[]) => void;
}

export const EnhancedJobScraper = ({ onJobsFound }: EnhancedJobScraperProps) => {
  const [query, setQuery] = useState('Frontend Developer');
  const [location, setLocation] = useState('Austin, TX');
  const [isRunning, setIsRunning] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>([
    'linkedin', 'indeed', 'greenhouse', 'lever'
  ]);
  const [progress, setProgress] = useState<ScrapingProgress[]>([]);
  const [allJobs, setAllJobs] = useState<ScrapedJob[]>([]);
  const [activeTab, setActiveTab] = useState('scraper');
  
  // ATS Company mappings
  const [atsCompanies, setAtsCompanies] = useState({
    greenhouse: ['airbnb', 'stripe', 'coinbase', 'notion'],
    lever: ['netflix', 'uber', 'pinterest', 'github'],
    icims: ['amazon', 'microsoft', 'google', 'meta'],
    workday: ['salesforce', 'oracle', 'adobe', 'nvidia']
  });

  const scraper = createEnhancedJobScraper();

  const initializeProgress = () => {
    const initialProgress: ScrapingProgress[] = platforms.map(platform => ({
      platform,
      status: 'pending',
      jobsFound: 0,
      progress: 0,
      message: 'Waiting to start...'
    }));
    setProgress(initialProgress);
  };

  const updateProgress = (platform: string, updates: Partial<ScrapingProgress>) => {
    setProgress(prev => prev.map(p => 
      p.platform === platform ? { ...p, ...updates } : p
    ));
  };

  const startScraping = async () => {
    if (!query.trim()) {
      toast({
        title: "Missing Query",
        description: "Please enter a job title or keywords to search for.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setAllJobs([]);
    initializeProgress();

    try {
      // Process each platform sequentially to avoid rate limiting
      for (const platform of platforms) {
        if (!isRunning) break; // Allow for cancellation

        updateProgress(platform, {
          status: 'running',
          message: `Searching ${platform}...`,
          progress: 10
        });

        try {
          // Add platform-specific delay to avoid detection
          await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

          updateProgress(platform, {
            progress: 30,
            message: `Extracting jobs from ${platform}...`
          });

          let platformJobs: ScrapedJob[] = [];

          if (platform === 'linkedin' || platform === 'indeed') {
            // Main job boards
            platformJobs = await scraper.searchJobs(query, location, [platform]);
          } else {
            // ATS systems - search across multiple companies
            const companies = atsCompanies[platform as keyof typeof atsCompanies] || [];
            const companyJobs = await Promise.all(
              companies.map(async (company) => {
                try {
                  const jobs = await scraper.searchJobs(query, location, [`${company}.${platform}.io`]);
                  return jobs.map(job => ({
                    ...job,
                    atsSystem: platform,
                    source: `${company} (${platform})`
                  }));
                } catch (error) {
                  console.error(`Error scraping ${company} on ${platform}:`, error);
                  return [];
                }
              })
            );
            platformJobs = companyJobs.flat();
          }

          updateProgress(platform, {
            progress: 80,
            message: `Verifying ${platformJobs.length} jobs...`
          });

          // Verify job availability
          const verifiedJobs = await scraper.verifyJobs(platformJobs);

          updateProgress(platform, {
            status: 'completed',
            progress: 100,
            jobsFound: verifiedJobs.length,
            message: `Found ${verifiedJobs.length} active jobs`
          });

          setAllJobs(prev => [...prev, ...verifiedJobs]);

        } catch (error) {
          console.error(`Error scraping ${platform}:`, error);
          updateProgress(platform, {
            status: 'error',
            progress: 100,
            message: `Error: ${(error as Error).message}`
          });
        }

        // Rate limiting delay between platforms
        if (platforms.indexOf(platform) < platforms.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      toast({
        title: "Scraping Complete",
        description: `Found ${allJobs.length} jobs across ${platforms.length} platforms.`,
      });

    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Scraping Failed",
        description: "An error occurred while scraping jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const stopScraping = () => {
    setIsRunning(false);
    toast({
      title: "Scraping Stopped",
      description: "Job scraping has been cancelled.",
    });
  };

  useEffect(() => {
    if (allJobs.length > 0) {
      onJobsFound(allJobs);
    }
  }, [allJobs, onJobsFound]);

  const getStatusIcon = (status: ScrapingProgress['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
      case 'running': return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const totalJobs = progress.reduce((sum, p) => sum + p.jobsFound, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Enhanced Job Scraper</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scraper">Job Scraper</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="results">Results ({totalJobs})</TabsTrigger>
            </TabsList>

            <TabsContent value="scraper" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="query">Job Title / Keywords</Label>
                  <Input
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Frontend Developer, Software Engineer"
                    disabled={isRunning}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX or Remote"
                    disabled={isRunning}
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                {!isRunning ? (
                  <Button onClick={startScraping} className="flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Start Scraping</span>
                  </Button>
                ) : (
                  <Button onClick={stopScraping} variant="destructive" className="flex items-center space-x-2">
                    <Pause className="w-4 h-4" />
                    <span>Stop Scraping</span>
                  </Button>
                )}
              </div>

              {progress.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Scraping Progress</h4>
                  {progress.map((p) => (
                    <div key={p.platform} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(p.status)}
                          <span className="font-medium capitalize">{p.platform}</span>
                          <Badge variant={p.status === 'completed' ? 'default' : 'secondary'}>
                            {p.jobsFound} jobs
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} className="h-2" />
                      <p className="text-xs text-gray-600">{p.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="platforms" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Active Platforms</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['linkedin', 'indeed', 'greenhouse', 'lever', 'icims', 'workday'].map((platform) => (
                      <div
                        key={platform}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          platforms.includes(platform)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          if (platforms.includes(platform)) {
                            setPlatforms(platforms.filter(p => p !== platform));
                          } else {
                            setPlatforms([...platforms, platform]);
                          }
                        }}
                      >
                        <div className="text-center">
                          <Building className="w-6 h-6 mx-auto mb-1" />
                          <p className="text-sm font-medium capitalize">{platform}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Rate limiting is automatically applied between platforms to avoid detection.
                    ATS systems (Greenhouse, Lever, etc.) will be scraped across multiple companies.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Jobs</p>
                        <p className="text-2xl font-bold">{totalJobs}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Verified Active</p>
                        <p className="text-2xl font-bold">{allJobs.filter(j => j.verified).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Platforms</p>
                        <p className="text-2xl font-bold">{progress.filter(p => p.jobsFound > 0).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {allJobs.length > 0 && (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {allJobs.slice(0, 10).map((job, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{job.title}</h5>
                            <p className="text-sm text-gray-600">{job.company}</p>
                            <p className="text-xs text-gray-500">{job.location}</p>
                          </div>
                          <Badge variant="outline">{job.source}</Badge>
                        </div>
                      </div>
                    ))}
                    {allJobs.length > 10 && (
                      <p className="text-center text-sm text-gray-500 py-2">
                        And {allJobs.length - 10} more jobs...
                      </p>
                    )}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
