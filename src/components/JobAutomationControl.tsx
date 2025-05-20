
import { useState } from 'react';
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
import { Loader2 } from "lucide-react";

interface JobAutomationControlProps {
  job: Job;
  isApplied: boolean;
}

export function JobAutomationControl({ job, isApplied }: JobAutomationControlProps) {
  const [showAutomationDialog, setShowAutomationDialog] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);

  const handleStartAutomation = async () => {
    setIsAutomating(true);
    
    try {
      // Check if we have automation settings saved
      const automationConfigStr = localStorage.getItem('automationConfig');
      
      if (!automationConfigStr) {
        toast("No automation settings found", {
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
      
      toast("Application automation started", {
        description: "Browser extension will handle the rest of the process",
        duration: 4000
      });
      
      // Close the dialog
      setShowAutomationDialog(false);
    } catch (error) {
      console.error("Error starting automation:", error);
      toast("Failed to start automation", {
        description: "Please try applying manually",
        duration: 4000
      });
    } finally {
      setIsAutomating(false);
    }
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
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm mb-4">
              This will use your saved resume and profile information to fill out the application form.
              You may need to verify some information before submission.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-800 text-xs">
              Note: Automation works best on standard application forms. Complex or non-standard forms may require manual intervention.
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
              disabled={isAutomating}
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
