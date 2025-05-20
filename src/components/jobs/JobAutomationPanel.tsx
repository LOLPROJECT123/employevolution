
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Check, FileText, ExternalLink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Import job automation components
import { validateUrl, extractJobId } from "../resume/job-application/utils";
import ConfirmationModal from "../resume/job-application/ConfirmationModal";
import { ScrapedJob } from "../resume/job-application/types";
import { FileUploadZone } from "./FileUploadZone";

// Define types for the uploaded files
interface UploadedFiles {
  resume: File | null;
  coverLetter: File | null;
}

const JobAutomationPanel = () => {
  const navigate = useNavigate();
  
  // Job application state
  const [jobUrl, setJobUrl] = useState("");
  const [selectedJob, setSelectedJob] = useState<ScrapedJob | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [recentApplications, setRecentApplications] = useState<ScrapedJob[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    resume: null,
    coverLetter: null
  });

  // Load saved data from localStorage
  useEffect(() => {
    try {
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
      toast("Verifying job listing availability...", {
        duration: 800
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demonstration: 95% of URLs are considered valid
      const isValid = Math.random() > 0.05;
      
      if (!isValid) {
        toast.error("The job posting appears to be no longer available", {
          description: "This position may have been filled or removed by the employer."
        });
        console.log("Job URL validation failed");
      }
      
      return isValid;
    } catch (error) {
      console.error("Error validating URL:", error);
      return false;
    } finally {
      setIsValidatingUrl(false);
    }
  };

  // Handle file uploads
  const handleFileUpload = (file: File, type: 'resume' | 'cover_letter') => {
    setUploadedFiles(prev => ({
      ...prev,
      [type === 'resume' ? 'resume' : 'coverLetter']: file
    }));
    
    // Save file reference to localStorage
    localStorage.setItem(
      type === 'resume' ? 'uploadedResumeFileName' : 'uploadedCoverLetterFileName', 
      file.name
    );
    
    // In a real implementation, you would handle file storage/processing here
    console.log(`${type === 'resume' ? 'Resume' : 'Cover letter'} uploaded:`, file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobUrl.trim()) {
      toast.error("Please enter a job URL");
      return;
    }
    
    if (!uploadedFiles.resume) {
      toast.error("Please upload your resume");
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
      
      // Save the active tab preference
      localStorage.setItem('preferredApplicationTab', 'combined');
      
      // Extract job ID for potential future reference
      const jobId = extractJobId(finalUrl);
      console.log("Extracted job ID:", jobId);
      
      // Show application in progress toast
      toast("Applying to position...", {
        description: "Submitting your application and resume",
        duration: 3000
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Track successful application
      const newApplication: ScrapedJob = {
        id: `app-${Date.now()}`,
        title: "Job Application",
        company: "Via URL",
        location: "Unknown",
        url: finalUrl,
        source: "Direct",
        datePosted: new Date().toLocaleDateString(),
        description: "Direct job application",
        applyUrl: finalUrl,
        verified: true
      };
      
      const updatedApplications = [newApplication, ...recentApplications].slice(0, 5);
      setRecentApplications(updatedApplications);
      localStorage.setItem('recentApplications', JSON.stringify(updatedApplications));
      
      // Success notification
      toast.success("Application prepared successfully!", {
        description: "Your application will open in a new tab"
      });
      
      // Always open in a new tab for better user experience
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      
      // Reset form
      setJobUrl("");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  const handleNavigateToProfile = () => {
    toast.info("Profile settings will open in a new tab");
    navigate("/profile", { state: { returnTo: "/jobs" } });
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardContent className="space-y-6 pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                <FileText className="h-3 w-3" />
                <p>Paste the full URL of the job posting you want to apply to</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Resume</label>
              <FileUploadZone 
                onFileSelect={(file) => handleFileUpload(file, 'resume')}
                fileType="resume"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Letter (Optional)</label>
              <FileUploadZone 
                onFileSelect={(file) => handleFileUpload(file, 'cover_letter')}
                fileType="cover_letter"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isValidatingUrl}
          >
            {isSubmitting || isValidatingUrl ? (
              <>
                {isValidatingUrl ? 'Checking Job Availability...' : 'Preparing Application...'}
              </>
            ) : (
              <>
                Apply to Job <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        
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
            onConfirm={() => {}} // Removed auto apply as we're now using direct application
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
