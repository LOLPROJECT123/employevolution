
"use client"

import { Progress } from '@/components/ui/progress';

interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
  showPercentage?: boolean;
}

const ProgressTracker = ({ 
  currentStep, 
  totalSteps, 
  label, 
  showPercentage = true 
}: ProgressTrackerProps) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <div className="w-full space-y-2">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showPercentage && <span className="text-sm text-muted-foreground">{percentage}%</span>}
        </div>
      )}
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default ProgressTracker;
