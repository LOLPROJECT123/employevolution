
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getParsedResumeFromProfile } from '@/utils/profileUtils';
import { enhanceJobWithMatchData } from '@/utils/jobMatching';
import { ExtendedJob } from '@/types/jobExtensions';
import { Job } from '@/types/job';

// Import components
import JobScraperPanel from '@/components/JobScraperPanel';
import AutoApplyPanel from '@/components/AutoApplyPanel';
import AutoApplyModal from '@/components/AutoApplyModal';
import ResumeJobMatchIndicator from '@/components/ResumeJobMatchIndicator';

// Mock jobs for demo purposes
import { mockJobs } from '@/data/mockJobs';

const JobAutomationPage = () => {
  const [jobs, setJobs] = useState<ExtendedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ExtendedJob | null>(null);
  const [showAutoApplyModal, setShowAutoApplyModal] = useState(false);
  const [activeTab, setActiveTab] = useState("scraper");
  
  // Load and enhance jobs with match data
  useEffect(() => {
    const loadJobs = async () => {
      try {
        // In a real implementation, this would be an API call
        // For demo, use mock data
        const resumeData = getParsedResumeFromProfile();
        const enhancedJobs = mockJobs.map(job => enhanceJobWithMatchData(job, resumeData));
        
        setJobs(enhancedJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
        toast.error('Error loading jobs');
      }
    };
    
    loadJobs();
  }, []);
  
  // Function to update job status after application
  const handleJobStatusUpdate = (jobId: string, status: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status } : job
    ));
  };
  
  // Handle auto-apply button click
  const handleAutoApply = (job: ExtendedJob) => {
    setSelectedJob(job);
    setShowAutoApplyModal(true);
  };
  
  // Handle successful application
  const handleApplySuccess = (job: Job) => {
    handleJobStatusUpdate(job.id, 'applied');
    toast.success(`Applied to ${job.title} at ${job.company}`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Job Automation Tools</h1>
        <p className="text-muted-foreground">
          Search for jobs and automate your application process
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
          <TabsTrigger value="scraper">Job Scraper</TabsTrigger>
          <TabsTrigger value="auto-apply">Auto Apply</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scraper" className="space-y-4 py-4">
          <JobScraperPanel />
        </TabsContent>
        
        <TabsContent value="auto-apply" className="space-y-4 py-4">
          <AutoApplyPanel 
            jobs={jobs}
            onJobStatusUpdate={handleJobStatusUpdate}
          />
        </TabsContent>
      </Tabs>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.slice(0, 6).map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <CardDescription>
                {job.company} • {job.location}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {job.matchPercentage !== undefined && (
                <ResumeJobMatchIndicator 
                  matchPercentage={job.matchPercentage} 
                  size="sm" 
                  className="mb-4" 
                />
              )}
              
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {job.datePosted || job.postedAt}
                </div>
                <Button 
                  size="sm" 
                  disabled={job.status === 'applied'}
                  onClick={() => handleAutoApply(job)}
                >
                  {job.status === 'applied' ? 'Applied' : 'Apply'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedJob && (
        <AutoApplyModal
          job={selectedJob}
          open={showAutoApplyModal}
          onClose={() => setShowAutoApplyModal(false)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
};

export default JobAutomationPage;
