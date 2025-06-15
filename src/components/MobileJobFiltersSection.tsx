
import React, { useState } from 'react';
import { JobFilters } from "@/types/job";
import { AdvancedJobFiltersSection } from "@/components/AdvancedJobFiltersSection";

interface MobileJobFiltersSectionProps {
  onApplyFilters: (filters: JobFilters) => void;
  appliedJobIds?: string[];
}

export const MobileJobFiltersSection = ({ onApplyFilters, appliedJobIds = [] }: MobileJobFiltersSectionProps) => {
  return (
    <div className="space-y-2">
      <AdvancedJobFiltersSection 
        onApplyFilters={onApplyFilters}
        appliedJobIds={appliedJobIds}
      />
    </div>
  );
};
