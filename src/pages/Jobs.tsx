
import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { Job } from "@/types/job";
import { JobDetailView } from "@/components/JobDetailView";
import { JobFiltersSection } from "@/components/JobFilters";
import { JobCard } from "@/components/JobCard";
import { useIsMobile } from "@/hooks/use-mobile";
import SwipeJobsInterface from "@/components/SwipeJobsInterface";
import { SavedAndAppliedJobs } from "@/components/SavedAndAppliedJobs";
import { toast } from "sonner";

// Create some sample jobs for testing
const sampleJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    salary: {
      min: 150000,
      max: 220000,
      currency: '$'
    },
    type: 'full-time',
    level: 'senior',
    description: 'We are looking for a Senior Software Engineer...',
    requirements: ['5+ years experience', 'React', 'Node.js'],
    postedAt: new Date().toISOString(),
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker']
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'InnovateCo',
    location: 'New York, NY',
    salary: {
      min: 130000,
      max: 180000,
      currency: '$'
    },
    type: 'full-time',
    level: 'mid',
    description: 'Seeking an experienced Product Manager...',
    requirements: ['3+ years experience', 'Agile', 'Technical background'],
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis']
  }
];

const Jobs = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(sampleJobs);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'list' | 'swipe'>(isMobile ? 'swipe' : 'list');
  const [showMyJobs, setShowMyJobs] = useState(false);

  useEffect(() => {
    setViewMode(isMobile ? 'swipe' : 'list');
  }, [isMobile]);

  // Get saved and applied jobs as Job objects (not just IDs)
  const savedJobs = jobs.filter(job => savedJobIds.includes(job.id));
  const appliedJobs = jobs.filter(job => appliedJobIds.includes(job.id));

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleSaveJob = (job: Job) => {
    if (savedJobIds.includes(job.id)) {
      setSavedJobIds(savedJobIds.filter(id => id !== job.id));
      toast.info("Job removed from saved jobs");
    } else {
      setSavedJobIds([...savedJobIds, job.id]);
      toast.success("Job saved successfully");
    }
  };

  const handleApplyJob = (job: Job) => {
    if (!appliedJobIds.includes(job.id)) {
      setAppliedJobIds([...appliedJobIds, job.id]);
      
      // For desktop: if the job has an application URL, open it in a new tab
      if (!isMobile && job.applyUrl) {
        window.open(job.applyUrl, '_blank');
        toast.success("Opening application page", {
          description: "Our Chrome extension will automatically complete the application for you."
        });
      } else {
        // If we're on mobile or no URL exists, show successful application message
        toast.success("Application submitted successfully", {
          description: `Your application to ${job.company} for ${job.title} has been submitted.`
        });
      }
      
      // If we're in swipe mode, automatically move to the next job
      if (viewMode === 'swipe') {
        const currentIndex = filteredJobs.findIndex(j => j.id === job.id);
        if (currentIndex < filteredJobs.length - 1) {
          setSelectedJob(filteredJobs[currentIndex + 1]);
        }
      }
    }
  };

  const handleSkipJob = (job: Job) => {
    // Implement additional logic if needed in the future
    // For example, marking jobs as "not interested"
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'swipe' : 'list');
  };

  const toggleMyJobs = () => {
    setShowMyJobs(!showMyJobs);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
              <JobFiltersSection />
              
              {isMobile && (
                <div className="mt-4 space-y-3">
                  <button 
                    onClick={toggleViewMode}
                    className="w-full py-2 px-4 rounded-md bg-primary text-white font-medium"
                  >
                    Switch to {viewMode === 'list' ? 'Swipe' : 'List'} View
                  </button>
                  
                  <button 
                    onClick={toggleMyJobs}
                    className="w-full py-2 px-4 rounded-md bg-secondary text-foreground font-medium border"
                  >
                    {showMyJobs ? 'Browse Jobs' : 'My Saved & Applied Jobs'}
                  </button>
                </div>
              )}
              
              {isMobile && showMyJobs ? (
                <div className="mt-6">
                  <SavedAndAppliedJobs
                    savedJobs={savedJobs}
                    appliedJobs={appliedJobs}
                    onApply={handleApplyJob}
                    onSave={handleSaveJob}
                    onSelect={handleJobSelect}
                    selectedJobId={selectedJob?.id || null}
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {!isMobile && (
                    <SavedAndAppliedJobs
                      savedJobs={savedJobs}
                      appliedJobs={appliedJobs}
                      onApply={handleApplyJob}
                      onSave={handleSaveJob}
                      onSelect={handleJobSelect}
                      selectedJobId={selectedJob?.id || null}
                    />
                  )}
                  
                  {(viewMode === 'list' || !isMobile) && (
                    <>
                      <h2 className="text-lg font-medium">Browse Jobs</h2>
                      <div className="space-y-4">
                        {filteredJobs.map(job => (
                          <JobCard 
                            key={job.id}
                            job={job}
                            onApply={handleApplyJob}
                            isSelected={selectedJob?.id === job.id}
                            isSaved={savedJobIds.includes(job.id)}
                            isApplied={appliedJobIds.includes(job.id)}
                            onClick={() => handleJobSelect(job)}
                            onSave={() => handleSaveJob(job)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-full md:w-2/3 lg:w-3/4 mt-6 md:mt-0">
              {viewMode === 'swipe' && isMobile ? (
                <SwipeJobsInterface 
                  jobs={filteredJobs}
                  onApply={handleApplyJob}
                  onSkip={handleSkipJob}
                />
              ) : (
                <JobDetailView 
                  job={selectedJob} 
                  onApply={handleApplyJob}
                  onSave={handleSaveJob}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
