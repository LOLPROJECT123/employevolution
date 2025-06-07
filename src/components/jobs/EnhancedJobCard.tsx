
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
import { useUserSkills } from '@/hooks/useUserSkills';
import { unifiedSkillsMatchingService } from '@/services/unifiedSkillsMatchingService';

interface EnhancedJobCardProps {
  job: Job;
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
  const { skills: userSkills, loading: skillsLoading } = useUserSkills();

  // Calculate skill matches using the unified service
  const skillsMatch = unifiedSkillsMatchingService.calculateSkillsMatch(
    job.skills || [], 
    userSkills
  );

  // Use the calculated match percentage or fallback to job's match percentage
  const skillMatchPercentage = skillsLoading 
    ? (job.matchPercentage || 75) 
    : skillsMatch.matchPercentage;

  const getMatchColor = (percentage: number) => {
    return unifiedSkillsMatchingService.getMatchColor(percentage);
  };

  const getMatchLabel = (percentage: number) => {
    return unifiedSkillsMatchingService.getMatchLabel(percentage);
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
    isSelected ? 'ring-2 ring-primary bg-accent/50' : ''
  } ${variant === 'list' ? 'border-l-4 border-l-transparent hover:border-l-primary' : ''}`;

  return (
    <Card className={cardClassName} onClick={handleCardClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 hover:text-primary cursor-pointer">
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
          <div className={`px-3 py-2 rounded-lg text-center bg-muted ${getMatchColor(skillMatchPercentage).replace('text-', 'text-')}`}>
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
          {isSaved && <Badge className="bg-destructive/10 text-destructive">Saved</Badge>}
          {isApplied && <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">Applied</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Skills Overview */}
        {job.skills && job.skills.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Skill Match</span>
              <span className="text-sm text-muted-foreground">
                {skillsMatch.matchingSkills.length} of {job.skills?.length || 0} skills
              </span>
            </div>
            
            <Progress value={skillMatchPercentage} className="h-2" />
            
            {/* Quick Skills Preview */}
            <div className="flex flex-wrap gap-2">
              {skillsMatch.matchingSkills.slice(0, 3).map((skill, index) => (
                <Badge key={index} className="bg-green-500/10 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {skill}
                </Badge>
              ))}
              {skillsMatch.missingSkills.slice(0, 2).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {skill}
                </Badge>
              ))}
              {(skillsMatch.matchingSkills.length + skillsMatch.missingSkills.length > 5) && (
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
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                      ✓ Skills You Have ({skillsMatch.matchingSkills.length})
                    </p>
                    <div className="space-y-1">
                      {skillsMatch.matchingSkills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
                      ⚠ Skills to Develop ({skillsMatch.missingSkills.length})
                    </p>
                    <div className="space-y-1">
                      {skillsMatch.missingSkills.map((skill, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Learning Recommendations */}
            {skillsMatch.missingSkills.length > 0 && (
              <div className="bg-accent p-3 rounded-lg">
                <h4 className="font-medium text-accent-foreground mb-2">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  Skill Development Recommendations
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {skillsMatch.missingSkills.slice(0, 3).map((skill, index) => (
                    <li key={index}>
                      • Consider taking an online course in {skill}
                    </li>
                  ))}
                  {skillsMatch.missingSkills.length > 3 && (
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
            className={isSaved ? 'bg-destructive/10 text-destructive' : ''}
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
