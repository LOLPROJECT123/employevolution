import { useState, useEffect, useRef } from 'react';
import { Job, JobFilters } from "@/types/job";
import { MobileJobCard } from "@/components/MobileJobCard";
import { MobileJobDetail } from "@/components/MobileJobDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileJobFilters } from "@/components/MobileJobFilters";
import { SavedAndAppliedJobs } from "@/components/SavedAndAppliedJobs";
import { ScrollArea } from "@/components/ui/scroll-area";
import MobileHeader from "@/components/MobileHeader";
import { 
  Drawer,
  DrawerContent,
  DrawerTrigger
} from "@/components/ui/drawer";
import { 
  Search,
  X,
  BookmarkIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function MobileJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailView, setShowDetailView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [toastShown, setToastShown] = useState(false);
  const [activeFilters, setActiveFilters] = useState<JobFilters>({
    search: "",
    location: "",
    jobType: [],
    remote: false,
    experienceLevels: [],
    education: [],
    salaryRange: [0, 300000],
    skills: [],
    companyTypes: [],
    companySize: [],
    benefits: [],
    seasons: [],
    leadership: 'no-preference',
    securityClearance: 'allow',
    sponsorH1B: false,
    simpleApplications: false,
    hideAppliedJobs: false
  });

  // Use ref to track if the toast was already shown for the current search
  const lastFilterRef = useRef<string>("");

  useEffect(() => {
    const fetchJobs = async () => {
      const generateSampleJobs = (count: number): Job[] => {
        const jobTypes: Array<'full-time' | 'part-time' | 'contract' | 'internship'> = 
          ['full-time', 'part-time', 'contract', 'internship'];
        
        const levels: Array<'intern' | 'entry' | 'mid' | 'senior' | 'executive'> = 
          ['intern', 'entry', 'mid', 'senior', 'executive'];
        
        const companies = [
          'TechCorp', 'InnovateCo', 'Google', 'Amazon', 'Microsoft', 'Facebook', 'Apple', 
          'Netflix', 'Tesla', 'Twitter', 'LinkedIn', 'Uber', 'Airbnb', 'Stripe', 'Square'
        ];
        
        const locations = [
          'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Boston, MA', 'Austin, TX',
          'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA', 'Portland, OR'
        ];
        
        const titles = [
          'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer',
          'Machine Learning Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
          'Engineering Manager'
        ];
        
        const skills = [
          'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go',
          'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'
        ];
        
        const requirements = [
          'Experience with modern frontend frameworks', 'Strong problem-solving skills',
          'Excellent communication skills', 'Ability to work in a team environment',
          'Passion for creating quality software', 'Understanding of CI/CD workflows'
        ];
        
        const platforms = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com', 'joinhandshake.com'];
        
        const benefits = [
          'Health Insurance', 'Dental Insurance', 'Vision Insurance', 'Life Insurance',
          '401(k) Retirement Plan', 'Wellness Program', 'Paid Vacation'
        ];
        
        const responsibilities = [
          'Develop and maintain software applications',
          'Collaborate with cross-functional teams',
          'Participate in code reviews',
          'Write clean, efficient, and well-documented code',
          'Troubleshoot and debug issues'
        ];

        return Array.from({ length: count }, (_, i) => {
          const randomSalaryMin = Math.floor(Math.random() * 15) * 10000 + 50000;
          const randomSalaryMax = randomSalaryMin + Math.floor(Math.random() * 10) * 10000;
          const randomSkills = Array.from(
            { length: Math.floor(Math.random() * 5) + 3 },
            () => skills[Math.floor(Math.random() * skills.length)]
          ).filter((item, pos, arr) => arr.indexOf(item) === pos);
          
          const randomRequirements = Array.from(
            { length: Math.floor(Math.random() * 4) + 2 },
            () => requirements[Math.floor(Math.random() * requirements.length)]
          ).filter((item, pos, arr) => arr.indexOf(item) === pos);
          
          const randomResponsibilities = Array.from(
            { length: Math.floor(Math.random() * 4) + 2 },
            () => responsibilities[Math.floor(Math.random() * responsibilities.length)]
          ).filter((item, pos, arr) => arr.indexOf(item) === pos);
          
          const randomBenefits = Array.from(
            { length: Math.floor(Math.random() * 4) + 3 },
            () => benefits[Math.floor(Math.random() * benefits.length)]
          ).filter((item, pos, arr) => arr.indexOf(item) === pos);
          
          const randomTitle = titles[Math.floor(Math.random() * titles.length)];
          const randomType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
          const randomLevel = levels[Math.floor(Math.random() * levels.length)];
          const randomPrefix = randomLevel === 'senior' ? 'Senior ' : 
                              randomLevel === 'executive' ? 'Lead ' : '';
          const randomRemote = Math.random() > 0.5;
          const randomWorkModel = randomRemote ? 'remote' : Math.random() > 0.5 ? 'hybrid' : 'onsite';
          const randomCompany = companies[Math.floor(Math.random() * companies.length)];
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          const randomMatchPercentage = Math.floor(Math.random() * 31) + 70; // 70-100%
          
          return {
            id: (i + 1).toString(),
            title: `${randomPrefix}${randomTitle}`,
            company: randomCompany,
            location: randomLocation,
            salary: {
              min: randomLevel === 'intern' ? 20 : randomSalaryMin,
              max: randomLevel === 'intern' ? 30 : randomSalaryMax,
              currency: '$'
            },
            type: randomType,
            level: randomLevel,
            description: `We are looking for a talented ${randomTitle} to join our growing team. The ideal candidate will have experience with ${randomSkills.slice(0, 3).join(', ')} and a passion for building high-quality software.`,
            requirements: randomRequirements,
            postedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
            skills: randomSkills,
            applyUrl: `https://${platforms[Math.floor(Math.random() * platforms.length)]}/jobs/example${i + 1}`,
            source: platforms[Math.floor(Math.random() * platforms.length)],
            remote: randomRemote,
            workModel: randomWorkModel,
            responsibilities: randomResponsibilities,
            benefits: randomBenefits,
            matchPercentage: randomMatchPercentage,
            matchCriteria: {
              degree: Math.random() > 0.5,
              experience: Math.random() > 0.5,
              skills: Math.random() > 0.5,
              location: Math.random() > 0.5,
            },
            companyType: Math.random() > 0.5 ? 'public' : 'private',
            companySize: Math.random() > 0.5 ? 'enterprise' : 'mid-size',
            applicantCount: Math.floor(Math.random() * 200) + 50,
            category: Math.random() > 0.5 ? 'Technology' : 'Engineering',
            jobFunction: Math.random() > 0.5 ? 'Engineering' : 'Product',
          };
        });
      };
      
      const sampleJobs = generateSampleJobs(25);
      setJobs(sampleJobs);
    };
    
    fetchJobs();
  }, []);

  const applyFiltersToJobs = (jobs: Job[], filters: JobFilters) => {
    let filtered = [...jobs];
    
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.remote) {
      filtered = filtered.filter(job => job.remote === true);
    }
    
    if (filters.jobType && filters.jobType.length > 0) {
      filtered = filtered.filter(job => 
        filters.jobType.includes(job.type)
      );
    }
    
    if (filters.experienceLevels && filters.experienceLevels.length > 0) {
      filtered = filtered.filter(job => 
        filters.experienceLevels.includes(job.level)
      );
    }
    
    if (filters.salaryRange && (filters.salaryRange[0] !== 0 || filters.salaryRange[1] !== 300000)) {
      filtered = filtered.filter(job => 
        job.salary.min >= filters.salaryRange[0] && job.salary.max <= filters.salaryRange[1]
      );
    }
    
    return filtered;
  };
  
  const filteredJobs = applyFiltersToJobs(jobs, activeFilters);

  // Handle filter changes and show toast only once
  useEffect(() => {
    // Removed the toast notification logic
    if (filteredJobs.length > 0 && !selectedJob) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob]);

  const handleSaveJob = (job: Job) => {
    if (savedJobIds.includes(job.id)) {
      setSavedJobIds(savedJobIds.filter(id => id !== job.id));
      toast({
        title: "Removed from saved jobs",
        description: `${job.title} at ${job.company} has been removed from your saved jobs.`,
      });
    } else {
      setSavedJobIds([...savedJobIds, job.id]);
      toast({
        title: "Job saved",
        description: `${job.title} at ${job.company} has been saved to your profile.`,
      });
    }
  };
  
  const handleApplyJob = (job: Job) => {
    if (!appliedJobIds.includes(job.id)) {
      setAppliedJobIds([...appliedJobIds, job.id]);
      
      toast({
        title: "Application submitted",
        description: `Your application to ${job.company} for ${job.title} has been submitted.`,
      });
      
      if (job.applyUrl) {
        window.open(job.applyUrl, '_blank');
      }
    }
  };
  
  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setShowDetailView(true);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };
  
  const handleApplyFilters = (filters: JobFilters) => {
    setActiveFilters(filters);
    setShowFilters(false);
    
    // Toast is now handled by the useEffect
  };
  
  const handleCloseFilters = () => {
    setShowFilters(false);
  };
  
  const getActiveFilterCount = () => {
    let count = 0;
    
    if (activeFilters.location) count++;
    if (activeFilters.remote) count++;
    if (activeFilters.jobType?.length) count += activeFilters.jobType.length;
    if (activeFilters.experienceLevels?.length) count += activeFilters.experienceLevels.length;
    if (activeFilters.skills?.length) count += activeFilters.skills.length;
    
    if (activeFilters.salaryRange && 
        (activeFilters.salaryRange[0] !== 0 || activeFilters.salaryRange[1] !== 300000)) {
      count++;
    }
    
    return count;
  };
  
  const activeFilterCount = getActiveFilterCount();
  
  const handleClearFilters = () => {
    setActiveFilters({
      search: "",
      location: "",
      jobType: [],
      remote: false,
      experienceLevels: [],
      education: [],
      salaryRange: [0, 300000],
      skills: [],
      companyTypes: [],
      companySize: [],
      benefits: [],
      seasons: [],
      leadership: 'no-preference',
      securityClearance: 'allow',
      sponsorH1B: false,
      simpleApplications: false,
      hideAppliedJobs: false
    });
    
    // Toast is now handled by the useEffect
  };
  
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      <MobileHeader title="Jobs" />
      
      {!showDetailView ? (
        <div className="relative flex-1 overflow-hidden pt-14">
          <div className="p-3 border-b">
            <div className="relative mb-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for roles, companies, or locations"
                  className="pl-9 pr-9 py-2 rounded-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-10 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-112px)]">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredJobs.map(job => (
                <MobileJobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.includes(job.id)}
                  onSave={() => handleSaveJob(job)}
                  onClick={() => handleSelectJob(job)}
                />
              ))}
              
              {filteredJobs.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No jobs match your search criteria. Try adjusting your filters.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-3"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <MobileJobDetail
          job={selectedJob}
          onApply={handleApplyJob}
          onSave={handleSaveJob}
          onBack={() => setShowDetailView(false)}
          isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
          isApplied={selectedJob ? appliedJobIds.includes(selectedJob.id) : false}
        />
      )}
    </div>
  );
}
