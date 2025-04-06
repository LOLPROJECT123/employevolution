
import React, { useState } from 'react';
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
  FileText
} from "lucide-react";

interface MobileJobFiltersSectionProps {
  onApplyFilters: (filters: JobFilters) => void;
}

export const MobileJobFiltersSection = ({ onApplyFilters }: MobileJobFiltersSectionProps) => {
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([50000, 150000]);
  
  // Sample job types
  const [jobTypes, setJobTypes] = useState({
    "full-time": false,
    "part-time": false,
    "contract": false,
    "internship": false
  });
  
  // Sample experience levels
  const [experienceLevels, setExperienceLevels] = useState({
    "entry": false,
    "mid": false,
    "senior": false
  });
  
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
  
  const formatSalary = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
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
      benefits: []
    };
    
    onApplyFilters(filters);
  };
  
  return (
    <div className="space-y-2">
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
                <Input 
                  id="location" 
                  placeholder="Enter location" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-9 text-sm"
                />
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
                <span>{formatSalary(salaryRange[0])}</span>
                <span>{formatSalary(salaryRange[1])}</span>
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
      </Accordion>
    </div>
  );
};
