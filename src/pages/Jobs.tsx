import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { Job } from "@/types/job";
import { JobDetailView } from "@/components/JobDetailView";
import { JobFiltersSection as JobFilters } from "@/components/JobFilters";
import { JobCard } from "@/components/JobCard";
import { useIsMobile } from "@/hooks/use-mobile";
import SwipeJobsInterface from "@/components/SwipeJobsInterface";
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
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'list' | 'swipe'>(isMobile ? 'swipe' : 'list');

  useEffect(() => {
    setViewMode(isMobile ? 'swipe' : 'list');
  }, [isMobile]);

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleSaveJob = (job: Job) => {
    if (savedJobs.includes(job.id)) {
      setSavedJobs(savedJobs.filter(id => id !== job.id));
      toast.info("Job removed from saved jobs");
    } else {
      setSavedJobs([...savedJobs, job.id]);
      toast.success("Job saved successfully");
    }
  };

  const handleApplyJob = (job: Job) => {
    if (!appliedJobs.includes(job.id)) {
      setAppliedJobs([...appliedJobs, job.id]);
      
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
    // You could implement additional logic here if needed
    // For example, marking jobs as "not interested"
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'swipe' : 'list');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
              <JobFilters />
              
              {isMobile && (
                <div className="mt-4">
                  <button 
                    onClick={toggleViewMode}
                    className="w-full py-2 px-4 rounded-md bg-primary text-white font-medium"
                  >
                    Switch to {viewMode === 'list' ? 'Swipe' : 'List'} View
                  </button>
                </div>
              )}
              
              {(viewMode === 'list' || !isMobile) && (
                <div className="mt-6 space-y-4">
                  {filteredJobs.map(job => (
                    <JobCard 
                      key={job.id}
                      job={job}
                      onApply={handleApplyJob}
                      isSelected={selectedJob?.id === job.id}
                      isSaved={savedJobs.includes(job.id)}
                      isApplied={appliedJobs.includes(job.id)}
                      onClick={() => handleJobSelect(job)}
                      onSave={() => handleSaveJob(job)}
                    />
                  ))}
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
