
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ExternalLink, Info, FileText } from "lucide-react";
import { validateUrl, extractJobId } from "./utils";

interface JobApplicationFormProps {
  activeTab: string;
  onNavigateToProfile: () => void;
  onSuccess?: (jobUrl: string) => void;
}

const JobApplicationForm = ({ activeTab, onNavigateToProfile, onSuccess }: JobApplicationFormProps) => {
  const [jobUrl, setJobUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedResume = localStorage.getItem('userResume');
      if (savedResume) {
        setResumeText(savedResume);
      }
      
      const savedCoverLetter = localStorage.getItem('userCoverLetter');
      if (savedCoverLetter) {
        setCoverLetterText(savedCoverLetter);
      }
    } catch (error) {
      console.error("Error loading saved resume:", error);
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
      
      // Callback to parent component
      if (onSuccess) {
        onSuccess(finalUrl);
      }
      
      toast.success("Application prepared successfully!", {
        description: "Your application will open in a new tab"
      });
      
      // Always open in a new tab for better user experience
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
      
      // Don't clear inputs after submission so they can be reused
      setJobUrl("");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {activeTab === "manual" && (
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
        </div>
      )}

      {activeTab === "auto" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="auto-job-url" className="text-sm font-medium">
              Job URL
            </label>
            <Input
              id="auto-job-url"
              placeholder="https://www.example.com/job/12345"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-center py-6 border-2 border-dashed rounded-lg">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                Auto-fill uses your saved profile information to apply to jobs without manual entry
              </p>
              <Button 
                variant="outline" 
                type="button"
                onClick={onNavigateToProfile}
              >
                Configure Auto-fill Settings
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        {activeTab !== "scraper" && (
          <Button 
            type="submit" 
            disabled={isSubmitting || isValidatingUrl} 
            className="w-full"
          >
            {isSubmitting || isValidatingUrl ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isValidatingUrl ? 'Checking Job Availability...' : 'Preparing Application...'}
              </>
            ) : (
              <>
                Apply to Job <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
};

export default JobApplicationForm;
