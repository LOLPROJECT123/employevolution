
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Clock, PercentIcon, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  const formattedSalary = `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.currency}${job.salary.max.toLocaleString()}`;
  const timeAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true });

  // Determine color based on match percentage
  const getMatchColor = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getMatchLabel = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 70) return "GOOD MATCH";
    if (percentage >= 50) return "FAIR MATCH";
    return "WEAK MATCH";
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
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
          </div>
          <div className="flex flex-col items-end gap-1">
            {job.matchPercentage && (
              <div className="flex flex-col items-end">
                <div className="relative w-16 h-16">
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${getMatchColor(job.matchPercentage)}`}
                    style={{ borderColor: job.matchPercentage >= 70 ? '#22c55e' : job.matchPercentage >= 50 ? '#f59e0b' : '#ef4444' }}
                  >
                    <span className={`text-xl font-bold ${getMatchColor(job.matchPercentage)}`}>
                      {job.matchPercentage}%
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-semibold mt-1 ${getMatchColor(job.matchPercentage)}`}>
                  {getMatchLabel(job.matchPercentage)}
                </span>
              </div>
            )}
            <div className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
              <Clock className="w-4 h-4" />
              {timeAgo}
            </div>
          </div>
        </div>

        {job.matchCriteria && (
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
            <div className="text-sm">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-yellow-500">⭐</span>
                <span className="text-muted-foreground">Employers are more likely to interview you if you match these preferences:</span>
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
          <Badge variant="secondary">{job.type}</Badge>
          <Badge variant="secondary">{job.level}</Badge>
          <Badge variant="outline">{formattedSalary}</Badge>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map((skill) => (
            <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={() => onApply?.(job.id)}
        >
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  );
}
