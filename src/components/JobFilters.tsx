
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Search, Filter, Info, Check, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { JobFilters } from "@/types/job";

type JobFunctionType = string;
type SkillType = string;
type CompanyType = string;
type JobTitleType = string;

interface JobFiltersSectionProps {
  onApplyFilters?: (filters: JobFilters) => void;
}

// Storage key for persisting filters
const FILTER_STORAGE_KEY = 'jobSearchFilters';

// Helper function to load filters from localStorage
const loadSavedFilters = (): JobFilters | null => {
  try {
    const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
  } catch (error) {
    console.error('Error loading saved filters:', error);
  }
  return null;
};

// Helper function to save filters to localStorage
const saveFilters = (filters: JobFilters) => {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving filters:', error);
  }
};

export const JobFiltersSection = ({ onApplyFilters }: JobFiltersSectionProps) => {
  const savedFilters = loadSavedFilters();
  
  // State for all filters - initialize from localStorage if available
  const [jobFunctions, setJobFunctions] = useState<JobFunctionType[]>(
    savedFilters?.jobFunction || []
  );
  const [skills, setSkills] = useState<SkillType[]>(
    savedFilters?.skills || []
  );
  const [companies, setCompanies] = useState<CompanyType[]>(
    savedFilters?.companies || []
  );
  const [jobTitles, setJobTitles] = useState<JobTitleType[]>(
    savedFilters?.title || []
  );
  const [salaryRange, setSalaryRange] = useState<[number, number]>(
    savedFilters?.salaryRange || [50000, 150000]
  );
  const [location, setLocation] = useState(
    savedFilters?.location || ""
  );
  const [remote, setRemote] = useState(
    savedFilters?.remote || false
  );
  
  // Initialize job types from saved filters or defaults
  const initJobTypes = () => {
    const defaultTypes = {
      "full-time": false,
      "part-time": false,
      "contract": false,
      "internship": false,
      "temporary": false
    };
    
    if (savedFilters?.jobType?.length) {
      const savedTypes = { ...defaultTypes };
      savedFilters.jobType.forEach(type => {
        if (type in savedTypes) {
          savedTypes[type] = true;
        }
      });
      return savedTypes;
    }
    
    return defaultTypes;
  };
  
  // Initialize experience levels from saved filters or defaults
  const initExperienceLevels = () => {
    const defaultLevels = {
      "entry": false,
      "mid": false,
      "senior": false,
      "lead": false,
      "manager": false,
      "director": false,
      "executive": false
    };
    
    if (savedFilters?.experienceLevels?.length) {
      const savedLevels = { ...defaultLevels };
      savedFilters.experienceLevels.forEach(level => {
        if (level in savedLevels) {
          savedLevels[level] = true;
        }
      });
      return savedLevels;
    }
    
    return defaultLevels;
  };
  
  const [jobTypes, setJobTypes] = useState<{[key: string]: boolean}>(initJobTypes());
  const [experienceLevels, setExperienceLevels] = useState<{[key: string]: boolean}>(initExperienceLevels());
  
  // Input refs for the add functionality
  const jobFunctionInputRef = useRef<HTMLInputElement>(null);
  const skillInputRef = useRef<HTMLInputElement>(null);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const jobTitleInputRef = useRef<HTMLInputElement>(null);
  
  // State for showing modals
  const [showAddJobFunctionModal, setShowAddJobFunctionModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showAddJobTitleModal, setShowAddJobTitleModal] = useState(false);
  
  // New input values
  const [newJobFunction, setNewJobFunction] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");

  // Flag to track if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(!!savedFilters);

  // State to track if the filters section is open
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Apply saved filters on component mount
  useEffect(() => {
    if (savedFilters && onApplyFilters) {
      onApplyFilters(savedFilters);
      setFiltersApplied(true);
    }
  }, [onApplyFilters]);

  // Handle applying filters
  const handleApplyFilters = () => {
    // Create a filters object based on current state
    const selectedJobTypes = Object.entries(jobTypes)
      .filter(([_, selected]) => selected)
      .map(([type]) => type);
      
    const selectedExperienceLevels = Object.entries(experienceLevels)
      .filter(([_, selected]) => selected)
      .map(([level]) => level);
    
    const filters: JobFilters = {
      search: "",
      location: location,
      jobType: selectedJobTypes,
      remote: remote,
      experienceLevels: selectedExperienceLevels,
      education: [],
      salaryRange: salaryRange,
      skills: skills,
      companyTypes: [],
      companySize: [],
      benefits: [],
      jobFunction: jobFunctions,
      companies: companies,
      title: jobTitles,
    };
    
    // Save filters to localStorage
    saveFilters(filters);
    
    // Call the callback function with the filters
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    
    setFiltersApplied(true);
    
    toast.success("Filters applied", {
      description: "Your job search filters have been applied and saved."
    });
  };
  
  // Handle adding new items
  const handleAddJobFunction = () => {
    if (newJobFunction.trim() !== "" && !jobFunctions.includes(newJobFunction)) {
      setJobFunctions([...jobFunctions, newJobFunction]);
      setNewJobFunction("");
      setShowAddJobFunctionModal(false);
    }
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() !== "" && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
      setShowAddSkillModal(false);
    }
  };
  
  const handleAddCompany = () => {
    if (newCompany.trim() !== "" && !companies.includes(newCompany)) {
      setCompanies([...companies, newCompany]);
      setNewCompany("");
      setShowAddCompanyModal(false);
    }
  };
  
  const handleAddJobTitle = () => {
    if (newJobTitle.trim() !== "" && !jobTitles.includes(newJobTitle)) {
      setJobTitles([...jobTitles, newJobTitle]);
      setNewJobTitle("");
      setShowAddJobTitleModal(false);
    }
  };
  
  // Handle remove item
  const handleRemoveJobFunction = (jobFunction: string) => {
    setJobFunctions(jobFunctions.filter(item => item !== jobFunction));
  };
  
  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(item => item !== skill));
  };
  
  const handleRemoveCompany = (company: string) => {
    setCompanies(companies.filter(item => item !== company));
  };
  
  const handleRemoveJobTitle = (jobTitle: string) => {
    setJobTitles(jobTitles.filter(item => item !== jobTitle));
  };
  
  // Handle job type toggle
  const handleJobTypeToggle = (type: string) => {
    setJobTypes({
      ...jobTypes,
      [type]: !jobTypes[type]
    });
  };
  
  // Handle experience level toggle
  const handleExperienceLevelToggle = (level: string) => {
    setExperienceLevels({
      ...experienceLevels,
      [level]: !experienceLevels[level]
    });
  };
  
  // Handle reset all filters
  const handleResetFilters = () => {
    // Clear localStorage
    localStorage.removeItem(FILTER_STORAGE_KEY);
    
    setJobFunctions([]);
    setSkills([]);
    setCompanies([]);
    setJobTitles([]);
    setSalaryRange([50000, 150000]);
    setLocation("");
    setRemote(false);
    setJobTypes({
      "full-time": false,
      "part-time": false,
      "contract": false,
      "internship": false,
      "temporary": false
    });
    setExperienceLevels({
      "entry": false,
      "mid": false,
      "senior": false,
      "lead": false,
      "manager": false,
      "director": false,
      "executive": false
    });
    setFiltersApplied(false);
    
    // Apply reset filters if callback exists
    if (onApplyFilters) {
      onApplyFilters({
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
    }
    
    toast.success("Filters reset", {
      description: "All job search filters have been reset."
    });
  };
  
  // Format salary display
  const formatSalary = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    
    if (location) count++;
    if (remote) count++;
    
    // Count selected job types
    Object.values(jobTypes).forEach(selected => {
      if (selected) count++;
    });
    
    // Count selected experience levels
    Object.values(experienceLevels).forEach(selected => {
      if (selected) count++;
    });
    
    // Add other filter categories
    count += jobFunctions.length;
    count += skills.length;
    count += companies.length;
    count += jobTitles.length;
    
    // Add salary if it's not the default
    if (salaryRange[0] !== 50000 || salaryRange[1] !== 150000) {
      count++;
    }
    
    return count;
  };
  
  const activeFilterCount = getActiveFilterCount();
  
  return (
    <Card className="border border-border bg-background">
      <CardContent className="p-0">
        <Collapsible
          open={isFiltersOpen}
          onOpenChange={setIsFiltersOpen}
          className="w-full"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <h3 className="text-lg font-medium">All Filters</h3>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResetFilters}
              className="text-xs h-8 ml-2"
            >
              Reset All
            </Button>
          </div>
          
          <CollapsibleContent>
            <div className="p-4 md:p-6 space-y-4">
              <Accordion type="single" collapsible className="w-full divide-y">
                {/* Location Section */}
                <AccordionItem value="location" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium">Location</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="location">City, State, or Zip</Label>
                        <Input 
                          id="location" 
                          placeholder="e.g. San Francisco, CA" 
                          value={location} 
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="remote" 
                          checked={remote} 
                          onCheckedChange={setRemote} 
                        />
                        <Label htmlFor="remote">Remote only</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Salary Range Section */}
                <AccordionItem value="salary" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium">Salary Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{formatSalary(salaryRange[0])}</span>
                        <span className="text-sm font-medium">{formatSalary(salaryRange[1])}</span>
                      </div>
                      <Slider
                        defaultValue={[50000, 150000]}
                        min={0}
                        max={300000}
                        step={5000}
                        value={salaryRange}
                        onValueChange={(value) => setSalaryRange(value as [number, number])}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Job Type Section */}
                <AccordionItem value="job-type" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium">Job Type</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="full-time" 
                          checked={jobTypes["full-time"]} 
                          onCheckedChange={() => handleJobTypeToggle("full-time")}
                        />
                        <Label htmlFor="full-time" className="cursor-pointer">Full-time</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="part-time" 
                          checked={jobTypes["part-time"]} 
                          onCheckedChange={() => handleJobTypeToggle("part-time")}
                        />
                        <Label htmlFor="part-time" className="cursor-pointer">Part-time</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="contract" 
                          checked={jobTypes["contract"]} 
                          onCheckedChange={() => handleJobTypeToggle("contract")}
                        />
                        <Label htmlFor="contract" className="cursor-pointer">Contract</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="internship" 
                          checked={jobTypes["internship"]} 
                          onCheckedChange={() => handleJobTypeToggle("internship")}
                        />
                        <Label htmlFor="internship" className="cursor-pointer">Internship</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="temporary" 
                          checked={jobTypes["temporary"]} 
                          onCheckedChange={() => handleJobTypeToggle("temporary")}
                        />
                        <Label htmlFor="temporary" className="cursor-pointer">Temporary</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Experience Level Section */}
                <AccordionItem value="experience" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium">Experience Level</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="entry" 
                          checked={experienceLevels["entry"]} 
                          onCheckedChange={() => handleExperienceLevelToggle("entry")}
                        />
                        <Label htmlFor="entry" className="cursor-pointer">Entry Level</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mid" 
                          checked={experienceLevels["mid"]} 
                          onCheckedChange={() => handleExperienceLevelToggle("mid")}
                        />
                        <Label htmlFor="mid" className="cursor-pointer">Mid Level</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="senior" 
                          checked={experienceLevels["senior"]} 
                          onCheckedChange={() => handleExperienceLevelToggle("senior")}
                        />
                        <Label htmlFor="senior" className="cursor-pointer">Senior Level</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="lead" 
                          checked={experienceLevels["lead"]} 
                          onCheckedChange={() => handleExperienceLevelToggle("lead")}
                        />
                        <Label htmlFor="lead" className="cursor-pointer">Lead</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="manager" 
                          checked={experienceLevels["manager"]} 
                          onCheckedChange={() => handleExperienceLevelToggle("manager")}
                        />
                        <Label htmlFor="manager" className="cursor-pointer">Manager</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="director" 
                          checked={experienceLevels["director"]} 
                          onCheckedChange={() => handleExperienceLevelToggle("director")}
                        />
                        <Label htmlFor="director" className="cursor-pointer">Director</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="executive" 
                          checked={experienceLevels["executive"]} 
                          onCheckedChange={() => handleExperienceLevelToggle("executive")}
                        />
                        <Label htmlFor="executive" className="cursor-pointer">Executive</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Job Function Section */}
                <AccordionItem value="job-function" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium">Job Function</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {jobFunctions.map((jobFunction, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="flex items-center gap-1 py-1"
                          >
                            {jobFunction}
                            <button 
                              onClick={() => handleRemoveJobFunction(jobFunction)}
                              className="ml-1 rounded-full hover:bg-muted p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        
                        <Dialog open={showAddJobFunctionModal} onOpenChange={setShowAddJobFunctionModal}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs gap-1 px-2"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add Job Function</DialogTitle>
                              <DialogDescription>
                                Enter a job function to add to your filters
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <Input 
                                placeholder="e.g. Software Development" 
                                value={newJobFunction}
                                onChange={(e) => setNewJobFunction(e.target.value)}
                                ref={jobFunctionInputRef}
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowAddJobFunctionModal(false)}>Cancel</Button>
                              <Button onClick={handleAddJobFunction}>Add</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Skills Section */}
                <AccordionItem value="skills" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium">Skills</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="flex items-center gap-1 py-1"
                          >
                            {skill}
                            <button 
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-1 rounded-full hover:bg-muted p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        
                        <Dialog open={showAddSkillModal} onOpenChange={setShowAddSkillModal}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs gap-1 px-2"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add Skill</DialogTitle>
                              <DialogDescription>
                                Enter a skill to add to your filters
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <Input 
                                placeholder="e.g. React" 
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                ref={skillInputRef}
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowAddSkillModal(false)}>Cancel</Button>
                              <Button onClick={handleAddSkill}>Add</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Companies Section */}
                <AccordionItem value="companies" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium">Companies</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {companies.map((company, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="flex items-center gap-1 py-1"
                          >
                            {company}
                            <button 
                              onClick={() => handleRemoveCompany(company)}
                              className="ml-1 rounded-full hover:bg-muted p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        
                        <Dialog open={showAddCompanyModal} onOpenChange={setShowAddCompanyModal}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs gap-1 px-2"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add Company</DialogTitle>
                              <DialogDescription>
                                Enter a company to add to your filters
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <Input 
                                placeholder="e.g. Google" 
                                value={newCompany}
                                onChange={(e) => setNewCompany(e.target.value)}
                                ref={companyInputRef}
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowAddCompanyModal(false)}>Cancel</Button>
                              <Button onClick={handleAddCompany}>Add</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Job Titles Section */}
                <AccordionItem value="job-titles" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium">Job Titles</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {jobTitles.map((jobTitle, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="flex items-center gap-1 py-1"
                          >
                            {jobTitle}
                            <button 
                              onClick={() => handleRemoveJobTitle(jobTitle)}
                              className="ml-1 rounded-full hover:bg-muted p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        
                        <Dialog open={showAddJobTitleModal} onOpenChange={setShowAddJobTitleModal}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-7 text-xs gap-1 px-2"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add Job Title</DialogTitle>
                              <DialogDescription>
                                Enter a job title to add to your filters
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <Input 
                                placeholder="e.g. Software Engineer" 
                                value={newJobTitle}
                                onChange={(e) => setNewJobTitle(e.target.value)}
                                ref={jobTitleInputRef}
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowAddJobTitleModal(false)}>Cancel</Button>
                              <Button onClick={handleAddJobTitle}>Add</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button 
          className="w-full flex items-center justify-center gap-2" 
          onClick={handleApplyFilters}
        >
          <Check className="h-4 w-4" />
          Apply Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
