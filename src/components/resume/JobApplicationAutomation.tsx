
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

// Import new components
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

  // Load saved tab preference from localStorage
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem('preferredApplicationTab') as JobApplicationTab | null;
      if (savedTab && (savedTab === 'manual' || savedTab === 'auto' || savedTab === 'scraper')) {
        setActiveTab(savedTab);
      }
    } catch (error) {
      console.error("Error loading tab preference:", error);
    }
  }, []);

  // Handle job selection for application
  const handleSelectJob = (job: ScrapedJob) => {
    setSelectedJob(job);
    setShowConfirmation(true);
  };

  // Handle auto-application with confirmation
  const handleAutoApply = async () => {
    if (!selectedJob) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call for auto-application
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
            />
          </TabsContent>
          
          <TabsContent value="auto" className="space-y-4 pt-4">
            <JobApplicationForm 
              activeTab={activeTab} 
              onNavigateToProfile={handleNavigateToProfile} 
            />
          </TabsContent>
        </Tabs>
        
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
      
      <CardFooter>
        {/* Footer is handled in individual components */}
      </CardFooter>
    </Card>
  );
};

export default JobApplicationAutomation;
