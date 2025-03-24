
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Heart, 
  SlidersHorizontal, 
  X, 
  Check, 
  ChevronDown, 
  Info, 
  Search, 
  Plus, 
  XCircle,
  Filter,
  ChevronRight,
  MapPin,
  Building,
  Briefcase,
  Clock
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { JobFilters } from "@/types/job";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JobFiltersSectionProps {
  filters?: JobFilters;
  onFiltersChange?: (filters: JobFilters) => void;
  onSaveSearch?: (name: string) => void;
  onResetFilters?: () => void;
}

export function JobFiltersSection({ 
  filters = {
    search: '',
    location: '',
    jobType: [],
    remote: false,
    experienceLevels: [],
    education: [],
    salaryRange: [0, 400],
    skills: [],
    companyTypes: [],
    companySize: [],
    benefits: []
  }, 
  onFiltersChange = () => {}, 
  onSaveSearch = () => {},
  onResetFilters = () => {} 
}: JobFiltersSectionProps) {
  const { toast } = useToast();
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedExperienceYears, setSelectedExperienceYears] = useState<[number, number]>([0, 11]);
  const [customSalary, setCustomSalary] = useState("");
  const [activeAccordion, setActiveAccordion] = useState<string[]>(["basic-job-criteria"]);
  const [jobFunctionInput, setJobFunctionInput] = useState("");
  const [locationInput, setLocationInput] = useState("Within US");
  const [skillInput, setSkillInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [titleInput, setTitleInput] = useState("");

  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your search",
        variant: "destructive"
      });
      return;
    }

    onSaveSearch(searchName);
    setSearchName("");
    setShowSaveDialog(false);
    
    toast({
      title: "Search Saved",
      description: `Your search "${searchName}" has been saved.`
    });
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      const skills = [...filters.skills, skillInput.trim()];
      onFiltersChange({ ...filters, skills });
      setSkillInput("");
      
      toast({
        title: "Skill Added",
        description: `"${skillInput.trim()}" has been added to your skills filter.`
      });
    }
  };

  const handleAddCompany = () => {
    if (companyInput.trim()) {
      const companies = [...(filters.companies || []), companyInput.trim()];
      onFiltersChange({ ...filters, companies });
      setCompanyInput("");
      
      toast({
        title: "Company Added",
        description: `"${companyInput.trim()}" has been added to your company filter.`
      });
    }
  };

  const handleAddTitle = () => {
    if (titleInput.trim()) {
      const titles = [...(filters.title || []), titleInput.trim()];
      onFiltersChange({ ...filters, title: titles });
      setTitleInput("");
      
      toast({
        title: "Title Added",
        description: `"${titleInput.trim()}" has been added to your title filter.`
      });
    }
  };

  const handleAddJobFunction = () => {
    if (jobFunctionInput.trim()) {
      const jobFunction = [...(filters.jobFunction || []), jobFunctionInput.trim()];
      onFiltersChange({ ...filters, jobFunction });
      setJobFunctionInput("");
      
      toast({
        title: "Job Function Added",
        description: `"${jobFunctionInput.trim()}" has been added to your job function filter.`
      });
    }
  };

  const toggleJobType = (type: string) => {
    const jobType = filters.jobType.includes(type)
      ? filters.jobType.filter(t => t !== type)
      : [...filters.jobType, type];
    onFiltersChange({ ...filters, jobType });
  };

  const toggleExperienceLevel = (level: string) => {
    const experienceLevels = filters.experienceLevels.includes(level)
      ? filters.experienceLevels.filter(l => l !== level)
      : [...filters.experienceLevels, level];
    onFiltersChange({ ...filters, experienceLevels });
  };

  const toggleEducation = (education: string) => {
    const updatedEducation = filters.education.includes(education)
      ? filters.education.filter(e => e !== education)
      : [...filters.education, education];
    onFiltersChange({ ...filters, education: updatedEducation });
  };

  const toggleCompanyType = (type: string) => {
    const companyTypes = filters.companyTypes.includes(type)
      ? filters.companyTypes.filter(t => t !== type)
      : [...filters.companyTypes, type];
    onFiltersChange({ ...filters, companyTypes });
  };

  const toggleCompanySize = (size: string) => {
    const companySizes = filters.companySize.includes(size)
      ? filters.companySize.filter(s => s !== size)
      : [...filters.companySize, size];
    onFiltersChange({ ...filters, companySize: companySizes });
  };

  const toggleBenefit = (benefit: string) => {
    const benefits = filters.benefits.includes(benefit)
      ? filters.benefits.filter(b => b !== benefit)
      : [...filters.benefits, benefit];
    onFiltersChange({ ...filters, benefits });
  };

  const toggleWorkModel = (model: string) => {
    const workModel = filters.workModel?.includes(model)
      ? filters.workModel.filter(m => m !== model)
      : [...(filters.workModel || []), model];
    onFiltersChange({ ...filters, workModel });
  };

  const toggleJobFunction = (func: string) => {
    const jobFunction = filters.jobFunction?.includes(func)
      ? filters.jobFunction.filter(f => f !== func)
      : [...(filters.jobFunction || []), func];
    onFiltersChange({ ...filters, jobFunction });
  };

  const toggleCompanyStage = (stage: string) => {
    const companyStage = filters.companyStage?.includes(stage)
      ? filters.companyStage.filter(s => s !== stage)
      : [...(filters.companyStage || []), stage];
    onFiltersChange({ ...filters, companyStage });
  };

  const toggleRoleType = (type: string) => {
    const roleType = filters.roleType?.includes(type)
      ? filters.roleType.filter(t => t !== type)
      : [...(filters.roleType || []), type];
    onFiltersChange({ ...filters, roleType });
  };

  const toggleCategory = (category: string) => {
    const categories = filters.categories?.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...(filters.categories || []), category];
    onFiltersChange({ ...filters, categories });
  };

  const toggleTitle = (title: string) => {
    const titles = filters.title?.includes(title)
      ? filters.title.filter(t => t !== title)
      : [...(filters.title || []), title];
    onFiltersChange({ ...filters, title: titles });
  };

  const toggleCompany = (company: string) => {
    const companies = filters.companies?.includes(company)
      ? filters.companies.filter(c => c !== company)
      : [...(filters.companies || []), company];
    onFiltersChange({ ...filters, companies });
  };

  const handleExperienceYearsChange = (value: number[]) => {
    setSelectedExperienceYears(value as [number, number]);
    onFiltersChange({ ...filters, experienceYears: value as [number, number] });
  };

  const handleDatePostedChange = (value: string) => {
    onFiltersChange({ ...filters, datePosted: value });
  };

  const handleSalaryMinimumChange = (value: string) => {
    if (value === "custom") {
      // Handle custom salary input
      return;
    }
    
    // Extract numeric value from string like "$80,000+"
    const numericValue = parseInt(value.replace(/\D/g, ''));
    const currentMax = filters.salaryRange[1];
    onFiltersChange({ 
      ...filters, 
      salaryRange: [numericValue, currentMax > numericValue ? currentMax : numericValue + 50000] 
    });
  };

  const handleCustomSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSalary(e.target.value);
    const numericValue = parseInt(e.target.value.replace(/\D/g, ''));
    if (!isNaN(numericValue)) {
      const currentMax = filters.salaryRange[1];
      onFiltersChange({ 
        ...filters, 
        salaryRange: [numericValue, currentMax > numericValue ? currentMax : numericValue + 50000] 
      });
    }
  };

  return (
    <div className="space-y-4">
      {!showAllFilters ? (
        <div className="flex flex-wrap gap-2 justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setShowAllFilters(true)}
          >
            <Filter className="w-4 h-4" />
            All Filters
          </Button>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowSaveDialog(true)}
            >
              <Heart className="w-4 h-4 text-blue-500" />
              Save Search
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground"
              onClick={() => setShowAllFilters(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium text-base">Basic Job Criteria</h3>
                  <p className="text-xs text-muted-foreground">Job Function / Job Type / Work Model</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-base">Compensation & Sponsorship</h3>
                  <p className="text-xs text-muted-foreground">Annual Salary / H1B Sponsorship</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-base">Areas of Interest</h3>
                  <p className="text-xs text-muted-foreground">Industry / Skill / Role (IC/Manager)</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-base">Company Insights</h3>
                  <p className="text-xs text-muted-foreground">Company Search / Exclude Staffing Agency</p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-100 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500 text-sm mt-0.5">⭐</span>
                    <div>
                      <h4 className="font-medium text-sm text-green-800 dark:text-green-300">Applying for specific companies?</h4>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                        Use filters in the Company Insights section to find your target companies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2 space-y-6">
                <Accordion 
                  type="multiple" 
                  value={activeAccordion}
                  onValueChange={setActiveAccordion}
                  className="space-y-3"
                >
                  <AccordionItem value="basic-job-criteria" className="border rounded-lg p-2">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Basic Job Criteria</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2 space-y-6">
                      {/* Job Function */}
                      <div>
                        <div className="flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          <span className="font-medium">Job Function</span>
                          <span className="text-xs text-muted-foreground ml-2">(select/enter your expected job function)</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Input 
                            placeholder="E.g., Software Engineer, Data Scientist" 
                            className="flex-1"
                            value={jobFunctionInput}
                            onChange={(e) => setJobFunctionInput(e.target.value)}
                            icon={<Briefcase className="h-4 w-4" />}
                          />
                          <Button size="sm" onClick={handleAddJobFunction}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {filters.jobFunction && filters.jobFunction.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {filters.jobFunction.map((func) => (
                              <div key={func} className="flex items-center bg-secondary/30 rounded-md px-3 py-1.5">
                                <span className="text-sm">{func}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-5 w-5 p-0 ml-1"
                                  onClick={() => {
                                    const jobFunction = filters.jobFunction?.filter(f => f !== func);
                                    onFiltersChange({ ...filters, jobFunction });
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-red-500 text-sm mt-1">Please select at least one job function</p>
                        )}
                      </div>
                      
                      {/* Excluded Title */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Excluded Title</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 p-0"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Job Type */}
                      <div>
                        <div className="flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          <span className="font-medium">Job Type</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`job-type-${type}`} 
                                checked={filters.jobType.includes(type)}
                                onCheckedChange={() => toggleJobType(type)}
                              />
                              <Label htmlFor={`job-type-${type}`} className="text-sm cursor-pointer">
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {filters.jobType.length === 0 && (
                          <p className="text-red-500 text-sm mt-1">Please select at least one job type.</p>
                        )}
                      </div>

                      {/* Work Model */}
                      <div>
                        <div className="flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          <span className="font-medium">Work Model</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {[
                            { id: "onsite", label: "Onsite" },
                            { id: "remote", label: "Remote" },
                            { id: "hybrid", label: "Hybrid" }
                          ].map((model) => (
                            <div key={model.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`work-model-${model.id}`} 
                                checked={filters.workModel?.includes(model.id)}
                                onCheckedChange={() => toggleWorkModel(model.id)}
                              />
                              <Label htmlFor={`work-model-${model.id}`} className="text-sm cursor-pointer">
                                {model.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {!filters.workModel?.length && (
                          <p className="text-red-500 text-sm mt-1">Please select at least one work model.</p>
                        )}
                      </div>

                      {/* Location */}
                      <div>
                        <div className="font-medium mb-2">Location</div>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            className="flex-grow" 
                            icon={<MapPin className="h-4 w-4" />}
                          />
                          <Select defaultValue="50">
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Miles" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10mi</SelectItem>
                              <SelectItem value="25">25mi</SelectItem>
                              <SelectItem value="50">50mi</SelectItem>
                              <SelectItem value="100">100mi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Add
                          </Button>
                        </div>
                      </div>

                      {/* Experience Level */}
                      <div>
                        <div className="flex items-center">
                          <span className="text-red-500 mr-1">*</span>
                          <span className="font-medium">Experience Level</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {[
                            { id: "intern", label: "Intern/New Grad", info: true },
                            { id: "entry", label: "Entry Level", info: true },
                            { id: "mid", label: "Mid Level", info: true },
                            { id: "senior", label: "Senior Level", info: true },
                            { id: "lead", label: "Lead/Staff", info: true },
                            { id: "director", label: "Director/Executive", info: true }
                          ].map((level) => (
                            <div key={level.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`exp-level-${level.id}`} 
                                checked={filters.experienceLevels.includes(level.id)}
                                onCheckedChange={() => toggleExperienceLevel(level.id)}
                              />
                              <Label htmlFor={`exp-level-${level.id}`} className="text-sm cursor-pointer">
                                {level.label}
                              </Label>
                              {level.info && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 p-3">
                                    <p className="text-xs">
                                      {level.id === "intern" && "Roles suitable for students or recent graduates with little to no professional experience."}
                                      {level.id === "entry" && "Roles requiring 0-2 years of experience, suitable for those starting their career."}
                                      {level.id === "mid" && "Roles requiring 2-5 years of experience, with established skills in the field."}
                                      {level.id === "senior" && "Roles requiring 5+ years of experience, with deep expertise and ability to lead projects."}
                                      {level.id === "lead" && "Senior technical or leadership roles requiring 8+ years of experience."}
                                      {level.id === "director" && "Executive or director-level positions with significant leadership responsibilities."}
                                    </p>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          ))}
                        </div>
                        {filters.experienceLevels.length === 0 && (
                          <p className="text-red-500 text-sm mt-1">Please select at least one experience level.</p>
                        )}
                      </div>

                      {/* Required Experience Years */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Required Experience 0-11 Years</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="py-4 px-2">
                          <Slider
                            value={selectedExperienceYears}
                            min={0}
                            max={11}
                            step={1}
                            onValueChange={handleExperienceYearsChange}
                          />
                          <div className="flex justify-between mt-1">
                            <span className="text-xs">{selectedExperienceYears[0]} years</span>
                            <span className="text-xs">{selectedExperienceYears[1]} years</span>
                          </div>
                        </div>
                      </div>

                      {/* Date Posted */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Date Posted</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            { id: "24h", label: "Past 24 hours" },
                            { id: "3d", label: "Past 3 days" },
                            { id: "7d", label: "Past week" },
                            { id: "30d", label: "Past month" }
                          ].map((option) => (
                            <Button 
                              key={option.id}
                              variant={filters.datePosted === option.id ? "default" : "outline"} 
                              size="sm" 
                              className="justify-start h-9"
                              onClick={() => handleDatePostedChange(option.id)}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="compensation" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Compensation & Sponsorship</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2 space-y-6">
                      {/* Minimum Annual Salary */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Minimum Annual Salary ${filters.salaryRange[0]}k/yr</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="py-4 px-2">
                          <Slider
                            value={[filters.salaryRange[0], filters.salaryRange[0]]}
                            min={0}
                            max={400}
                            step={10}
                            onValueChange={(values) => onFiltersChange({
                              ...filters,
                              salaryRange: [values[0], filters.salaryRange[1]]
                            })}
                          />
                          <div className="flex justify-between mt-1">
                            <span className="text-xs">$0k</span>
                            <span className="text-xs">$400k</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <RadioGroup 
                            value={`$${filters.salaryRange[0]}000+`}
                            onValueChange={handleSalaryMinimumChange}
                          >
                            <div className="space-y-2">
                              {["$40,000+", "$80,000+", "$100,000+", "$200,000+", "$300,000+", "$400,000+"].map((amount) => (
                                <div key={amount} className="flex items-center space-x-2">
                                  <RadioGroupItem value={amount} id={`salary-${amount}`} />
                                  <label htmlFor={`salary-${amount}`} className="text-sm cursor-pointer">
                                    {amount}
                                  </label>
                                </div>
                              ))}
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom" id="salary-custom" />
                                <Input 
                                  placeholder="Custom" 
                                  value={customSalary}
                                  onChange={handleCustomSalaryChange}
                                  className="h-7 text-sm"
                                />
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      {/* Work Authorization */}
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Work Authorization</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4">
                              <h4 className="font-medium text-sm mb-2">H1B Sponsorship Information</h4>
                              <p className="text-xs text-muted-foreground">
                                When enabled, we'll prioritize jobs from companies with a history of providing
                                H1B visa sponsorship, based on public records and our database.
                              </p>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox 
                            id="h1b-sponsorship"
                            checked={filters.sponsorH1b}
                            onCheckedChange={() => onFiltersChange({ ...filters, sponsorH1b: !filters.sponsorH1b })}
                          />
                          <Label htmlFor="h1b-sponsorship" className="text-sm cursor-pointer">
                            H1B sponsorship
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          This filter helps you find jobs that either explicitly share H1B support
                          ("H1B Sponsored") or come from companies with a recent history of 
                          sponsoring H1B visas for similar roles ("H1B Sponsor Likely").
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="areas-of-interest" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Areas of Interest</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2 space-y-6">
                      {/* Industry */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Industry</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="mt-2 space-y-2">
                          {[
                            { id: "it", label: "Information Technology", selected: true },
                            { id: "ai", label: "Artificial Intelligence (AI)", selected: true },
                            { id: "financial", label: "Financial Services", selected: true },
                            { id: "consulting", label: "Consulting", selected: true },
                            { id: "software", label: "Software", selected: true }
                          ].map((industry) => (
                            <div key={industry.id} className="flex items-center justify-between bg-secondary/30 rounded-md px-3 py-1.5">
                              <span className="text-sm">{industry.label}</span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={() => toggleCategory(industry.id)}
                              >
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center gap-1"
                            onClick={() => {
                              const dialogElement = document.getElementById('industry-dialog');
                              if (dialogElement) dialogElement.showModal();
                            }}
                          >
                            <Plus className="h-3 w-3" /> Add
                          </Button>
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Skills</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Input 
                            placeholder="Add a skill (e.g. Python, Java)" 
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={handleAddSkill}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-2 space-y-2">
                          {filters.skills.map((skill) => (
                            <div key={skill} className="flex items-center justify-between bg-secondary/30 rounded-md px-3 py-1.5">
                              <span className="text-sm">{skill}</span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  const skills = filters.skills.filter(s => s !== skill);
                                  onFiltersChange({ ...filters, skills });
                                }}
                              >
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Excluded Skill */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Excluded Skill</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 p-0"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Role Type */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Role Type</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {[
                            { id: "individual-contributor", label: "Individual Contributor" },
                            { id: "people-manager", label: "People Manager" }
                          ].map((type) => (
                            <div key={type.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`role-type-${type.id}`}
                                checked={filters.roleType?.includes(type.id)}
                                onCheckedChange={() => toggleRoleType(type.id)}
                              />
                              <Label htmlFor={`role-type-${type.id}`} className="text-sm cursor-pointer">
                                {type.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="company-insights" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Company Insights</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2 space-y-6">
                      {/* Company Name */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Company Name</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Input 
                            placeholder="E.g., Google, Microsoft" 
                            className="flex-1"
                            value={companyInput}
                            onChange={(e) => setCompanyInput(e.target.value)}
                            icon={<Building className="h-4 w-4" />}
                          />
                          <Button size="sm" onClick={handleAddCompany}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {filters.companies && filters.companies.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {filters.companies.map((company) => (
                              <div key={company} className="flex items-center bg-secondary/30 rounded-md px-3 py-1.5">
                                <span className="text-sm">{company}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-5 w-5 p-0 ml-1"
                                  onClick={() => {
                                    const companies = filters.companies?.filter(c => c !== company);
                                    onFiltersChange({ ...filters, companies });
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Excluded Companies */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Excluded Companies</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 p-0"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Company Size */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Company Size</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {[
                            { id: "1-50", label: "1-50 employees" },
                            { id: "51-200", label: "51-200 employees" },
                            { id: "201-500", label: "201-500 employees" },
                            { id: "501-1000", label: "501-1,000 employees" },
                            { id: "1001-5000", label: "1,001-5,000 employees" },
                            { id: "5001-10000", label: "5,001-10,000 employees" },
                            { id: "10001+", label: "10,001+ employees" }
                          ].map((size) => (
                            <div key={size.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`company-size-${size.id}`}
                                checked={filters.companySize.includes(size.id)}
                                onCheckedChange={() => toggleCompanySize(size.id)}
                              />
                              <Label htmlFor={`company-size-${size.id}`} className="text-sm cursor-pointer">
                                {size.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Company Type */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Company Type</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {[
                            { id: "public", label: "Public Company" },
                            { id: "private", label: "Private Company" },
                            { id: "non-profit", label: "Non-profit" },
                            { id: "government", label: "Government" },
                            { id: "startup", label: "Startup" },
                            { id: "agency", label: "Agency" }
                          ].map((type) => (
                            <div key={type.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`company-type-${type.id}`}
                                checked={filters.companyTypes.includes(type.id)}
                                onCheckedChange={() => toggleCompanyType(type.id)}
                              />
                              <Label htmlFor={`company-type-${type.id}`} className="text-sm cursor-pointer">
                                {type.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Company Stage */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Company Stage</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {[
                            { id: "seed", label: "Seed" },
                            { id: "seriesa", label: "Series A" },
                            { id: "seriesb", label: "Series B" },
                            { id: "seriesc", label: "Series C" },
                            { id: "seriesd", label: "Series D+" },
                            { id: "ipo", label: "IPO" }
                          ].map((stage) => (
                            <div key={stage.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`company-stage-${stage.id}`}
                                checked={filters.companyStage?.includes(stage.id)}
                                onCheckedChange={() => toggleCompanyStage(stage.id)}
                              />
                              <Label htmlFor={`company-stage-${stage.id}`} className="text-sm cursor-pointer">
                                {stage.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
