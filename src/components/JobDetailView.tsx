
import { useState } from "react";
import { Job } from "@/types/job";
import { getMatchBgColor, getMatchColor, getMatchLabel } from "@/utils/jobMatchingUtils";
import { JobMatchDetails } from "@/components/JobMatchDetails";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, ExternalLink, FileText, Zap, Users } from "lucide-react";
import AutoApplyModal from "@/components/AutoApplyModal";
import { toast } from "@/hooks/use-toast";

interface JobDetailViewProps {
  job: Job | null;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  isSaved?: boolean;
  isApplied?: boolean;
}

export const JobDetailView = ({ 
  job, 
  onApply, 
  onSave,
  isSaved,
  isApplied
}: JobDetailViewProps) => {
  const [showAutoApplyModal, setShowAutoApplyModal] = useState(false);
  
  if (!job) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p>No job selected</p>
      </div>
    );
  }

  const handleApply = () => {
    if (job.applyUrl) {
      // Check if job is available before proceeding
      if (!job.applicationDetails?.isAvailable) {
        toast({
          title: "Job no longer available",
          description: "This job posting is no longer active. It may have been filled or removed by the employer.",
          variant: "destructive",
        });
        return;
      }
      
      const canAutoApply = job.applyUrl && detectPlatform(job.applyUrl) !== null;
      
      if (canAutoApply) {
        setShowAutoApplyModal(true);
      } else {
        if (typeof window !== 'undefined' && 
            window.chrome?.runtime?.sendMessage) {
          window.chrome.runtime.sendMessage({ 
            action: "openJobUrl", 
            url: job.applyUrl 
          });
        } else {
          window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
        }
        onApply(job);
      }
    } else {
      toast({
        title: "Application URL not available",
        description: "This job doesn't have an application link.",
        variant: "destructive",
      });
      onApply(job);
    }
  };
  
  const handleViewJob = () => {
    if (!job.applyUrl) {
      toast({
        title: "Job URL not available",
        description: "This job doesn't have a URL to view details.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if job is available before opening URL
    if (!job.applicationDetails?.isAvailable) {
      toast({
        title: "Job no longer available",
        description: "This job posting is no longer active. It may have been filled or removed by the employer.",
        variant: "destructive",
      });
      return;
    }
    
    window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
  };
  
  const detectPlatform = (url: string): string | null => {
    if (!url) return null;
    
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('google.com') || lowerUrl.includes('careers.google')) return 'Google';
    if (lowerUrl.includes('microsoft.com') || lowerUrl.includes('careers.microsoft')) return 'Microsoft';
    if (lowerUrl.includes('apple.com') || lowerUrl.includes('jobs.apple')) return 'Apple';
    if (lowerUrl.includes('amazon.jobs') || lowerUrl.includes('amazon.com/jobs')) return 'Amazon';
    if (lowerUrl.includes('meta.com') || lowerUrl.includes('metacareers')) return 'Meta';
    if (lowerUrl.includes('netflix.com') || lowerUrl.includes('jobs.netflix')) return 'Netflix';
    if (lowerUrl.includes('uber.com/careers') || lowerUrl.includes('uber.com/us/en/careers')) return 'Uber';
    if (lowerUrl.includes('airbnb.com/careers') || lowerUrl.includes('careers.airbnb')) return 'Airbnb';
    if (lowerUrl.includes('twitter.com/careers') || lowerUrl.includes('careers.twitter')) return 'Twitter';
    if (lowerUrl.includes('linkedin.com/jobs') || lowerUrl.includes('careers.linkedin')) return 'LinkedIn';
    
    if (lowerUrl.includes('greenhouse.io')) return 'Greenhouse';
    if (lowerUrl.includes('lever.co')) return 'Lever';
    if (lowerUrl.includes('workday')) return 'Workday';
    if (lowerUrl.includes('indeed.com')) return 'Indeed';
    if (lowerUrl.includes('taleo')) return 'Taleo';
    if (lowerUrl.includes('icims')) return 'iCIMS';
    if (lowerUrl.includes('brassring')) return 'BrassRing';
    if (lowerUrl.includes('smartrecruiters')) return 'SmartRecruiters';
    if (lowerUrl.includes('jobvite')) return 'Jobvite';
    
    return null; // Unknown platform
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {job.matchPercentage && (
        <div className={`p-4 rounded-lg ${getMatchBgColor(job.matchPercentage)} mb-4`}>
          <div className="flex items-center gap-2">
            <div className={`text-xl font-bold ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}%</div>
            <div className={`font-semibold ${getMatchColor(job.matchPercentage)}`}>
              {getMatchLabel(job.matchPercentage)}
            </div>
          </div>
          <p className="text-sm mt-1">Based on your profile, skills, and experience</p>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <JobMatchDetails job={job} compact={true} />
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <div className="mt-2 text-lg">{job.company}</div>
          <div className="mt-1 text-gray-500">{job.location}</div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{job.applicationDetails?.applicantCount || '0'} applicants</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleApply}
            disabled={isApplied}
            className={isApplied ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isApplied ? (
              <>Applied</>
            ) : job.applyUrl && detectPlatform(job.applyUrl) ? (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Auto Apply
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Apply
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => onSave(job)}
            className={isSaved ? "border-primary-500 text-primary" : ""}
          >
            <BookmarkIcon className={`mr-2 h-4 w-4 ${isSaved ? "fill-primary" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>
          
          {job.applyUrl && (
            <Button 
              variant="outline"
              onClick={handleViewJob}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Job
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-4 p-4 border rounded-lg">
        <div className="font-semibold">Salary Range</div>
        <div className="text-xl font-bold mt-1">
          {job.salary.currency}{job.salary.min.toLocaleString()} - {job.salary.currency}{job.salary.max.toLocaleString()}
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="whitespace-pre-line">{job.description}</p>
      </div>
      
      {job.requirements && job.requirements.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Requirements</h2>
          <ul className="list-disc pl-5 space-y-2">
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}
      
      {job.skills && job.skills.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {job.matchPercentage && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-3">Detailed Match Analysis</h2>
          <JobMatchDetails job={job} />
        </div>
      )}
      
      <AutoApplyModal
        job={job}
        open={showAutoApplyModal}
        onClose={() => setShowAutoApplyModal(false)}
        onSuccess={onApply}
      />
    </div>
  );
};
