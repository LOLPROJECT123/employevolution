
import { getMatchColor } from "@/utils/jobMatchingUtils";
import { Job } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, XIcon } from "lucide-react";

interface JobMatchDetailsProps {
  job: Job;
  compact?: boolean;
}

export const JobMatchDetails = ({ job, compact = false }: JobMatchDetailsProps) => {
  if (!job.matchPercentage) {
    return null;
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="space-y-2">
          <h3 className="font-medium">Match Score</h3>
          <div className="flex items-center gap-2">
            <div className={`text-xl font-bold ${getMatchColor(job.matchPercentage)}`}>
              {job.matchPercentage}%
            </div>
            <div className="text-sm text-gray-600">
              Overall match based on your profile
            </div>
          </div>
        </div>
      )}
      
      {job.matchCriteria && (
        <div className={compact ? "" : "mt-4"}>
          <h3 className={`font-medium ${compact ? "text-sm" : ""} mb-2`}>Match Details</h3>
          <div className="space-y-2">
            {Object.entries(job.matchCriteria).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${value ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {value ? <CheckIcon className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}
                </div>
                <div className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {job.keywordMatch && !compact && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Skills Match</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className={`text-xl font-bold ${getMatchColor(job.keywordMatch.score)}`}>
              {job.keywordMatch.score}%
            </div>
            <div className="text-sm text-gray-600">
              {job.keywordMatch.found} of {job.keywordMatch.total} skills matched
            </div>
          </div>
          
          {job.keywordMatch.highPriority && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">High Priority Skills</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {job.keywordMatch.highPriority.keywords.map((keyword: string, index: number) => (
                  <Badge key={index} className="bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                    {keyword}
                  </Badge>
                ))}
              </div>
              <p className="text-xs mt-1 text-gray-500">
                {job.keywordMatch.highPriority.found} of {job.keywordMatch.highPriority.total} matched
              </p>
            </div>
          )}
          
          {job.keywordMatch.lowPriority && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Other Skills</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {job.keywordMatch.lowPriority.keywords.map((keyword: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
              <p className="text-xs mt-1 text-gray-500">
                {job.keywordMatch.lowPriority.found} of {job.keywordMatch.lowPriority.total} matched
              </p>
            </div>
          )}
        </div>
      )}
      
      {compact && job.skills && job.skills.length > 0 && (
        <div className="mt-2">
          <h4 className="text-sm font-medium mb-1">Required Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs py-0 px-1.5">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="outline" className="text-xs py-0 px-1.5">
                +{job.skills.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
