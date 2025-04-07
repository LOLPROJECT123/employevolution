
import { useState, useEffect, useRef } from 'react';
import Navbar from "@/components/Navbar";
import { Job, JobFilters } from "@/types/job";
import { JobDetailView } from "@/components/JobDetailView";
import { JobFiltersSection } from "@/components/JobFilters";
import { JobCard } from "@/components/JobCard";
import { useIsMobile } from "@/hooks/use-mobile";
import SwipeJobsInterface from "@/components/SwipeJobsInterface";
import { SavedAndAppliedJobs } from "@/components/SavedAndAppliedJobs";
import { toast } from "@/hooks/use-toast";
import AutomationSettings from "@/components/AutomationSettings";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  detectPlatform, 
  startAutomation 
} from '@/utils/automationUtils';
import JobSourcesDisplay from "@/components/JobSourcesDisplay";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const generateSampleJobs = (count: number): Job[] => {
  const jobTypes: Array<'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary' | 'volunteer' | 'other'> = 
    ['full-time', 'part-time', 'contract', 'internship', 'temporary', 'volunteer', 'other'];
  
  const levels: Array<'intern' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'manager' | 'director'> = 
    ['intern', 'entry', 'mid', 'senior', 'lead', 'executive', 'manager', 'director'];
  
  const companies = [
    'TechCorp', 'InnovateCo', 'Google', 'Amazon', 'Microsoft', 'Facebook', 'Apple', 
    'Netflix', 'Tesla', 'Twitter', 'LinkedIn', 'Uber', 'Airbnb', 'Stripe', 'Square',
    'Salesforce', 'Adobe', 'IBM', 'Oracle', 'Intel', 'Cisco', 'Dell', 'HP', 'Lenovo',
    'Accenture', 'Deloitte', 'KPMG', 'EY', 'PwC', 'McKinsey', 'BCG', 'Bain',
    'Goldman Sachs', 'JPMorgan', 'Morgan Stanley', 'Barclays', 'HSBC', 'Citi',
    'Dropbox', 'Slack', 'Zoom', 'Spotify', 'ByteDance', 'Tencent', 'Alibaba',
    'Samsung', 'Sony', 'Nintendo', 'Electronic Arts', 'Ubisoft', 'Activision Blizzard'
  ];
  
  const locations = [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Boston, MA', 'Austin, TX',
    'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA', 'Portland, OR',
    'Miami, FL', 'Washington, DC', 'Philadelphia, PA', 'San Diego, CA', 'Dallas, TX',
    'Houston, TX', 'Phoenix, AZ', 'San Antonio, TX', 'San Jose, CA', 'Nashville, TN',
    'Charlotte, NC', 'Indianapolis, IN', 'Columbus, OH', 'Detroit, MI', 'Minneapolis, MN',
    'Kansas City, MO', 'Raleigh, NC', 'Pittsburgh, PA', 'Cleveland, OH', 'Cincinnati, OH',
    'St. Louis, MO', 'Salt Lake City, UT', 'Orlando, FL', 'Tampa, FL', 'Baltimore, MD',
    'Richmond, VA', 'Sacramento, CA', 'Las Vegas, NV', 'Milwaukee, WI', 'Albuquerque, NM'
  ];
  
  const titles = [
    'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer',
    'Machine Learning Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Engineering Manager', 'QA Engineer', 'Systems Architect', 'Technical Writer', 'Database Administrator',
    'Cloud Engineer', 'Mobile Developer', 'Security Engineer', 'Network Engineer', 'UI Designer',
    'Data Analyst', 'Business Analyst', 'Sales Engineer', 'Solutions Architect', 'Technical Support Engineer',
    'IT Manager', 'Project Manager', 'Scrum Master', 'Site Reliability Engineer', 'AI Engineer',
    'Blockchain Developer', 'Game Developer', 'iOS Developer', 'Android Developer', 'React Developer',
    'Angular Developer', 'Vue.js Developer', 'Node.js Developer', 'Python Developer', 'Java Developer',
    'C# Developer', 'Ruby Developer', 'PHP Developer', 'Golang Developer', 'Rust Developer',
    'Scala Developer', 'Swift Developer', 'Kotlin Developer', 'TypeScript Developer', 'WordPress Developer'
  ];
  
  const skills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'Redux', 'GraphQL', 'REST API',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'TensorFlow', 'PyTorch', 'Swift', 'Kotlin',
    'Angular', 'Vue.js', 'Svelte', 'Express', 'Django', 'Rails', 'Spring', 'Hadoop', 'Spark',
    'React Native', 'Flutter', 'Xamarin', 'Unity', 'Unreal Engine', 'Figma', 'Sketch', 'Adobe XD',
    'Photoshop', 'Illustrator', 'InDesign', 'After Effects', 'Premiere Pro', 'Blender',
    'HTML', 'CSS', 'JavaScript', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material UI',
    'Webpack', 'Babel', 'ESLint', 'Jest', 'Cypress', 'Selenium', 'Jenkins', 'CircleCI',
    'GitHub Actions', 'Travis CI', 'Ansible', 'Terraform', 'Puppet', 'Chef', 'Grafana',
    'Prometheus', 'ELK Stack', 'Datadog', 'New Relic', 'AWS Lambda', 'S3', 'EC2', 'RDS',
    'DynamoDB', 'Redis', 'Elasticsearch', 'Kafka', 'RabbitMQ', 'NGINX', 'Apache', 'IIS'
  ];
  
  const requirements = [
    'Experience with modern frontend frameworks', 'Strong problem-solving skills',
    'Excellent communication skills', 'Ability to work in a team environment',
    'Passion for creating quality software', 'Understanding of CI/CD workflows',
    'Experience with agile methodologies', 'Knowledge of design patterns',
    'Familiarity with version control systems', 'Experience with databases',
    'Knowledge of RESTful APIs', 'Experience with cloud platforms',
    'Understanding of software development lifecycle', 'Strong analytical skills',
    'Ability to work independently', 'Knowledge of testing methodologies',
    'Experience with containerization', 'Understanding of security principles',
    'Knowledge of performance optimization', 'Experience with microservices',
    'Familiarity with serverless architecture', 'Strong debugging skills',
    'Experience with code reviews', 'Knowledge of accessibility standards',
    'Familiarity with responsive design', 'Experience with mobile development',
    'Understanding of cross-browser compatibility', 'Knowledge of SEO principles',
    'Experience with data structures and algorithms', 'Understanding of system design'
  ];
  
  const platforms = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com', 'joinhandshake.com', 'ziprecruiter.com', 'dice.com', 'hired.com', 'wellfound.com', 'stackoverflow.com/jobs'];

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
    const randomType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    const randomPrefix = randomLevel === 'senior' ? 'Senior ' : 
                         randomLevel === 'lead' ? 'Lead ' : 
                         randomLevel === 'manager' ? 'Manager, ' : '';
    const randomRemote = Math.random() > 0.5;
    const randomWorkModel = randomRemote ? 'remote' : Math.random() > 0.5 ? 'hybrid' : 'onsite';
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    return {
      id: (i + 1).toString(),
      title: `${randomPrefix}${randomTitle}`,
      company: randomCompany,
      location: randomLocation,
      salary: {
        min: randomSalaryMin,
        max: randomSalaryMax,
        currency: '$'
      },
      type: randomType,
      level: randomLevel,
      description: `We are looking for a talented ${randomTitle} to join our growing team. The ideal candidate will have experience with ${randomSkills.slice(0, 3).join(', ')} and a passion for building high-quality software.`,
      requirements: randomRequirements,
      postedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
      skills: randomSkills,
      applyUrl: `https://${platforms[Math.floor(Math.random() * platforms.length)]}/jobs/example${i + 1}`,
      remote: randomRemote,
      workModel: randomWorkModel
    };
  });
};

const sampleJobs: Job[] = generateSampleJobs(100);

type SortOption = 'relevance' | 'date-newest' | 'date-oldest' | 'salary-highest' | 'salary-lowest';

const Jobs = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(sampleJobs);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [showAutomation, setShowAutomation] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'list' | 'swipe'>(isMobile ? 'swipe' : 'list');
  const [showMyJobs, setShowMyJobs] = useState(false);
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
    benefits: []
  });
  const toastDisplayedRef = useRef(false);
  const filtersAppliedRef = useRef(false);

  useEffect(() => {
    setViewMode(isMobile ? 'swipe' : 'list');
  }, [isMobile]);

  useEffect(() => {
    if (filteredJobs.length > 0 && !selectedJob) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob]);

  useEffect(() => {
    sortJobs(sortOption);
  }, [sortOption]);

  const savedJobs = jobs.filter(job => savedJobIds.includes(job.id));
  const appliedJobs = jobs.filter(job => appliedJobIds.includes(job.id));

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleSaveJob = (job: Job) => {
    if (savedJobIds.includes(job.id)) {
      setSavedJobIds(savedJobIds.filter(id => id !== job.id));
      toast({
        title: "Job Removed From Saved Jobs",
        variant: "default",
      });
    } else {
      setSavedJobIds([...savedJobIds, job.id]);
      toast({
        title: "Job Saved Successfully",
        variant: "default",
      });
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
          toast({
            title: "Automation Available",
            description: "You can use the automation tools to apply to this job automatically.",
            variant: "default",
          });
        } else {
          window.open(job.applyUrl, '_blank');
          toast({
            title: "Opening application page",
            description: "The application page has been opened in a new tab.",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Application submitted successfully",
          description: `Your application to ${job.company} for ${job.title} has been submitted.`,
          variant: "default",
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
        toast({
          title: "Cannot automate application",
          description: "This job doesn't have an application URL.",
          variant: "destructive",
        });
        return;
      }
      
      const automationConfig = localStorage.getItem('automationConfig');
      if (!automationConfig) {
        toast({
          title: "Automation not configured",
          description: "Please configure your automation settings first.",
          variant: "destructive",
        });
        return;
      }
      
      const config = JSON.parse(automationConfig);
      
      startAutomation(job.applyUrl, config);
      
      const platform = detectPlatform(job.applyUrl);
      
      toast({
        title: "Automation initiated",
        description: `The automation script will now apply to this job on ${platform || 'the job platform'}. Please check the browser extension for details.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Automation failed",
        description: "There was an error starting the automation process.",
        variant: "destructive",
      });
      console.error("Automation error:", error);
    }
  };

  const handleSkipJob = (job: Job) => {
    // No action needed for now
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'swipe' : 'list');
  };

  const toggleMyJobs = () => {
    setShowMyJobs(!showMyJobs);
  };

  const sortJobs = (option: SortOption) => {
    let sortedJobs = [...filteredJobs];
    
    switch (option) {
      case 'relevance':
        sortedJobs.sort((a, b) => {
          const matchA = a.matchPercentage || 0;
          const matchB = b.matchPercentage || 0;
          return matchB - matchA;
        });
        break;
        
      case 'date-newest':
        sortedJobs.sort((a, b) => {
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        });
        break;
        
      case 'date-oldest':
        sortedJobs.sort((a, b) => {
          return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
        });
        break;
        
      case 'salary-highest':
        sortedJobs.sort((a, b) => {
          return b.salary.max - a.salary.max;
        });
        break;
        
      case 'salary-lowest':
        sortedJobs.sort((a, b) => {
          return a.salary.min - b.salary.min;
        });
        break;
    }
    
    setFilteredJobs(sortedJobs);
    
    if (sortedJobs.length > 0) {
      setSelectedJob(sortedJobs[0]);
    }
  };

  const handleSortChange = (value: string) => {
    setSortOption(value as SortOption);
    
    toast({
      title: "Jobs Sorted",
      description: `Jobs Are Now Sorted By ${getSortDescription(value as SortOption)}`,
      variant: "default",
    });
  };
  
  const getSortDescription = (option: SortOption): string => {
    switch (option) {
      case 'relevance': return 'Relevance';
      case 'date-newest': return 'Date (Newest First)';
      case 'date-oldest': return 'Date (Oldest First)';
      case 'salary-highest': return 'Salary (Highest First)';
      case 'salary-lowest': return 'Salary (Lowest First)';
      default: return 'Relevance';
    }
  };

  const applyFilters = (filters: JobFilters) => {
    setActiveFilters(filters);
    
    let newFilteredJobs = [...jobs];
    
    if (filters.location && filters.location.trim() !== "") {
      newFilteredJobs = newFilteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.remote) {
      newFilteredJobs = newFilteredJobs.filter(job => job.remote === true);
    }
    
    if (filters.jobType && filters.jobType.length > 0) {
      newFilteredJobs = newFilteredJobs.filter(job => 
        filters.jobType.includes(job.type)
      );
    }
    
    if (filters.experienceLevels && filters.experienceLevels.length > 0) {
      newFilteredJobs = newFilteredJobs.filter(job => 
        filters.experienceLevels.includes(job.level)
      );
    }
    
    if (filters.salaryRange && filters.salaryRange[0] !== 0 && filters.salaryRange[1] !== 300000) {
      newFilteredJobs = newFilteredJobs.filter(job => 
        job.salary.min >= filters.salaryRange[0] && job.salary.max <= filters.salaryRange[1]
      );
    }
    
    if (filters.skills && filters.skills.length > 0) {
      newFilteredJobs = newFilteredJobs.filter(job => 
        filters.skills.some(skill => job.skills.includes(skill))
      );
    }
    
    if (filters.companies && filters.companies.length > 0) {
      newFilteredJobs = newFilteredJobs.filter(job => 
        filters.companies.includes(job.company)
      );
    }
    
    if (filters.workModel && filters.workModel.length > 0) {
      newFilteredJobs = newFilteredJobs.filter(job => 
        job.workModel && filters.workModel.includes(job.workModel)
      );
    }
    
    if (filters.title && filters.title.length > 0) {
      newFilteredJobs = newFilteredJobs.filter(job => 
        filters.title.some(title => job.title.toLowerCase().includes(title.toLowerCase()))
      );
    }
    
    setFilteredJobs(newFilteredJobs);
    
    if (newFilteredJobs.length > 0 && (!selectedJob || !newFilteredJobs.find(job => job.id === selectedJob.id))) {
      setSelectedJob(newFilteredJobs[0]);
    }
    
    if (!filtersAppliedRef.current) {
      if (newFilteredJobs.length === 0) {
        toast({
          title: "No jobs match your filters",
          description: "Try adjusting your search criteria to find more opportunities.",
          variant: "default",
        });
      } else {
        toast({
          title: `Found ${newFilteredJobs.length} matching jobs`,
          description: "Displaying jobs that match your search criteria.",
          variant: "default",
        });
      }
      filtersAppliedRef.current = true;
      
      setTimeout(() => {
        filtersAppliedRef.current = false;
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900/30">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container px-4 py-6 mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Find Your Next Opportunity
            </h1>
            <div className="hidden md:block">
              <AutomationSettings />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="w-full">
              <JobSourcesDisplay />
            </div>

            {/* My Jobs Section - Now Above Filters for Desktop Too */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-lg">My Jobs</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Saved and Applied Positions</p>
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
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-semibold text-lg">Filter Jobs</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Narrow Down Your Search</p>
              </div>
              <div className="p-4">
                <JobFiltersSection onApplyFilters={applyFilters} />
              </div>
            </div>
          </div>
          
          {isMobile && (
            <div className="space-y-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 mt-6">
              <button 
                onClick={toggleViewMode}
                className="w-full py-2.5 px-4 rounded-lg bg-primary text-white font-medium"
              >
                Switch To {viewMode === 'list' ? 'Swipe' : 'List'} View
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
            <SavedAndAppliedJobs
              savedJobs={savedJobs}
              appliedJobs={appliedJobs}
              onApply={handleApplyJob}
              onSave={handleSaveJob}
              onSelect={handleJobSelect}
              selectedJobId={selectedJob?.id || null}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              <div className="lg:col-span-12">
                {viewMode === 'swipe' && isMobile ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden p-4">
                    <SwipeJobsInterface 
                      jobs={filteredJobs}
                      onApply={handleApplyJob}
                      onSkip={handleSkipJob}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Card className="overflow-hidden h-full max-h-[calc(100vh-280px)]">
                        <CardHeader className="py-3 px-4 border-b flex flex-row justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                          <div>
                            <CardTitle className="text-base font-medium">Browse Jobs</CardTitle>
                            <p className="text-xs text-muted-foreground">Showing {filteredJobs.length} of {jobs.length} Jobs</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select defaultValue={sortOption} onValueChange={handleSortChange}>
                              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 h-8 text-sm">
                                <SelectValue placeholder="Sort By: Relevance" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="relevance">Sort By: Relevance</SelectItem>
                                <SelectItem value="date-newest">Date: Newest First</SelectItem>
                                <SelectItem value="date-oldest">Date: Oldest First</SelectItem>
                                <SelectItem value="salary-highest">Salary: Highest First</SelectItem>
                                <SelectItem value="salary-lowest">Salary: Lowest First</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-0 divide-y overflow-y-auto max-h-[calc(100vh-330px)]">
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
                              variant="list"
                            />
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <Card className="h-full max-h-[calc(100vh-280px)] overflow-hidden">
                        <CardContent className="p-0">
                          <JobDetailView 
                            job={selectedJob} 
                            onApply={handleApplyJob}
                            onSave={handleSaveJob}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                
                {showAutomation && selectedJob && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800 overflow-hidden mt-6">
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
                        Use Automation To Apply To This Job At {selectedJob.company} Automatically.
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Jobs;
