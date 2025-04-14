import { useState } from "react";
import { Job } from "@/types/job";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2, MonitorSmartphone, UserCheck, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

// Import auto applicator types
import { AutoApplicator, ApplicationResult } from "@/server/autoApplicator";

enum AutoApplyStatus {
  INITIALIZING = "initializing",
  DETECTING_PLATFORM = "detecting_platform",
  FILLING_FORM = "filling_form",
  CUSTOM_QUESTIONS = "custom_questions",
  SUBMITTING = "submitting",
  COMPLETED = "completed",
  PAUSED = "paused",
  FAILED = "failed"
}

interface AutoApplyModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
  onSuccess: (job: Job) => void;
}

const AutoApplyModal = ({ job, open, onClose, onSuccess }: AutoApplyModalProps) => {
  const [status, setStatus] = useState<AutoApplyStatus>(AutoApplyStatus.INITIALIZING);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ApplicationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // This would be replaced with actual profile data from your app's state/context
  const profileData = {
    personal: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "555-123-4567"
    },
    // Other profile fields would be populated from the user's profile
    education: [],
    experience: [],
    skills: [],
    resumePath: "/path/to/resume.pdf", 
    standardAnswers: {
      workAuthorization: "US Citizen",
      requireSponsorship: false,
      willingToRelocate: true,
      remotePreference: "Remote or Hybrid"
    }
  } as any; // Using 'any' here for simplicity, real implementation would use the full type

  const startAutoApply = async () => {
    if (!job.applyUrl) {
      setError("This job doesn't have an application URL");
      setStatus(AutoApplyStatus.FAILED);
      return;
    }
    
    try {
      setStatus(AutoApplyStatus.INITIALIZING);
      setProgress(10);
      
      // In a real implementation, this would communicate with your server or extension
      // For now, we'll simulate the process
      await simulateStep(AutoApplyStatus.DETECTING_PLATFORM, 30, 1000);
      
      // Simulate platform detection
      const platform = detectPlatform(job.applyUrl);
      if (!platform) {
        setError("Could not detect application platform");
        setStatus(AutoApplyStatus.FAILED);
        return;
      }
      
      await simulateStep(AutoApplyStatus.FILLING_FORM, 60, 2000);
      
      // Random chance of encountering custom questions
      if (Math.random() > 0.7) {
        setStatus(AutoApplyStatus.CUSTOM_QUESTIONS);
        setProgress(75);
        setResult({
          status: 'paused',
          reason: 'Custom questions require manual input',
          platform: platform,
          timestamp: new Date().toISOString(),
        });
        return;
      }
      
      await simulateStep(AutoApplyStatus.SUBMITTING, 90, 1000);
      
      // Simulate successful completion
      setStatus(AutoApplyStatus.COMPLETED);
      setProgress(100);
      setResult({
        status: 'completed',
        confirmation: 'Your application has been successfully submitted',
        platform: platform,
        timestamp: new Date().toISOString(),
        jobTitle: job.title,
        company: job.company,
      });
      
      // Notify parent component of successful application
      onSuccess(job);
      
      // Show success toast
      toast.success("Application Submitted Successfully", {
        description: `Your application to ${job.company} for ${job.title} has been submitted.`,
      });
      
    } catch (e) {
      setStatus(AutoApplyStatus.FAILED);
      setError(e instanceof Error ? e.message : "Application process failed");
      
      // Show error toast
      toast.error("Application Failed", {
        description: e instanceof Error ? e.message : "There was an error submitting your application.",
      });
    }
  };
  
  // Helper function to simulate steps with delays (for demonstration)
  const simulateStep = async (newStatus: AutoApplyStatus, newProgress: number, delay: number) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    setStatus(newStatus);
    setProgress(newProgress);
  };

  // Detect platform based on URL (simplified version)
  const detectPlatform = (url: string): string | null => {
    if (!url) return null;
    
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('greenhouse.io')) return 'Greenhouse';
    if (lowerUrl.includes('lever.co')) return 'Lever';
    if (lowerUrl.includes('workday')) return 'Workday';
    if (lowerUrl.includes('indeed.com')) return 'Indeed';
    if (lowerUrl.includes('linkedin.com')) return 'LinkedIn';
    
    return 'Generic';
  };
  
  // Helper function to get status text for display
  const getStatusText = () => {
    switch (status) {
      case AutoApplyStatus.INITIALIZING:
        return "Initializing automation...";
      case AutoApplyStatus.DETECTING_PLATFORM:
        return "Detecting application platform...";
      case AutoApplyStatus.FILLING_FORM:
        return "Filling application form...";
      case AutoApplyStatus.CUSTOM_QUESTIONS:
        return "Custom questions detected";
      case AutoApplyStatus.SUBMITTING:
        return "Submitting application...";
      case AutoApplyStatus.COMPLETED:
        return "Application completed!";
      case AutoApplyStatus.PAUSED:
        return "Application paused - action required";
      case AutoApplyStatus.FAILED:
        return "Application failed";
      default:
        return "Processing...";
    }
  };
  
  // Helper to check if process is in an active state
  const isProcessing = () => {
    return [
      AutoApplyStatus.INITIALIZING,
      AutoApplyStatus.DETECTING_PLATFORM,
      AutoApplyStatus.FILLING_FORM,
      AutoApplyStatus.SUBMITTING
    ].includes(status);
  };

  return (
    <Dialog open={open} onOpenChange={() => {
      if (!isProcessing()) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {status === AutoApplyStatus.COMPLETED ? "Application Submitted" : "Auto-Apply to Job"}
          </DialogTitle>
          <DialogDescription>
            {job.company} - {job.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Progress indicator */}
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-sm font-medium">{getStatusText()}</p>
              <p className="text-sm text-muted-foreground">{progress}%</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Status Information */}
          {status === AutoApplyStatus.COMPLETED && (
            <Card className="border-green-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-600">Application Submitted Successfully</h3>
                    <p className="text-sm text-muted-foreground">
                      Your application to {job.company} for {job.title} has been submitted.
                    </p>
                    {result?.confirmation && (
                      <p className="text-sm mt-2">{result.confirmation}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {status === AutoApplyStatus.PAUSED && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Action required</p>
                <p className="text-sm">
                  {result?.reason || "The application requires your input to continue."}
                  <br />
                  Click the button below to open the application in a new tab.
                </p>
              </AlertDescription>
            </Alert>
          )}
          
          {status === AutoApplyStatus.FAILED && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Application failed</p>
                <p className="text-sm">{error || "There was an error processing your application."}</p>
              </AlertDescription>
            </Alert>
          )}
          
          {status === AutoApplyStatus.INITIALIZING && (
            <div className="text-center py-6">
              <Zap className="mx-auto h-8 w-8 text-primary animate-pulse" />
              <p className="mt-2">Preparing to automate your job application</p>
              <p className="text-sm text-muted-foreground mt-1">
                This uses your saved profile information to apply
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between">
          {!isProcessing() && status !== AutoApplyStatus.COMPLETED && (
            <div className="flex-1">
              <Button 
                variant="outline"
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              
              {(status === AutoApplyStatus.FAILED || status === AutoApplyStatus.INITIALIZING) && (
                <Button 
                  onClick={startAutoApply}
                  disabled={isProcessing()}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {status === AutoApplyStatus.FAILED ? "Retry" : "Start Auto-Apply"}
                </Button>
              )}
              
              {status === AutoApplyStatus.PAUSED && job.applyUrl && (
                <Button 
                  onClick={() => {
                    window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
                    onSuccess(job);
                    onClose();
                  }}
                >
                  <MonitorSmartphone className="mr-2 h-4 w-4" />
                  Continue Manually
                </Button>
              )}
            </div>
          )}
          
          {isProcessing() && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing your application...
            </div>
          )}
          
          {status === AutoApplyStatus.COMPLETED && (
            <Button onClick={onClose}>
              <UserCheck className="mr-2 h-4 w-4" />
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AutoApplyModal;
