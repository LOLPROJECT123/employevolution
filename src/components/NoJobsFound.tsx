
import React from 'react';
import { JobFilters } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchX, Filter, RotateCcw } from 'lucide-react';
import { JobFilteringService } from '@/services/jobFilteringService';

interface NoJobsFoundProps {
  filters: JobFilters;
  onClearFilters: () => void;
  onModifyFilters?: () => void;
  totalJobsWithoutFilters?: number;
}

export const NoJobsFound = ({ 
  filters, 
  onClearFilters, 
  onModifyFilters,
  totalJobsWithoutFilters = 0 
}: NoJobsFoundProps) => {
  const activeFilterCount = JobFilteringService.getActiveFilterCount(filters);
  const activeFiltersDescriptions = JobFilteringService.getActiveFiltersDescription(filters);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-6">
          <SearchX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {hasActiveFilters ? 'No jobs match your filters' : 'No jobs found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {hasActiveFilters 
              ? `We couldn't find any jobs matching your ${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}.`
              : 'Try adjusting your search criteria or browse all available positions.'
            }
          </p>
          
          {totalJobsWithoutFilters > 0 && hasActiveFilters && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
              {totalJobsWithoutFilters} job{totalJobsWithoutFilters > 1 ? 's' : ''} available without filters
            </p>
          )}
        </div>

        {hasActiveFilters && (
          <div className="mb-6 w-full">
            <div className="flex items-center justify-center mb-3">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Filters ({activeFilterCount})
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {activeFiltersDescriptions.map((description, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {description}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {hasActiveFilters && (
            <Button 
              onClick={onClearFilters}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All Filters
            </Button>
          )}
          
          {onModifyFilters && (
            <Button 
              onClick={onModifyFilters}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Modify Filters
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">Suggestions to find more jobs:</p>
            <ul className="text-left space-y-1">
              <li>• Try broader search terms</li>
              <li>• Expand your location preferences</li>
              <li>• Consider different experience levels</li>
              <li>• Remove some skill requirements</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
