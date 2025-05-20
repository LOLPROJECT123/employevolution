
import React, { useState, useEffect } from 'react';
import { JobFilters } from "@/types/job";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  DollarSign,
  Briefcase,
  GraduationCap,
  Code,
  Building2,
  Search,
  BookmarkCheck,
  CalendarDays
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { formatSalaryCompact, getLocationSuggestions } from "@/utils/formatters";

interface MobileJobFiltersSectionProps {
  onApplyFilters: (filters: JobFilters) => void;
  initialFilters?: Partial<JobFilters>;
}

export const MobileJobFiltersSection = ({ onApplyFilters, initialFilters = {} }: MobileJobFiltersSectionProps) => {
  const [location, setLocation] = useState(initialFilters.location || "");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [remote, setRemote] = useState(initialFilters.remote || false);
  const [salaryRange, setSalaryRange] = useState<[number, number]>(initialFilters.salaryRange || [50000, 150000]);
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<JobFilters['sort']>(initialFilters.sort || 'relevance');
  
  // Sample job types
  const [jobTypes, setJobTypes] = useState<Record<string, boolean>>({
    "full-time": initialFilters.jobType?.includes("full-time") || false,
    "part-time": initialFilters.jobType?.includes("part-time") || false,
    "contract": initialFilters.jobType?.includes("contract") || false,
    "internship": initialFilters.jobType?.includes("internship") || false,
    "temporary": initialFilters.jobType?.includes("temporary") || false
  });
  
  // Sample experience levels
  const [experienceLevels, setExperienceLevels] = useState<Record<string, boolean>>({
    "entry": initialFilters.experienceLevels?.includes("entry") || false,
    "mid": initialFilters.experienceLevels?.includes("mid") || false,
    "senior": initialFilters.experienceLevels?.includes("senior") || false,
    "lead": initialFilters.experienceLevels?.includes("lead") || false,
    "manager": initialFilters.experienceLevels?.includes("manager") || false,
    "director": initialFilters.experienceLevels?.includes("director") || false,
    "executive": initialFilters.experienceLevels?.includes("executive") || false
  });
  
  // Get location suggestions when location input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      const suggestions = await getLocationSuggestions(location);
      setLocationSuggestions(suggestions);
    };

    fetchSuggestions();
  }, [location]);

  const handleJobTypeToggle = (type: string) => {
    setJobTypes({
      ...jobTypes,
      [type]: !jobTypes[type]
    });
  };
  
  const handleExperienceLevelToggle = (level: string) => {
    setExperienceLevels({
      ...experienceLevels,
      [level]: !experienceLevels[level]
    });
  };
  
  const handleApplyFilters = () => {
    // Create filters object from state
    const selectedJobTypes = Object.entries(jobTypes)
      .filter(([_, selected]) => selected)
      .map(([type]) => type);
      
    const selectedExperienceLevels = Object.entries(experienceLevels)
      .filter(([_, selected]) => selected)
      .map(([level]) => level);
    
    // Create filters object
    const filters: JobFilters = {
      search: "",
      location: location,
      jobType: selectedJobTypes,
      remote: remote,
      experienceLevels: selectedExperienceLevels,
      education: [],
      salaryRange: salaryRange,
      skills: [],
      companyTypes: [],
      companySize: [],
      benefits: [],
      sort: sort
    };
    
    onApplyFilters(filters);
  };

  const handleSelectLocation = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setOpen(false);
  };
  
  return (
    <div className="space-y-2">
      {/* Sort By Dropdown */}
      <div className="mb-4">
        <Label htmlFor="sort" className="text-sm font-medium mb-1.5 block">Sort By</Label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as JobFilters['sort'])}
          className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <option value="relevance">Relevance</option>
          <option value="date-newest">Date: Newest First</option>
          <option value="date-oldest">Date: Oldest First</option>
          <option value="salary-highest">Salary: Highest First</option>
          <option value="salary-lowest">Salary: Lowest First</option>
        </select>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {/* Location */}
        <AccordionItem value="location" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="py-3 text-sm font-medium">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-blue-500" />
              Location
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-3">
              <div>
                <Label htmlFor="location" className="text-xs mb-1.5 block">City, State, or Zip</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Input 
                        id="location" 
                        placeholder="Enter location" 
                        value={location} 
                        onChange={(e) => setLocation(e.target.value)}
                        className="h-9 text-sm pr-8"
                      />
                      <Search className="h-4 w-4 absolute top-2.5 right-2.5 text-gray-400" />
                    </div>
                  </PopoverTrigger>
                  {locationSuggestions.length > 0 && (
                    <PopoverContent className="p-0 w-[300px] max-h-[200px] overflow-y-auto" align="start">
                      <Command>
                        <CommandList>
                          {locationSuggestions.map((suggestion) => (
                            <CommandItem 
                              key={suggestion} 
                              onSelect={() => handleSelectLocation(suggestion)}
                              className="cursor-pointer"
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              {suggestion}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  )}
                </Popover>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                <Switch 
                  id="remote" 
                  checked={remote} 
                  onCheckedChange={setRemote}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor="remote" className="text-sm cursor-pointer">Remote only</Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Salary */}
        <AccordionItem value="salary" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="py-3 text-sm font-medium">
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-green-500" />
              Salary Range
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                <span>{formatSalaryCompact(salaryRange[0])}</span>
                <span>{formatSalaryCompact(salaryRange[1])}</span>
              </div>
              <Slider
                defaultValue={[50000, 150000]}
                min={0}
                max={300000}
                step={5000}
                value={salaryRange}
                onValueChange={(value) => setSalaryRange(value as [number, number])}
                className="[&>span]:bg-blue-600"
              />
              <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                Drag the handles to set min and max salary
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Job Type */}
        <AccordionItem value="job-type" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="py-3 text-sm font-medium">
            <div className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4 text-purple-500" />
              Job Type
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(jobTypes).map(([type, isChecked]) => (
                <div 
                  key={type} 
                  className={`flex items-center gap-2 p-2 rounded border ${
                    isChecked 
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleJobTypeToggle(type)}
                >
                  <Checkbox 
                    id={`job-type-${type}`} 
                    checked={isChecked} 
                    onCheckedChange={() => handleJobTypeToggle(type)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label 
                    htmlFor={`job-type-${type}`} 
                    className="text-xs cursor-pointer capitalize"
                  >
                    {type.replace('-', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Experience Level */}
        <AccordionItem value="experience" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="py-3 text-sm font-medium">
            <div className="flex items-center">
              <GraduationCap className="mr-2 h-4 w-4 text-orange-500" />
              Experience Level
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(experienceLevels).map(([level, isChecked]) => (
                <div 
                  key={level} 
                  className={`flex items-center gap-2 p-2 rounded border ${
                    isChecked 
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleExperienceLevelToggle(level)}
                >
                  <Checkbox 
                    id={`exp-${level}`} 
                    checked={isChecked} 
                    onCheckedChange={() => handleExperienceLevelToggle(level)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label 
                    htmlFor={`exp-${level}`} 
                    className="text-xs cursor-pointer capitalize"
                  >
                    {level}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Date Posted */}
        <AccordionItem value="date-posted" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="py-3 text-sm font-medium">
            <div className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-blue-500" />
              Date Posted
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-2">
              {["Past 24 hours", "Past week", "Past month", "Any time"].map((period) => (
                <div
                  key={period}
                  className="flex items-center gap-2 p-2 rounded border border-gray-200 dark:border-gray-700"
                >
                  <Checkbox 
                    id={`date-${period}`}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label 
                    htmlFor={`date-${period}`} 
                    className="text-xs cursor-pointer"
                  >
                    {period}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="mt-4">
        <Button
          onClick={handleApplyFilters}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
