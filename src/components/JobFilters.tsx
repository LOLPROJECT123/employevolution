
import { useState } from 'react';
import { JobFilters } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Search, MapPin, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface JobFiltersSectionProps {
  onFiltersApply: (filters: JobFilters) => void;
}

export const JobFiltersSection = ({ onFiltersApply }: JobFiltersSectionProps) => {
  const [filters, setFilters] = useState<JobFilters>({
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
    jobFunction: [],
    companies: [],
    title: ""
  });

  const [isAllFiltersOpen, setIsAllFiltersOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'temporary'];
  const experienceLevels = ['intern', 'entry', 'mid', 'senior', 'lead', 'executive', 'manager', 'director'];
  const companyTypes = ['public', 'private', 'startup', 'non-profit'];
  const companySizes = ['startup', 'small', 'mid-size', 'enterprise'];
  const jobFunctions = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations'];

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayFilter = (key: keyof JobFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter(item => item !== value)
        : [...(prev[key] as string[]), value]
    }));
  };

  const clearFilters = () => {
    setFilters({
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
      jobFunction: [],
      companies: [],
      title: ""
    });
  };

  const applyFilters = () => {
    onFiltersApply(filters);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterSection = ({ 
    title, 
    icon, 
    children, 
    sectionKey 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode; 
    sectionKey: string;
  }) => (
    <Collapsible 
      open={openSections[sectionKey]} 
      onOpenChange={() => toggleSection(sectionKey)}
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium">{title}</span>
        </div>
        {openSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-lg">Filter Jobs</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Find jobs that match your preferences</p>
      </div>

      <div className="p-4">
        <Collapsible open={isAllFiltersOpen} onOpenChange={setIsAllFiltersOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="font-medium">All Filters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Reset All</span>
              {isAllFiltersOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4 space-y-2">
            <FilterSection 
              title="Location" 
              icon={<MapPin className="h-4 w-4 text-blue-600" />}
              sectionKey="location"
            >
              <Input
                placeholder="e.g. San Francisco, CA"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </FilterSection>

            <FilterSection 
              title="Salary Range" 
              icon={<div className="w-4 h-4 rounded-full bg-green-600" />}
              sectionKey="salary"
            >
              <div className="space-y-3">
                <Label>Salary Range (${filters.salaryRange[0].toLocaleString()} - ${filters.salaryRange[1].toLocaleString()})</Label>
                <Slider
                  value={filters.salaryRange}
                  onValueChange={(value) => handleFilterChange('salaryRange', value as [number, number])}
                  max={300000}
                  min={0}
                  step={5000}
                  className="w-full"
                />
              </div>
            </FilterSection>

            <FilterSection 
              title="Job Type" 
              icon={<div className="w-4 h-4 rounded bg-purple-600" />}
              sectionKey="jobType"
            >
              <div className="flex flex-wrap gap-2">
                {jobTypes.map(type => (
                  <Button
                    key={type}
                    variant={filters.jobType.includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('jobType', type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </FilterSection>

            <FilterSection 
              title="Experience Level" 
              icon={<div className="w-4 h-4 rounded bg-orange-600" />}
              sectionKey="experience"
            >
              <div className="flex flex-wrap gap-2">
                {experienceLevels.map(level => (
                  <Button
                    key={level}
                    variant={filters.experienceLevels.includes(level) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('experienceLevels', level)}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </FilterSection>

            <FilterSection 
              title="Job Function" 
              icon={<div className="w-4 h-4 rounded bg-red-600" />}
              sectionKey="jobFunction"
            >
              <div className="flex flex-wrap gap-2">
                {jobFunctions.map(func => (
                  <Button
                    key={func}
                    variant={filters.jobFunction.includes(func) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('jobFunction', func)}
                  >
                    {func}
                  </Button>
                ))}
              </div>
            </FilterSection>

            <FilterSection 
              title="Skills" 
              icon={<div className="w-4 h-4 rounded bg-teal-600" />}
              sectionKey="skills"
            >
              <Input
                placeholder="Add skills..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = e.currentTarget.value.trim();
                    if (value && !filters.skills.includes(value)) {
                      handleFilterChange('skills', [...filters.skills, value]);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('skills', filters.skills.filter(s => s !== skill))}
                    />
                  </Badge>
                ))}
              </div>
            </FilterSection>

            <FilterSection 
              title="Companies" 
              icon={<div className="w-4 h-4 rounded bg-indigo-600" />}
              sectionKey="companies"
            >
              <Input
                placeholder="Company names..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = e.currentTarget.value.trim();
                    if (value && !filters.companies.includes(value)) {
                      handleFilterChange('companies', [...filters.companies, value]);
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.companies.map(company => (
                  <Badge key={company} variant="secondary" className="flex items-center gap-1">
                    {company}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('companies', filters.companies.filter(c => c !== company))}
                    />
                  </Badge>
                ))}
              </div>
            </FilterSection>

            <FilterSection 
              title="Job Titles" 
              icon={<div className="w-4 h-4 rounded bg-yellow-600" />}
              sectionKey="jobTitles"
            >
              <Input
                placeholder="e.g. Software Engineer, Product Manager"
                value={filters.title}
                onChange={(e) => handleFilterChange('title', e.target.value)}
              />
            </FilterSection>
          </CollapsibleContent>
        </Collapsible>

        <div className="mt-6">
          <Button 
            onClick={applyFilters} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
