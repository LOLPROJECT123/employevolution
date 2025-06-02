
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Filter, X } from 'lucide-react';

interface JobFiltersProps {
  onFiltersChange: (filters: any) => void;
  currentFilters: any;
}

export const JobFilters: React.FC<JobFiltersProps> = ({ onFiltersChange, currentFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Filter */}
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, State or Remote"
            value={currentFilters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        {/* Job Type Filter */}
        <div>
          <Label>Job Type</Label>
          <Select
            value={currentFilters.jobType || ''}
            onValueChange={(value) => handleFilterChange('jobType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level */}
        <div>
          <Label>Experience Level</Label>
          <Select
            value={currentFilters.experience || ''}
            onValueChange={(value) => handleFilterChange('experience', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Levels</SelectItem>
              <SelectItem value="intern">Intern</SelectItem>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="mid">Mid Level</SelectItem>
              <SelectItem value="senior">Senior Level</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Remote Option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote"
            checked={currentFilters.remote || false}
            onCheckedChange={(checked) => handleFilterChange('remote', checked)}
          />
          <Label htmlFor="remote">Remote Work</Label>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </Button>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* Salary Range */}
            <div>
              <Label>Salary Range (k)</Label>
              <div className="px-2 py-4">
                <Slider
                  value={currentFilters.salaryRange || [50, 200]}
                  onValueChange={(value) => handleFilterChange('salaryRange', value)}
                  max={300}
                  min={30}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>${(currentFilters.salaryRange?.[0] || 50)}k</span>
                  <span>${(currentFilters.salaryRange?.[1] || 200)}k</span>
                </div>
              </div>
            </div>

            {/* Company Size */}
            <div>
              <Label>Company Size</Label>
              <Select
                value={currentFilters.companySize || ''}
                onValueChange={(value) => handleFilterChange('companySize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Size</SelectItem>
                  <SelectItem value="startup">Startup (1-50)</SelectItem>
                  <SelectItem value="small">Small (51-200)</SelectItem>
                  <SelectItem value="medium">Medium (201-1000)</SelectItem>
                  <SelectItem value="large">Large (1000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills Filter */}
            <div>
              <Label htmlFor="skills">Required Skills</Label>
              <Input
                id="skills"
                placeholder="e.g. React, Python, AWS"
                value={currentFilters.skills || ''}
                onChange={(e) => handleFilterChange('skills', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {Object.keys(currentFilters).length > 0 && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium">Active Filters:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(currentFilters).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null;
                
                let displayValue = String(value);
                if (key === 'salaryRange' && Array.isArray(value)) {
                  displayValue = `$${value[0]}k - $${value[1]}k`;
                }
                
                return (
                  <Badge key={key} variant="secondary">
                    {key}: {displayValue}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobFilters;
