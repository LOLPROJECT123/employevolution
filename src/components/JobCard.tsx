
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, Building2, MapPin, Clock, CheckCircle, ArrowRight, Zap, BadgePercent } from "lucide-react";
import { formatRelativeTime } from "@/utils/dateUtils";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface JobCardProps {
  job: Job;
  isSelected?: boolean;
  isSaved?: boolean;
  isApplied?: boolean;
  onApply?: (job: Job) => void;
  onClick?: () => void;
  onSave?: () => void;
  variant?: 'list' | 'grid';
}

export function JobCard({
  job,
  isSelected = false,
  isSaved = false,
  isApplied = false,
  onApply,
  onClick,
  onSave,
  variant = 'list'
}: JobCardProps) {
  const timeAgo = formatRelativeTime(job.postedAt);
  
  const getMatchColor = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getMatchBgColor = (percentage?: number) => {
    if (!percentage) return "bg-gray-100 dark:bg-gray-800";
    if (percentage >= 70) return "bg-green-50 dark:bg-green-900/30";
    if (percentage >= 50) return "bg-amber-50 dark:bg-amber-900/30";
    return "bg-red-50 dark:bg-red-900/30";
  };
  
  const formattedSalary = `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`;
  
  const getCompanyInitial = () => {
    return job.company.charAt(0).toUpperCase();
  };
  
  const getCompanyColor = () => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-red-100 text-red-600',
      'bg-indigo-100 text-indigo-600',
      'bg-pink-100 text-pink-600',
      'bg-orange-100 text-orange-600',
    ];
    
    const charSum = job.company
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    return colors[charSum % colors.length];
  };
  
  const getMatchLabel = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 70) return "GREAT MATCH";
    if (percentage >= 50) return "GOOD MATCH";
    if (percentage >= 30) return "FAIR MATCH";
    return "LOW MATCH";
  };
  
  if (variant === 'list') {
    return (
      <div
        onClick={onClick}
        className={`px-4 py-3 cursor-pointer transition-colors relative ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
      >
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 flex-shrink-0 rounded-md flex items-center justify-center ${getCompanyColor()}`}>
            {getCompanyInitial()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium truncate">{job.title}</h3>
            </div>
            
            <div className="flex flex-col gap-1 mt-1.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> {job.company}
              </p>
              
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> {job.location}
              </p>
              
              <p className="text-xs text-blue-600 dark:text-blue-400">{formattedSalary}</p>
              
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> {timeAgo}
              </p>
              
              {/* Match percentage with Progress bar */}
              {job.matchPercentage !== undefined && (
                <div className="mt-1 mb-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <BadgePercent className="h-3 w-3" /> Match
                    </span>
                    <span className={`font-medium ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}%</span>
                  </div>
                  <Progress value={job.matchPercentage} className="h-1.5" />
                </div>
              )}
            </div>
          </div>
          
          {/* Match percentage circular indicator */}
          {job.matchPercentage !== undefined && (
            <div className="ml-2 flex flex-col items-center">
              <div className="relative w-14 h-14">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="2"></circle>
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    className={`stroke-current ${getMatchColor(job.matchPercentage)}`}
                    strokeWidth="2" 
                    strokeDasharray="100" 
                    strokeDashoffset={100 - (job.matchPercentage || 0)} 
                    transform="rotate(-90 18 18)"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-medium ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}%</span>
                </div>
              </div>
              <span className="text-xs font-medium text-center mt-1">{getMatchLabel(job.matchPercentage)}</span>
            </div>
          )}
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <Button 
            size="sm" 
            className="w-full justify-between text-xs bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onApply?.(job);
            }}
          >
            Apply Now <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
          
          {/* Bookmark button moved down next to Apply Now button */}
          <Button
            variant="ghost"
            size="sm"
            className={`ml-2 ${isSaved ? "text-primary" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onSave?.();
            }}
          >
            <BookmarkIcon className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all border rounded-lg relative ${
        isSelected ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md hover:border-primary/30'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center ${getCompanyColor()}`}>
          {getCompanyInitial()}
        </div>
        
        {/* Match percentage circular indicator for grid view */}
        {job.matchPercentage !== undefined && (
          <div className="flex flex-col items-center">
            <div className="relative w-14 h-14">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="2"></circle>
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  className={`stroke-current ${getMatchColor(job.matchPercentage)}`}
                  strokeWidth="2" 
                  strokeDasharray="100" 
                  strokeDashoffset={100 - (job.matchPercentage || 0)} 
                  transform="rotate(-90 18 18)"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-medium ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}%</span>
              </div>
            </div>
            <span className="text-xs font-medium text-center mt-1">{getMatchLabel(job.matchPercentage)}</span>
          </div>
        )}
      </div>
      
      <h3 className="font-medium mt-1">{job.title}</h3>
      
      <p className="text-sm text-muted-foreground mt-2">{job.company}</p>
      
      <div className="flex flex-col gap-1.5 mt-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> {job.location}
        </p>
        
        <p className="text-xs text-blue-600 dark:text-blue-400">{formattedSalary}</p>
        
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> {timeAgo}
        </p>
        
        {/* Match percentage with Progress bar - kept for grid view */}
        {job.matchPercentage !== undefined && (
          <div className="mt-2 mb-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <BadgePercent className="h-3 w-3" /> Match
              </span>
              <span className={`font-medium ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}%</span>
            </div>
            <Progress value={job.matchPercentage} className="h-1.5" />
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <Button
          size="sm"
          className={isApplied ? "text-green-600 border-green-200 bg-green-50 w-full" : "bg-blue-600 hover:bg-blue-700 w-full"}
          onClick={(e) => {
            e.stopPropagation();
            onApply?.(job);
          }}
        >
          {isApplied ? (
            <>
              <CheckCircle className="mr-1 h-3 w-3" /> Applied
            </>
          ) : (
            <>
              Apply Now <Zap className="ml-1 h-3 w-3" />
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className={isSaved ? "text-primary ml-2" : "ml-2"}
          onClick={(e) => {
            e.stopPropagation();
            onSave?.();
          }}
        >
          <BookmarkIcon className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
