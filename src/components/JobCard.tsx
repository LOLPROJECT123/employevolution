
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Clock, CheckCircle } from "lucide-react";
import { formatRelativeTime } from "@/utils/dateUtils";

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  isSelected?: boolean;
  isSaved?: boolean;
  isApplied?: boolean;
  onClick?: () => void;
  onSave?: () => void;
}

export function JobCard({ 
  job, 
  onApply, 
  isSelected, 
  isSaved, 
  isApplied, 
  onClick, 
  onSave 
}: JobCardProps) {
  const formattedSalary = `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.currency}${job.salary.max.toLocaleString()}`;
  const timeAgo = formatRelativeTime(job.postedAt);

  const getMatchColor = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getMatchLabel = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 70) return "Good Match";
    if (percentage >= 50) return "Fair Match";
    return "Weak Match";
  };

  const getMatchBorderColor = (percentage?: number) => {
    if (!percentage) return "border-gray-200";
    if (percentage >= 70) return "border-green-500";
    if (percentage >= 50) return "border-amber-500";
    return "border-red-500";
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply(job);
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card 
      className={`group hover:shadow-md transition-all duration-200 cursor-pointer relative ${isSelected ? 'border-primary' : ''}`}
      onClick={handleCardClick}
    >
      {job.matchPercentage && (
        <div className="absolute top-3 right-3 z-10">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${getMatchBorderColor(job.matchPercentage)} bg-white dark:bg-gray-950`}>
            <span className={`text-sm font-bold ${getMatchColor(job.matchPercentage)}`}>
              {job.matchPercentage}%
            </span>
          </div>
        </div>
      )}
      
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <Clock className="w-4 h-4" />
              <span>Posted {timeAgo}</span>
            </div>
          </div>
        </div>

        {job.matchCriteria && (
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
            <div className="text-sm">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-yellow-500">⭐</span>
                <span className="text-muted-foreground">Employers Are Looking For:</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.matchCriteria.degree && (
                  <div className="flex items-center gap-1 bg-secondary/50 rounded-full px-3 py-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Degree</span>
                  </div>
                )}
                {job.matchCriteria.experience && (
                  <div className="flex items-center gap-1 bg-secondary/50 rounded-full px-3 py-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Experience</span>
                  </div>
                )}
                {job.matchCriteria.skills && (
                  <div className="flex items-center gap-1 bg-secondary/50 rounded-full px-3 py-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Skills</span>
                  </div>
                )}
                {job.matchCriteria.location && (
                  <div className="flex items-center gap-1 bg-secondary/50 rounded-full px-3 py-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Location</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="capitalize">{job.type}</Badge>
          <Badge variant="secondary" className="capitalize">{job.level}</Badge>
          <Badge variant="outline">{formattedSalary}</Badge>
          {job.remote && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Remote
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map((skill) => (
            <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary capitalize">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          className={`w-full ${isApplied ? 'bg-green-600 hover:bg-green-700' : ''}`}
          onClick={handleApplyClick}
          disabled={isApplied}
        >
          {isApplied ? 'Applied' : 'Apply Now'}
        </Button>
        
        {onSave && (
          <Button 
            variant="outline"
            className="ml-2"
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
