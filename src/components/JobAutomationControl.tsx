
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Job } from "@/types/job";
import { startAutomation } from "@/utils/automationUtils";
import { Loader2, Settings, AlertCircle } from "lucide-react";
import { detectJobPlatform, checkJobUrlStatus } from "@/utils/jobUrlUtils";

interface JobAutomationControlProps {
  job: Job;
  isApplied: boolean;
}

export function JobAutomationControl({ job, isApplied }: JobAutomationControlProps) {
  const [showAutomationDialog, setShowAutomationDialog] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [jobPlatform, setJobPlatform] = useState<string | null>(null);

  // Check if automation is configured
  useEffect(() => {
    // Check if automation config is available
    const automationConfigStr = localStorage.getItem('automationConfig');
    setIsConfigured(!!automationConfigStr);
    
    // Check for extension installation
    const checkExtension = () => {
      try {
        // Send a message to the extension to check if it's installed
        window.postMessage({ type: 'CHECK_EXTENSION_INSTALLED' }, '*');
        
        // Listen for response from extension
        const handleMessage = (event: MessageEvent) => {
          if (event.data && event.data.type === 'EXTENSION_INSTALLED') {
            setIsExtensionInstalled(true);
          }
        };
        
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
      } catch (e) {
        console.error("Error checking extension:", e);
      }
    };
    
    checkExtension();
    
    // Detect job platform
    if (job.applyUrl) {
      const platform = detectJobPlatform(job.applyUrl);
      setJobPlatform(platform);
    }
  }, [job.applyUrl]);

  const handleStartAutomation = async () => {
    setIsAutomating(true);
    
    try {
      // Check if the URL is still valid
      const urlStatus = await checkJobUrlStatus(job.applyUrl || '');
      
      if (!urlStatus.valid) {
        toast.error("Job posting URL is no longer valid", {
          description: urlStatus.message || "This job posting may have been removed or has expired",
          duration: 5000
        });
        setIsAutomating(false);
        setShowAutomationDialog(false);
        return;
      }
      
      // Check if we have automation settings saved
      const automationConfigStr = localStorage.getItem('automationConfig');
      
      if (!automationConfigStr) {
        toast.error("No automation settings found", {
          description: "Please configure your automation settings first",
          duration: 5000
        });
        setIsAutomating(false);
        setShowAutomationDialog(false);
        return;
      }
      
      const automationConfig = JSON.parse(automationConfigStr);
      
      // Show toast to indicate automation is starting
      toast("Starting application automation", {
        description: `Applying to ${job.company} for ${job.title}`,
        duration: 2000
      });
      
      // Start the automation process
      startAutomation(job.applyUrl || '', automationConfig);
      
      // Show success message with platform-specific information
      const platformMessage = jobPlatform 
        ? `Automation started for ${jobPlatform}`
        : "Browser extension will handle the rest of the process";
      
      toast.success("Application automation started", {
        description: platformMessage,
        duration: 4000
      });
      
      // Close the dialog
      setShowAutomationDialog(false);
    } catch (error) {
      console.error("Error starting automation:", error);
      toast.error("Failed to start automation", {
        description: "Please try applying manually",
        duration: 4000
      });
    } finally {
      setIsAutomating(false);
    }
  };
  
  const handleConfigureAutomation = () => {
    // In a real app, this would navigate to the settings page
    // For now, we'll just show a toast
    toast.info("Opening automation settings", {
      description: "Configure your resume and application preferences",
      duration: 3000
    });
    
    // Redirect to settings page
    window.location.href = '/settings';
  };

  if (isApplied || !job.applyUrl) {
    return null; // Don't show automation option for already applied jobs or if no apply URL
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowAutomationDialog(true)} 
        className="ml-2"
      >
        Auto-Apply
      </Button>

      <Dialog open={showAutomationDialog} onOpenChange={setShowAutomationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Automatic Job Application</DialogTitle>
            <DialogDescription>
              Our browser extension will automatically fill out the application for {job.title} at {job.company}.
              {jobPlatform && (
                <span className="block mt-1 text-sm font-medium text-blue-500">
                  Platform: {jobPlatform}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {!isExtensionInstalled && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-yellow-800 text-xs">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                  <div>
                    <p className="font-semibold">Extension Not Detected</p>
                    <p className="mt-1">
                      The Streamline browser extension is required for automation. 
                      Please install it from the Chrome Web Store first.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!isConfigured && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 text-amber-800 text-xs">
                <div className="flex items-start">
                  <Settings className="h-4 w-4 mr-2 mt-0.5" />
                  <div>
                    <p className="font-semibold">Setup Required</p>
                    <p className="mt-1">
                      You need to configure your resume information and automation 
                      preferences before using Auto-Apply.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleConfigureAutomation} 
                      className="mt-2 text-xs h-7 bg-amber-100 hover:bg-amber-200"
                    >
                      Configure Settings
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-sm mb-4">
              This will use your saved resume and profile information to fill out the application form.
              You may need to verify some information before submission.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-800 text-xs">
              Note: Automation works best on standard application forms. Complex or non-standard forms may require manual intervention.
              {jobPlatform && (
                <p className="mt-2">
                  <span className="font-medium">Support level for {jobPlatform}:</span> {" "}
                  {jobPlatform === 'LinkedIn' || jobPlatform === 'Indeed' ? 'High' : 'Medium'}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAutomationDialog(false)}
              disabled={isAutomating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartAutomation}
              disabled={isAutomating || !isExtensionInstalled || !isConfigured}
            >
              {isAutomating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Auto-Apply"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
