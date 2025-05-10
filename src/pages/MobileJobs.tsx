
import { useState } from 'react';
import MobileHeader from "@/components/MobileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobAutomationPanel from "@/components/jobs/JobAutomationPanel";
import MobileJobDetail from "@/components/MobileJobDetail";
import { MobileJobList } from "@/components/MobileJobList";
import { useSwipe } from "@/hooks/use-swipe";
import { Job } from "@/types/job";

const MobileJobs = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'automation'>('browse');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  // Sample jobs or fetch from API
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  
  // Handle job selection
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setShowDetail(true);
  };
  
  // Handle going back from job detail view
  const handleBack = () => {
    setShowDetail(false);
  };
  
  // Handle saving a job
  const handleSaveJob = (job: Job) => {
    // Add or remove from saved jobs
    const jobId = job.id;
    setSavedJobIds(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId) 
        : [...prev, jobId]
    );
  };
  
  // Handle applying to a job
  const handleApplyJob = (job: Job) => {
    // Add to applied jobs if not already applied
    const jobId = job.id;
    if (!appliedJobIds.includes(jobId)) {
      setAppliedJobIds(prev => [...prev, jobId]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900/30">
      <MobileHeader title="Jobs" />
      
      <main className="flex-1 pt-16 pb-16">
        {showDetail && selectedJob ? (
          <MobileJobDetail 
            job={selectedJob}
            onBack={handleBack}
            onApply={handleApplyJob}
            onSave={handleSaveJob}
            isSaved={savedJobIds.includes(selectedJob.id)}
            isApplied={appliedJobIds.includes(selectedJob.id)}
          />
        ) : (
          <div className="container px-4 py-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'browse' | 'automation')} className="space-y-4">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
                <TabsTrigger value="automation">Job Automation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="browse" className="space-y-4">
                <MobileJobList 
                  jobs={jobs}
                  savedJobIds={savedJobIds}
                  appliedJobIds={appliedJobIds}
                  onSelect={handleJobSelect}
                  onSave={handleSaveJob}
                  onApply={handleApplyJob}
                />
              </TabsContent>
              
              <TabsContent value="automation">
                <JobAutomationPanel />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default MobileJobs;
