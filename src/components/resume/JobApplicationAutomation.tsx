
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Zap, FileCode, Settings, PlusCircle, Download, Play } from "lucide-react";
import { toast } from "sonner";
import AutomationSettings from "@/components/AutomationSettings";
import { 
  detectPlatform,
  startAutomation,
  getHandshakeAutomationScript,
  getIndeedAutomationScript
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
          Automate your job application process across multiple platforms
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
                    placeholder="https://indeed.com/job/..." 
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
                  Paste a job URL from Handshake, LinkedIn, Indeed, or Glassdoor
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
