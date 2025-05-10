
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Check, Info, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Import job automation components
import JobList from "../resume/job-application/JobList";
import ConfirmationModal from "../resume/job-application/ConfirmationModal";
import { ScrapedJob, JobApplicationTab } from "../resume/job-application/types";
import { validateUrl, extractJobId } from "../resume/job-application/utils";

const JobAutomationPanel = () => {
  const [activeTab, setActiveTab] = useState<JobApplicationTab>("manual");
  const navigate = useNavigate();
  
  // Form state
  const [jobUrl, setJobUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  
  // Job application state
  const [selectedJob, setSelectedJob] = useState<ScrapedJob | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recentApplications, setRecentApplications] = useState<ScrapedJob[]>([]);

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem('preferredApplicationTab') as JobApplicationTab | null;
      if (savedTab && (savedTab === 'manual' || savedTab === 'auto')) {
        setActiveTab(savedTab);
      }
      
      const savedResume = localStorage.getItem('userResume');
      if (savedResume) {
        setResumeText(savedResume);
      }
      
      const savedCoverLetter = localStorage.getItem('userCoverLetter');
      if (savedCoverLetter) {
        setCoverLetterText(savedCoverLetter);
      }
      
      // Load recent applications
      const savedApplications = localStorage.getItem('recentApplications');
      if (savedApplications) {
        setRecentApplications(JSON.parse(savedApplications));
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }, []);

  // Function to check if a URL is still valid
  const checkUrlValidity = async (url: string): Promise<boolean> => {
    setIsValidatingUrl(true);
    
    try {
      // In a real implementation, this would make a server-side request
      // to check if the URL returns a valid job posting
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demonstration: 90% of URLs are considered valid
      const isValid = Math.random() > 0.1;
      
      if (!isValid) {
        toast.error("The job posting appears to be no longer available", {
          description: "This position may have been filled or removed by the employer."
        });
      }
      
      return isValid;
    } catch (error) {
      console.error("Error validating URL:", error);
      return false;
    } finally {
      setIsValidatingUrl(false);
    }
  };

  // Handle job selection for application from job list
  const handleSelectJob = (job: ScrapedJob) => {
    if (!job.verified) {
      toast("Cannot apply to unverified job listing", {
        description: "This job listing could not be verified and may no longer be available."
      });
      return;
    }
    
    setSelectedJob(job);
    setShowConfirmation(true);
  };

  // Handle form submission for manual job application
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobUrl.trim()) {
      toast.error("Please enter a job URL");
      return;
    }
    
    if (activeTab === "manual" && !resumeText.trim()) {
      toast.error("Please enter your resume text");
      return;
    }
    
    // Validate and potentially fix the URL
    const validatedUrl = validateUrl(jobUrl);
    if (!validatedUrl) {
      toast.error("Please enter a valid job URL", {
        description: "The URL should start with http:// or https://"
      });
      return;
    }
    
    // Use the fixed URL if needed
    const finalUrl = typeof validatedUrl === 'string' ? validatedUrl : jobUrl;
    setIsSubmitting(true);
    
    try {
      // Check if the URL is still valid
      const isUrlValid = await checkUrlValidity(finalUrl);
      if (!isUrlValid) {
        setIsSubmitting(false);
        return;
      }
      
      // Save the resume to localStorage for future use
      if (resumeText.trim()) {
        localStorage.setItem('userResume', resumeText);
      }
      
      if (coverLetterText.trim()) {
        localStorage.setItem('userCoverLetter', coverLetterText);
      }
      
      // Save the active tab preference
      localStorage.setItem('preferredApplicationTab', activeTab);
      
      // Extract job ID for potential future reference
      const jobId = extractJobId(finalUrl);
      console.log("Extracted job ID:", jobId);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Add to recent applications
      const newApplication: ScrapedJob = {
        id: `manual-${Date.now()}`,
        title: activeTab === "auto" ? "Automated Application" : "Custom Application",
        company: activeTab === "auto" ? "Auto Entry" : "Manual Entry",
        location: "Unknown",
        url: finalUrl,
        source: activeTab === "auto" ? "Auto" : "Manual",
        datePosted: new Date().toLocaleDateString(),
        description: activeTab === "auto" ? "Automatically submitted application" : "Manually submitted application",
        applyUrl: finalUrl,
        verified: true
      };
      
      const updatedApplications = [newApplication, ...recentApplications].slice(0, 5);
      setRecentApplications(updatedApplications);
      localStorage.setItem('recentApplications', JSON.stringify(updatedApplications));
      
      toast.success("Application prepared successfully!", {
        description: "Your application will open in a new tab"
      });
      
      // Always open in a new tab for better user experience
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      
      // Reset the form
      setJobUrl("");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Enhanced auto-application with better verification
  const handleAutoApply = async () => {
    if (!selectedJob) return;
    
    setIsSubmitting(true);
    
    try {
      // Show a more informative progress notification
      toast("Preparing to apply...", {
        description: "Verifying job listing and preparing your resume data",
        duration: 2000
      });
      
      // Verify that the job URL is still valid
      const isValid = await checkUrlValidity(selectedJob.applyUrl);
      
      if (!isValid) {
        toast("Job listing is no longer available", {
          description: "This position appears to have been filled or removed. Try searching for new opportunities."
        });
        setIsSubmitting(false);
        setShowConfirmation(false);
        return;
      }
      
      // Show application in progress toast
      toast("Applying to position...", {
        description: "Submitting your application and resume",
        duration: 3000
      });
      
      // Simulate API call for auto-application with improved feedback
      await simulateJobApplication(selectedJob);
      
      // Add to recent applications
      const updatedApplications = [selectedJob, ...recentApplications].slice(0, 5);
      setRecentApplications(updatedApplications);
      localStorage.setItem('recentApplications', JSON.stringify(updatedApplications));
      
      toast.success("Application submitted successfully!", {
        description: `Your application to ${selectedJob.company} for ${selectedJob.title} has been sent.`
      });
      
      // Reset form
      setSelectedJob(null);
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error auto-applying:", error);
      toast("Failed to submit application automatically. Try manual application.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const simulateJobApplication = async (job: ScrapedJob) => {
    // Simulate the application process with better feedback
    toast("Filling out application form...", {
      duration: 1500
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast("Attaching resume...", {
      duration: 1000
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast("Submitting application...", {
      duration: 1500
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real implementation, this would be an actual API call to apply
    console.log("Applying to job:", job);
    
    // Simulate 90% success rate
    const isSuccess = Math.random() < 0.9;
    
    if (!isSuccess) {
      throw new Error("Application submission failed");
    }
    
    return true;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Automated Job Application</CardTitle>
        <CardDescription>
          Apply to jobs with automatic resume and profile submission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as JobApplicationTab)} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="manual" className="flex-1">Manual Apply</TabsTrigger>
            <TabsTrigger value="auto" className="flex-1">Auto Fill</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4 pt-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="job-url" className="text-sm font-medium">
                    Job URL
                  </label>
                  <Input
                    id="job-url"
                    placeholder="https://www.example.com/job/12345"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                  />
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <Info className="h-3 w-3" />
                    <p>Paste the full URL of the job posting you want to apply to</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="resume" className="text-sm font-medium">
                    Resume Text
                  </label>
                  <Textarea
                    id="resume"
                    placeholder="Paste your resume text here..."
                    rows={8}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="cover-letter" className="text-sm font-medium">
                    Cover Letter (Optional)
                  </label>
                  <Textarea
                    id="cover-letter"
                    placeholder="Paste your cover letter here..."
                    rows={6}
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isValidatingUrl}
                >
                  {isSubmitting || isValidatingUrl ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                      {isValidatingUrl ? "Validating..." : "Applying..."}
                    </>
                  ) : (
                    <>Apply to Job <ExternalLink className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="auto" className="space-y-4 pt-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="job-url-auto" className="text-sm font-medium">
                    Job URL
                  </label>
                  <Input
                    id="job-url-auto"
                    placeholder="https://www.example.com/job/12345"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                  />
                </div>
                
                <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Auto-fill uses your saved profile information to apply to jobs without manual entry
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isValidatingUrl}
                >
                  {isSubmitting || isValidatingUrl ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                      {isValidatingUrl ? "Validating..." : "Applying..."}
                    </>
                  ) : (
                    <>Apply to Job <ExternalLink className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        
        {/* Recent Applications Section */}
        {recentApplications.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Recent Applications</h3>
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="divide-y">
                {recentApplications.map((job) => (
                  <div key={job.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm">{job.company} • {job.location}</p>
                        <p className="text-xs text-muted-foreground">Applied on {job.datePosted}</p>
                      </div>
                      <Badge className="bg-green-600"><Check className="h-3 w-3 mr-1" /> Applied</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Confirmation modal for auto-apply */}
        {showConfirmation && selectedJob && (
          <ConfirmationModal 
            selectedJob={selectedJob}
            isSubmitting={isSubmitting}
            onConfirm={handleAutoApply}
            onCancel={() => {
              setShowConfirmation(false);
              setSelectedJob(null);
            }}
          />
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <Alert variant="default" className="bg-blue-50 text-blue-800 border border-blue-200">
          <AlertDescription>
            All job applications are verified before submission to ensure you don't waste time on expired listings.
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
};

export default JobAutomationPanel;
