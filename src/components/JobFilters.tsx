
import React, { useState } from 'react';
import { JobFilters } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { X, Search, MapPin } from 'lucide-react';

interface JobFiltersSectionProps {
  onApplyFilters: (filters: JobFilters) => void;
  initialFilters?: JobFilters;
}

export const JobFiltersSection = ({ onApplyFilters, initialFilters }: JobFiltersSectionProps) => {
  const [filters, setFilters] = useState<JobFilters>(initialFilters || {
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
    benefits: [],
    seasons: [],
    leadership: 'no-preference',
    securityClearance: 'allow',
    sponsorH1B: false,
    simpleApplications: false,
    hideAppliedJobs: false,
    jobFunction: '',
    companies: [],
    title: ''
  });

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectChange = (key: keyof JobFilters, value: string, checked: boolean) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[] || [];
      if (checked) {
        return { ...prev, [key]: [...currentArray, value] };
      } else {
        return { ...prev, [key]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !filters.skills.includes(skill)) {
      handleFilterChange('skills', [...filters.skills, skill]);
    }
  };

  const handleSkillRemove = (skill: string) => {
    handleFilterChange('skills', filters.skills.filter(s => s !== skill));
  };

  const clearAllFilters = () => {
    const clearedFilters: JobFilters = {
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
      benefits: [],
      seasons: [],
      leadership: 'no-preference',
      securityClearance: 'allow',
      sponsorH1B: false,
      simpleApplications: false,
      hideAppliedJobs: false,
      jobFunction: '',
      companies: [],
      title: ''
    };
    setFilters(clearedFilters);
  };

  const applyFilters = () => {
    onApplyFilters(filters);
  };

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship'];
  const experienceLevels = ['intern', 'entry', 'mid', 'senior', 'executive'];
  const companyTypes = ['private', 'public', 'nonprofit', 'education'];
  const companySizes = ['seed', 'early', 'mid-size', 'large', 'enterprise'];
  const educationLevels = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD'];
  const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'SQL', 'AWS', 'Docker'];
  const benefits = ['Health Insurance', 'Dental', 'Vision', '401k', 'Remote Work', 'Flexible Hours', 'PTO', 'Stock Options'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Job Filters
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search">Job Title or Keywords</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="e.g., Software Engineer, Data Scientist"
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="e.g., San Francisco, Remote"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Job Type and Remote */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Job Type</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {jobTypes.map(type => (
                <label key={type} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.jobType.includes(type)}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('jobType', type, checked as boolean)
                    }
                  />
                  <span className="capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={filters.remote}
              onCheckedChange={(checked) => handleFilterChange('remote', checked)}
            />
            <Label htmlFor="remote">Remote Work Available</Label>
          </div>
        </div>

        <Separator />

        {/* Experience Level */}
        <div>
          <Label className="text-base font-semibold">Experience Level</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {experienceLevels.map(level => (
              <label key={level} className="flex items-center space-x-2">
                <Checkbox
                  checked={filters.experienceLevels.includes(level)}
                  onCheckedChange={(checked) => 
                    handleMultiSelectChange('experienceLevels', level, checked as boolean)
                  }
                />
                <span className="capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        {/* Salary Range */}
        <div>
          <Label className="text-base font-semibold">Salary Range</Label>
          <div className="px-3 mt-4">
            <Slider
              value={filters.salaryRange}
              onValueChange={(value) => handleFilterChange('salaryRange', value)}
              max={300000}
              min={0}
              step={5000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>${filters.salaryRange[0].toLocaleString()}</span>
              <span>${filters.salaryRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Skills */}
        <div>
          <Label className="text-base font-semibold">Required Skills</Label>
          <div className="space-y-2 mt-2">
            <div className="flex flex-wrap gap-2">
              {commonSkills.map(skill => (
                <Badge
                  key={skill}
                  variant={filters.skills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => 
                    filters.skills.includes(skill) 
                      ? handleSkillRemove(skill)
                      : handleSkillAdd(skill)
                  }
                >
                  {skill}
                </Badge>
              ))}
            </div>
            
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm font-medium">Selected:</span>
                {filters.skills.map(skill => (
                  <Badge key={skill} variant="default" className="gap-1">
                    {skill}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleSkillRemove(skill)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={clearAllFilters}>
            Clear All
          </Button>
          <Button onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
