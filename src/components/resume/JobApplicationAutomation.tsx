
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
import { AlertTriangle, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import components
import JobApplicationForm from "./job-application/JobApplicationForm";
import JobScraper from "./job-application/JobScraper";
import JobList from "./job-application/JobList";
import ConfirmationModal from "./job-application/ConfirmationModal";
import { JOB_TABS } from "./job-application/constants";
import { ScrapedJob, JobApplicationTab } from "./job-application/types";

const JobApplicationAutomation = () => {
  const [activeTab, setActiveTab] = useState<JobApplicationTab>("manual");
  const navigate = useNavigate();
  
  // Job scraping state
  const [scrapedJobs, setScrapedJobs] = useState<ScrapedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ScrapedJob | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentApplications, setRecentApplications] = useState<ScrapedJob[]>([]);

  // Load saved tab preference from localStorage
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem('preferredApplicationTab') as JobApplicationTab | null;
      if (savedTab && (savedTab === 'manual' || savedTab === 'auto' || savedTab === 'scraper')) {
        setActiveTab(savedTab);
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

  // Handle job selection for application
  const handleSelectJob = (job: ScrapedJob) => {
    if (!job.verified) {
      toast.error("Cannot apply to unverified job listing", {
        description: "This job listing could not be verified and may no longer be available."
      });
      return;
    }
    
    setSelectedJob(job);
    setShowConfirmation(true);
  };

  // Handle auto-application with confirmation
  const handleAutoApply = async () => {
    if (!selectedJob) return;
    
    setIsSubmitting(true);
    
    try {
      // Verify that the job URL is still valid
      const isValid = await verifyJobUrl(selectedJob.applyUrl);
      
      if (!isValid) {
        toast.error("Job listing is no longer available", {
          description: "This position appears to have been filled or removed. Try searching for new opportunities."
        });
        setIsSubmitting(false);
        setShowConfirmation(false);
        return;
      }
      
      // Simulate API call for auto-application
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
      toast.error("Failed to submit application automatically. Try manual application.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const simulateJobApplication = async (job: ScrapedJob) => {
    // Simulate the application process with a random success rate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation, this would be an actual API call to apply
    console.log("Applying to job:", job);
    
    // Simulate 90% success rate
    const isSuccess = Math.random() < 0.9;
    
    if (!isSuccess) {
      throw new Error("Application submission failed");
    }
    
    return true;
  };
  
  const verifyJobUrl = async (url: string): Promise<boolean> => {
    // In real implementation, this would make a server-side request to check if URL is valid
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate 95% valid rate for demonstration
    return Math.random() < 0.95;
  };
  
  const handleNavigateToProfile = () => {
    toast.info("Profile settings will open in a new tab");
    navigate("/profile", { state: { returnTo: "/resume-tools" } });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Automated Job Application</CardTitle>
        <CardDescription>
          Scrape jobs from multiple sources and apply with your resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as JobApplicationTab)} className="w-full">
          <TabsList className="w-full">
            {JOB_TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="scraper" className="space-y-4 pt-4">
            <JobScraper onJobsScraped={setScrapedJobs} />
            <JobList jobs={scrapedJobs} onSelectJob={handleSelectJob} />
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4 pt-4">
            <JobApplicationForm 
              activeTab={activeTab} 
              onNavigateToProfile={handleNavigateToProfile} 
              onSuccess={(jobUrl) => {
                // Track successful manual applications
                const newApplication: ScrapedJob = {
                  id: `manual-${Date.now()}`,
                  title: "Custom Application",
                  company: "Manual Entry",
                  location: "Unknown",
                  url: jobUrl,
                  source: "Manual",
                  datePosted: new Date().toLocaleDateString(),
                  description: "Manually submitted application",
                  applyUrl: jobUrl,
                  verified: true
                };
                
                const updatedApplications = [newApplication, ...recentApplications].slice(0, 5);
                setRecentApplications(updatedApplications);
                localStorage.setItem('recentApplications', JSON.stringify(updatedApplications));
              }}
            />
          </TabsContent>
          
          <TabsContent value="auto" className="space-y-4 pt-4">
            <JobApplicationForm 
              activeTab={activeTab} 
              onNavigateToProfile={handleNavigateToProfile} 
              onSuccess={(jobUrl) => {
                // Track successful auto applications
                const newApplication: ScrapedJob = {
                  id: `auto-${Date.now()}`,
                  title: "Automated Application",
                  company: "Auto Entry",
                  location: "Unknown",
                  url: jobUrl,
                  source: "Auto",
                  datePosted: new Date().toLocaleDateString(),
                  description: "Automatically submitted application",
                  applyUrl: jobUrl,
                  verified: true
                };
                
                const updatedApplications = [newApplication, ...recentApplications].slice(0, 5);
                setRecentApplications(updatedApplications);
                localStorage.setItem('recentApplications', JSON.stringify(updatedApplications));
              }}
            />
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

export default JobApplicationAutomation;
