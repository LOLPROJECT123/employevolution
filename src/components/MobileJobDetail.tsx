
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Users, 
  BookmarkIcon, 
  ExternalLink,
  Check,
  AlertCircle,
  Star
} from "lucide-react";

interface MobileJobDetailProps {
  job: Job | null;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  onBack: () => void;
  isSaved: boolean;
  isApplied: boolean;
}

export const MobileJobDetail = ({ 
  job, 
  onApply, 
  onSave, 
  onBack, 
  isSaved, 
  isApplied 
}: MobileJobDetailProps) => {
  if (!job) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No job selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a job to view details
          </p>
        </div>
      </div>
    );
  }

  const formattedSalary = job.level === 'intern' 
    ? `$${job.salary.min}/hr - $${job.salary.max}/hr`
    : `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave(job)}
            className={isSaved ? "text-blue-600" : ""}
          >
            <BookmarkIcon className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
          </Button>
          {job.applyUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(job.applyUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Job Header */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {job.title}
              </h1>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Building className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            </div>

            {/* Match Percentage */}
            {job.matchPercentage && (
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <Badge 
                  variant="outline" 
                  className={
                    job.matchPercentage >= 80 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : job.matchPercentage >= 60 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }
                >
                  {job.matchPercentage}% Match
                </Badge>
              </div>
            )}

            {/* Key Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{formattedSalary}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm capitalize">{job.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm capitalize">{job.level}</span>
              </div>
              {job.remote && (
                <Badge variant="secondary" className="w-fit">
                  Remote
                </Badge>
              )}
            </div>

            {/* Category and Job Function if available */}
            <div className="flex flex-wrap gap-2">
              {job.category && (
                <Badge variant="outline">
                  {job.category}
                </Badge>
              )}
              {job.jobFunction && (
                <Badge variant="outline">
                  {job.jobFunction}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Job Description</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Required Skills</h2>
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
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Benefits</h2>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Company Info */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">About {job.company}</h2>
            <div className="space-y-2">
              {job.companyType && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Type: <span className="capitalize">{job.companyType}</span>
                </p>
              )}
              {job.companySize && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Size: <span className="capitalize">{job.companySize}</span>
                </p>
              )}
            </div>
          </div>

          {/* Bottom padding for fixed button */}
          <div className="h-20"></div>
        </div>
      </ScrollArea>

      {/* Fixed Action Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <Button 
          onClick={() => onApply(job)}
          className="w-full"
          size="lg"
          disabled={isApplied}
        >
          {isApplied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Applied
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Apply Now
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
