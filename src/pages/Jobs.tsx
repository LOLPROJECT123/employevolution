
import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { JobScraperConfig } from "@/components/JobScraperConfig";
import { PasswordManager } from "@/components/PasswordManager";
import { ApplicationAnswers } from "@/components/ApplicationAnswers";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/utils/dateUtils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BriefcaseIcon,
  SearchIcon,
  MapPinIcon,
  ClockIcon,
  Building2,
  FilterIcon,
  XIcon,
  BookmarkIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  BadgeCheckIcon,
  Save,
  GraduationCapIcon,
  FolderIcon,
  TagIcon,
  DollarSignIcon,
  ShieldCheckIcon,
  UsersIcon,
  HeartIcon,
  PlusIcon,
  BellRingIcon,
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Job, JobFilters } from "@/types/job";
import { JobCard } from "@/components/JobCard";

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    type: "full-time",
    level: "senior",
    salary: {
      min: 120000,
      max: 150000,
      currency: "$"
    },
    description: "We are looking for a Senior Frontend Developer to join our team. You will be responsible for building and maintaining web applications using React, TypeScript, and modern frontend tools.",
    requirements: ["5+ years experience", "React expertise", "TypeScript knowledge"],
    postedAt: "2023-11-01T00:00:00Z",
    skills: ["React", "TypeScript", "CSS", "JavaScript"],
    remote: true,
    matchPercentage: 85
  },
  {
    id: "2",
    title: "UX/UI Designer",
    company: "Creative Digital Agency",
    location: "New York, NY",
    type: "full-time",
    level: "mid",
    salary: {
      min: 90000,
      max: 120000,
      currency: "$"
    },
    description: "Join our design team and help create beautiful, user-friendly interfaces for our clients. You'll work closely with product managers and developers to bring designs to life.",
    requirements: ["3+ years experience", "Figma expertise", "UI/UX knowledge"],
    postedAt: "2023-11-05T00:00:00Z",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
    remote: false,
    matchPercentage: 65
  },
  {
    id: "3",
    title: "Full Stack Developer",
    company: "Growth Technologies",
    location: "Remote",
    type: "contract",
    level: "senior",
    salary: {
      min: 80000,
      max: 100000,
      currency: "$"
    },
    description: "We're seeking a talented Full Stack Developer to help build our SaaS platform. You'll work with React, Node.js, and PostgreSQL in an agile environment.",
    requirements: ["4+ years experience", "Full stack expertise", "SQL knowledge"],
    postedAt: "2023-11-08T00:00:00Z",
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    remote: true,
    matchPercentage: 75
  },
  {
    id: "4",
    title: "Product Manager",
    company: "Innovate Inc.",
    location: "Seattle, WA",
    type: "full-time",
    level: "senior",
    salary: {
      min: 130000,
      max: 160000,
      currency: "$"
    },
    description: "Lead product development for our flagship application. You'll work with cross-functional teams to define product strategy and roadmap.",
    requirements: ["6+ years experience", "Product management expertise", "Agile knowledge"],
    postedAt: "2023-11-10T00:00:00Z",
    skills: ["Product Strategy", "Agile", "User Stories", "Competitive Analysis"],
    remote: false,
    matchPercentage: 92
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "Cloud Systems",
    location: "Remote",
    type: "full-time",
    level: "mid",
    salary: {
      min: 110000,
      max: 140000,
      currency: "$"
    },
    description: "Join our infrastructure team to build and maintain our cloud-based systems. Experience with AWS, Kubernetes, and CI/CD pipelines is required.",
    requirements: ["3+ years experience", "AWS expertise", "Kubernetes knowledge"],
    postedAt: "2023-11-12T00:00:00Z",
    skills: ["AWS", "Kubernetes", "Docker", "Terraform"],
    remote: true,
    matchPercentage: 80
  },
  {
    id: "6",
    title: "React Native Developer",
    company: "Mobile Innovations",
    location: "Austin, TX",
    type: "full-time",
    level: "mid",
    salary: {
      min: 100000,
      max: 130000,
      currency: "$"
    },
    description: "Help us build cross-platform mobile applications using React Native. You'll work on new features and improve existing functionality.",
    requirements: ["2+ years experience", "React Native expertise", "Mobile development knowledge"],
    postedAt: "2023-11-15T00:00:00Z",
    skills: ["React Native", "JavaScript", "iOS", "Android"],
    remote: true,
    matchPercentage: 70
  },
];

type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
type ExperienceLevel = "Entry-level" | "Mid-level" | "Senior" | "Executive";

interface Filters {
  search: string;
  location: string;
  jobType: JobType[];
  remote: boolean;
  experienceLevels: ExperienceLevel[];
  salaryRange: [number, number];
  categories?: string[];
  education?: string[];
  sponsorH1b?: boolean;
  companyTypes?: string[];
  companySize?: string[];
  benefits?: string[];
  workModel?: string[];
  excludeStaffingAgency?: boolean;
  companyStage?: string[];
  title?: string[];
  datePosted?: string;
}

const categoryOptions = [
  "Software Engineering",
  "Product Management",
  "Data Science",
  "Design",
  "Marketing",
  "Sales & Account Management",
  "Finance & Banking",
  "Medical, Clinical & Veterinary",
  "Nursing & Allied Health Professionals",
  "Retail",
  "Education",
  "Engineering",
  "Operations",
  "Legal",
  "Human Resources",
  "Customer Service",
];

const educationOptions = [
  "Bachelor's",
  "Master's",
  "Associate's",
  "PhD",
  "MD",
  "MBA",
  "High School",
  "Diploma",
  "Certificate",
];

const companyTypeOptions = [
  "Private",
  "Public",
  "Nonprofit",
  "Education",
  "Government",
];

const companySizeOptions = [
  "Seed, 1-10",
  "Early, 11-100",
  "Mid-size, 101-1,000",
  "Large, 1,001-10,000",
  "Enterprise, 10,001+",
];

const benefitsOptions = [
  "Remote Work",
  "401K",
  "PTO (Paid/Vacation Days)",
  "Maternity Leave",
  "Free Lunch",
  "Tuition Reimbursement",
  "Pet Friendly Workplace",
  "Gym Discount",
  "Health Insurance",
  "Transport Allowance",
];

const workModelOptions = [
  "On-site",
  "Fully Remote",
  "Hybrid",
];

const companyStageOptions = [
  "Early Stage",
  "Growth Stage",
  "Late Stage",
  "Public Company",
];

const datePostedOptions = [
  "Any time",
  "Past 24 hours",
  "Past 3 days",
  "Past 7 days",
  "Past 14 days",
  "Past 30 days",
];

const popularCompanies = [
  "Amazon",
  "Microsoft",
  "Google",
  "Facebook",
  "Apple",
  "Netflix",
  "Tesla",
  "IBM",
  "Adobe",
];

const popularTitles = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Software Engineering Manager",
  "Product Designer",
  "Hardware Engineer",
  "Business Analyst",
];

const Jobs = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(mockJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);
  const [isScrapingJobs, setIsScrapingJobs] = useState(false);
  const [lastScraped, setLastScraped] = useState<Date | null>(null);
  const [showApplicationAnswers, setShowApplicationAnswers] = useState(false);
  const [showMostRecent, setShowMostRecent] = useState(false);
  const [totalJobCount, setTotalJobCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortCriteria, setSortCriteria] = useState<string>("relevance");
  const [showPostJobDialog, setShowPostJobDialog] = useState(false);
  const jobsPerPage = 10;

  const [filters, setFilters] = useState<Filters>({
    search: "",
    location: "",
    jobType: [],
    remote: false,
    experienceLevels: [],
    salaryRange: [50, 200],
    categories: [],
    education: [],
    sponsorH1b: false,
    companyTypes: [],
    companySize: [],
    benefits: [],
    workModel: [],
    excludeStaffingAgency: false,
    companyStage: [],
    title: [],
    datePosted: "",
  });

  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    type: "full-time",
    salaryMin: "",
    salaryMax: "",
    remote: false,
    skills: "",
    category: ""
  });

  useEffect(() => {
    const timer = setTimeout(() => setAnimationReady(true), 100);
    
    if (jobs.length > 0) {
      setSelectedJob(jobs[0]);
    }
    
    const storedJobs = localStorage.getItem('scrapedJobs');
    const lastScrapedTime = localStorage.getItem('lastScrapedTime');
    
    if (storedJobs) {
      try {
        const parsedJobs = JSON.parse(storedJobs);
        if (Array.isArray(parsedJobs) && parsedJobs.length > 0) {
          setJobs([...parsedJobs, ...jobs.slice(0, 2)]);
        }
      } catch (e) {
        console.error("Error parsing stored jobs:", e);
      }
    }
    
    if (lastScrapedTime) {
      setLastScraped(new Date(lastScrapedTime));
    }
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = [...jobs];
    
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
    
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      result = result.filter(
        job => job.location.toLowerCase().includes(locationLower)
      );
    }
    
    if (filters.jobType.length > 0) {
      result = result.filter(job => {
        const jobTypeFormatted = job.type.charAt(0).toUpperCase() + job.type.slice(1) as JobType;
        return filters.jobType.includes(jobTypeFormatted);
      });
    }
    
    if (filters.remote) {
      result = result.filter(job => job.remote);
    }
    
    if (filters.experienceLevels.length > 0) {
      result = result.filter(job => {
        const level = job.level;
        if (filters.experienceLevels.includes('Entry-level') && (level === 'intern' || level === 'entry')) return true;
        if (filters.experienceLevels.includes('Mid-level') && level === 'mid') return true;
        if (filters.experienceLevels.includes('Senior') && (level === 'senior' || level === 'lead')) return true;
        if (filters.experienceLevels.includes('Executive') && (level === 'executive' || level === 'director')) return true;
        return false;
      });
    }
    
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter(job => 
        job.category && filters.categories?.includes(job.category)
      );
    }
    
    if (filters.education && filters.education.length > 0) {
      result = result.filter(job => 
        job.education && job.education.some(edu => 
          filters.education?.includes(edu))
      );
    }
    
    if (filters.sponsorH1b) {
      result = result.filter(job => job.sponsorH1b === true);
    }
    
    if (filters.companyTypes && filters.companyTypes.length > 0) {
      result = result.filter(job => 
        job.companyType && filters.companyTypes?.includes(job.companyType)
      );
    }
    
    if (filters.companySize && filters.companySize.length > 0) {
      result = result.filter(job => 
        job.companySize && filters.companySize?.includes(job.companySize)
      );
    }
    
    if (filters.benefits && filters.benefits.length > 0) {
      result = result.filter(job => 
        job.benefits && job.benefits.some(benefit => 
          filters.benefits?.includes(benefit))
      );
    }
    
    if (filters.workModel && filters.workModel.length > 0) {
      result = result.filter(job => 
        job.workModel && filters.workModel?.includes(job.workModel)
      );
    }
    
    if (filters.excludeStaffingAgency) {
      result = result.filter(job => 
        job.source !== "Staffing Agency"
      );
    }

    if (filters.datePosted) {
      const now = new Date();
      let daysAgo = 0;
      
      switch (filters.datePosted) {
        case "Past 24 hours":
          daysAgo = 1;
          break;
        case "Past 3 days":
          daysAgo = 3;
          break;
        case "Past 7 days":
          daysAgo = 7;
          break;
        case "Past 14 days":
          daysAgo = 14;
          break;
        case "Past 30 days":
          daysAgo = 30;
          break;
        default:
          daysAgo = 0;
      }
      
      if (daysAgo > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - daysAgo);
        
        result = result.filter(job => {
          const postedDate = new Date(job.postedAt);
          return postedDate >= cutoffDate;
        });
      }
    }
    
    if (showMostRecent) {
      result = [...result].sort((a, b) => 
        new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      );
    }
    
    setTotalJobCount(result.length);
    
    const startIndex = (currentPage - 1) * jobsPerPage;
    const paginatedResult = result.slice(startIndex, startIndex + jobsPerPage);
    
    setFilteredJobs(paginatedResult);
    
    if ((!selectedJob || !result.some(job => job.id === selectedJob.id)) && result.length > 0) {
      setSelectedJob(result[0]);
    }
  }, [filters, jobs, selectedJob, showMostRecent, currentPage]);

  const resetFilters = () => {
    setFilters({
      search: "",
      location: "",
      jobType: [],
      remote: false,
      experienceLevels: [],
      salaryRange: [50, 200],
      categories: [],
      education: [],
      sponsorH1b: false,
      companyTypes: [],
      companySize: [],
      benefits: [],
      workModel: [],
      excludeStaffingAgency: false,
      companyStage: [],
      title: [],
      datePosted: "",
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

  const toggleCategory = (category: string) => {
    setFilters(prev => {
      const categories = prev.categories?.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...(prev.categories || []), category];
      return { ...prev, categories };
    });
  };

  const toggleEducation = (education: string) => {
    setFilters(prev => {
      const educationList = prev.education?.includes(education)
        ? prev.education.filter(e => e !== education)
        : [...(prev.education || []), education];
      return { ...prev, education: educationList };
    });
  };

  const toggleCompanyType = (type: string) => {
    setFilters(prev => {
      const companyTypes = prev.companyTypes?.includes(type)
        ? prev.companyTypes.filter(t => t !== type)
        : [...(prev.companyTypes || []), type];
      return { ...prev, companyTypes };
    });
  };

  const toggleCompanySize = (size: string) => {
    setFilters(prev => {
      const companySize = prev.companySize?.includes(size)
        ? prev.companySize.filter(s => s !== size)
        : [...(prev.companySize || []), size];
      return { ...prev, companySize };
    });
  };

  const toggleBenefit = (benefit: string) => {
    setFilters(prev => {
      const benefits = prev.benefits?.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...(prev.benefits || []), benefit];
      return { ...prev, benefits };
    });
  };

  const toggleWorkModel = (model: string) => {
    setFilters(prev => {
      const workModel = prev.workModel?.includes(model)
        ? prev.workModel.filter(m => m !== model)
        : [...(prev.workModel || []), model];
      return { ...prev, workModel };
    });
  };

  const toggleCompanyStage = (stage: string) => {
    setFilters(prev => {
      const companyStage = prev.companyStage?.includes(stage)
        ? prev.companyStage.filter(s => s !== stage)
        : [...(prev.companyStage || []), stage];
      return { ...prev, companyStage };
    });
  };

  const toggleTitle = (title: string) => {
    setFilters(prev => {
      const titles = prev.title?.includes(title)
        ? prev.title.filter(t => t !== title)
        : [...(prev.title || []), title];
      return { ...prev, title: titles };
    });
  };

  const applyToJob = (job: Job) => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank');
    } else {
      toast({
        title: "Application Started",
        description: `You're applying to ${job.title} at ${job.company}.`,
      });
    }
  };

  const saveJob = (job: Job) => {
    toast({
      title: "Job Saved",
      description: `${job.title} at ${job.company} has been saved.`,
    });
    
    const savedJobs = localStorage.getItem('savedJobs');
    try {
      const parsedJobs = savedJobs ? JSON.parse(savedJobs) : [];
      const updatedJobs = [...parsedJobs, job];
      localStorage.setItem('savedJobs', JSON.stringify(updatedJobs));
    } catch (e) {
      console.error("Error saving job:", e);
    }
  };

  const handleConfigUpdate = (sources: {id: string, name: string, isActive: boolean}[]) => {
    toast({
      title: "Job Sources Updated",
      description: `${sources.filter(s => s.isActive).length} job sources are now active.`,
    });
  };

  const refreshJobListings = () => {
    setIsScrapingJobs(true);
    
    setTimeout(() => {
      const newJobs: Job[] = [
        {
          id: Math.floor(Math.random() * 10000).toString(),
          title: "Senior Frontend Engineer",
          company: "TechHQ",
          location: "Remote",
          type: "full-time",
          level: "senior",
          salary: {
            min: 140000,
            max: 180000,
            currency: "$"
          },
          description: "TechHQ is looking for a Senior Frontend Engineer to join our growing team. You'll be responsible for building and maintaining our core products using React and TypeScript. This role involves collaborating with design teams to implement elegant and responsive user interfaces while ensuring high performance across all devices and browsers. You'll work on complex state management, API integration, and optimizing application speed.",
          requirements: ["5+ years experience with frontend development", "Strong React and TypeScript skills", "Experience with GraphQL"],
          postedAt: new Date().toISOString(),
          skills: ["React", "TypeScript", "GraphQL", "CSS"],
          remote: true,
          matchPercentage: 92,
          source: "LinkedIn",
          applyUrl: "https://linkedin.com/jobs",
          workModel: "remote"
        },
        {
          id: Math.floor(Math.random() * 10000).toString(),
          title: "Backend Developer",
          company: "DataSystems",
          location: "Boston, MA",
          type: "full-time",
          level: "mid",
          salary: {
            min: 120000,
            max: 150000,
            currency: "$"
          },
          description: "Join our backend team to build scalable APIs and services using Node.js and PostgreSQL. In this role, you'll design and implement RESTful APIs, optimize database queries for performance, and collaborate with frontend developers to ensure seamless integration. You'll also participate in architecture discussions and help make decisions about technology choices and system design.",
          requirements: ["3+ years Node.js experience", "Strong database knowledge", "API design experience"],
          postedAt: new Date().toISOString(),
          skills: ["Node.js", "PostgreSQL", "Express", "API Design"],
          remote: false,
          matchPercentage: 78,
          source: "Indeed",
          applyUrl: "https://indeed.com/jobs",
          workModel: "onsite",
          education: ["Bachelor's"]
        },
        {
          id: Math.floor(Math.random() * 10000).toString(),
          title: "DevOps Engineer",
          company: "CloudNinjas",
          location: "Seattle, WA",
          type: "full-time",
          level: "senior",
          salary: {
            min: 130000,
            max: 160000,
            currency: "$"
          },
          description: "Help us build and maintain our cloud infrastructure with AWS, Kubernetes, and Terraform. As a DevOps Engineer, you'll be responsible for managing our CI/CD pipelines, implementing infrastructure as code, and ensuring high availability of our production systems. You'll work closely with development teams to streamline deployment processes and optimize cloud resources for cost and performance.",
          requirements: ["4+ years cloud experience", "Kubernetes expertise", "CI/CD pipeline knowledge"],
          postedAt: new Date().toISOString(),
          skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"],
          remote: true,
          matchPercentage: 85,
          source: "GitHub Jobs",
          applyUrl: "https://github.com/jobs",
          workModel: "hybrid",
          sponsorH1b: true,
          benefits: ["Remote Work", "401K", "Health Insurance"]
        }
      ];
      
      const allJobs = [...newJobs, ...jobs];
      setJobs(allJobs);
      
      localStorage.setItem('scrapedJobs', JSON.stringify(allJobs));
      
      const now = new Date();
      setLastScraped(now);
      localStorage.setItem('lastScrapedTime', now.toISOString());
      
      setIsScrapingJobs(false);
      
      toast({
        title: "Jobs Updated",
        description: `${newJobs.length} new job listings have been added.`,
      });
    }, 2500);
  };

  const handlePostJob = () => {
    const jobId = Math.floor(Math.random() * 10000).toString();
    const currentDate = new Date().toISOString();
    
    const postedJob: Job = {
      id: jobId,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location || (newJob.remote ? "Remote" : ""),
      type: newJob.type as "full-time" | "part-time" | "contract" | "internship" | "temporary" | "volunteer" | "other",
      level: "mid",
      salary: {
        min: parseInt(newJob.salaryMin) * 1000 || 50000,
        max: parseInt(newJob.salaryMax) * 1000 || 100000,
        currency: "$"
      },
      description: newJob.description,
      requirements: ["Experience required"],
      postedAt: currentDate,
      skills: newJob.skills.split(',').map(skill => skill.trim()),
      remote: newJob.remote,
      source: "Posted by You",
      category: newJob.category,
      matchPercentage: 100
    };
    
    const updatedJobs = [postedJob, ...jobs];
    setJobs(updatedJobs);
    
    localStorage.setItem('scrapedJobs', JSON.stringify(updatedJobs));
    setShowPostJobDialog(false);
    
    toast({
      title: "Job Posted Successfully",
      description: `Your job listing for ${newJob.title} has been published.`,
    });
    
    setNewJob({
      title: "",
      company: "",
      location: "",
      description: "",
      type: "full-time",
      salaryMin: "",
      salaryMax: "",
      remote: false,
      skills: "",
      category: ""
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="container px-4 py-8">
          <div className={`${animationReady ? 'slide-up' : 'opacity-0'} mb-8 transition-all duration-500`}>
            <h1 className="text-3xl font-bold">Find Your Perfect Job</h1>
            <p className="text-muted-foreground mt-1">
              Discover opportunities that match your skills and preferences.
            </p>
          </div>
          
          <div className={`${animationReady ? 'slide-up' : 'opacity-0'} mb-4 transition-all duration-500 delay-100`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={refreshJobListings}
                  disabled={isScrapingJobs}
                >
                  {isScrapingJobs ? (
                    <RefreshCwIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCwIcon className="w-4 h-4" />
                  )}
                  {isScrapingJobs ? "Refreshing..." : "Refresh Jobs"}
                </Button>
                <JobScraperConfig onConfigUpdate={handleConfigUpdate} />
                <PasswordManager />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setShowApplicationAnswers(!showApplicationAnswers)}
                >
                  <Save className="w-4 h-4" />
                  {showApplicationAnswers ? "Hide Saved Answers" : "Saved Answers"}
                </Button>
                
                <Dialog open={showPostJobDialog} onOpenChange={setShowPostJobDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2 ml-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <BriefcaseIcon className="w-4 h-4" />
                      Post or Promote a Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Post a New Job</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to create a new job listing that will be visible to all users.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor="job-title">Job Title</Label>
                          <Input 
                            id="job-title"
                            value={newJob.title}
                            onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                            placeholder="e.g. Senior Software Engineer"
                          />
                        </div>
                        <div>
                          <Label htmlFor="company">Company</Label>
                          <Input 
                            id="company"
                            value={newJob.company} 
                            onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                            placeholder="e.g. Acme Inc."
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input 
                            id="location"
                            value={newJob.location} 
                            onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                            placeholder="e.g. San Francisco, CA"
                          />
                        </div>
                        <div>
                          <Label htmlFor="type">Job Type</Label>
                          <Select 
                            defaultValue={newJob.type}
                            onValueChange={(value) => setNewJob({...newJob, type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full-time">Full-time</SelectItem>
                              <SelectItem value="part-time">Part-time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select 
                            defaultValue={newJob.category}
                            onValueChange={(value) => setNewJob({...newJob, category: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryOptions.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="salary-min">Minimum Salary (K)</Label>
                          <Input 
                            id="salary-min"
                            type="number"
                            value={newJob.salaryMin} 
                            onChange={(e) => setNewJob({...newJob, salaryMin: e.target.value})}
                            placeholder="e.g. 100"
                          />
                        </div>
                        <div>
                          <Label htmlFor="salary-max">Maximum Salary (K)</Label>
                          <Input 
                            id="salary-max"
                            type="number"
                            value={newJob.salaryMax} 
                            onChange={(e) => setNewJob({...newJob, salaryMax: e.target.value})}
                            placeholder="e.g. 150"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="skills">Required Skills (comma separated)</Label>
                          <Input 
                            id="skills"
                            value={newJob.skills} 
                            onChange={(e) => setNewJob({...newJob, skills: e.target.value})}
                            placeholder="e.g. React, TypeScript, Node.js"
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="remote"
                              checked={newJob.remote} 
                              onCheckedChange={(checked) => setNewJob({...newJob, remote: checked as boolean})}
                            />
                            <Label htmlFor="remote">Remote Job</Label>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="description">Job Description</Label>
                          <Textarea 
                            id="description"
                            value={newJob.description} 
                            onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                            placeholder="Enter detailed job description..."
                            className="h-32"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPostJobDialog(false)}>Cancel</Button>
                      <Button onClick={handlePostJob}>Post Job</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="flex items-center space-x-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <FilterIcon className="w-4 h-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full max-w-md sm:max-w-lg overflow-auto">
                    <SheetHeader>
                      <SheetTitle>Job Filters</SheetTitle>
                      <SheetDescription>
                        Refine your job search with these filters.
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="py-6 space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-3">Job Type</h3>
                        <div className="space-y-2">
                          {["Full-time", "Part-time", "Contract", "Internship"].map(type => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`jobType-${type}`}
                                checked={filters.jobType.includes(type as JobType)}
                                onCheckedChange={() => toggleJobType(type as JobType)}
                              />
                              <label htmlFor={`jobType-${type}`} className="text-sm">
                                {type}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Experience Level</h3>
                        <div className="space-y-2">
                          {["Entry-level", "Mid-level", "Senior", "Executive"].map(level => (
                            <div key={level} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`experienceLevel-${level}`}
                                checked={filters.experienceLevels.includes(level as ExperienceLevel)}
                                onCheckedChange={() => toggleExperienceLevel(level as ExperienceLevel)}
                              />
                              <label htmlFor={`experienceLevel-${level}`} className="text-sm">
                                {level}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Remote</h3>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="remote-switch"
                            checked={filters.remote}
                            onCheckedChange={(checked) => setFilters({...filters, remote: checked})}
                          />
                          <Label htmlFor="remote-switch">Remote jobs only</Label>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Salary Range (K)</h3>
                        <div className="pt-4">
                          <Slider 
                            defaultValue={filters.salaryRange}
                            max={300}
                            step={10}
                            onValueChange={(value) => setFilters({...filters, salaryRange: value as [number, number]})}
                          />
                          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                            <span>${filters.salaryRange[0]}K</span>
                            <span>${filters.salaryRange[1]}K</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Work Model</h3>
                        <div className="space-y-2">
                          {workModelOptions.map(model => (
                            <div key={model} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`workModel-${model}`}
                                checked={filters.workModel?.includes(model)}
                                onCheckedChange={() => toggleWorkModel(model)}
                              />
                              <label htmlFor={`workModel-${model}`} className="text-sm">
                                {model}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">Job Categories</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {categoryOptions.slice(0, 6).map(category => (
                            <div key={category} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`category-${category}`}
                                checked={filters.categories?.includes(category)}
                                onCheckedChange={() => toggleCategory(category)}
                              />
                              <label htmlFor={`category-${category}`} className="text-sm">
                                {category}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <SheetFooter className="flex-col sm:flex-row gap-2">
                      <Button variant="outline" onClick={resetFilters} className="w-full">
                        Reset All Filters
                      </Button>
                      <SheetClose asChild>
                        <Button className="w-full">Apply Filters</Button>
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
                
                <div className="flex items-center">
                  <Input
                    placeholder="Search jobs..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-60 md:w-80"
                  />
                  <Button variant="ghost" className="ml-1">
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {showApplicationAnswers && <ApplicationAnswers />}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="col-span-1 lg:col-span-1">
              <div className={`sticky top-24 ${animationReady ? 'slide-up' : 'opacity-0'} transition-all duration-500 delay-200`}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Job Listings ({totalJobCount})</h2>
                  <div className="flex items-center gap-2">
                    <Select 
                      defaultValue="relevance"
                      onValueChange={setSortCriteria}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="salary-high">Highest Salary</SelectItem>
                        <SelectItem value="salary-low">Lowest Salary</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowMostRecent(!showMostRecent)}
                      className={showMostRecent ? "bg-primary/10" : ""}
                    >
                      <ClockIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                      <div 
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`cursor-pointer transition-all ${selectedJob?.id === job.id ? 'ring-2 ring-primary' : 'hover:bg-secondary/50'}`}
                      >
                        <JobCard job={job} />
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-card rounded-lg border">
                      <div className="mb-3">
                        <SearchIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-medium">No jobs found</h3>
                      <p className="text-muted-foreground mt-1">
                        Try adjusting your search or filters to find more jobs.
                      </p>
                      <Button 
                        className="mt-4" 
                        variant="outline"
                        onClick={resetFilters}
                      >
                        Reset Filters
                      </Button>
                    </div>
                  )}
                </div>
                
                {filteredJobs.length > 0 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                          />
                        </PaginationItem>
                        
                        {Array.from({length: Math.ceil(totalJobCount / jobsPerPage)}, (_, i) => i + 1)
                          .slice(0, 5)
                          .map(page => (
                            <PaginationItem key={page}>
                              <PaginationLink 
                                href="#" 
                                isActive={currentPage === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                        
                        {Math.ceil(totalJobCount / jobsPerPage) > 5 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < Math.ceil(totalJobCount / jobsPerPage)) {
                                setCurrentPage(currentPage + 1);
                              }
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </div>
            
            <div className="col-span-1 lg:col-span-2">
              {selectedJob ? (
                <div className={`${animationReady ? 'slide-up' : 'opacity-0'} transition-all duration-500 delay-300`}>
                  <Card>
                    <CardHeader className="relative pb-0">
                      <div className="absolute right-6 top-6 flex items-center gap-2">
                        {selectedJob.matchPercentage && (
                          <div className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full text-xs font-semibold">
                            <BadgeCheckIcon className="w-3 h-3" />
                            {selectedJob.matchPercentage}% Match
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 bg-transparent border-gray-200"
                          onClick={() => saveJob(selectedJob)}
                        >
                          <BookmarkIcon className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        {selectedJob.applyUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 bg-transparent border-gray-200"
                            onClick={() => window.open(selectedJob.applyUrl, '_blank')}
                          >
                            <ExternalLinkIcon className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                      
                      <CardTitle className="text-2xl leading-tight">
                        {selectedJob.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-6 mt-2 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span className="text-foreground font-medium">
                            {selectedJob.company}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{selectedJob.location}</span>
                          {selectedJob.remote && (
                            <span className="text-blue-500 dark:text-blue-400 ml-1">
                              (Remote)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <BriefcaseIcon className="w-4 h-4" />
                          <span className="capitalize">{selectedJob.type.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSignIcon className="w-4 h-4" />
                          <span>
                            {selectedJob.salary.currency}{selectedJob.salary.min.toLocaleString()} - 
                            {selectedJob.salary.currency}{selectedJob.salary.max.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>
                            Posted {formatRelativeTime(selectedJob.postedAt)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                            <div className="text-muted-foreground space-y-4">
                              <p>{selectedJob.description}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                              {selectedJob.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <Card className="bg-primary/5">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {selectedJob.skills.map(skill => (
                                  <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                          
                          {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                            <Card className="bg-primary/5">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">Benefits</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {selectedJob.benefits.map(benefit => (
                                    <div key={benefit} className="flex items-center gap-2">
                                      <BadgeCheckIcon className="w-4 h-4 text-green-500" />
                                      <span className="text-sm">{benefit}</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                          
                          {selectedJob.education && selectedJob.education.length > 0 && (
                            <Card className="bg-primary/5">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">Education</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {selectedJob.education.map(edu => (
                                    <div key={edu} className="flex items-center gap-2">
                                      <GraduationCapIcon className="w-4 h-4 text-blue-500" />
                                      <span className="text-sm">{edu}</span>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex-col sm:flex-row gap-4">
                      <Button 
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                        onClick={() => applyToJob(selectedJob)}
                        size="lg"
                      >
                        Apply Now
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full sm:w-auto"
                        onClick={() => saveJob(selectedJob)}
                      >
                        Save Job
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-12 bg-card rounded-lg border">
                  <div className="text-center max-w-md mx-auto">
                    <BriefcaseIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium">Select a job to view details</h3>
                    <p className="text-muted-foreground mt-2">
                      Choose a job listing from the left to view its full details and apply.
                    </p>
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
