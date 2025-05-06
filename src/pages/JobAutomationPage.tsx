
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { ResumeJobMatchIndicator } from '@/components/ResumeJobMatchIndicator'; // Fixed import
import { Briefcase, FileText, Settings, Zap, Play, Clock, PauseCircle, AlertCircle } from 'lucide-react';

const JobAutomationPage = () => {
  const [activeTab, setActiveTab] = useState("scraper");
  const [isScraperRunning, setIsScraperRunning] = useState(false);
  const [isApplierRunning, setIsApplierRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobsFound, setJobsFound] = useState(0);
  const [jobsApplied, setJobsApplied] = useState(0);
  const [status, setStatus] = useState("idle");
  const [logs, setLogs] = useState<string[]>([]);

  // Settings states
  const [scraperSettings, setScraperSettings] = useState({
    jobTitle: "Software Engineer",
    location: "Remote",
    keywords: "React, TypeScript, JavaScript",
    sources: ["LinkedIn", "Indeed", "Glassdoor"],
    filters: {
      remote: true,
      datePosted: "past_week",
      experienceLevel: ["entry", "mid"],
    },
    maxJobs: 50,
  });

  const [applierSettings, setApplierSettings] = useState({
    minMatchPercentage: 70,
    autoTailorResume: true,
    coverLetterTemplate: "I am writing to express my interest in the {{position}} position at {{company}}...",
    followUpAfterDays: 5,
    applyTo: ["Excellent", "Good"],
    avoidKeywords: "Senior, Lead, 10+ years",
  });

  const handleStartScraper = () => {
    if (isScraperRunning) return;
    
    setIsScraperRunning(true);
    setStatus("running");
    setLogs(prev => [...prev, "Job scraper started..."]);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsScraperRunning(false);
          setStatus("complete");
          setLogs(prev => [...prev, "Job scraper completed. Found 42 matching jobs."]);
          setJobsFound(42);
          return 100;
        }
        setJobsFound(Math.floor(newProgress * 0.42));
        setLogs(prev => [...prev, `Scanning page ${Math.floor(newProgress / 10)}...`]);
        return newProgress;
      });
    }, 1000);
  };

  const handleStartAutomatedApplier = () => {
    if (isApplierRunning) return;
    
    setIsApplierRunning(true);
    setStatus("running");
    setLogs(prev => [...prev, "Automated job applier started..."]);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsApplierRunning(false);
          setStatus("complete");
          setLogs(prev => [...prev, "Job application session completed. Applied to 15 jobs."]);
          return 100;
        }
        setJobsApplied(Math.floor(newProgress * 0.15));
        setLogs(prev => [...prev, `Applied to job ${Math.floor(newProgress * 0.15)}...`]);
        return newProgress;
      });
    }, 1200);
  };

  const stopAutomation = () => {
    setIsScraperRunning(false);
    setIsApplierRunning(false);
    setStatus("paused");
    setLogs(prev => [...prev, "Automation paused."]);
  };

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Job Automation Center</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 gap-2">
          <TabsTrigger value="scraper" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Job Scraper</span>
          </TabsTrigger>
          <TabsTrigger value="applier" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Auto Applier</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="scraper">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Job Scraper</CardTitle>
                <CardDescription>Find jobs that match your profile across multiple platforms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input 
                      id="jobTitle" 
                      value={scraperSettings.jobTitle}
                      onChange={(e) => setScraperSettings({...scraperSettings, jobTitle: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      value={scraperSettings.location}
                      onChange={(e) => setScraperSettings({...scraperSettings, location: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input 
                    id="keywords" 
                    value={scraperSettings.keywords}
                    onChange={(e) => setScraperSettings({...scraperSettings, keywords: e.target.value})}
                    placeholder="React, TypeScript, Remote, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sources</Label>
                    <div className="flex flex-wrap gap-2">
                      {["LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter"].map((source) => (
                        <div key={source} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id={`source-${source}`}
                            checked={scraperSettings.sources.includes(source)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setScraperSettings({
                                  ...scraperSettings, 
                                  sources: [...scraperSettings.sources, source]
                                })
                              } else {
                                setScraperSettings({
                                  ...scraperSettings, 
                                  sources: scraperSettings.sources.filter(s => s !== source)
                                })
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor={`source-${source}`} className="text-sm">{source}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Filters</Label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="remote"
                          checked={scraperSettings.filters.remote}
                          onChange={(e) => setScraperSettings({
                            ...scraperSettings, 
                            filters: {...scraperSettings.filters, remote: e.target.checked}
                          })}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="remote" className="text-sm">Remote Only</Label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select 
                          value={scraperSettings.filters.datePosted}
                          onValueChange={(value) => setScraperSettings({
                            ...scraperSettings, 
                            filters: {...scraperSettings.filters, datePosted: value}
                          })}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Date Posted" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="past_week">Past Week</SelectItem>
                            <SelectItem value="past_month">Past Month</SelectItem>
                            <SelectItem value="anytime">Anytime</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex gap-4">
                  {!isScraperRunning ? (
                    <Button 
                      onClick={handleStartScraper} 
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Start Scraper
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopAutomation} 
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <PauseCircle className="h-4 w-4" />
                      Stop Scraper
                    </Button>
                  )}
                  
                  <Button variant="outline">Browse Results</Button>
                </div>
                
                {(isScraperRunning || status === "complete") && (
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Jobs found: {jobsFound}</span>
                      <span>Status: {status}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] rounded-md border">
                  <div className="p-4 space-y-2">
                    {logs.length > 0 ? 
                      logs.map((log, index) => (
                        <div key={index} className="text-sm pb-1 border-b last:border-0">
                          <span className="text-xs text-muted-foreground">
                            {new Date().toLocaleTimeString()}: 
                          </span>{' '}
                          {log}
                        </div>
                      ))
                      :
                      <div className="text-center text-muted-foreground py-8">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>No activity logs yet.</p>
                        <p>Start the scraper to see logs.</p>
                      </div>
                    }
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="applier">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Automated Job Applier</CardTitle>
                <CardDescription>Automatically apply to jobs that match your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minMatch">Minimum Match Percentage</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="minMatch" 
                        type="number"
                        min="0"
                        max="100"
                        value={applierSettings.minMatchPercentage}
                        onChange={(e) => setApplierSettings({
                          ...applierSettings, 
                          minMatchPercentage: parseInt(e.target.value)
                        })}
                      />
                      <span>%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Apply to Jobs Rated</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Excellent", "Good", "Fair", "Poor"].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id={`rating-${rating}`}
                            checked={applierSettings.applyTo.includes(rating)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setApplierSettings({
                                  ...applierSettings, 
                                  applyTo: [...applierSettings.applyTo, rating]
                                })
                              } else {
                                setApplierSettings({
                                  ...applierSettings, 
                                  applyTo: applierSettings.applyTo.filter(r => r !== rating)
                                })
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor={`rating-${rating}`} className="text-sm">{rating}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tailor">Auto-tailor Resume</Label>
                    <Switch 
                      id="tailor"
                      checked={applierSettings.autoTailorResume}
                      onCheckedChange={(checked) => setApplierSettings({
                        ...applierSettings, 
                        autoTailorResume: checked
                      })}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically adjust your resume to highlight relevant skills for each job
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter Template</Label>
                  <Textarea 
                    id="coverLetter"
                    value={applierSettings.coverLetterTemplate}
                    onChange={(e) => setApplierSettings({
                      ...applierSettings, 
                      coverLetterTemplate: e.target.value
                    })}
                    placeholder="Use {{position}} and {{company}} as placeholders"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {{position}}, {{company}}, and {{skills}} as placeholders
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avoid">Keywords to Avoid</Label>
                  <Input 
                    id="avoid"
                    value={applierSettings.avoidKeywords}
                    onChange={(e) => setApplierSettings({
                      ...applierSettings, 
                      avoidKeywords: e.target.value
                    })}
                    placeholder="Senior, Lead, 10+ years"
                  />
                  <p className="text-xs text-muted-foreground">
                    Skip jobs containing these keywords (comma separated)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="followUp">Follow-up After</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="followUp"
                      type="number"
                      min="0"
                      value={applierSettings.followUpAfterDays}
                      onChange={(e) => setApplierSettings({
                        ...applierSettings, 
                        followUpAfterDays: parseInt(e.target.value)
                      })}
                    />
                    <span>days</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically follow up on applications after this many days (0 to disable)
                  </p>
                </div>
                
                <div className="pt-4 flex gap-4">
                  {!isApplierRunning ? (
                    <Button 
                      onClick={handleStartAutomatedApplier} 
                      className="flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      Start Applying
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopAutomation} 
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <PauseCircle className="h-4 w-4" />
                      Stop Applying
                    </Button>
                  )}
                  
                  <Button variant="outline">View Applications</Button>
                </div>
                
                {(isApplierRunning || status === "complete") && (
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Jobs applied: {jobsApplied}</span>
                      <span>Status: {status}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Job Match</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">Current job match threshold:</p>
                  <ResumeJobMatchIndicator 
                    matchPercentage={applierSettings.minMatchPercentage} 
                    showTooltip={false}
                  />
                  <div className="mt-4 text-sm text-muted-foreground">
                    Jobs with a match score below this threshold will be skipped
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Jobs Found</span>
                    <span className="font-medium">{jobsFound}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Jobs Applied</span>
                    <span className="font-medium">{jobsApplied}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium">
                      {jobsFound > 0 ? Math.round((jobsApplied / jobsFound) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Time Saved</span>
                    <span className="font-medium">
                      {jobsApplied * 15} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Browser Automation</CardTitle>
                <CardDescription>Configure browser settings for job scraping and applying</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="headless">Run in Headless Mode</Label>
                  <Switch id="headless" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userAgent">User Agent</Label>
                  <Select defaultValue="chrome">
                    <SelectTrigger id="userAgent">
                      <SelectValue placeholder="Select user agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chrome">Chrome</SelectItem>
                      <SelectItem value="firefox">Firefox</SelectItem>
                      <SelectItem value="safari">Safari</SelectItem>
                      <SelectItem value="edge">Edge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay">Request Delay (ms)</Label>
                  <Input id="delay" type="number" defaultValue={500} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="captcha">Auto-solve Captchas</Label>
                  <Switch id="captcha" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="proxy">Use Proxy</Label>
                  <Switch id="proxy" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proxyConfig">Proxy Configuration</Label>
                  <Textarea 
                    id="proxyConfig" 
                    placeholder="host:port:username:password"
                    disabled
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Configure your job portal accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <Label>LinkedIn</Label>
                    </div>
                    <Badge variant="outline" className="text-green-500">Connected</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Connected as john.doe@example.com
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <Label>Indeed</Label>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Connect Account</Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <Label>Glassdoor</Label>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Connect Account</Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <Label>ZipRecruiter</Label>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">Not Connected</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Connect Account</Button>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Configure advanced options for job automation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="retention">Data Retention (days)</Label>
                    <Input id="retention" type="number" defaultValue={30} className="w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="concurrentRequests">Concurrent Requests</Label>
                    <Input id="concurrentRequests" type="number" defaultValue={3} className="w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoRetry">Auto-retry Failed Requests</Label>
                    <Switch id="autoRetry" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maxRetries">Max Retries</Label>
                    <Input id="maxRetries" type="number" defaultValue={3} className="w-20" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="resumeOnFailure">Resume On Failure</Label>
                    <Switch id="resumeOnFailure" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="logLevel">Log Level</Label>
                    <Select defaultValue="info">
                      <SelectTrigger id="logLevel" className="w-28">
                        <SelectValue placeholder="Log level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifyMe">Notify on Completion</Label>
                    <Switch id="notifyMe" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="exportFormat">Export Format</Label>
                    <Select defaultValue="json">
                      <SelectTrigger id="exportFormat" className="w-28">
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="md:col-span-2 pt-4">
                  <Button variant="outline" className="w-full">Reset to Defaults</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobAutomationPage;
