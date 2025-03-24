
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Zap, FileCode, Settings, PlusCircle, Download, Play, Linkedin } from "lucide-react";
import { toast } from "sonner";
import AutomationSettings from "@/components/AutomationSettings";
import { 
  detectPlatform,
  startAutomation,
  getHandshakeAutomationScript,
  getIndeedAutomationScript,
  getLinkedInAutomationScript
} from '@/utils/automationUtils';

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

  const handleRunScript = () => {
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
      
      // Trigger automation
      startAutomation(jobUrl, JSON.parse(config));
      
      toast.success("Automation started", {
        description: `Now applying to job on ${platform}.`
      });
    } catch (error) {
      toast.error("Automation failed", {
        description: "Failed to start automation. Please check your settings and try again."
      });
      console.error("Automation error:", error);
    }
  };

  const handleDownloadScript = () => {
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
                    className="flex-grow"
                  />
                  <Button onClick={handleRunScript} disabled={!jobUrl}>
                    <Play className="mr-2 h-4 w-4" />
                    Apply
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Paste a job URL from LinkedIn, Handshake, Indeed, or Glassdoor
                </p>
              </div>
              
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
