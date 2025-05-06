
/**
 * ResumeJobMatchIndicator - Component to display job-resume match percentage
 */
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Percent, Star, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeJobMatchIndicatorProps {
  matchPercentage: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function ResumeJobMatchIndicator({
  matchPercentage,
  size = 'md',
  showLabel = true,
  showTooltip = true,
  className
}: ResumeJobMatchIndicatorProps) {
  // Match level categories
  const getMatchLevel = () => {
    if (matchPercentage >= 85) return "Excellent";
    if (matchPercentage >= 70) return "Good";
    if (matchPercentage >= 50) return "Fair";
    return "Poor";
  };

  // Colors based on match level
  const getMatchColor = () => {
    if (matchPercentage >= 85) return "text-emerald-500 dark:text-emerald-400";
    if (matchPercentage >= 70) return "text-green-500 dark:text-green-400";
    if (matchPercentage >= 50) return "text-amber-500 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
  };

  const getMatchIcon = () => {
    if (matchPercentage >= 85) return <Award className="h-4 w-4" />;
    if (matchPercentage >= 70) return <Star className="h-4 w-4" />;
    return <Percent className="h-4 w-4" />;
  };

  const getBadgeColor = () => {
    if (matchPercentage >= 85) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (matchPercentage >= 70) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (matchPercentage >= 50) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  const getIndicatorSize = () => {
    switch(size) {
      case 'sm': return { fontSize: 'text-sm', progressHeight: 'h-1.5' };
      case 'lg': return { fontSize: 'text-xl', progressHeight: 'h-3' };
      default: return { fontSize: 'text-base', progressHeight: 'h-2' };
    }
  };

  const { fontSize, progressHeight } = getIndicatorSize();

  const tooltipContent = (
    <div className="p-2 max-w-xs">
      <h4 className="font-medium mb-1">Match Score: {matchPercentage}%</h4>
      <p className="text-sm text-muted-foreground">
        {matchPercentage >= 85 ? (
          "Your resume is an excellent match for this job. Your skills and experience align very well!"
        ) : matchPercentage >= 70 ? (
          "Your resume is a good match for this job. You meet many of the key requirements."
        ) : matchPercentage >= 50 ? (
          "Your resume is a fair match for this job. You meet some of the requirements but may be missing others."
        ) : (
          "Your resume may not be a strong match for this job. Consider jobs with better alignment to your skills."
        )}
      </p>
    </div>
  );

  const matchIndicator = (
    <div className={cn("flex flex-col space-y-1", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {showLabel && (
            <Badge variant="outline" className={getBadgeColor()}>
              <span className="flex items-center gap-1">
                {getMatchIcon()}
                <span>{getMatchLevel()}</span>
              </span>
            </Badge>
          )}
        </div>
        
        <span className={cn(fontSize, "font-medium", getMatchColor())}>
          {matchPercentage}%
        </span>
      </div>
      
      <Progress 
        value={matchPercentage} 
        className={cn(
          progressHeight,
          matchPercentage >= 85 ? "bg-emerald-100 dark:bg-emerald-950" : 
          matchPercentage >= 70 ? "bg-green-100 dark:bg-green-950" : 
          matchPercentage >= 50 ? "bg-amber-100 dark:bg-amber-950" : 
          "bg-red-100 dark:bg-red-950"
        )}
        indicatorClassName={
          matchPercentage >= 85 ? "bg-emerald-500" : 
          matchPercentage >= 70 ? "bg-green-500" : 
          matchPercentage >= 50 ? "bg-amber-500" : 
          "bg-red-500"
        }
      />
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {matchIndicator}
          </TooltipTrigger>
          <TooltipContent>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return matchIndicator;
}
