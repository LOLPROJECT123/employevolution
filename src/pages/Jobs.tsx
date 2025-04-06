
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
import AutomationSettings from "@/components/AutomationSettings";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  detectPlatform, 
  startAutomation 
} from '@/utils/automationUtils';
import JobSourcesDisplay from "@/components/JobSourcesDisplay";

const generateSampleJobs = (count: number): Job[] => {
  const jobTypes: Array<'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary' | 'volunteer' | 'other'> = 
    ['full-time', 'part-time', 'contract', 'internship', 'temporary', 'volunteer', 'other'];
  
  const levels: Array<'intern' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'manager' | 'director'> = 
    ['intern', 'entry', 'mid', 'senior', 'lead', 'executive', 'manager', 'director'];
  
  const companies = [
    'TechCorp', 'InnovateCo', 'Google', 'Amazon', 'Microsoft', 'Facebook', 'Apple', 
    'Netflix', 'Tesla', 'Twitter', 'LinkedIn', 'Uber', 'Airbnb', 'Stripe', 'Square',
    'Salesforce', 'Adobe', 'IBM', 'Oracle', 'Intel', 'Cisco', 'Dell', 'HP', 'Lenovo'
  ];
  
  const locations = [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Boston, MA', 'Austin, TX',
    'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA', 'Portland, OR',
    'Miami, FL', 'Washington, DC', 'Philadelphia, PA', 'San Diego, CA', 'Dallas, TX'
  ];
  
  const titles = [
    'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer',
    'Machine Learning Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Engineering Manager', 'QA Engineer', 'Systems Architect', 'Technical Writer', 'Database Administrator',
    'Cloud Engineer', 'Mobile Developer', 'Security Engineer', 'Network Engineer', 'UI Designer'
  ];
  
  const skills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'Redux', 'GraphQL', 'REST API',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'TensorFlow', 'PyTorch', 'Swift', 'Kotlin',
    'Angular', 'Vue.js', 'Svelte', 'Express', 'Django', 'Rails', 'Spring', 'Hadoop', 'Spark'
  ];
  
  const requirements = [
    'Experience with modern frontend frameworks', 'Strong problem-solving skills',
    'Excellent communication skills', 'Ability to work in a team environment',
    'Passion for creating quality software', 'Understanding of CI/CD workflows',
    'Experience with agile methodologies', 'Knowledge of design patterns',
    'Familiarity with version control systems', 'Experience with databases'
  ];
  
  const platforms = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com', 'joinhandshake.com'];

  return Array.from({ length: count }, (_, i) => {
    const randomSalaryMin = Math.floor(Math.random() * 15) * 10000 + 50000;
    const randomSalaryMax = randomSalaryMin + Math.floor(Math.random() * 10) * 10000;
    const randomSkills = Array.from(
      { length: Math.floor(Math.random() * 5) + 3 },
      () => skills[Math.floor(Math.random() * skills.length)]
    ).filter((item, pos, arr) => arr.indexOf(item) === pos); // Remove duplicates
    
    const randomRequirements = Array.from(
      { length: Math.floor(Math.random() * 4) + 2 },
      () => requirements[Math.floor(Math.random() * requirements.length)]
    ).filter((item, pos, arr) => arr.indexOf(item) === pos); // Remove duplicates
    
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const randomPrefix = randomLevel === 'senior' ? 'Senior ' : 
                         randomLevel === 'lead' ? 'Lead ' : 
                         randomLevel === 'manager' ? 'Manager, ' : '';
    
    return {
      id: (i + 1).toString(),
      title: `${randomPrefix}${randomTitle}`,
      company: companies[Math.floor(Math.random() * companies.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      salary: {
        min: randomSalaryMin,
        max: randomSalaryMax,
        currency: '$'
      },
      type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
      level: randomLevel,
      description: `We are looking for a talented ${randomTitle} to join our growing team. The ideal candidate will have experience with ${randomSkills.slice(0, 3).join(', ')} and a passion for building high-quality software.`,
      requirements: randomRequirements,
      postedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
      skills: randomSkills,
      applyUrl: `https://${platforms[Math.floor(Math.random() * platforms.length)]}/jobs/example${i + 1}`,
      remote: Math.random() > 0.5,
      workModel: Math.random() > 0.7 ? 'remote' : Math.random() > 0.5 ? 'hybrid' : 'onsite'
    };
  });
};

// Create 30 sample jobs
const sampleJobs: Job[] = generateSampleJobs(30);

const Jobs = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(sampleJobs);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [showAutomation, setShowAutomation] = useState(false);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'list' | 'swipe'>(isMobile ? 'swipe' : 'list');
  const [showMyJobs, setShowMyJobs] = useState(false);

  useEffect(() => {
    setViewMode(isMobile ? 'swipe' : 'list');
  }, [isMobile]);

  useEffect(() => {
    // Select the first job by default when jobs are loaded
    if (filteredJobs.length > 0 && !selectedJob) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob]);

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
      
      const canAutomate = job.applyUrl ? detectPlatform(job.applyUrl) !== null : false;
      const automationEnabled = (() => {
        try {
          const config = JSON.parse(localStorage.getItem('automationConfig') || '{}');
          return config?.credentials?.enabled || false;
        } catch (e) {
          return false;
        }
      })();
      
      if (!isMobile && job.applyUrl) {
        if (canAutomate && automationEnabled) {
          setShowAutomation(true);
          toast.success("Automation Available", {
            description: "You can use the automation tools to apply to this job automatically."
          });
        } else {
          window.open(job.applyUrl, '_blank');
          toast.success("Opening application page", {
            description: "The application page has been opened in a new tab."
          });
        }
      } else {
        toast.success("Application submitted successfully", {
          description: `Your application to ${job.company} for ${job.title} has been submitted.`
        });
      }
      
      if (viewMode === 'swipe') {
        const currentIndex = filteredJobs.findIndex(j => j.id === job.id);
        if (currentIndex < filteredJobs.length - 1) {
          setSelectedJob(filteredJobs[currentIndex + 1]);
        }
      }
    }
  };

  const handleAutomatedApply = (job: Job) => {
    try {
      if (!job.applyUrl) {
        toast.error("Cannot automate application", {
          description: "This job doesn't have an application URL."
        });
        return;
      }
      
      const automationConfig = localStorage.getItem('automationConfig');
      if (!automationConfig) {
        toast.error("Automation not configured", {
          description: "Please configure your automation settings first."
        });
        return;
      }
      
      const config = JSON.parse(automationConfig);
      
      startAutomation(job.applyUrl, config);
      
      const platform = detectPlatform(job.applyUrl);
      
      toast.success("Automation initiated", {
        description: `The automation script will now apply to this job on ${platform || 'the job platform'}. Please check the browser extension for details.`
      });
    } catch (error) {
      toast.error("Automation failed", {
        description: "There was an error starting the automation process."
      });
      console.error("Automation error:", error);
    }
  };

  const handleSkipJob = (job: Job) => {
    // Implementation for skipping a job - currently just placeholder
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'swipe' : 'list');
  };

  const toggleMyJobs = () => {
    setShowMyJobs(!showMyJobs);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900/30">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Find Your Next Opportunity
            </h1>
            <div className="hidden md:block">
              <AutomationSettings />
            </div>
          </div>
          
          <div className="w-full mb-6">
            <JobSourcesDisplay />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="font-semibold text-lg">Filter Jobs</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Narrow down your search</p>
                </div>
                <div className="p-4">
                  <JobFiltersSection />
                </div>
              </div>
              
              {isMobile && (
                <div className="space-y-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                  <button 
                    onClick={toggleViewMode}
                    className="w-full py-2.5 px-4 rounded-lg bg-primary text-white font-medium"
                  >
                    Switch to {viewMode === 'list' ? 'Swipe' : 'List'} View
                  </button>
                  
                  <button 
                    onClick={toggleMyJobs}
                    className="w-full py-2.5 px-4 rounded-lg bg-secondary text-foreground font-medium border"
                  >
                    {showMyJobs ? 'Browse Jobs' : 'My Saved & Applied Jobs'}
                  </button>
                  
                  <div className="mt-2">
                    <AutomationSettings />
                  </div>
                </div>
              )}
              
              {isMobile && showMyJobs ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold text-lg">My Jobs</h2>
                  </div>
                  <div className="p-4">
                    <SavedAndAppliedJobs
                      savedJobs={savedJobs}
                      appliedJobs={appliedJobs}
                      onApply={handleApplyJob}
                      onSave={handleSaveJob}
                      onSelect={handleJobSelect}
                      selectedJobId={selectedJob?.id || null}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {!isMobile && (
                    <>
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="font-semibold text-lg">My Jobs</h2>
                      </div>
                      <div className="p-4">
                        <SavedAndAppliedJobs
                          savedJobs={savedJobs}
                          appliedJobs={appliedJobs}
                          onApply={handleApplyJob}
                          onSave={handleSaveJob}
                          onSelect={handleJobSelect}
                          selectedJobId={selectedJob?.id || null}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="lg:col-span-9 space-y-6">
              {(viewMode === 'list' || !isMobile) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold text-lg">Browse Jobs</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{filteredJobs.length} opportunities found</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-transparent">
                        <option>Sort by: Relevance</option>
                        <option>Date: Newest first</option>
                        <option>Salary: Highest first</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
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
                </div>
              )}
            
              {viewMode === 'swipe' && isMobile ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-4">
                  <SwipeJobsInterface 
                    jobs={filteredJobs}
                    onApply={handleApplyJob}
                    onSkip={handleSkipJob}
                  />
                </div>
              ) : (
                <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="font-semibold text-lg">Job Details</h2>
                  </div>
                  <div className="p-0">
                    <JobDetailView 
                      job={selectedJob} 
                      onApply={handleApplyJob}
                      onSave={handleSaveJob}
                    />
                  </div>
                </div>
              )}
              
              {showAutomation && selectedJob && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800 overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Automated Application
                    </h3>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAutomation(false)}
                    >
                      Close
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm mb-3 text-blue-600 dark:text-blue-400">
                      Use automation to apply to this job at {selectedJob.company} automatically.
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleAutomatedApply(selectedJob)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Run Automation Script
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedJob.applyUrl, '_blank')}
                      >
                        Apply Manually
                      </Button>
                      
                      <div className="ml-auto">
                        <AutomationSettings />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
