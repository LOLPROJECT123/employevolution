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
  Filter
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
                          <span className="text-xs text-muted-foreground ml-2">(select from drop-down for best results)</span>
                        </div>
                        <Input 
                          placeholder="Please select/enter your expected job function" 
                          className="mt-2"
                        />
                        <p className="text-red-500 text-sm mt-1">Please select at least one job function</p>
                      </div>
                      
                      {/* Excluded Title */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Excluded Title</span>
                          <ChevronDown className="h-4 w-4" />
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
                        <p className="text-red-500 text-sm mt-1">Please select at least one job type.</p>
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
                        <p className="text-red-500 text-sm mt-1">Please select at least one work model.</p>
                      </div>

                      {/* Location */}
                      <div>
                        <div className="font-medium mb-2">Location</div>
                        <div className="flex items-center gap-2">
                          <Input defaultValue="Within US" className="flex-grow" />
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
                              {level.info && <Info className="h-4 w-4 text-muted-foreground" />}
                            </div>
                          ))}
                        </div>
                        <p className="text-red-500 text-sm mt-1">Please select at least one experience level.</p>
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
                          <span className="font-medium">Minimum Annual Salary $0k/yr</span>
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
                          <Info className="h-4 w-4 text-muted-foreground" />
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
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
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
                        <div className="mt-2 space-y-2">
                          {[
                            { id: "python", label: "Python", selected: true },
                            { id: "matlab", label: "Matlab", selected: true },
                            { id: "java", label: "Java", selected: true },
                            { id: "cpp", label: "C++", selected: true },
                            { id: "linux", label: "Linux", selected: true }
                          ].map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between bg-secondary/30 rounded-md px-3 py-1.5">
                              <span className="text-sm">{skill.label}</span>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  const skills = filters.skills.includes(skill.id)
                                    ? filters.skills.filter(s => s !== skill.id)
                                    : [...filters.skills, skill.id];
                                  onFiltersChange({ ...filters, skills });
                                }}
                              >
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Plus className="h-3 w-3" /> Add
                          </Button>
                        </div>
                      </div>

                      {/* Excluded Skill */}
                      <div>
                        <div className="flex justify-between">
                          <span className="font-medium">Excluded Skill</span>
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Role Type */}
                      <div>
                        <div className="font-medium mb-2">Role Type</div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            variant={filters.roleType?.includes("IC") ? "default" : "outline"} 
                            size="sm" 
                            className="justify-center"
                            onClick={() => toggleRoleType("IC")}
                          >
                            IC
                          </Button>
                          <Button 
                            variant={filters.roleType?.includes("Manager") ? "default" : "outline"} 
                            size="sm" 
                            className="justify-center"
                            onClick={() => toggleRoleType("Manager")}
                          >
                            Manager
                          </Button>
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
                      {/* Company */}
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Company</span>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex justify-between">
                          <div></div>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <Plus className="h-3 w-3" /> Add
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Company Stage */}
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Company Stage</span>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex justify-between">
                          <div></div>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Clear All</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {[
                            { id: "early", label: "Early Stage" },
                            { id: "growth", label: "Growth Stage" },
                            { id: "late", label: "Late Stage" },
                            { id: "public", label: "Public Company" }
                          ].map((stage) => (
                            <div key={stage.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`stage-${stage.id}`}
                                checked={filters.companyStage?.includes(stage.id)}
                                onCheckedChange={() => toggleCompanyStage(stage.id)}
                              />
                              <Label htmlFor={`stage-${stage.id}`} className="text-sm cursor-pointer">
                                {stage.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Job Source */}
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Job Source</span>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox 
                            id="exclude-staffing"
                            checked={filters.excludeStaffingAgency}
                            onCheckedChange={() => onFiltersChange({ 
                              ...filters, 
                              excludeStaffingAgency: !filters.excludeStaffingAgency
                            })}
                          />
                          <Label htmlFor="exclude-staffing" className="text-sm cursor-pointer">
                            Exclude Staffing Agency
                          </Label>
                        </div>
                      </div>

                      {/* Company Type */}
                      <div>
                        <h4 className="font-medium mb-3">Company Type</h4>
                        <div className="space-y-2">
                          {["Private", "Public", "Nonprofit", "Education"].map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`company-type-${type}`} 
                                checked={filters.companyTypes.includes(type)}
                                onCheckedChange={() => toggleCompanyType(type)}
                              />
                              <Label htmlFor={`company-type-${type}`} className="text-sm cursor-pointer">
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Company Size */}
                      <div>
                        <h4 className="font-medium mb-3">Company Size</h4>
                        <div className="space-y-2">
                          {[
                            { id: "seed", label: "Seed, 1-10" },
                            { id: "early", label: "Early, 11-100" },
                            { id: "mid-size", label: "Mid-size, 101-1,000" },
                            { id: "large", label: "Large, 1,001-10,000" },
                            { id: "enterprise", label: "Enterprise, 10,001+" }
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
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="education" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Education</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2">
                      <p className="text-sm text-muted-foreground mb-3">Filter by education level</p>
                      <div className="grid grid-cols-2 gap-3">
                        {["Bachelor's", "Master's", "Associate's", "PhD", "MD", "MBA"].map((education) => (
                          <div key={education} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`education-${education}`} 
                              checked={filters.education.includes(education)}
                              onCheckedChange={() => toggleEducation(education)}
                            />
                            <Label htmlFor={`education-${education}`} className="text-sm cursor-pointer">
                              {education}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="benefits" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Benefits</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2">
                      <p className="text-sm text-muted-foreground mb-3">Filter jobs by benefits a company offers</p>
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Search all benefits" className="pl-9" />
                        </div>
                      </div>
                      <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Popular</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Remote Work", "401K", "PTO", "Maternity Leave", "Free Lunch", 
                          "Tuition Reimbursement", "Pet Friendly", "Gym Discount", 
                          "Health Insurance", "Transport Allowance"
                        ].map((benefit) => (
                          <div key={benefit} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`benefit-${benefit}`} 
                              checked={filters.benefits.includes(benefit)}
                              onCheckedChange={() => toggleBenefit(benefit)}
                            />
                            <Label htmlFor={`benefit-${benefit}`} className="text-sm cursor-pointer">
                              {benefit}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="category" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Category</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2">
                      <p className="text-sm text-muted-foreground mb-3">Filter by category</p>
                      <div className="mb-4">
                        <select className="w-full border border-gray-300 rounded-md p-2 mb-4">
                          <option>Category</option>
                        </select>
                      </div>
                      <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Popular</p>
                      <div className="space-y-2">
                        {[
                          "Medical, Clinical & Veterinary",
                          "Software Engineering",
                          "Sales & Account Management",
                          "Finance & Banking",
                          "Nursing & Allied Health Professionals",
                          "Retail"
                        ].map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`category-${category}`}
                              checked={filters.categories?.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="title" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Title</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2">
                      <p className="text-sm text-muted-foreground mb-3">Filter by jobs by specific title(s)</p>
                      <div className="mb-4">
                        <Input placeholder="Search by title" className="mb-4" />
                      </div>
                      <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Popular</p>
                      <div className="space-y-2">
                        {[
                          { id: "software-engineer", icon: "🖥", label: "Software Engineer" },
                          { id: "product-manager", icon: "📊", label: "Product Manager" },
                          { id: "data-scientist", icon: "📈", label: "Data Scientist" },
                          { id: "engineering-manager", icon: "🛠", label: "Software Engineering Manager" },
                          { id: "product-designer", icon: "✏️", label: "Product Designer" },
                          { id: "hardware-engineer", icon: "🔌", label: "Hardware Engineer" },
                          { id: "business-analyst", icon: "📋", label: "Business Analyst" }
                        ].map((title) => (
                          <div key={title.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`title-${title.id}`}
                              checked={filters.title?.includes(title.id)}
                              onCheckedChange={() => toggleTitle(title.id)}
                            />
                            <Label htmlFor={`title-${title.id}`} className="text-sm cursor-pointer flex items-center">
                              <span className="mr-2">{title.icon}</span> {title.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="companies" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Companies</span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2">
                      <p className="text-sm text-muted-foreground mb-3">Filter by companies</p>
                      <div className="mb-4">
                        <Input placeholder="Search by company" className="mb-4" />
                      </div>
                      <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Popular</p>
                      <div className="space-y-2">
                        {["Amazon", "Microsoft", "Google", "Facebook", "Apple"].map((company) => (
                          <div key={company} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`company-${company}`}
                              checked={filters.companies?.includes(company)}
                              onCheckedChange={() => toggleCompany(company)}
                            />
                            <Label htmlFor={`company-${company}`} className="text-sm cursor-pointer">
                              {company}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="flex justify-between pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={onResetFilters}
                  >
                    Clear All
                  </Button>
                  <Button className="bg-green-500 hover:bg-green-600 text-white">
                    UPDATE
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {showSaveDialog && (
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Save This Search</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground"
                  onClick={() => setShowSaveDialog(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Input 
                placeholder="Enter a name for this search"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSaveSearch}
                >
                  Save Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default JobFiltersSection;

