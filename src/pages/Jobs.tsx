import { useState, useEffect } from 'react';
import { JobDetailView } from '@/components/JobDetailView';
import { JobFilters } from '@/components/JobFilters';
import { Job } from '@/types/job';
import { validateJobUrl, detectJobPlatform } from '@/utils/jobValidationUtils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SavedSearch } from "@/types/job";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { HoverCard, HoverCardContent, HoverCardDescription, HoverCardFooter, HoverCardHeader, HoverCardTrigger } from "@/components/ui/hover-card"
import { Link } from 'lucide-react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar"
import { CommandDialog, Command as CommandUI } from "@/components/ui/command"
import { CalendarDateRangePicker } from "@/components/ui/calendar"
import { MultiSelect } from "@/components/ui/multi-select"
import { InputWithSelect } from "@/components/ui/input-with-select"
import { FileUpload } from "@/components/ui/file-upload"
import { DataTable } from "@/components/ui/data-table"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { Pagination } from "@/components/ui/pagination"
import { Steps } from "@/components/ui/steps"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { AspectRatioDemo } from "@/components/ui/aspect-ratio"
import { CalendarDemo } from "@/components/ui/calendar"
import { AlertDialogDemo } from "@/components/ui/alert-dialog"
import { HoverCardDemo } from "@/components/ui/hover-card"
import { NavigationMenuDemo } from "@/components/ui/navigation-menu"
import { DropdownMenuDemo } from "@/components/ui/dropdown-menu"
import { ContextMenuDemo } from "@/components/ui/context-menu"
import { MenubarDemo } from "@/components/ui/menubar"
import { CommandDemo } from "@/components/ui/command"
import { CalendarDateRangePickerDemo } from "@/components/ui/calendar"
import { MultiSelectDemo } from "@/components/ui/multi-select"
import { InputWithSelectDemo } from "@/components/ui/input-with-select"
import { FileUploadDemo } from "@/components/ui/file-upload"
import { DataTableDemo } from "@/components/ui/data-table"
import { DataTableViewOptionsDemo } from "@/components/ui/data-table-view-options"
import { PaginationDemo } from "@/components/ui/pagination"
import { StepsDemo } from "@/components/ui/steps"
import { CarouselDemo } from "@/components/ui/carousel"
import { ProgressDemo } from "@/components/ui/progress"
import { AccordionDemo } from "@/components/ui/accordion"
import { SwitchDemo } from "@/components/ui/switch"
import { SeparatorDemo } from "@/components/ui/separator"
import { ScrollAreaDemo } from "@/components/ui/scroll-area"
import { BadgeDemo } from "@/components/ui/badge"
import { DrawerDemo } from "@/components/ui/drawer"
import { PopoverDemo } from "@/components/ui/popover"
import { SliderDemo } from "@/components/ui/slider"
import { CheckboxDemo } from "@/components/ui/checkbox"
import { TextareaDemo } from "@/components/ui/textarea"
import { LabelDemo } from "@/components/ui/label"
import { CardDemo } from "@/components/ui/card"
import { TableDemo } from "@/components/ui/table"
import { InputDemo } from "@/components/ui/input"
import { ButtonDemo } from "@/components/ui/button"

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState<string[]>([]);
  const [remoteFilter, setRemoteFilter] = useState(false);
  const [experienceLevelsFilter, setExperienceLevelsFilter] = useState<string[]>([]);
  const [educationFilter, setEducationFilter] = useState<string[]>([]);
  const [salaryRangeFilter, setSalaryRangeFilter] = useState<[number, number]>([0, 200000]);
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [companyTypesFilter, setCompanyTypesFilter] = useState<string[]>([]);
  const [companySizeFilter, setCompanySizeFilter] = useState<string[]>([]);
  const [benefitsFilter, setBenefitsFilter] = useState<string[]>([]);
  const [datePostedFilter, setDatePostedFilter] = useState<string>('');
  const [excludedSkillsFilter, setExcludedSkillsFilter] = useState<string[]>([]);
  const [jobFunctionFilter, setJobFunctionFilter] = useState<string[]>([]);
  const [workModelFilter, setWorkModelFilter] = useState<string[]>([]);
  const [experienceYearsFilter, setExperienceYearsFilter] = useState<[number, number]>([0, 10]);
  const [sponsorH1bFilter, setSponsorH1bFilter] = useState<boolean>(false);
  const [categoriesFilter, setCategoriesFilter] = useState<string[]>([]);
  const [companiesFilter, setCompaniesFilter] = useState<string[]>([]);
  const [excludeStaffingAgencyFilter, setExcludeStaffingAgencyFilter] = useState<boolean>(false);
  const [companyStageFilter, setCompanyStageFilter] = useState<string[]>([]);
  const [roleTypeFilter, setRoleTypeFilter] = useState<string[]>([]);
  const [titleFilter, setTitleFilter] = useState<string[]>([]);
  
  const handleApply = (job: Job) => {
    toast.success(`${job.title} at ${job.company} applied!`);
    setIsApplied(true);
  };
  
  const handleSave = (job: Job) => {
    toast.success(`${job.title} at ${job.company} saved!`);
    setIsSaved(true);
  };
  
  // Enhanced function to generate sample jobs with validation
  const generateSampleJobs = async (): Promise<Job[]> => {
    const sampleJobs: Job[] = [
      {
        id: '1',
        title: 'Frontend Developer',
        company: 'Google',
        location: 'Mountain View, CA',
        description: 'Join our team to build the next generation of web applications...',
        requirements: ['5+ years of experience', 'Expert in React', 'Strong CS fundamentals'],
        skills: ['React', 'TypeScript', 'GraphQL'],
        salary: {
          min: 130000,
          max: 180000,
          currency: '$'
        },
        type: 'full-time',
        level: 'senior',
        matchPercentage: 92,
        remote: true,
        postedAt: new Date().toISOString(),
        applyUrl: 'https://careers.google.com/jobs/results',
        applicationDetails: {
          isAvailable: true,
          applicantCount: 45
        }
      },
      {
        id: '2',
        title: 'Data Scientist',
        company: 'Microsoft',
        location: 'Seattle, WA',
        description: 'Help us make sense of the world\'s data...',
        requirements: ['3+ years of experience', 'Strong in Python', 'Experience with machine learning'],
        skills: ['Python', 'Machine Learning', 'SQL'],
        salary: {
          min: 140000,
          max: 200000,
          currency: '$'
        },
        type: 'full-time',
        level: 'mid',
        matchPercentage: 88,
        remote: false,
        postedAt: new Date().toISOString(),
        applyUrl: 'https://careers.microsoft.com/professionals/us/en/job-listings',
        applicationDetails: {
          isAvailable: true,
          applicantCount: 62
        }
      },
      {
        id: '3',
        title: 'Software Engineer',
        company: 'Amazon',
        location: 'Remote',
        description: 'Build scalable systems that power the world\'s largest e-commerce platform...',
        requirements: ['4+ years of experience', 'Proficient in Java', 'Experience with AWS'],
        skills: ['Java', 'AWS', 'Docker'],
        salary: {
          min: 120000,
          max: 170000,
          currency: '$'
        },
        type: 'full-time',
        level: 'mid',
        matchPercentage: 75,
        remote: true,
        postedAt: new Date().toISOString(),
        applyUrl: 'https://www.amazon.jobs/en/business_categories/software-development',
        applicationDetails: {
          isAvailable: true,
          applicantCount: 38
        }
      },
      {
        id: '4',
        title: 'Product Manager',
        company: 'Apple',
        location: 'Cupertino, CA',
        description: 'Define and drive the product vision for our next generation devices...',
        requirements: ['5+ years of experience', 'Strong analytical skills', 'Experience with Agile'],
        skills: ['Product Management', 'Agile', 'Analytics'],
        salary: {
          min: 150000,
          max: 220000,
          currency: '$'
        },
        type: 'full-time',
        level: 'senior',
        matchPercentage: 95,
        remote: false,
        postedAt: new Date().toISOString(),
        applyUrl: 'https://jobs.apple.com/en-us/search?team=Software-Engineering',
        applicationDetails: {
          isAvailable: true,
          applicantCount: 55
        }
      },
      {
        id: '5',
        title: 'Data Analyst',
        company: 'Netflix',
        location: 'Los Gatos, CA',
        description: 'Help us understand our users and improve their experience...',
        requirements: ['2+ years of experience', 'Proficient in SQL', 'Experience with data visualization'],
        skills: ['SQL', 'Data Visualization', 'Tableau'],
        salary: {
          min: 110000,
          max: 160000,
          currency: '$'
        },
        type: 'full-time',
        level: 'entry',
        matchPercentage: 68,
        remote: false,
        postedAt: new Date().toISOString(),
        applyUrl: 'https://jobs.netflix.com/search',
        applicationDetails: {
          isAvailable: true,
          applicantCount: 41
        }
      },
    ];

    // Validate each job's apply URL
    const validatedJobs = await Promise.all(
      sampleJobs.map(async (job) => {
        if (job.applyUrl) {
          const validation = await validateJobUrl(job.applyUrl);
          if (job.applicationDetails) {
            job.applicationDetails.isAvailable = validation.isValid;
          }
          if (!validation.isValid) {
            console.warn(`Invalid job URL for ${job.title}: ${validation.error}`);
          }
        }
        return job;
      })
    );

    // Filter out jobs with invalid URLs
    return validatedJobs.filter(job => job.applicationDetails?.isAvailable);
  };

  // Update useEffect to handle async job generation
  useEffect(() => {
    const loadJobs = async () => {
      const jobs = await generateSampleJobs();
      setJobs(jobs);
    };
    loadJobs();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Job Filters Section */}
      <aside className="w-80 border-r p-4">
        <Button onClick={() => setFiltersVisible(!filtersVisible)}>
          {filtersVisible ? 'Hide Filters' : 'Show Filters'}
        </Button>
        {filtersVisible && (
          <JobFilters />
        )}
      </aside>

      {/* Job Listings and Detail View Section */}
      <main className="flex-1 flex flex-col">
        {/* Job Listings */}
        <section className="p-4">
          <h1 className="text-2xl font-bold mb-4">Job Listings</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className="cursor-pointer hover:shadow-md transition-shadow duration-300"
                onClick={() => setSelectedJob(job)}
              >
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{job.location}</p>
                  <p className="text-sm mt-2">
                    Match: {job.matchPercentage}%
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Job Detail View */}
        <section className="p-4">
          {selectedJob ? (
            <JobDetailView 
              job={selectedJob} 
              onApply={handleApply} 
              onSave={handleSave}
              isSaved={isSaved}
              isApplied={isApplied}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p>Select a job to view details</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
