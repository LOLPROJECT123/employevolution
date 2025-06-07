
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, Building2, MapPin, Clock, CheckCircle, ArrowRight, Zap } from "lucide-react";
import { formatRelativeTime } from "@/utils/dateUtils";
import { Badge } from "./ui/badge";

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
    if (percentage >= 70) return "text-green-600 dark:text-green-400";
    if (percentage >= 50) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getMatchBgColor = (percentage?: number) => {
    if (!percentage) return "bg-muted";
    if (percentage >= 70) return "bg-green-50 dark:bg-green-900/20";
    if (percentage >= 50) return "bg-amber-50 dark:bg-amber-900/20";
    return "bg-red-50 dark:bg-red-900/20";
  };
  
  const formattedSalary = `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`;
  
  const getCompanyInitial = () => {
    return job.company.charAt(0).toUpperCase();
  };
  
  const getCompanyColor = () => {
    const colors = [
      'bg-primary/10 text-primary',
      'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
      'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
      'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    ];
    
    const charSum = job.company
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    return colors[charSum % colors.length];
  };
  
  if (variant === 'list') {
    return (
      <div
        onClick={onClick}
        className={`px-4 py-3 cursor-pointer transition-colors relative ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-muted/50'}`}
      >
        <div className="flex items-center space-x-3">
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
              
              <p className="text-xs text-primary">{formattedSalary}</p>
              
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> {timeAgo}
              </p>
            </div>
          </div>
          
          <div className="ml-2 flex flex-col items-end gap-2">
            {job.matchPercentage !== undefined && (
              <Badge className={`text-xs px-2 py-1 ${getMatchBgColor(job.matchPercentage)} ${getMatchColor(job.matchPercentage)} flex items-center gap-1 mb-1`}>
                {job.matchPercentage}% Match
              </Badge>
            )}
          
            {isApplied ? (
              <Badge className="bg-green-100 dark:bg-green-900/20 hover:bg-green-100 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                <CheckCircle className="mr-1 h-3 w-3" /> Applied
              </Badge>
            ) : isSaved ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave?.();
                }}
              >
                <BookmarkIcon className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave?.();
                }}
              >
                <BookmarkIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-2">
          <Button 
            size="sm" 
            className="w-full justify-between text-xs bg-primary hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation();
              onApply?.(job);
            }}
          >
            Apply Now <ArrowRight className="h-3 w-3 ml-1" />
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
        
        {job.matchPercentage !== undefined && (
          <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-bold ${getMatchBgColor(job.matchPercentage)} ${getMatchColor(job.matchPercentage)} flex items-center gap-1`}>
            {job.matchPercentage}% Match
          </Badge>
        )}
      </div>
      
      <h3 className="font-medium mt-1">{job.title}</h3>
      
      <p className="text-sm text-muted-foreground mt-2">{job.company}</p>
      
      <div className="flex flex-col gap-1.5 mt-3">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> {job.location}
        </p>
        
        <p className="text-xs text-primary">{formattedSalary}</p>
        
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> {timeAgo}
        </p>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <Button
          size="sm"
          className={isApplied ? "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 w-full" : "bg-primary hover:bg-primary/90 w-full"}
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
