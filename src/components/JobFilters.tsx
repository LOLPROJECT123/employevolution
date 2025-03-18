
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
import { Heart, SlidersHorizontal, X, Check, ChevronRight, Info, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { JobFilters } from "@/types/job";

interface JobFiltersSectionProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onSaveSearch: (name: string) => void;
  onResetFilters: () => void;
}

export function JobFiltersSection({ 
  filters, 
  onFiltersChange, 
  onSaveSearch,
  onResetFilters 
}: JobFiltersSectionProps) {
  const { toast } = useToast();
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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

  return (
    <div className="space-y-4">
      {!showAllFilters ? (
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setShowAllFilters(true)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            All Filters
          </Button>
          
          <div className="flex items-center gap-2">
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
              <SlidersHorizontal className="w-5 h-5" />
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
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-6">
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
              
              <div className="md:col-span-2 space-y-6">
                <Accordion type="multiple" defaultValue={["job-type", "experience", "education"]}>
                  <AccordionItem value="job-type" className="border rounded-lg p-2">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Job Type</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2">
                      <p className="text-sm text-muted-foreground mb-3">Filter jobs by employment type</p>
                      <div className="grid grid-cols-2 gap-3">
                        {["Full-time", "Part-time", "Contract", "Internship", "Temporary", "Volunteer"].map((type) => (
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
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="experience" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Experience Level</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2">
                      <div className="grid grid-cols-2 gap-3">
                        {["Intern", "Entry", "Mid", "Senior", "Manager", "Director", "Executive"].map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`exp-level-${level}`} 
                              checked={filters.experienceLevels.includes(level)}
                              onCheckedChange={() => toggleExperienceLevel(level)}
                            />
                            <Label htmlFor={`exp-level-${level}`} className="text-sm cursor-pointer">
                              {level === "Intern" ? "Intern/New Grad" : `${level} Level`}
                            </Label>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex justify-between mb-2">
                          <Label className="text-sm">Required Experience (Years)</Label>
                          <span className="text-sm text-muted-foreground">0-11+ years</span>
                        </div>
                        <Slider
                          defaultValue={[0, 11]}
                          min={0}
                          max={11}
                          step={1}
                          className="mt-6"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="education" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Education</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
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
                  
                  <AccordionItem value="salary" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Salary</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2">
                      <p className="text-sm text-muted-foreground mb-3">Filter by minimum salary</p>
                      <RadioGroup defaultValue="$40000+">
                        {["$40,000+", "$80,000+", "$100,000+", "$200,000+", "$300,000+", "$400,000+"].map((salary) => (
                          <div key={salary} className="flex items-center space-x-2 py-1">
                            <RadioGroupItem value={salary} id={`salary-${salary}`} />
                            <Label htmlFor={`salary-${salary}`} className="text-sm cursor-pointer">
                              {salary}
                            </Label>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2 py-1">
                          <RadioGroupItem value="custom" id="salary-custom" />
                          <Label htmlFor="salary-custom" className="text-sm cursor-pointer sr-only">
                            Custom
                          </Label>
                          <Input className="w-full h-8" placeholder="Custom" />
                        </div>
                      </RadioGroup>
                      
                      <div className="flex items-center mt-4 border-t pt-4">
                        <Checkbox id="h1b-sponsorship" />
                        <Label htmlFor="h1b-sponsorship" className="ml-2 text-sm cursor-pointer">
                          Sponsors H1B
                        </Label>
                        <div className="relative ml-1 group">
                          <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer" />
                          <div className="absolute left-0 bottom-6 w-60 p-2 bg-popover shadow-md rounded text-xs hidden group-hover:block z-50">
                            This filter helps you find jobs that either explicitly share H1B support or come from companies with a recent history of sponsoring H1B visas.
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="company-type" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Company Type</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2">
                      <p className="text-sm text-muted-foreground mb-3">Filter by type of company</p>
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
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="company-size" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Company Size</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 px-2 pb-2">
                      <p className="text-sm text-muted-foreground mb-3">Filter by category of company</p>
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
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="benefits" className="border rounded-lg p-2 mt-3">
                    <AccordionTrigger className="hover:no-underline px-2">
                      <div className="flex justify-between w-full">
                        <span className="font-medium">Benefits</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
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
                </Accordion>
                
                <div className="flex justify-between pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={onResetFilters}
                  >
                    Clear All
                  </Button>
                  <Button>
                    Update
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
