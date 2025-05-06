
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ResumeJobMatchIndicatorProps {
  matchPercentage: number;
  showTooltip?: boolean;
  tooltipText?: string;
  className?: string;
}

export function ResumeJobMatchIndicator({ 
  matchPercentage, 
  showTooltip = true,
  tooltipText,
  className = ""
}: ResumeJobMatchIndicatorProps) {
  const getMatchColor = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const getMatchLabel = (percentage: number): string => {
    if (percentage >= 80) return "Excellent Match";
    if (percentage >= 60) return "Good Match";
    if (percentage >= 40) return "Fair Match";
    return "Poor Match";
  };
  
  const customTooltipText = tooltipText || getMatchLabel(matchPercentage);
  const progressBarColor = getMatchColor(matchPercentage);

  const indicator = (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Match Score</p>
        <p className="text-sm font-medium">{matchPercentage}%</p>
      </div>
      <Progress 
        value={matchPercentage}
        className="h-2"
        indicatorClassName={progressBarColor}
      />
      <p className="text-xs text-right text-muted-foreground">{getMatchLabel(matchPercentage)}</p>
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {indicator}
          </TooltipTrigger>
          <TooltipContent>
            <p>{customTooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return indicator;
}
