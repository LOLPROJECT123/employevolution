
import React, { useState } from 'react';
import { JobFilters } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { MobileJobFiltersSection } from "@/components/MobileJobFiltersSection";

interface MobileJobFiltersProps {
  onApply: (filters: JobFilters) => void;
  onClose: () => void;
  activeFilterCount?: number;
}

export const MobileJobFilters = ({ 
  onApply, 
  onClose, 
  activeFilterCount = 0 
}: MobileJobFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleApplyFilters = (filters: JobFilters) => {
    onApply(filters);
    setIsOpen(false);
  };

  const handleResetAll = () => {
    onClose();
    setIsOpen(false);
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
              className="flex items-center rounded-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-9 relative"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1.5" />
              Filter Jobs
              {activeFilterCount > 0 && (
                <Badge className="ml-1.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-blue-600 hover:bg-blue-700">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] p-0">
            <SheetHeader className="border-b border-gray-200 dark:border-gray-700 px-3 py-3 flex flex-row justify-between items-center">
              <SheetTitle className="text-base font-medium">
                All Filters {activeFilterCount > 0 && `(${activeFilterCount} active)`}
              </SheetTitle>
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
          Save Search
        </Button>
        
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-9 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            onClick={handleResetAll}
          >
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>
      
      {/* Job count and sort */}
      <div className="flex items-center justify-between py-1.5 border-t border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {/* This will be updated by the parent component */}
        </span>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Most recent
          </span>
        </div>
      </div>
    </div>
  );
};
