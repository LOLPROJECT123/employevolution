import { useState } from 'react';
import { JobFilters } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Search, MapPin, Filter } from "lucide-react";

interface MobileJobFiltersSectionProps {
  onApplyFilters: (filters: JobFilters) => void;
  onClose: () => void;
}

export const MobileJobFiltersSection = ({ onApplyFilters, onClose }: MobileJobFiltersSectionProps) => {
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

  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'temporary'];
  const experienceLevels = ['intern', 'entry', 'mid', 'senior', 'lead', 'executive', 'manager', 'director'];

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
    onApplyFilters(filters);
    onClose();
  };

  return (
    <div className="space-y-6 p-4">
      {/* Search and Location */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Job Title or Keywords</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="e.g. Software Engineer"
              className="pl-10"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="location"
              placeholder="e.g. San Francisco, CA"
              className="pl-10"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Job Type */}
      <div className="space-y-3">
        <Label>Job Type</Label>
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
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <Label>Experience Level</Label>
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
      </div>

      {/* Remote Work */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remote"
          checked={filters.remote}
          onCheckedChange={(checked) => handleFilterChange('remote', checked)}
        />
        <Label htmlFor="remote">Remote work only</Label>
      </div>

      {/* Salary Range */}
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

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4">
        <Button onClick={applyFilters} className="flex-1">
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
        <Button variant="outline" onClick={clearFilters}>
          Clear All
        </Button>
      </div>
    </div>
  );
};
