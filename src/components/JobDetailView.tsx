
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Job } from '@/types/job';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  ExternalLink,
  Star,
  Users,
  Calendar
} from 'lucide-react';

interface JobDetailViewProps {
  job: Job | null;
  onApply?: (job: Job) => void;
  onSave?: (job: Job) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({ job, onApply, onSave }) => {
  if (!job) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No job selected</h3>
          <p className="text-sm text-muted-foreground">Select a job from the list to view details</p>
        </div>
      </div>
    );
  }

  const formatSalary = (salary: Job['salary']) => {
    if (!salary || salary.min === 0) return 'Salary not specified';
    
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

  const getMatchColor = (percentage?: number) => {
    if (!percentage) return "text-muted-foreground";
    if (percentage >= 85) return "text-green-600 dark:text-green-400";
    if (percentage >= 70) return "text-primary";
    return "text-amber-600 dark:text-amber-400";
  };

  const getMatchBgColor = (percentage?: number) => {
    if (!percentage) return "bg-muted";
    if (percentage >= 85) return "bg-green-50 dark:bg-green-900/20";
    if (percentage >= 70) return "bg-primary/10";
    return "bg-amber-50 dark:bg-amber-900/20";
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b border-border">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold mb-2">{job.title}</CardTitle>
              <div className="flex items-center gap-4 text-muted-foreground mb-3">
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
            
            {job.matchPercentage && (
              <div className={`px-4 py-3 rounded-lg text-center ${getMatchBgColor(job.matchPercentage)}`}>
                <div className={`text-2xl font-bold ${getMatchColor(job.matchPercentage)}`}>
                  {job.matchPercentage}%
                </div>
                <div className="text-xs font-medium text-muted-foreground">Match</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatSalary(job.salary)}
            </span>
            <Badge variant="outline">{job.type}</Badge>
            <Badge variant="outline">{job.level}</Badge>
            {job.applicantCount && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                {job.applicantCount} applicants
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Salary Range Card */}
            <Card className="bg-accent/50">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2 text-accent-foreground">Salary Range</h4>
                <p className="text-2xl font-bold text-primary">
                  {formatSalary(job.salary)}
                </p>
              </CardContent>
            </Card>

            {/* Job Description */}
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Job Description</h4>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Requirements</h4>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-foreground">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button 
                onClick={() => onApply?.(job)} 
                className="flex-1"
              >
                Apply Now
              </Button>
              <Button 
                onClick={() => onSave?.(job)} 
                variant="outline"
              >
                Save Job
              </Button>
              {job.applyUrl && (
                <Button asChild variant="outline">
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
};
