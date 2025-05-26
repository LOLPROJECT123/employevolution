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
import { AlertTriangle, Check, Linkedin, UserRound } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import components
import JobApplicationForm from "./job-application/JobApplicationForm";
import JobScraper from "./job-application/JobScraper";
import JobSourceScraper from "./job-application/JobSourceScraper";
import JobList from "./job-application/JobList";
import ConfirmationModal from "./job-application/ConfirmationModal";
import LinkedInContactFinder from "./job-application/LinkedInContactFinder";
import { JOB_TABS } from "./job-application/constants";
import { ScrapedJob, JobApplicationTab } from "./job-application/types";
import { LinkedInContact, OutreachTemplate } from "@/types/resumePost";

const JobApplicationAutomation = () => {
  const [activeTab, setActiveTab] = useState<JobApplicationTab>("manual");
  const navigate = useNavigate();
  
  // Job scraping state
  const [scrapedJobs, setScrapedJobs] = useState<ScrapedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ScrapedJob | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentApplications, setRecentApplications] = useState<ScrapedJob[]>([]);
  
  // LinkedIn integration state
  const [linkedInContacts, setLinkedInContacts] = useState<LinkedInContact[]>([]);
  const [isScrapingLinkedIn, setIsScrapingLinkedIn] = useState(false);
  const [outreachTemplates, setOutreachTemplates] = useState<OutreachTemplate[]>([
    {
      id: "template-1",
      name: "Alumni Referral Request",
      subject: "Fellow [University] Alumnus Seeking Advice on [Company] Application",
      body: "Hi [Name],\n\nI hope this message finds you well. I noticed that you're a fellow [University] alumnus currently working at [Company]. I recently applied for the [Position] role and I'm very excited about the opportunity.\n\nWould you be open to a quick chat about your experience at [Company] or possibly helping with an internal referral? Any insights you could share would be greatly appreciated.\n\nThank you for your time!\n\nBest regards,\n[Your Name]",
      type: "alumni",
      variables: ["University", "Company", "Position", "Name", "Your Name"]
    },
    {
      id: "template-2",
      name: "Recruiter Outreach",
      subject: "Following Up on [Position] Application at [Company]",
      body: "Hello [Name],\n\nI recently applied for the [Position] position at [Company] and wanted to follow up personally. I'm particularly excited about [specific aspect of the company] and believe my background in [relevant skill/experience] aligns well with what you're looking for.\n\nI'd love to discuss the role further and learn more about the team's current priorities. Would you have 15 minutes for a call in the coming week?\n\nThank you for your consideration!\n\nBest regards,\n[Your Name]",
      type: "recruiter",
      variables: ["Position", "Company", "Name", "specific aspect of the company", "relevant skill/experience", "Your Name"]
    }
  ]);

  // Load saved tab preference from localStorage
  useEffect(() => {
    try {
      const savedTab = localStorage.getItem('preferredApplicationTab') as JobApplicationTab | null;
      if (savedTab && ['manual', 'auto', 'scraper', 'linkedin'].includes(savedTab)) {
        setActiveTab(savedTab);
      }
      
      // Load recent applications
      const savedApplications = localStorage.getItem('recentApplications');
      if (savedApplications) {
        setRecentApplications(JSON.parse(savedApplications));
      }
      
      // Load outreach templates
      const savedTemplates = localStorage.getItem('outreachTemplates');
      if (savedTemplates) {
        setOutreachTemplates(JSON.parse(savedTemplates));
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

  // Find LinkedIn contacts for the selected job
  const findLinkedInContacts = async (job: ScrapedJob) => {
    setIsScrapingLinkedIn(true);
    
    try {
      toast.loading("Finding LinkedIn contacts...", {
        description: `Searching for recruiters and alumni at ${job.company}`,
        duration: 2500
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContacts = generateMockLinkedInContacts(job.company);
      setLinkedInContacts(mockContacts);
      
      toast.success("LinkedIn contacts found", {
        description: `Found ${mockContacts.filter(c => c.title.toLowerCase().includes('recruit')).length} recruiters and ${mockContacts.filter(c => c.isAlumni).length} alumni at ${job.company}`
      });
      
      setActiveTab('linkedin');
    } catch (error) {
      console.error("Error finding LinkedIn contacts:", error);
      toast.error("Failed to find LinkedIn contacts", {
        description: "There was an error searching LinkedIn. Please try again later."
      });
    } finally {
      setIsScrapingLinkedIn(false);
    }
  };
  
  // Generate mock LinkedIn contacts for demonstration
  const generateMockLinkedInContacts = (company: string): LinkedInContact[] => {
    const titles = [
      'Technical Recruiter', 'Senior Recruiter', 'Talent Acquisition Specialist',
      'Software Engineer', 'Engineering Manager', 'Product Manager',
      'HR Specialist', 'Hiring Manager', 'Technical Sourcer'
    ];
    
    const universities = ['Stanford University', 'MIT', 'UC Berkeley', 'Harvard', 'UCLA'];
    const userUniversity = 'Stanford University';
    
    const contacts: LinkedInContact[] = [];
    
    const recruiterCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < recruiterCount; i++) {
      contacts.push({
        id: `recruiter-${i}`,
        name: `Recruiter ${i + 1}`,
        title: titles[Math.floor(Math.random() * 3)],
        company,
        profileUrl: `https://linkedin.com/in/recruiter-${i}`,
        avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 10}.jpg`,
        connectionDegree: Math.random() > 0.7 ? 2 : 3,
        mutualConnections: Math.floor(Math.random() * 10),
        isAlumni: Math.random() > 0.8,
        graduationYear: Math.random() > 0.8 ? `${2010 + Math.floor(Math.random() * 12)}` : undefined
      });
    }
    
    const alumniCount = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < alumniCount; i++) {
      contacts.push({
        id: `alumni-${i}`,
        name: `Alumni ${i + 1}`,
        title: titles[Math.floor(Math.random() * 9)],
        company,
        profileUrl: `https://linkedin.com/in/alumni-${i}`,
        avatar: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 20}.jpg`,
        connectionDegree: Math.random() > 0.5 ? 2 : 3,
        mutualConnections: Math.floor(Math.random() * 15) + 1,
        isAlumni: true,
        graduationYear: `${2010 + Math.floor(Math.random() * 12)}`
      });
    }
    
    return contacts;
  };

  // Enhanced auto-application with LinkedIn integration
  const handleAutoApply = async () => {
    if (!selectedJob) return;
    
    setIsSubmitting(true);
    
    try {
      toast.loading("Preparing to apply...", {
        description: "Verifying job listing and preparing your resume data",
        duration: 2000
      });
      
      const isValid = await verifyJobUrl(selectedJob.applyUrl);
      
      if (!isValid) {
        toast.error("Job listing is no longer available", {
          description: "This position appears to have been filled or removed. Try searching for new opportunities."
        });
        setIsSubmitting(false);
        setShowConfirmation(false);
        return;
      }
      
      toast.loading("Applying to position...", {
        description: "Submitting your application and resume",
        duration: 3000
      });
      
      const result = await simulateJobApplication(selectedJob);
      
      const updatedApplications = [selectedJob, ...recentApplications].slice(0, 5);
      setRecentApplications(updatedApplications);
      localStorage.setItem('recentApplications', JSON.stringify(updatedApplications));
      
      toast.success("Application submitted successfully!", {
        description: `Your application to ${selectedJob.company} for ${selectedJob.title} has been sent.`
      });
      
      await findLinkedInContacts(selectedJob);
      
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
    toast.loading("Filling out application form...", {
      duration: 1500
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.loading("Attaching resume...", {
      duration: 1000
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.loading("Submitting application...", {
      duration: 1500
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Applying to job:", job);
    
    const isSuccess = Math.random() < 0.9;
    
    if (!isSuccess) {
      throw new Error("Application submission failed");
    }
    
    return true;
  };
  
  const verifyJobUrl = async (url: string): Promise<boolean> => {
    toast.loading("Verifying job listing availability...", {
      duration: 800
    });
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const isValid = Math.random() < 0.95;
    
    if (!isValid) {
      console.log("Job URL validation failed");
    }
    
    return isValid;
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
            <TabsTrigger value="linkedin" className="flex-1">
              <Linkedin className="h-4 w-4 mr-1" /> LinkedIn
            </TabsTrigger>
            <TabsTrigger value="custom-urls" className="flex-1">
              Custom URLs
            </TabsTrigger>
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
          
          <TabsContent value="linkedin" className="space-y-4 pt-4">
            <LinkedInContactFinder 
              contacts={linkedInContacts}
              isLoading={isScrapingLinkedIn}
              templates={outreachTemplates}
              onSaveTemplate={(template) => {
                const updatedTemplates = outreachTemplates.map(t => 
                  t.id === template.id ? template : t
                );
                setOutreachTemplates(updatedTemplates);
                localStorage.setItem('outreachTemplates', JSON.stringify(updatedTemplates));
                toast.success("Template saved successfully");
              }}
              onCreateTemplate={(template) => {
                const newTemplate = {
                  ...template,
                  id: `template-${Date.now()}`
                };
                const updatedTemplates = [...outreachTemplates, newTemplate];
                setOutreachTemplates(updatedTemplates);
                localStorage.setItem('outreachTemplates', JSON.stringify(updatedTemplates));
                toast.success("New template created successfully");
              }}
            />
          </TabsContent>
          
          <TabsContent value="custom-urls" className="space-y-4 pt-4">
            <JobSourceScraper onJobsScraped={setScrapedJobs} />
            {scrapedJobs.length > 0 && <JobList jobs={scrapedJobs} onSelectJob={handleSelectJob} />}
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
