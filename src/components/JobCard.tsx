
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Clock, PercentIcon } from "lucide-react";
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
              <div className="flex items-center">
                <span className={`text-xl font-bold ${getMatchColor(job.matchPercentage)}`}>
                  {job.matchPercentage}%
                </span>
                <PercentIcon className={`w-4 h-4 ml-1 ${getMatchColor(job.matchPercentage)}`} />
              </div>
            )}
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {timeAgo}
            </div>
          </div>
        </div>
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
