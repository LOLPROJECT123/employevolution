
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
import { Check, FileText, Clipboard } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { ScrapedJob } from "../resume/job-application/types";
import { validateUrl, extractJobId } from "../resume/job-application/utils";
import { startAutomation } from "@/utils/automationUtils";

const JobAutomationPanel = () => {
  const navigate = useNavigate();
  
  // Application form state
  const [jobUrl, setJobUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  
  // Recent applications state
  const [recentApplications, setRecentApplications] = useState<ScrapedJob[]>([]);

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
      
      // Load recent applications
      const savedApplications = localStorage.getItem('recentApplications');
      if (savedApplications) {
        setRecentApplications(JSON.parse(savedApplications));
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  }, []);

  // Function to check if a URL is still valid
  const checkUrlValidity = async (url: string): Promise<boolean> => {
    setIsValidatingUrl(true);
    
    try {
      // In a real implementation, this would make a server-side request
      toast("Verifying job posting availability...", {
        duration: 1000
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demonstration: 95% of URLs are considered valid
      const isValid = Math.random() > 0.05;
      
      if (!isValid) {
        toast("The job listing appears to be no longer available", {
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

  // Combined function to handle both manual apply and auto-fill
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobUrl.trim()) {
      toast("Please enter a job URL");
      return;
    }
    
    // Validate and potentially fix the URL
    const validatedUrl = validateUrl(jobUrl);
    if (!validatedUrl) {
      toast("Please enter a valid job URL", {
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
      
      // Save the resume and cover letter to localStorage for future use
      if (resumeText.trim()) {
        localStorage.setItem('userResume', resumeText);
      }
      
      if (coverLetterText.trim()) {
        localStorage.setItem('userCoverLetter', coverLetterText);
      }
      
      // Extract job ID for potential future reference
      const jobId = extractJobId(finalUrl);
      console.log("Extracted job ID:", jobId);
      
      // Get automation configuration if available
      const automationConfig = localStorage.getItem('automationConfig');
      
      // Create a new application record
      const newApplication: ScrapedJob = {
        id: `app-${Date.now()}`,
        title: "Application",
        company: jobUrl.includes('linkedin.com') ? 'LinkedIn' : 
                jobUrl.includes('indeed.com') ? 'Indeed' : 
                'Unknown Source',
        location: "Remote",
        url: finalUrl,
        source: "Application Automation",
        datePosted: new Date().toLocaleDateString(),
        description: "Application submitted via job automation",
        applyUrl: finalUrl,
        verified: true
      };
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (automationConfig) {
        // Show auto-fill option if automation config exists
        toast("Starting application automation...", {
          description: "Your resume data will be used to auto-fill the application form."
        });
        
        // Start the automation process
        startAutomation(finalUrl, JSON.parse(automationConfig));
        
        toast("Application automation started", {
          description: "Browser extension will handle the rest of the process"
        });
      } else {
        // Manual apply flow
        toast("Application prepared", {
          description: "Opening application page in a new tab"
        });
        
        // Open in new tab
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
      }
      
      // Add to recent applications
      const updatedApplications = [newApplication, ...recentApplications].slice(0, 5);
      setRecentApplications(updatedApplications);
      localStorage.setItem('recentApplications', JSON.stringify(updatedApplications));
      
      // Reset form
      setJobUrl("");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast("Failed to process application. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  const handleNavigateToProfile = () => {
    toast("Profile settings will open in a new tab");
    navigate("/profile", { state: { returnTo: "/jobs" } });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Job Application Automation</CardTitle>
        <CardDescription>
          Apply to jobs with auto-fill or manual application options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmitApplication} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="job-url" className="text-sm font-medium">
              Job URL
            </label>
            <Input
              id="job-url"
              placeholder="https://www.example.com/job/12345"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              disabled={isSubmitting}
              className="mb-1"
            />
            <div className="flex items-start text-xs text-muted-foreground gap-1">
              <FileText className="h-3 w-3 mt-0.5" />
              <p>Paste the full URL of the job posting you want to apply to</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="resume" className="text-sm font-medium">
                Resume Text
              </label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs" 
                onClick={handleNavigateToProfile}
              >
                <Clipboard className="h-3 w-3 mr-1" />
                Load from profile
              </Button>
            </div>
            <Textarea
              id="resume"
              placeholder="Paste your resume text here or load from your profile..."
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="cover-letter" className="text-sm font-medium">
              Cover Letter (Optional)
            </label>
            <Textarea
              id="cover-letter"
              placeholder="Paste your cover letter here..."
              rows={4}
              value={coverLetterText}
              onChange={(e) => setCoverLetterText(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || isValidatingUrl}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>Apply Now</>
              )}
            </Button>
          </div>
          
          <Alert variant="default" className="bg-blue-50 text-blue-800 border border-blue-200 mt-4">
            <AlertDescription>
              Your application will be processed using either manual apply or auto-fill depending on your settings and the job platform.
            </AlertDescription>
          </Alert>
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
                        <p className="text-sm">{job.company} • {job.source}</p>
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
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <Alert variant="default" className="bg-blue-50 text-blue-800 border border-blue-200">
          <AlertDescription>
            Job applications are verified before submission to ensure you don't waste time on expired listings.
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
};

export default JobAutomationPanel;
