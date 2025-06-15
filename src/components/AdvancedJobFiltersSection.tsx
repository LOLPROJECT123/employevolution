
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  MapPin,
  DollarSign,
  Briefcase,
  GraduationCap,
  Code,
  Building2,
  FileText,
  Calendar,
  Shield,
  Users,
  CheckCircle,
  EyeOff
} from "lucide-react";

interface AdvancedJobFiltersSectionProps {
  onApplyFilters: (filters: JobFilters) => void;
  appliedJobIds?: string[];
}

export const AdvancedJobFiltersSection = ({ onApplyFilters, appliedJobIds = [] }: AdvancedJobFiltersSectionProps) => {
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [salaryRange, setSalaryRange] = useState<[number, number]>([50000, 150000]);
  
  // Job types
  const [jobTypes, setJobTypes] = useState({
    "full-time": false,
    "part-time": false,
    "contract": false,
    "internship": false
  });
  
  // Experience levels
  const [experienceLevels, setExperienceLevels] = useState({
    "entry": false,
    "mid": false,
    "senior": false
  });

  // Seasonal filters - key feature from the images
  const [seasons, setSeasons] = useState({
    "Summer 2025": false,
    "Fall 2025": false,
    "Winter 2025": false,
    "Spring 2026": false,
    "Summer 2026": false,
    "Fall 2026": false
  });

  // Leadership preference
  const [leadership, setLeadership] = useState<'individual' | 'manager' | 'no-preference'>('no-preference');

  // Security clearance
  const [securityClearance, setSecurityClearance] = useState<'hide' | 'show-only' | 'allow'>('allow');

  // Advanced toggles
  const [sponsorH1B, setSponsorH1B] = useState(false);
  const [simpleApplications, setSimpleApplications] = useState(false);
  const [hideAppliedJobs, setHideAppliedJobs] = useState(false);
  
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

  const handleSeasonToggle = (season: string) => {
    setSeasons({
      ...seasons,
      [season]: !seasons[season]
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
    const selectedJobTypes = Object.entries(jobTypes)
      .filter(([_, selected]) => selected)
      .map(([type]) => type);
      
    const selectedExperienceLevels = Object.entries(experienceLevels)
      .filter(([_, selected]) => selected)
      .map(([level]) => level);

    const selectedSeasons = Object.entries(seasons)
      .filter(([_, selected]) => selected)
      .map(([season]) => season);
    
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
      seasons: selectedSeasons,
      leadership: leadership,
      securityClearance: securityClearance,
      sponsorH1B: sponsorH1B,
      simpleApplications: simpleApplications,
      hideAppliedJobs: hideAppliedJobs
    };
    
    onApplyFilters(filters);
  };
  
  return (
    <div className="space-y-2">
      <Accordion type="multiple" className="w-full">
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

        {/* Seasons - Key feature from reference images */}
        <AccordionItem value="seasons" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="py-3 text-sm font-medium">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-green-500" />
              Seasons
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(seasons).map(([season, isChecked]) => (
                <div 
                  key={season} 
                  className={`flex items-center gap-2 p-2 rounded border ${
                    isChecked 
                      ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => handleSeasonToggle(season)}
                >
                  <Checkbox 
                    id={`season-${season}`} 
                    checked={isChecked} 
                    onCheckedChange={() => handleSeasonToggle(season)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label 
                    htmlFor={`season-${season}`} 
                    className="text-xs cursor-pointer"
                  >
                    {season}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Leadership */}
        <AccordionItem value="leadership" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="py-3 text-sm font-medium">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-purple-500" />
              Leadership
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <RadioGroup value={leadership} onValueChange={(value: 'individual' | 'manager' | 'no-preference') => setLeadership(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="text-sm">Individual Contributor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manager" id="manager" />
                <Label htmlFor="manager" className="text-sm">Manager</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no-preference" id="no-preference" />
                <Label htmlFor="no-preference" className="text-sm">I don't have a preference</Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Security Clearance */}
        <AccordionItem value="security-clearance" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="py-3 text-sm font-medium">
            <div className="flex items-center">
              <Shield className="mr-2 h-4 w-4 text-red-500" />
              Security Clearance
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <RadioGroup value={securityClearance} onValueChange={(value: 'hide' | 'show-only' | 'allow') => setSecurityClearance(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hide" id="hide-clearance" />
                <Label htmlFor="hide-clearance" className="text-sm">Hide Clearance Jobs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="show-only" id="show-only-clearance" />
                <Label htmlFor="show-only-clearance" className="text-sm">Show Only Clearance Jobs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="allow" id="allow-clearance" />
                <Label htmlFor="allow-clearance" className="text-sm">Allow Clearance Jobs</Label>
              </div>
            </RadioGroup>
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

        {/* Advanced Options */}
        <AccordionItem value="advanced" className="border-b border-gray-200 dark:border-gray-700">
          <AccordionTrigger className="py-3 text-sm font-medium">
            <div className="flex items-center">
              <Code className="mr-2 h-4 w-4 text-indigo-500" />
              Advanced Options
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="h1b-sponsor" className="text-sm">Sponsors H1B</Label>
                <Switch 
                  id="h1b-sponsor" 
                  checked={sponsorH1B} 
                  onCheckedChange={setSponsorH1B}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="simple-apps" className="text-sm">Simple Applications</Label>
                <Switch 
                  id="simple-apps" 
                  checked={simpleApplications} 
                  onCheckedChange={setSimpleApplications}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="hide-applied" className="text-sm">Hide Applied Jobs</Label>
                <Switch 
                  id="hide-applied" 
                  checked={hideAppliedJobs} 
                  onCheckedChange={setHideAppliedJobs}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-4">
        <Button 
          onClick={handleApplyFilters}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 h-12 font-medium"
        >
          Apply Advanced Filters
        </Button>
      </div>
    </div>
  );
};
