
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Zap, FileCode, Settings, PlusCircle, Download, Play, Linkedin, Briefcase, Clock, X } from "lucide-react";
import { toast } from "sonner";
import AutomationSettings from "@/components/AutomationSettings";
import { 
  detectPlatform,
  startAutomation,
  getHandshakeAutomationScript,
  getIndeedAutomationScript,
  getLinkedInAutomationScript
} from '@/utils/automationUtils';
import { Badge } from "@/components/ui/badge";

const JobApplicationAutomation = () => {
  const [jobUrl, setJobUrl] = useState('');
  const [selectedTab, setSelectedTab] = useState('application');
  const [isInstalled, setIsInstalled] = useState(() => {
    try {
      // Check if browser extension is installed by looking for custom event listener
      return !!window.document.documentElement.getAttribute('data-automation-extension');
    } catch (e) {
      return false;
    }
  });
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [automationStatus, setAutomationStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [stats, setStats] = useState({
    applied: 0,
    skipped: 0,
    failed: 0,
    total: 0
  });

  // Load recent URLs from localStorage
  useEffect(() => {
    try {
      const savedUrls = localStorage.getItem('recentJobUrls');
      if (savedUrls) {
        setRecentUrls(JSON.parse(savedUrls).slice(0, 5));
      }
    } catch (e) {
      console.error("Failed to load recent URLs:", e);
    }
  }, []);

  // Save URL to recent list
  const saveToRecent = (url: string) => {
    if (!url || recentUrls.includes(url)) return;
    
    const newRecentUrls = [url, ...recentUrls].slice(0, 5);
    setRecentUrls(newRecentUrls);
    
    try {
      localStorage.setItem('recentJobUrls', JSON.stringify(newRecentUrls));
    } catch (e) {
      console.error("Failed to save recent URLs:", e);
    }
  };

  const clearJobUrl = () => {
    setJobUrl('');
  };

  const handleRunScript = () => {
    if (!jobUrl) {
      toast.error("Please enter a job URL");
      return;
    }
    
    const platform = detectPlatform(jobUrl);
    
    if (!platform) {
      toast.error("Unsupported platform", {
        description: "This URL doesn't match any supported job platform (Handshake, LinkedIn, Indeed, Glassdoor)."
      });
      return;
    }
    
    try {
      const config = localStorage.getItem('automationConfig');
      if (!config) {
        toast.error("Automation not configured", {
          description: "Please configure your automation settings first."
        });
        return;
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total + 1
      }));
      
      // Save to recent URLs
      saveToRecent(jobUrl);
      
      // Set status to running
      setAutomationStatus('running');
      
      // Trigger automation
      const automationResult = startAutomation(jobUrl, JSON.parse(config));
      
      if (automationResult) {
        toast.success("Automation started", {
          description: `Now applying to job on ${platform}.`
        });
        
        // Simulate completion after a delay (in real implementation this would be based on callback from extension)
        setTimeout(() => {
          setAutomationStatus('completed');
          setStats(prev => ({
            ...prev,
            applied: prev.applied + 1
          }));
          toast.success("Application completed", {
            description: `Successfully applied to job on ${platform}.`
          });
        }, 3000);
      } else {
        throw new Error("Failed to start automation");
      }
    } catch (error) {
      setAutomationStatus('failed');
      setStats(prev => ({
        ...prev,
        failed: prev.failed + 1
      }));
      toast.error("Automation failed", {
        description: "Failed to start automation. Please check your settings and try again."
      });
      console.error("Automation error:", error);
    }
  };

  const handleDownloadScript = () => {
    if (!jobUrl) {
      toast.error("Please enter a job URL");
      return;
    }
    
    const platform = detectPlatform(jobUrl);
    
    if (!platform) {
      toast.error("Unsupported platform", {
        description: "This URL doesn't match any supported job platform (Handshake, LinkedIn, Indeed, Glassdoor)."
      });
      return;
    }
    
    try {
      const configJson = localStorage.getItem('automationConfig');
      if (!configJson) {
        toast.error("Automation not configured", {
          description: "Please configure your automation settings first."
        });
        return;
      }
      
      // Save to recent URLs
      saveToRecent(jobUrl);
      
      const config = JSON.parse(configJson);
      
      // Generate script based on platform
      let scriptContent = '';
      let fileName = '';
      
      if (platform === 'handshake') {
        scriptContent = getHandshakeAutomationScript(config);
        fileName = 'handshake_automation.py';
      } else if (platform === 'indeed') {
        scriptContent = getIndeedAutomationScript(config);
        fileName = 'indeed_automation.py';
      } else if (platform === 'linkedin') {
        scriptContent = getLinkedInAutomationScript(config);
        fileName = 'linkedin_automation.py';
        // Replace placeholder with actual job URL
        scriptContent = scriptContent.replace('JOB_URL_PLACEHOLDER', jobUrl);
      } else {
        toast.info("Script generation not implemented", {
          description: `Automation script for ${platform} is not yet implemented.`
        });
        return;
      }
      
      // Create and download file
      const element = document.createElement('a');
      const file = new Blob([scriptContent], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = fileName;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success(`Downloaded ${fileName}`, {
        description: "Run this script with Python to automate your job applications."
      });
    } catch (error) {
      toast.error("Script download failed", {
        description: "Failed to generate the automation script. Please check your settings."
      });
      console.error("Script download error:", error);
    }
  };

  // Function to remove URL from recent list
  const removeFromRecent = (urlToRemove: string) => {
    const updatedUrls = recentUrls.filter(url => url !== urlToRemove);
    setRecentUrls(updatedUrls);
    localStorage.setItem('recentJobUrls', JSON.stringify(updatedUrls));
  };

  // Function to get platform badge color
  const getPlatformBadgeColor = (url: string) => {
    const platform = detectPlatform(url);
    switch(platform) {
      case 'linkedin': return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'indeed': return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case 'handshake': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'glassdoor': return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Job Application Automation
        </CardTitle>
        <CardDescription>
          Automate your job application process across multiple platforms including LinkedIn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="application">Application Tool</TabsTrigger>
            <TabsTrigger value="settings">Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="application" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="job-url">Job Posting URL</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input 
                    id="job-url" 
                    placeholder="https://www.linkedin.com/jobs/view/..." 
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    onClear={clearJobUrl}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleRunScript} 
                    disabled={!jobUrl || automationStatus === 'running'}
                    className="relative"
                  >
                    {automationStatus === 'running' ? (
                      <>
                        <span className="animate-pulse">Applying...</span>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Apply
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Paste a job URL from LinkedIn, Handshake, Indeed, or Glassdoor
                </p>
              </div>
              
              {/* Recent URLs */}
              {recentUrls.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Job URLs
                  </h3>
                  <div className="space-y-2">
                    {recentUrls.map((url, index) => (
                      <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md bg-background hover:bg-secondary/20 transition-colors">
                        <div className="truncate text-sm flex-grow">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getPlatformBadgeColor(url)}>
                              {detectPlatform(url) || 'Unknown'}
                            </Badge>
                            <span className="truncate">{url}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setJobUrl(url)}
                            className="h-7 px-2"
                          >
                            Use
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFromRecent(url)}
                            className="h-7 w-7 p-0 text-muted-foreground"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Application Stats */}
              {stats.total > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-300">{stats.applied}</div>
                    <div className="text-sm text-green-800 dark:text-green-300">Applied</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{stats.skipped}</div>
                    <div className="text-sm text-yellow-800 dark:text-yellow-300">Skipped</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-300">{stats.failed}</div>
                    <div className="text-sm text-red-800 dark:text-red-300">Failed</div>
                  </div>
                </div>
              )}
              
              <div className="bg-secondary/20 p-4 rounded-lg space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  Download Automation Script
                </h3>
                <p className="text-sm text-muted-foreground">
                  Generate and download a Python script to automate job applications
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadScript}
                  disabled={!jobUrl}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Script for This Job
                </Button>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-3">
                <h3 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Automation Features
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  The LinkedIn automation script includes:
                </p>
                <ul className="text-sm list-disc list-inside text-blue-600 dark:text-blue-300 pl-2 space-y-1">
                  <li>Automated login to LinkedIn</li>
                  <li>Navigation to the job posting</li>
                  <li>Multi-step form completion</li>
                  <li>Smart answering of screening questions</li>
                  <li>Resume upload (if path is configured)</li>
                </ul>
              </div>
              
              {!isInstalled && (
                <div className="bg-destructive/10 p-4 rounded-lg space-y-3">
                  <h3 className="font-medium text-destructive flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Extension Not Detected
                  </h3>
                  <p className="text-sm">
                    The browser extension for automation isn't installed. You'll need to manually run the Python scripts.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="flex items-center justify-center p-4">
              <AutomationSettings />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JobApplicationAutomation;
