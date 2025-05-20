
import { useState, useEffect } from 'react';
import { X, Filter, ArrowUpAZ } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { JobFilters } from '@/types/job';

interface JobFiltersSectionProps {
  onApplyFilters: (filters: Partial<JobFilters>) => void;
}

export function JobFiltersSection({ onApplyFilters }: JobFiltersSectionProps) {
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    location: '',
    jobType: [],
    remote: false,
    experienceLevels: [],
    education: [],
    salaryRange: [0, 200000],
    skills: [],
    companyTypes: [],
    companySize: [],
    benefits: [],
  });
  
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const handleFilterChange = <K extends keyof JobFilters>(
    key: K,
    value: JobFilters[K]
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      return newFilters;
    });
  };

  const handleRemoveFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        handleFilterChange('search', '');
        break;
      case 'location':
        handleFilterChange('location', '');
        break;
      case 'remote':
        handleFilterChange('remote', false);
        break;
      case 'jobType':
        handleFilterChange('jobType', []);
        break;
      case 'experienceLevels':
        handleFilterChange('experienceLevels', []);
        break;
      case 'education':
        handleFilterChange('education', []);
        break;
      case 'salaryRange':
        handleFilterChange('salaryRange', [0, 200000]);
        break;
      case 'skills':
        handleFilterChange('skills', []);
        break;
      case 'companyTypes':
        handleFilterChange('companyTypes', []);
        break;
      case 'companySize':
        handleFilterChange('companySize', []);
        break;
      case 'benefits':
        handleFilterChange('benefits', []);
        break;
      default:
        break;
    }
  };

  // Toggle for experience levels
  const handleToggleExperienceLevel = (level: string) => {
    handleFilterChange('experienceLevels', filters.experienceLevels.includes(level)
      ? filters.experienceLevels.filter(l => l !== level)
      : [...filters.experienceLevels, level]
    );
  };

  // Toggle for job types
  const handleToggleJobType = (type: string) => {
    handleFilterChange('jobType', filters.jobType.includes(type)
      ? filters.jobType.filter(t => t !== type)
      : [...filters.jobType, type]
    );
  };

  // Toggle for company types
  const handleToggleCompanyType = (type: string) => {
    handleFilterChange('companyTypes', filters.companyTypes.includes(type)
      ? filters.companyTypes.filter(t => t !== type)
      : [...filters.companyTypes, type]
    );
  };

  // Apply filters
  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  // Update active filters when filters change
  useEffect(() => {
    const newActiveFilters: string[] = [];
    
    if (filters.search) newActiveFilters.push('search');
    if (filters.location) newActiveFilters.push('location');
    if (filters.remote) newActiveFilters.push('remote');
    if (filters.jobType && filters.jobType.length > 0) newActiveFilters.push('jobType');
    if (filters.experienceLevels && filters.experienceLevels.length > 0) newActiveFilters.push('experienceLevels');
    if (filters.education && filters.education.length > 0) newActiveFilters.push('education');
    if (filters.salaryRange && (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 200000)) newActiveFilters.push('salaryRange');
    if (filters.skills && filters.skills.length > 0) newActiveFilters.push('skills');
    if (filters.companyTypes && filters.companyTypes.length > 0) newActiveFilters.push('companyTypes');
    if (filters.companySize && filters.companySize.length > 0) newActiveFilters.push('companySize');
    if (filters.benefits && filters.benefits.length > 0) newActiveFilters.push('benefits');
    
    setActiveFilters(newActiveFilters);
  }, [filters]);

  const formatSalary = (value: number): string => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Job Filters
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Hide' : 'Show'}
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search job title or keywords"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, state, or country"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={filters.remote}
                onCheckedChange={(checked) => handleFilterChange('remote', !!checked)}
              />
              <Label htmlFor="remote">Remote only</Label>
            </div>
          </div>

          <Separator />

          <Accordion type="single" collapsible defaultValue="experience">
            <AccordionItem value="experience">
              <AccordionTrigger>Experience Level</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {['intern', 'entry', 'mid', 'senior', 'lead', 'manager', 'director', 'executive'].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`experience-${level}`}
                        checked={filters.experienceLevels.includes(level)}
                        onCheckedChange={() => handleToggleExperienceLevel(level)}
                      />
                      <Label htmlFor={`experience-${level}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="jobType">
              <AccordionTrigger>Job Type</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {['full-time', 'part-time', 'contract', 'internship', 'temporary', 'volunteer', 'other'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`jobType-${type}`}
                        checked={filters.jobType.includes(type)}
                        onCheckedChange={() => handleToggleJobType(type)}
                      />
                      <Label htmlFor={`jobType-${type}`}>{type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="salary">
              <AccordionTrigger>Salary Range</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-2">
                  <div>
                    <div className="flex justify-between">
                      <span>{formatSalary(filters.salaryRange[0])}</span>
                      <span>{formatSalary(filters.salaryRange[1])}</span>
                    </div>
                    <Slider
                      value={[filters.salaryRange[0], filters.salaryRange[1]]}
                      min={0}
                      max={200000}
                      step={5000}
                      onValueChange={(value) => handleFilterChange('salaryRange', [value[0], value[1]])}
                      className="mt-2"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="companyType">
              <AccordionTrigger>Company Type</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {['private', 'public', 'nonprofit', 'education'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`companyType-${type}`}
                        checked={filters.companyTypes.includes(type)}
                        onCheckedChange={() => handleToggleCompanyType(type)}
                      />
                      <Label htmlFor={`companyType-${type}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sort">
              <AccordionTrigger>Sort By</AccordionTrigger>
              <AccordionContent>
                <RadioGroup 
                  value={filters.sort || 'relevance'}
                  onValueChange={(value) => handleFilterChange('sort', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="relevance" id="sort-relevance" />
                    <Label htmlFor="sort-relevance">Relevance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date-newest" id="sort-date-newest" />
                    <Label htmlFor="sort-date-newest">Date: Newest first</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="date-oldest" id="sort-date-oldest" />
                    <Label htmlFor="sort-date-oldest">Date: Oldest first</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="salary-highest" id="sort-salary-highest" />
                    <Label htmlFor="sort-salary-highest">Salary: Highest first</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="salary-lowest" id="sort-salary-lowest" />
                    <Label htmlFor="sort-salary-lowest">Salary: Lowest first</Label>
                  </div>
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="pt-4">
            {activeFilters.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Active filters:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({
                      search: '',
                      location: '',
                      jobType: [],
                      remote: false,
                      experienceLevels: [],
                      education: [],
                      salaryRange: [0, 200000],
                      skills: [],
                      companyTypes: [],
                      companySize: [],
                      benefits: [],
                    })}
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter) => (
                    <Badge key={filter} variant="secondary" className="px-3 py-1">
                      {filter}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveFilter(filter)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <Button className="w-full" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
