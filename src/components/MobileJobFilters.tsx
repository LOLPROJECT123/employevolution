
import React, { useState } from 'react';
import { JobFilters } from "@/types/job";
import { Button } from "@/components/ui/button";
import { ChevronDown, X, Check, SlidersHorizontal, BookmarkCheck, SortAscending } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { MobileJobFiltersSection } from "@/components/MobileJobFiltersSection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface MobileJobFiltersProps {
  onApply: (filters: JobFilters) => void;
  onClose: () => void;
  onSort: (sort: JobFilters['sort']) => void;
  activeFilterCount?: number;
  totalJobs?: number;
  visibleJobs?: number;
  currentSort?: JobFilters['sort'];
}

export const MobileJobFilters = ({ 
  onApply, 
  onClose, 
  onSort,
  activeFilterCount = 0,
  totalJobs = 0,
  visibleJobs = 0,
  currentSort = 'relevance'
}: MobileJobFiltersProps) => {
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleApplyFilters = (filters: JobFilters) => {
    onApply(filters);
    setIsOpen(false);
  };

  const handleResetAll = () => {
    // Reset all filters
    onClose();
  };

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date-newest', label: 'Date: Newest First' },
    { value: 'date-oldest', label: 'Date: Oldest First' },
    { value: 'salary-highest', label: 'Salary: Highest First' },
    { value: 'salary-lowest', label: 'Salary: Lowest First' }
  ];

  const getSortLabel = () => {
    return sortOptions.find(option => option.value === currentSort)?.label || 'Sort';
  };
  
  return (
    <div className="bg-white dark:bg-gray-800">
      {/* Filter buttons row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center rounded-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-9"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1.5" />
              Filter Jobs
              {activeFilterCount > 0 && (
                <span className="ml-1.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] p-0">
            <SheetHeader className="border-b border-gray-200 dark:border-gray-700 px-3 py-3 flex flex-row justify-between items-center">
              <SheetTitle className="text-base font-medium">All Filters</SheetTitle>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-gray-600 dark:text-gray-400"
                  onClick={handleResetAll}
                >
                  Reset All
                </Button>
              </div>
            </SheetHeader>
            <div className="p-3">
              <MobileJobFiltersSection onApplyFilters={handleApplyFilters} />
            </div>
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 h-12 font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Check className="h-5 w-5 mr-2" />
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-9"
        >
          <BookmarkCheck className="h-4 w-4 mr-1.5" />
          Save Search
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-9"
            >
              <SortAscending className="h-4 w-4 mr-1.5" />
              {getSortLabel()}
              <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {sortOptions.map((option) => (
              <DropdownMenuItem 
                key={option.value}
                className={currentSort === option.value ? "bg-gray-100 dark:bg-gray-800" : ""}
                onClick={() => onSort(option.value as JobFilters['sort'])}
              >
                <div className="flex items-center w-full">
                  {option.label}
                  {currentSort === option.value && <Check className="ml-auto h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-9"
          onClick={handleResetAll}
        >
          Clear
        </Button>
      </div>
      
      {/* Job count and sort */}
      <div className="flex items-center justify-between py-1.5 border-t border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Showing {visibleJobs} of {totalJobs} Jobs
        </span>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {getSortLabel()}
          </span>
        </div>
      </div>
    </div>
  );
};
