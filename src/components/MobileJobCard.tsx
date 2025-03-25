
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
  
  const formattedSalary = job.level === 'intern' 
    ? `${job.salary.currency}${job.salary.min.toLocaleString()} /hr` 
    : `${job.salary.currency}${job.salary.min.toLocaleString()}`;
  
  return (
    <div 
      className="p-4 border-b border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-800/60"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className={`w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center ${getCompanyColor()}`}>
          {getCompanyInitial()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">{job.company} {job.level === 'intern' ? '• Internship' : ''}</p>
              <h3 className="text-base font-medium mt-1">{job.title}</h3>
            </div>
            
            <button 
              className="ml-2 flex-shrink-0 p-1"
              onClick={(e) => {
                e.stopPropagation();
                onSave?.();
              }}
            >
              <BookmarkIcon className={`h-5 w-5 ${isSaved ? "fill-primary text-primary" : "text-gray-400"}`} />
            </button>
          </div>
          
          <div className="flex flex-col mt-2 gap-1.5">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <DollarSign className="h-4 w-4" />
              <span>{formattedSalary}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
