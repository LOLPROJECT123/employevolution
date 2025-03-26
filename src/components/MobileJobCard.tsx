
import { Job } from "@/types/job";
import { BookmarkIcon, MapPin, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MobileJobCardProps {
  job: Job;
  isSaved?: boolean;
  onSave?: () => void;
  onClick?: () => void;
}

export function MobileJobCard({
  job,
  isSaved = false,
  onSave,
  onClick
}: MobileJobCardProps) {
  // Generate a colored initial badge for the company
  const getInitialBadgeColor = () => {
    const initialMap: Record<string, string> = {
      'A': 'bg-green-100 text-green-600',
      'B': 'bg-blue-100 text-blue-600',
      'C': 'bg-yellow-100 text-yellow-600',
      'D': 'bg-orange-100 text-orange-600',
      'E': 'bg-purple-100 text-purple-600',
      'F': 'bg-indigo-100 text-indigo-600',
      'G': 'bg-red-100 text-red-600',
      'H': 'bg-emerald-100 text-emerald-600',
      'I': 'bg-cyan-100 text-cyan-600',
      'J': 'bg-violet-100 text-violet-600',
      'K': 'bg-fuchsia-100 text-fuchsia-600',
      'L': 'bg-rose-100 text-rose-600',
      'M': 'bg-pink-100 text-pink-600',
      'N': 'bg-amber-100 text-amber-600',
      'O': 'bg-lime-100 text-lime-600',
      'P': 'bg-teal-100 text-teal-600',
      'Q': 'bg-sky-100 text-sky-600',
      'R': 'bg-emerald-100 text-emerald-600',
      'S': 'bg-blue-100 text-blue-600',
      'T': 'bg-pink-100 text-pink-600',
      'U': 'bg-purple-100 text-purple-600',
      'V': 'bg-yellow-100 text-yellow-600',
      'W': 'bg-green-100 text-green-600',
      'X': 'bg-red-100 text-red-600',
      'Y': 'bg-orange-100 text-orange-600',
      'Z': 'bg-indigo-100 text-indigo-600',
    };
    
    const initial = job.company.charAt(0).toUpperCase();
    return initialMap[initial] || 'bg-gray-100 text-gray-600';
  };
  
  const formattedSalary = job.level === 'intern' 
    ? `$ ${job.salary.min.toLocaleString()} /hr` 
    : `$ ${job.salary.min.toLocaleString()}`;

  // Get match color based on percentage
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
  
  return (
    <div 
      className="py-3 px-3 border-b border-gray-100 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800/60"
      onClick={onClick}
    >
      <div className="flex items-start gap-2 min-w-0">
        {/* Initial badge */}
        <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md ${getInitialBadgeColor()}`}>
          {job.company.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-base font-bold leading-tight truncate">{job.title}</h3>
            
            {job.matchPercentage !== undefined && (
              <Badge variant="outline" className={`ml-1 flex-shrink-0 px-1.5 py-0.5 text-xs font-medium ${getMatchBgColor(job.matchPercentage)} ${getMatchColor(job.matchPercentage)} flex items-center`}>
                {job.matchPercentage}%
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-sm text-gray-600 truncate">
              <span className="truncate">{job.company}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-600 truncate">
              <DollarSign className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{formattedSalary}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-600 truncate">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
          </div>
        </div>
        
        <button 
          className="ml-1 flex-shrink-0 p-1"
          onClick={(e) => {
            e.stopPropagation();
            onSave?.();
          }}
        >
          <BookmarkIcon className={`h-5 w-5 ${isSaved ? "fill-primary text-primary" : "text-gray-400"}`} />
        </button>
      </div>
    </div>
  );
}
