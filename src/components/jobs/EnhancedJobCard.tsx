
import React from 'react';
import { Job } from '@/types/job';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Star,
  Building,
  Briefcase,
  Heart,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedJobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  onSelect: (job: Job) => void;
  isSelected?: boolean;
  isSaved?: boolean;
  isApplied?: boolean;
  variant?: 'list' | 'grid';
}

export const EnhancedJobCard = ({
  job,
  onApply,
  onSave,
  onSelect,
  isSelected = false,
  isSaved = false,
  isApplied = false,
  variant = 'list'
}: EnhancedJobCardProps) => {
  const formatSalary = (salary: Job['salary']) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    if (salary.min === salary.max) {
      return formatter.format(salary.min);
    }
    
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md border",
        isSelected && "ring-2 ring-blue-500 border-blue-500",
        !job.applicationDetails?.isAvailable && "opacity-60",
        variant === 'grid' ? "h-full" : ""
      )}
      onClick={() => onSelect(job)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
              {job.company.substring(0, 2).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight mb-1 truncate">
                {job.title}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Building className="w-4 h-4" />
                <span className="font-medium">{job.company}</span>
                {job.companySize && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{job.companySize}</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatSalary(job.salary)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeAgo(job.postedAt)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave(job);
              }}
              className={cn(
                "p-2 rounded-full transition-colors",
                isSaved 
                  ? "text-red-500 bg-red-50 hover:bg-red-100" 
                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
              )}
            >
              <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
            </button>
            
            {job.matchPercentage && (
              <Badge className={cn("text-xs font-medium", getMatchColor(job.matchPercentage))}>
                {job.matchPercentage}% match
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Briefcase className="w-3 h-3 mr-1" />
              {job.type}
            </Badge>
            
            <Badge variant="outline" className="text-xs">
              {job.level}
            </Badge>
            
            {job.remote && (
              <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                Remote
              </Badge>
            )}
            
            {job.workModel && job.workModel !== 'onsite' && (
              <Badge variant="outline" className="text-xs capitalize">
                {job.workModel}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {job.description}
          </p>
          
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills.length - 4} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {job.applicationDetails?.applicantCount && (
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{job.applicationDetails.applicantCount} applicants</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>{job.source}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {job.applyUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(job.applyUrl, '_blank');
                  }}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(job);
                }}
                disabled={isApplied || !job.applicationDetails?.isAvailable}
                className="text-xs"
              >
                {isApplied ? 'Applied' : 'Apply'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
