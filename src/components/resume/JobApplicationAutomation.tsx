
import { useState } from "react";
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

const JobApplicationAutomation = () => {
  const [jobUrl, setJobUrl] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobUrl.trim()) {
      toast.error("Please enter a job URL");
      return;
    }
    
    if (!resumeText.trim()) {
      toast.error("Please enter your resume text");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Application submitted successfully!");
      setJobUrl("");
      setResumeText("");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Automated Job Application</CardTitle>
        <CardDescription>
          Paste a job URL and your resume to automatically apply
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
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Apply to Job"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JobApplicationAutomation;
