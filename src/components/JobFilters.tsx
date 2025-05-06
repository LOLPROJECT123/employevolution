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
import { JobFilters as JobFiltersType } from "@/types/job";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type JobFunctionType = string;
type SkillType = string;
type CompanyType = string;
type JobTitleType = string;

interface JobFiltersSectionProps {
  onApplyFilters?: (filters: JobFiltersType) => void;
}

// Storage key for persisting filters
const FILTER_STORAGE_KEY = 'jobSearchFilters';

// Helper function to load filters from localStorage
const loadSavedFilters = (): JobFiltersType | null => {
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
const saveFilters = (filters: JobFiltersType) => {
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

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
    
    const filters: JobFiltersType = {
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
    <Card className="border border-border bg-background shadow-md rounded-lg overflow-hidden">
      <CardContent className="p-0">
        <Collapsible
          open={isFiltersOpen}
          onOpenChange={setIsFiltersOpen}
          className="w-full"
        >
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-500" />
                <h3 className="text-lg font-medium">All Filters</h3>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {activeFilterCount}
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform duration-200 text-gray-500 ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResetFilters}
              className="text-xs h-8 ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              Reset All
            </Button>
          </div>
          
          <CollapsibleContent className="transition-all duration-300 ease-in-out">
            <div className="p-4 md:p-6 space-y-4">
              <Accordion type="single" collapsible className="w-full divide-y">
                {/* Location Section */}
                <AccordionItem value="location" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded-md transition-colors">
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      Location
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">City, State, or Zip</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            id="location" 
                            placeholder="e.g. San Francisco, CA" 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)}
                            className="pl-9 border-gray-200 dark:border-gray-700 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        <Switch 
                          id="remote" 
                          checked={remote} 
                          onCheckedChange={setRemote}
                          className="data-[state=checked]:bg-blue-500"
                        />
                        <Label htmlFor="remote" className="cursor-pointer text-sm font-medium">Remote only</Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Salary Range Section */}
                <AccordionItem value="salary" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded-md transition-colors">
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                      Salary Range
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    <div className="space-y-4 pt-2 pb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatSalary(salaryRange[0])}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatSalary(salaryRange[1])}</span>
                      </div>
                      <Slider
                        defaultValue={[50000, 150000]}
                        min={0}
                        max={300000}
                        step={5000}
                        value={salaryRange}
                        onValueChange={(value) => setSalaryRange(value as [number, number])}
                        className="[&>span[data-state=dragging]]:bg-blue-600 [&>span]:h-5 [&>span]:w-5 [&>span]:bg-blue-500"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Job Type Section */}
                <AccordionItem value="job-type" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded-md transition-colors">
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                      Job Type
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    <div className="grid grid-cols-2 gap-3 pt-2 pb-1">
                      {Object.entries(jobTypes).map(([type, isChecked]) => (
                        <div 
                          key={type} 
                          className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer border ${isChecked ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700'}`}
                          onClick={() => handleJobTypeToggle(type)}
                        >
                          <Checkbox 
                            id={`job-type-${type}`} 
                            checked={isChecked} 
                            onCheckedChange={() => handleJobTypeToggle(type)}
                            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                          <Label 
                            htmlFor={`job-type-${type}`} 
                            className="cursor-pointer text-sm capitalize"
                          >
                            {type.replace('-', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Experience Level Section */}
                <AccordionItem value="experience" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded-md transition-colors">
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M20 7h-3a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M9 18a2 2 0 0 1-2-2v-2a2 2 0 0 0-2-2H2"/><path d="M12 12V2h7a2 2 0 0 1 2 2v7"/><path d="M12 12h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-3"/></svg>
                      Experience Level
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    <div className="space-y-2 pt-2 pb-1">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(experienceLevels).map(([level, isChecked]) => (
                          <div 
                            key={level} 
                            className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer border ${isChecked ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-700'}`}
                            onClick={() => handleExperienceLevelToggle(level)}
                          >
                            <Checkbox 
                              id={`exp-${level}`} 
                              checked={isChecked} 
                              onCheckedChange={() => handleExperienceLevelToggle(level)}
                              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            />
                            <Label 
                              htmlFor={`exp-${level}`} 
                              className="cursor-pointer text-sm capitalize"
                            >
                              {level.replace('-', ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Job Function Section */}
                <AccordionItem value="job-function" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded-md transition-colors">
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      Job Function
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    <div className="space-y-4 pt-2">
                      <div className="flex flex-wrap gap-2">
                        {jobFunctions.map((jobFunction, index) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className="flex items-center gap-1 py-1 px-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                          >
                            {jobFunction}
                            <button 
                              onClick={() => handleRemoveJobFunction(jobFunction)}
                              className="ml-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 p-0.5"
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
                              className="h-7 text-xs gap-1 px-2 border-dashed border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400"
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
                              <Button onClick={handleAddJobFunction} className="bg-blue-600 hover:bg-blue-700">Add</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Skills Section */}
                <AccordionItem value="skills" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded-md transition-colors">
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="m7 11 4.08 10.35a1 1 0 0 1 1.84 0L17 11"/><path d="M18 6a4 4 0 0 0-2-3.37A4 4 0 0 0 12 6a4 4 0 0 0-2-3.37A4 4 0 0 0 6 6h12Z"/></svg>
                      Skills
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    <div className="space-y-4 pt-2">
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className="flex items-center gap-1 py-1 px-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                          >
                            {skill}
                            <button 
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-1 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 p-0.5"
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
                              className="h-7 text-xs gap-1 px-2 border-dashed border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400"
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
                              <Button onClick={handleAddSkill} className="bg-emerald-600 hover:bg-emerald-700">Add</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Companies Section */}
                <AccordionItem value="companies" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded-md transition-colors">
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M3 9h18v10a2 2 0 0 1-2 2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/><path d="M12 14v3"/><path d="M8 14v1"/><path d="M16 14v1"/></svg>
                      Companies
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    <div className="space-y-4 pt-2">
                      <div className="flex flex-wrap gap-2">
                        {companies.map((company, index) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className="flex items-center gap-1 py-1 px-2 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700"
                          >
                            {company}
                            <button 
                              onClick={() => handleRemoveCompany(company)}
                              className="ml-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 p-0.5"
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
                              className="h-7 text-xs gap-1 px-2 border-dashed border-indigo-300 text-indigo-600 dark:border-indigo-700 dark:text-indigo-400"
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
                              <Button onClick={handleAddCompany} className="bg-indigo-600 hover:bg-indigo-700">Add</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Job Titles Section */}
                <AccordionItem value="job-titles" className="border-0 py-2">
                  <AccordionTrigger className="py-2 text-base font-medium hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded-md transition-colors">
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M12 12H5a2 2 0 0 0-2 2v5"/><path d="M15 2H8a2 2 0 0 0-2 2v10h8.5"/><path d="M20 14h-5v8h8v-5"/><path d="M20 14h-5V6h8v6c0 1.1-.9 2-2 2Z"/><path d="M3 10h7"/></svg>
                      Job Titles
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-2">
                    <div className="space-y-4 pt-2">
                      <div className="flex flex-wrap gap-2">
                        {jobTitles.map((jobTitle, index) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className="flex items-center gap-1 py-1 px-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                          >
                            {jobTitle}
                            <button 
                              onClick={() => handleRemoveJobTitle(jobTitle)}
                              className="ml-1 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 p-0.5"
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
                              className="h-7 text-xs gap-1 px-2 border-dashed border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400"
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
                              <Button onClick={handleAddJobTitle} className="bg-amber-600 hover:bg-amber-700">Add</Button>
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
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm py-2.5" 
          onClick={handleApplyFilters}
        >
          <Check className="h-4 w-4" />
          Apply Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Export JobFiltersSection as default named export
export default JobFiltersSection;
