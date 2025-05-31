
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Eye,
  Heart,
  ExternalLink
} from 'lucide-react';
import { Job } from '@/types/job';

interface EnhancedJobCardProps {
  job: Job;
  userSkills?: string[];
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  onSelect?: (job: Job) => void;
  onViewDetails?: (job: Job) => void;
  isSelected?: boolean;
  isSaved?: boolean;
  isApplied?: boolean;
  variant?: 'list' | 'card';
}

const EnhancedJobCard: React.FC<EnhancedJobCardProps> = ({
  job,
  userSkills = [],
  onApply,
  onSave,
  onSelect,
  onViewDetails,
  isSelected = false,
  isSaved = false,
  isApplied = false,
  variant = 'card'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate skill matches
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase());
  const normalizedJobSkills = job.skills?.map(skill => skill.toLowerCase()) || [];
  
  const matchingSkills = job.skills?.filter(skill => 
    normalizedUserSkills.includes(skill.toLowerCase())
  ) || [];
  
  const missingSkills = job.skills?.filter(skill => 
    !normalizedUserSkills.includes(skill.toLowerCase())
  ) || [];

  const skillMatchPercentage = job.skills?.length 
    ? Math.round((matchingSkills.length / job.skills.length) * 100)
    : job.matchPercentage || 75; // Use job's match percentage or default

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-blue-600 bg-blue-50';
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMatchLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellent Match';
    if (percentage >= 60) return 'Good Match';
    if (percentage >= 40) return 'Fair Match';
    return 'Skills Gap';
  };

  const formatSalary = (salary: Job['salary']) => {
    if (!salary || salary.min === 0) return 'Not specified';
    
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
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(job);
    } else if (onViewDetails) {
      onViewDetails(job);
    }
  };

  const cardClassName = `hover:shadow-lg transition-shadow duration-200 cursor-pointer ${
    isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
  } ${variant === 'list' ? 'border-l-4 border-l-transparent hover:border-l-blue-500' : ''}`;

  return (
    <Card className={cardClassName} onClick={handleCardClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 hover:text-blue-600 cursor-pointer">
              {job.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
                {job.remote && <Badge variant="secondary" className="ml-1">Remote</Badge>}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {getTimeAgo(job.postedAt)}
              </span>
            </div>
          </div>
          
          {/* Match Score */}
          <div className={`px-3 py-2 rounded-lg text-center ${getMatchColor(skillMatchPercentage)}`}>
            <div className="text-2xl font-bold">{skillMatchPercentage}%</div>
            <div className="text-xs font-medium">{getMatchLabel(skillMatchPercentage)}</div>
          </div>
        </div>

        {/* Salary and Job Type */}
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {formatSalary(job.salary)}
          </span>
          <Badge variant="outline">{job.type}</Badge>
          <Badge variant="outline">{job.level}</Badge>
          {isSaved && <Badge className="bg-red-100 text-red-800">Saved</Badge>}
          {isApplied && <Badge className="bg-green-100 text-green-800">Applied</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Skills Overview */}
        {job.skills && job.skills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Skill Match</span>
              <span className="text-sm text-muted-foreground">
                {matchingSkills.length} of {job.skills?.length || 0} skills
              </span>
            </div>
            
            <Progress value={skillMatchPercentage} className="h-2" />
            
            {/* Quick Skills Preview */}
            <div className="flex flex-wrap gap-2">
              {matchingSkills.slice(0, 3).map((skill, index) => (
                <Badge key={index} className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {skill}
                </Badge>
              ))}
              {missingSkills.slice(0, 2).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-orange-600">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {skill}
                </Badge>
              ))}
              {(matchingSkills.length + missingSkills.length > 5) && (
                <Badge variant="secondary">
                  +{(job.skills?.length || 0) - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="font-medium">
                {isExpanded ? 'Hide Details' : 'View Detailed Analysis'}
              </span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* All Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Required Skills Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-2">
                      ✓ Skills You Have ({matchingSkills.length})
                    </p>
                    <div className="space-y-1">
                      {matchingSkills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-orange-700 mb-2">
                      ⚠ Skills to Develop ({missingSkills.length})
                    </p>
                    <div className="space-y-1">
                      {missingSkills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-orange-600" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Learning Recommendations */}
            {missingSkills.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  Skill Development Recommendations
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {missingSkills.slice(0, 3).map((skill, index) => (
                    <li key={index}>
                      • Consider taking an online course in {skill}
                    </li>
                  ))}
                  {missingSkills.length > 3 && (
                    <li>• Focus on the most critical missing skills first</li>
                  )}
                </ul>
              </div>
            )}

            {/* Job Description Preview */}
            <div>
              <h4 className="font-medium mb-2">Job Description</h4>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {job.description}
              </p>
            </div>

            {/* Additional Info */}
            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.slice(0, 4).map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                  {job.benefits.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{job.benefits.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4" onClick={(e) => e.stopPropagation()}>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onApply(job);
            }} 
            className="flex-1"
            disabled={isApplied}
          >
            {isApplied ? 'Applied' : 'Apply Now'}
          </Button>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onSave(job);
            }} 
            variant="outline"
            className={isSaved ? 'bg-red-50 text-red-600' : ''}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
          {onViewDetails && (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(job);
              }} 
              variant="outline"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {job.applyUrl && (
            <Button 
              asChild 
              variant="outline"
              onClick={(e) => e.stopPropagation()}
            >
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedJobCard;
