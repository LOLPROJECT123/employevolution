
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, X, Search, MapPin, Building, Briefcase, User, DollarSign, GraduationCap, Shield, Calendar, Star } from 'lucide-react';

interface UnifiedJobFiltersProps {
  onApplyFilters: (filters: JobFilters) => void;
  initialFilters?: JobFilters;
}

export const UnifiedJobFilters = ({ onApplyFilters, initialFilters }: UnifiedJobFiltersProps) => {
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

  const [openSections, setOpenSections] = useState<string[]>(['basic', 'jobType', 'experience']);

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

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
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

  // Filter options
  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'temporary'];
  const experienceLevels = ['intern', 'entry', 'mid', 'senior', 'lead', 'executive'];
  const companyTypes = ['private', 'public', 'nonprofit', 'education', 'government'];
  const companySizes = ['startup', 'small', 'medium', 'large', 'enterprise'];
  const educationLevels = ['High School', 'Associate', 'Bachelor', 'Master', 'PhD'];
  const jobFunctions = ['Engineering', 'Sales', 'Marketing', 'Design', 'Product', 'Operations', 'Finance', 'HR', 'Legal', 'Customer Success'];
  const popularCompanies = ['Google', 'Apple', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'Spotify', 'Uber', 'Airbnb', 'Stripe', 'Shopify'];
  const jobTitles = ['Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Engineering Manager'];
  const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'];
  const benefits = ['Health Insurance', 'Dental', 'Vision', '401k', 'Remote Work', 'Flexible Hours', 'PTO', 'Stock Options', 'Free Lunch', 'Gym Membership'];

  const FilterSection = ({ title, icon: Icon, sectionKey, children }: { 
    title: string; 
    icon: any; 
    sectionKey: string; 
    children: React.ReactNode; 
  }) => (
    <Collapsible open={openSections.includes(sectionKey)} onOpenChange={() => toggleSection(sectionKey)}>
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-gray-100">{title}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes(sectionKey) ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 pt-0">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Job Filters</span>
          </div>
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {/* Basic Search */}
          <FilterSection title="Basic Search" icon={Search} sectionKey="basic">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Keywords</Label>
                <Input
                  id="search"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Job title, skills, company..."
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="City, state, or remote"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={filters.remote}
                onCheckedChange={(checked) => handleFilterChange('remote', checked)}
              />
              <Label htmlFor="remote">Remote positions only</Label>
            </div>
          </FilterSection>

          {/* Job Function */}
          <FilterSection title="Job Function" icon={Briefcase} sectionKey="jobFunction">
            <Select value={filters.jobFunction} onValueChange={(value) => handleFilterChange('jobFunction', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select job function" />
              </SelectTrigger>
              <SelectContent>
                {jobFunctions.map(func => (
                  <SelectItem key={func} value={func}>{func}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterSection>

          {/* Job Titles */}
          <FilterSection title="Job Titles" icon={User} sectionKey="jobTitles">
            <div>
              <Input
                value={filters.title || ''}
                onChange={(e) => handleFilterChange('title', e.target.value)}
                placeholder="Enter specific job title"
                className="mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {jobTitles.map(title => (
                  <Badge
                    key={title}
                    variant={filters.title === title ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleFilterChange('title', filters.title === title ? '' : title)}
                  >
                    {title}
                  </Badge>
                ))}
              </div>
            </div>
          </FilterSection>

          {/* Companies */}
          <FilterSection title="Companies" icon={Building} sectionKey="companies">
            <div className="flex flex-wrap gap-2">
              {popularCompanies.map(company => (
                <label key={company} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.companies?.includes(company) || false}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('companies', company, checked as boolean)
                    }
                  />
                  <span className="text-sm">{company}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Job Type */}
          <FilterSection title="Job Type" icon={Calendar} sectionKey="jobType">
            <div className="flex flex-wrap gap-4">
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
          </FilterSection>

          {/* Experience Level */}
          <FilterSection title="Experience Level" icon={Star} sectionKey="experience">
            <div className="flex flex-wrap gap-4">
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
          </FilterSection>

          {/* Salary Range */}
          <FilterSection title="Salary Range" icon={DollarSign} sectionKey="salary">
            <div className="px-3 py-4">
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
          </FilterSection>

          {/* Skills */}
          <FilterSection title="Skills" icon={GraduationCap} sectionKey="skills">
            <div className="space-y-3">
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
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Selected:</span>
                  {filters.skills.map(skill => (
                    <Badge key={skill} variant="default" className="gap-1">
                      {skill}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleSkillRemove(skill)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </FilterSection>

          {/* Company Details */}
          <FilterSection title="Company Details" icon={Building} sectionKey="companyDetails">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Company Type</Label>
                <div className="space-y-2 mt-2">
                  {companyTypes.map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.companyTypes.includes(type)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('companyTypes', type, checked as boolean)
                        }
                      />
                      <span className="capitalize text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Company Size</Label>
                <div className="space-y-2 mt-2">
                  {companySizes.map(size => (
                    <label key={size} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.companySize.includes(size)}
                        onCheckedChange={(checked) => 
                          handleMultiSelectChange('companySize', size, checked as boolean)
                        }
                      />
                      <span className="capitalize text-sm">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Benefits */}
          <FilterSection title="Benefits & Perks" icon={Star} sectionKey="benefits">
            <div className="flex flex-wrap gap-3">
              {benefits.map(benefit => (
                <label key={benefit} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.benefits.includes(benefit)}
                    onCheckedChange={(checked) => 
                      handleMultiSelectChange('benefits', benefit, checked as boolean)
                    }
                  />
                  <span className="text-sm">{benefit}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Advanced Options */}
          <FilterSection title="Advanced Options" icon={Shield} sectionKey="advanced">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sponsorH1B"
                  checked={filters.sponsorH1B}
                  onCheckedChange={(checked) => handleFilterChange('sponsorH1B', checked)}
                />
                <Label htmlFor="sponsorH1B">Sponsors H1B visa</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="simpleApplications"
                  checked={filters.simpleApplications}
                  onCheckedChange={(checked) => handleFilterChange('simpleApplications', checked)}
                />
                <Label htmlFor="simpleApplications">Easy apply only</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hideAppliedJobs"
                  checked={filters.hideAppliedJobs}
                  onCheckedChange={(checked) => handleFilterChange('hideAppliedJobs', checked)}
                />
                <Label htmlFor="hideAppliedJobs">Hide jobs I've applied to</Label>
              </div>
            </div>
          </FilterSection>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <Button variant="outline" onClick={clearAllFilters}>
            Clear All
          </Button>
          <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
