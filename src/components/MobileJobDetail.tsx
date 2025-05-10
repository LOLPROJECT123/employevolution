
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types/job";
import { BookmarkIcon, ArrowLeft, XIcon, CheckIcon, BriefcaseIcon, MapPinIcon, CalendarIcon, BuildingIcon } from "lucide-react";
import { toast } from "sonner";
import { formatSalary } from "@/utils/formatters";
import { JobKeywordMatch } from "@/components/JobKeywordMatch";
import { JobAutomationControl } from "@/components/JobAutomationControl";

interface MobileJobDetailProps {
  job: Job | null;
  onBack: () => void;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  isSaved: boolean;
  isApplied: boolean;
}

export const MobileJobDetail = ({
  job,
  onBack,
  onApply,
  onSave,
  isSaved,
  isApplied
}: MobileJobDetailProps) => {
  const [isApplying, setIsApplying] = useState(false);
  
  if (!job) {
    return (
      <div className="h-[calc(100vh-56px)] flex justify-center items-center">
        <p className="text-gray-500">No job selected</p>
      </div>
    );
  }

  // Handle apply button click
  const handleApply = () => {
    setIsApplying(true);
    // Simulate API call
    setTimeout(() => {
      onApply(job);
      setIsApplying(false);
    }, 1000);
  };
  
  const formattedSalary = job.salary 
    ? formatSalary(job.salary.min, job.salary.max, job.salary.currency) 
    : 'Not specified';

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col bg-white dark:bg-gray-900">
      <div className="px-3 py-3 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-800">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium truncate flex-1 text-center">Job Details</h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onSave(job)}
        >
          <BookmarkIcon className={`h-5 w-5 ${isSaved ? 'fill-blue-500 text-blue-500' : ''}`} />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4 pb-24">
        <div className="space-y-6">
          {/* Job Header */}
          <div>
            <h1 className="text-xl font-bold">{job.title}</h1>
            <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
              <BuildingIcon className="h-4 w-4 mr-1" />
              <p>{job.company}</p>
            </div>
            <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <p>{job.location}</p>
              {job.remote && <Badge variant="outline" className="ml-2">Remote</Badge>}
            </div>
            <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <p>Posted {job.postedAt}</p>
            </div>
          </div>
          
          {/* Key Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Salary</p>
              <p className="font-medium">{formattedSalary}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Job Type</p>
              <p className="font-medium capitalize">{job.type}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
              <p className="font-medium capitalize">{job.level}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Work Model</p>
              <p className="font-medium capitalize">{job.workModel}</p>
            </div>
          </div>
          
          {/* Match Score */}
          {job.matchPercentage && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Match Score</h3>
                <Badge variant={job.matchPercentage > 85 ? "default" : "outline"} className={job.matchPercentage > 85 ? "bg-green-500" : ""}>
                  {job.matchPercentage}% Match
                </Badge>
              </div>
              
              <div className="mt-3 space-y-2">
                {job.matchCriteria && Object.entries(job.matchCriteria).map(([key, value]) => (
                  <div key={key} className="flex items-center text-sm">
                    {value ? (
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <XIcon className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span className="capitalize">{key}</span>
                  </div>
                ))}
              </div>
              
              {job.skills && job.skills.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Skills Match</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="bg-white dark:bg-gray-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Job Description */}
          <div>
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{job.description}</p>
          </div>
          
          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-2">Requirements</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-2">Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {job.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-2">Benefits</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Keyword Match */}
          {job.keywordMatch && (
            <JobKeywordMatch keywordMatch={job.keywordMatch} />
          )}
        </div>
      </ScrollArea>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t">
        <div className="flex justify-between items-center">
          <Button 
            onClick={handleApply} 
            disabled={isApplied || isApplying}
            className="flex-1"
          >
            {isApplying ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Applying...
              </>
            ) : isApplied ? (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Applied
              </>
            ) : (
              <>
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                Apply Now
              </>
            )}
          </Button>
          
          {/* Add the JobAutomationControl component */}
          <JobAutomationControl job={job} isApplied={isApplied} />
        </div>
      </div>
    </div>
  );
};
