
import { useState, useEffect } from "react";
import { Job } from "@/types/job";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2, MonitorSmartphone, UserCheck, Zap, FileText, Edit } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Import auto applicator types
import { AutoApplicator, ApplicationResult, UserProfileData, generateCoverLetter } from "@/server/autoApplicator";

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
  const [activeTab, setActiveTab] = useState<string>("auto-apply");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  
  // This would be replaced with actual profile data from your app's state/context
  const profileData: UserProfileData = {
    personal: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "555-123-4567"
    },
    education: [{
      institution: "University of Technology",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2018-09",
      endDate: "2022-05",
      gpa: "3.8"
    }],
    experience: [{
      company: "Tech Solutions Inc",
      title: "Software Engineer",
      startDate: "2022-06",
      endDate: "Present",
      description: [
        "Developed full-stack web applications using React and Node.js",
        "Improved system performance by 30% through code optimization",
        "Collaborated with cross-functional teams to deliver features on schedule"
      ]
    }],
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "SQL", "Git"],
    resumePath: "/path/to/resume.pdf", 
    standardAnswers: {
      workAuthorization: "US Citizen",
      requireSponsorship: false,
      willingToRelocate: true,
      remotePreference: "Remote or Hybrid"
    }
  };

  // Generate cover letter when the modal opens
  useEffect(() => {
    if (open && job && activeTab === "cover-letter" && !coverLetter && !isGeneratingCoverLetter) {
      handleGenerateCoverLetter();
    }
  }, [open, job, activeTab]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "cover-letter" && !coverLetter && !isGeneratingCoverLetter) {
      handleGenerateCoverLetter();
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!job) return;
    
    setIsGeneratingCoverLetter(true);
    
    try {
      // In a real implementation, this would use the job description
      // For demo purposes, we'll create a simple job description from our job object
      const jobDescription = `
        ${job.title} at ${job.company}
        ${job.description}
        Required skills: ${job.skills?.join(', ')}
      `;
      
      const generatedLetter = await generateCoverLetter(jobDescription, profileData);
      setCoverLetter(generatedLetter);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      toast.error("Failed to generate cover letter", {
        description: "Please try again or write one manually."
      });
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const startAutoApply = async () => {
    if (!job.applyUrl) {
      setError("This job doesn't have an application URL");
      setStatus(AutoApplyStatus.FAILED);
      return;
    }
    
    try {
      setStatus(AutoApplyStatus.INITIALIZING);
      setProgress(10);
      
      // Create auto applicator instance
      const autoApplicator = new AutoApplicator(profileData, {
        customQuestionStrategy: 'PAUSE_FOR_USER',
        requireFinalReview: true
      });
      
      // Start application process, update status and progress
      setStatus(AutoApplyStatus.DETECTING_PLATFORM);
      setProgress(30);
      
      // In a real implementation, this would communicate with your extension/server
      // For now, we'll simulate the process
      const applicationResult = await autoApplicator.applyToJob(job);
      
      // Handle result based on status
      if (applicationResult.status === 'completed') {
        setStatus(AutoApplyStatus.COMPLETED);
        setProgress(100);
        setResult(applicationResult);
        
        // Notify parent component of successful application
        onSuccess(job);
        
        // Show success toast
        toast.success("Application Submitted Successfully", {
          description: `Your application to ${job.company} for ${job.title} has been submitted.`,
        });
      } 
      else if (applicationResult.status === 'paused') {
        setStatus(AutoApplyStatus.PAUSED);
        setProgress(75);
        setResult(applicationResult);
      }
      else {
        setStatus(AutoApplyStatus.FAILED);
        setError(applicationResult.reason || "Unknown error");
        
        // Show error toast
        toast.error("Application Failed", {
          description: applicationResult.reason || "There was an error submitting your application.",
        });
      }
      
    } catch (e) {
      setStatus(AutoApplyStatus.FAILED);
      setError(e instanceof Error ? e.message : "Application process failed");
      
      // Show error toast
      toast.error("Application Failed", {
        description: e instanceof Error ? e.message : "There was an error submitting your application.",
      });
    }
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {status === AutoApplyStatus.COMPLETED ? "Application Submitted" : "Apply to Job"}
          </DialogTitle>
          <DialogDescription>
            {job.company} - {job.title}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="auto-apply">Auto-Apply</TabsTrigger>
            <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
          </TabsList>
          
          <TabsContent value="auto-apply" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="cover-letter" className="space-y-4">
            {isGeneratingCoverLetter ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2">Generating cover letter...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Using AI to create a personalized letter for this position
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-medium">Customized Cover Letter</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerateCoverLetter}
                    disabled={isGeneratingCoverLetter}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
                
                <Textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Your cover letter will appear here..."
                  className="min-h-[300px] font-mono text-sm"
                />
                
                <p className="text-xs text-muted-foreground">
                  This AI-generated letter is based on your profile and the job description. 
                  Feel free to edit it before submitting your application.
                </p>
              </>
            )}
          </TabsContent>
        </Tabs>
        
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
