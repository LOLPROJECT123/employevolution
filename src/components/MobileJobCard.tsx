
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
    const companyInitial = job.company.charAt(0).toUpperCase();
    const colors: Record<string, string> = {
      'A': 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      'B': 'bg-primary/10 text-primary',
      'C': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      'D': 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      'E': 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      'F': 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
      'G': 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      'H': 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      'I': 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
      'J': 'bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
      'K': 'bg-fuchsia-100 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400',
      'L': 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
      'M': 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
      'N': 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      'O': 'bg-lime-100 dark:bg-lime-900/20 text-lime-600 dark:text-lime-400',
      'P': 'bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
      'Q': 'bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400',
      'R': 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      'S': 'bg-primary/10 text-primary',
      'T': 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
      'U': 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      'V': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      'W': 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      'X': 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      'Y': 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      'Z': 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    };
    
    return colors[companyInitial] || 'bg-muted text-muted-foreground';
  };
  
  const formattedSalary = job.level === 'intern' 
    ? `$ $ ${job.salary.min.toLocaleString()} /hr` 
    : `$ $ ${job.salary.min.toLocaleString()}`;

  // Get match color based on percentage
  const getMatchColor = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 80) return "text-green-500 dark:text-green-400";
    if (percentage >= 60) return "text-amber-500 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
  };

  const getMatchBgColor = (percentage?: number) => {
    if (!percentage) return "bg-muted";
    if (percentage >= 80) return "bg-green-50 dark:bg-green-900/20";
    if (percentage >= 60) return "bg-amber-50 dark:bg-amber-900/20";
    return "bg-red-50 dark:bg-red-900/20";
  };
  
  return (
    <div 
      className="py-3 px-3 border-b border-border active:bg-muted/50"
      onClick={onClick}
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* Initial badge */}
        <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-md ${getInitialBadgeColor()}`}>
          {job.company.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-bold leading-tight truncate max-w-[75%]">{job.title}</h3>
            
            {job.matchPercentage !== undefined && (
              <Badge variant="outline" className={`flex-shrink-0 px-1.5 py-0.5 text-xs font-medium ${getMatchBgColor(job.matchPercentage)} ${getMatchColor(job.matchPercentage)}`}>
                {job.matchPercentage}%
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
              <span className="truncate">{job.company}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
              <span className="truncate">{formattedSalary}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground truncate">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
          </div>
        </div>
        
        <button 
          className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSave?.();
          }}
          aria-label={isSaved ? "Unsave job" : "Save job"}
        >
          <BookmarkIcon className={`h-5 w-5 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>
    </div>
  );
}
