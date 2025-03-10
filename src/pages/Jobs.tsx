
import { useState, useEffect } from 'react';
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BriefcaseIcon,
  SearchIcon,
  MapPinIcon,
  ClockIcon,
  BuildingIcon,
  FilterIcon,
  XIcon,
  ChevronDownIcon,
  BookmarkIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// Mock job data
const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120K - $150K",
    experience: "5+ years",
    logo: "https://via.placeholder.com/50",
    remote: true,
    postedDate: "2023-11-01",
    description: "We are looking for a Senior Frontend Developer to join our team. You will be responsible for building and maintaining web applications using React, TypeScript, and modern frontend tools.",
    skills: ["React", "TypeScript", "CSS", "JavaScript"],
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "Creative Digital Agency",
    location: "New York, NY",
    type: "Full-time",
    salary: "$90K - $120K",
    experience: "3+ years",
    logo: "https://via.placeholder.com/50",
    remote: false,
    postedDate: "2023-11-05",
    description: "Join our design team and help create beautiful, user-friendly interfaces for our clients. You'll work closely with product managers and developers to bring designs to life.",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "Growth Technologies",
    location: "Remote",
    type: "Contract",
    salary: "$80 - $100/hr",
    experience: "4+ years",
    logo: "https://via.placeholder.com/50",
    remote: true,
    postedDate: "2023-11-08",
    description: "We're seeking a talented Full Stack Developer to help build our SaaS platform. You'll work with React, Node.js, and PostgreSQL in an agile environment.",
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
  },
  {
    id: 4,
    title: "Product Manager",
    company: "Innovate Inc.",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$130K - $160K",
    experience: "6+ years",
    logo: "https://via.placeholder.com/50",
    remote: false,
    postedDate: "2023-11-10",
    description: "Lead product development for our flagship application. You'll work with cross-functional teams to define product strategy and roadmap.",
    skills: ["Product Strategy", "Agile", "User Stories", "Competitive Analysis"],
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "Cloud Systems",
    location: "Remote",
    type: "Full-time",
    salary: "$110K - $140K",
    experience: "3+ years",
    logo: "https://via.placeholder.com/50",
    remote: true,
    postedDate: "2023-11-12",
    description: "Join our infrastructure team to build and maintain our cloud-based systems. Experience with AWS, Kubernetes, and CI/CD pipelines is required.",
    skills: ["AWS", "Kubernetes", "Docker", "Terraform"],
  },
  {
    id: 6,
    title: "React Native Developer",
    company: "Mobile Innovations",
    location: "Austin, TX",
    type: "Full-time",
    salary: "$100K - $130K",
    experience: "2+ years",
    logo: "https://via.placeholder.com/50",
    remote: true,
    postedDate: "2023-11-15",
    description: "Help us build cross-platform mobile applications using React Native. You'll work on new features and improve existing functionality.",
    skills: ["React Native", "JavaScript", "iOS", "Android"],
  },
];

type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
type ExperienceLevel = "Entry-level" | "Mid-level" | "Senior" | "Executive";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  logo: string;
  remote: boolean;
  postedDate: string;
  description: string;
  skills: string[];
}

interface Filters {
  search: string;
  location: string;
  jobType: JobType[];
  remote: boolean;
  experienceLevels: ExperienceLevel[];
  salaryRange: [number, number];
}

const Jobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    search: "",
    location: "",
    jobType: [],
    remote: false,
    experienceLevels: [],
    salaryRange: [50, 200],
  });

  useEffect(() => {
    // Delay animations slightly for better page load experience
    const timer = setTimeout(() => setAnimationReady(true), 100);
    
    // On component mount, set the first job as selected
    if (jobs.length > 0) {
      setSelectedJob(jobs[0]);
    }
    
    return () => clearTimeout(timer);
  }, [jobs]);

  useEffect(() => {
    // Apply filters
    let result = [...jobs];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        job => 
          job.title.toLowerCase().includes(searchLower) ||
          job.company.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      result = result.filter(
        job => job.location.toLowerCase().includes(locationLower)
      );
    }
    
    // Apply job type filter
    if (filters.jobType.length > 0) {
      result = result.filter(
        job => filters.jobType.includes(job.type as JobType)
      );
    }
    
    // Apply remote filter
    if (filters.remote) {
      result = result.filter(job => job.remote);
    }
    
    // Apply experience level filter
    if (filters.experienceLevels.length > 0) {
      // This is a simplified implementation since our mock data doesn't have exact experience levels
      // In a real app, you would match based on the actual experience level data
      result = result.filter(job => {
        const years = parseInt(job.experience.split('+')[0]);
        if (filters.experienceLevels.includes('Entry-level') && years <= 2) return true;
        if (filters.experienceLevels.includes('Mid-level') && years >= 3 && years <= 5) return true;
        if (filters.experienceLevels.includes('Senior') && years >= 5) return true;
        if (filters.experienceLevels.includes('Executive') && years >= 8) return true;
        return false;
      });
    }
    
    // Apply salary range filter
    // This is also simplified since our mock data has string salary ranges
    // In a real app, you would parse the actual salary values
    
    setFilteredJobs(result);
    
    // If no job is selected or the selected job is filtered out, select the first job from filtered results
    if ((!selectedJob || !result.some(job => job.id === selectedJob.id)) && result.length > 0) {
      setSelectedJob(result[0]);
    }
  }, [filters, jobs, selectedJob]);

  const resetFilters = () => {
    setFilters({
      search: "",
      location: "",
      jobType: [],
      remote: false,
      experienceLevels: [],
      salaryRange: [50, 200],
    });
    toast({
      title: "Filters Reset",
      description: "All job filters have been reset.",
    });
  };

  const toggleJobType = (type: JobType) => {
    setFilters(prev => {
      const jobType = prev.jobType.includes(type)
        ? prev.jobType.filter(t => t !== type)
        : [...prev.jobType, type];
      return { ...prev, jobType };
    });
  };

  const toggleExperienceLevel = (level: ExperienceLevel) => {
    setFilters(prev => {
      const experienceLevels = prev.experienceLevels.includes(level)
        ? prev.experienceLevels.filter(l => l !== level)
        : [...prev.experienceLevels, level];
      return { ...prev, experienceLevels };
    });
  };

  const applyToJob = (job: Job) => {
    toast({
      title: "Application Started",
      description: `You're applying to ${job.title} at ${job.company}.`,
    });
  };

  const saveJob = (job: Job) => {
    toast({
      title: "Job Saved",
      description: `${job.title} at ${job.company} has been saved.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="container px-4 py-8">
          {/* Job Search Header */}
          <div className={`${animationReady ? 'slide-up' : 'opacity-0'} mb-8 transition-all duration-500`}>
            <h1 className="text-3xl font-bold">Find Your Perfect Job</h1>
            <p className="text-muted-foreground mt-1">
              Discover opportunities that match your skills and preferences.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className={`${animationReady ? 'slide-up' : 'opacity-0'} mb-8 transition-all duration-500 delay-100`}>
            <div className="relative rounded-lg border shadow-sm overflow-hidden bg-background">
              <div className="flex flex-col md:flex-row">
                <div className="relative flex-1 border-b md:border-b-0 md:border-r">
                  <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    className="border-0 h-14 pl-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <div className="relative flex-1 md:border-r">
                  <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Location or Remote"
                    className="border-0 h-14 pl-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>
                <div className="p-2 md:p-0">
                  <Button 
                    className="w-full md:w-auto h-full md:px-8 button-hover"
                    onClick={() => toast({ title: "Search Executed", description: "Showing jobs based on your search criteria." })}
                  >
                    <SearchIcon className="w-5 h-5 md:mr-2" />
                    <span className="hidden md:inline">Search Jobs</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center button-hover"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FilterIcon className="w-4 h-4 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                
                {/* Filter summary */}
                <div className="ml-4 flex flex-wrap gap-2">
                  {filters.remote && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-secondary text-xs">
                      Remote Only
                      <button 
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => setFilters({ ...filters, remote: false })}
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {filters.jobType.map((type) => (
                    <div key={type} className="inline-flex items-center px-2 py-1 rounded-full bg-secondary text-xs">
                      {type}
                      <button 
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => toggleJobType(type)}
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {filters.experienceLevels.map((level) => (
                    <div key={level} className="inline-flex items-center px-2 py-1 rounded-full bg-secondary text-xs">
                      {level}
                      <button 
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => toggleExperienceLevel(level)}
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {filteredJobs.length} jobs found
              </div>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className={`${animationReady ? 'fade-in' : 'opacity-0'} mb-8 rounded-lg border bg-background p-6 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={resetFilters}
                >
                  Reset All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Job Type */}
                <div>
                  <h4 className="font-medium mb-3">Job Type</h4>
                  <div className="space-y-2">
                    {(["Full-time", "Part-time", "Contract", "Internship"] as JobType[]).map((type) => (
                      <div key={type} className="flex items-center">
                        <Checkbox 
                          id={`job-type-${type}`}
                          checked={filters.jobType.includes(type)}
                          onCheckedChange={() => toggleJobType(type)}
                        />
                        <Label 
                          htmlFor={`job-type-${type}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Experience Level */}
                <div>
                  <h4 className="font-medium mb-3">Experience Level</h4>
                  <div className="space-y-2">
                    {(["Entry-level", "Mid-level", "Senior", "Executive"] as ExperienceLevel[]).map((level) => (
                      <div key={level} className="flex items-center">
                        <Checkbox 
                          id={`exp-level-${level}`}
                          checked={filters.experienceLevels.includes(level)}
                          onCheckedChange={() => toggleExperienceLevel(level)}
                        />
                        <Label 
                          htmlFor={`exp-level-${level}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Salary Range */}
                <div>
                  <h4 className="font-medium mb-3">Salary Range (K)</h4>
                  <div className="px-2">
                    <Slider
                      value={filters.salaryRange}
                      min={50}
                      max={200}
                      step={5}
                      onValueChange={(value) => setFilters({ ...filters, salaryRange: value as [number, number] })}
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>${filters.salaryRange[0]}K</span>
                      <span>${filters.salaryRange[1]}K</span>
                    </div>
                  </div>
                </div>
                
                {/* Remote */}
                <div>
                  <h4 className="font-medium mb-3">Work Model</h4>
                  <div className="flex items-center">
                    <Checkbox 
                      id="remote-only"
                      checked={filters.remote}
                      onCheckedChange={() => setFilters({ ...filters, remote: !filters.remote })}
                    />
                    <Label 
                      htmlFor="remote-only"
                      className="ml-2 text-sm cursor-pointer"
                    >
                      Remote Only
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Job Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Listings */}
            <div className={`${animationReady ? 'slide-up' : 'opacity-0'} lg:col-span-1 transition-all duration-500 delay-200`}>
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle>Available Positions</CardTitle>
                  <CardDescription>{filteredJobs.length} jobs match your criteria</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto pb-0">
                  <div className="space-y-2">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map((job) => (
                        <div 
                          key={job.id}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${
                            selectedJob?.id === job.id 
                              ? 'bg-primary/10 border-l-4 border-primary' 
                              : 'bg-background hover:bg-secondary/50'
                          }`}
                          onClick={() => setSelectedJob(job)}
                        >
                          <div className="flex items-start">
                            <div className="w-10 h-10 bg-secondary rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                              <BuildingIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-medium truncate">{job.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">{job.company}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center">
                                  <MapPinIcon className="w-3 h-3 mr-1" />
                                  {job.location}
                                </span>
                                <span className="flex items-center">
                                  <BriefcaseIcon className="w-3 h-3 mr-1" />
                                  {job.type}
                                </span>
                                {job.remote && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    Remote
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 px-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                          <SearchIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No Jobs Found</h3>
                        <p className="text-muted-foreground mt-2">
                          Try adjusting your filters or search criteria
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={resetFilters}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 pb-4">
                  <Select defaultValue="relevance">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                      <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                    </SelectContent>
                  </Select>
                </CardFooter>
              </Card>
            </div>
            
            {/* Job Details */}
            <div className={`${animationReady ? 'slide-up' : 'opacity-0'} lg:col-span-2 transition-all duration-500 delay-300`}>
              {selectedJob ? (
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{selectedJob.title}</CardTitle>
                        <CardDescription>
                          {selectedJob.company} • {selectedJob.location}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => saveJob(selectedJob)}
                          className="button-hover"
                        >
                          <BookmarkIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open('#', '_blank')}
                          className="button-hover"
                        >
                          <ExternalLinkIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
                    <div className="flex flex-wrap gap-3 mb-6">
                      <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                        {selectedJob.type}
                      </div>
                      <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                        {selectedJob.experience}
                      </div>
                      <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                        {selectedJob.salary}
                      </div>
                      {selectedJob.remote && (
                        <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm">
                          Remote
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mb-6">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      Posted on {new Date(selectedJob.postedDate).toLocaleDateString()}
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Job Description</h3>
                        <p className="text-muted-foreground whitespace-pre-line">
                          {selectedJob.description}
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Skills & Requirements</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.skills.map((skill, index) => (
                            <div key={index} className="px-3 py-1 rounded-full bg-secondary/70 text-sm">
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button
                        className="w-full button-hover"
                        onClick={() => applyToJob(selectedJob)}
                      >
                        Apply Now
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full button-hover"
                        onClick={() => saveJob(selectedJob)}
                      >
                        Save Job
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <BriefcaseIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No Job Selected</h3>
                    <p className="text-muted-foreground mt-2">
                      Select a job from the list to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Jobs;
