
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, ExternalLink, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JobApplicationAutomation = () => {
  const [jobUrl, setJobUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const navigate = useNavigate();

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

      const savedTab = localStorage.getItem('preferredApplicationTab');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    } catch (error) {
      console.error("Error loading saved resume:", error);
    }
  }, []);

  const validateUrl = (url) => {
    if (!url) return false;
    
    try {
      // Try to create a URL object to validate
      new URL(url);
      return true;
    } catch (e) {
      // If it fails, check if it might be missing the protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        try {
          new URL('https://' + url);
          return 'https://' + url;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
  };

  // Extract job ID from URL if present
  const extractJobId = (url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Look for "job" or "jobs" in the path
      const jobIndex = pathParts.findIndex(part => 
        part === 'job' || part === 'jobs' || part === 'position' || part === 'posting');
      
      if (jobIndex >= 0 && jobIndex < pathParts.length - 1) {
        return pathParts[jobIndex + 1];
      }
      
      // Try to extract from query params
      const jobId = urlObj.searchParams.get('jobId') || 
                   urlObj.searchParams.get('id') || 
                   urlObj.searchParams.get('job');
      
      if (jobId) return jobId;
      
      // Last resort: just return the last part of the path
      return pathParts[pathParts.length - 1];
    } catch (e) {
      console.error("Error extracting job ID:", e);
      return null;
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Automated Job Application</CardTitle>
        <CardDescription>
          Paste a job URL and your resume to quickly apply to jobs
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="manual" className="flex-1">Manual Apply</TabsTrigger>
              <TabsTrigger value="auto" className="flex-1">Auto Fill</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4 pt-4">
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
            </TabsContent>
            
            <TabsContent value="auto" className="space-y-4 pt-4">
              <div className="flex items-center justify-center py-8 border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <p className="mb-4 text-muted-foreground">
                    Auto-fill uses your saved profile information to apply to jobs without manual entry
                  </p>
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => {
                      toast.info("Profile settings will open in a new tab");
                      navigate("/profile", { state: { returnTo: "/resume-tools" } });
                    }}
                  >
                    Configure Auto-fill Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing Application...
              </>
            ) : (
              <>
                Apply to Job <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JobApplicationAutomation;
