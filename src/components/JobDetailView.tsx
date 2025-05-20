
import { useState } from 'react';
import { Job } from '@/types/job';
import { ChevronLeft, Bookmark, ExternalLink, Building, MapPin, Clock, FileSpreadsheet, CheckCircle, BriefcaseBusiness, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMatchColor, getMatchBgColor } from '@/utils/jobMatchingUtils';
import { Separator } from '@/components/ui/separator';
import JobKeywordMatch from './JobKeywordMatch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import LinkedInOutreachPanel from './jobs/LinkedInOutreachPanel';

interface JobDetailViewProps {
  job: Job;
  onClose?: () => void;
  onSave?: () => void;
  onApply?: () => void;
  isSaved?: boolean;
  isApplied?: boolean;
  isMobile?: boolean;
}

export function JobDetailView({
  job,
  onClose,
  onSave,
  onApply,
  isSaved = false,
  isApplied = false,
  isMobile = false,
}: JobDetailViewProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showLinkedInDialog, setShowLinkedInDialog] = useState<boolean>(false);

  const formatSalary = (min: number, max: number, currency: string) => {
    return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
  };
  
  const handleApplyJob = () => {
    if (onApply) {
      onApply();
    }
    
    // If job has an apply URL, open it
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank');
    }
    
    // Show LinkedIn outreach option after applying
    setTimeout(() => {
      toast("Want to improve your chances?", {
        description: "Find recruiters and alumni at this company",
        action: {
          label: "Find Connections",
          onClick: () => setShowLinkedInDialog(true)
        },
        duration: 8000
      });
    }, 1500);
  };

  const renderJobDetails = () => {
    return (
      <div className="space-y-6">
        {/* Company & Location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-gray-600" />
            <span className="font-medium">{job.company}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <span>{job.location}</span>
          </div>
        </div>

        {/* Job Type & Level */}
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {job.type}
          </Badge>
          <Badge variant="outline">
            {job.level} level
          </Badge>
          {job.workModel && (
            <Badge variant="outline">
              {job.workModel}
            </Badge>
          )}
        </div>

        {/* Salary Range */}
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-gray-600" />
          <span className="font-medium">
            {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
          </span>
          <span className="text-gray-600 text-sm">per year</span>
        </div>

        {/* Posted At */}
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600" />
          <span>Posted {job.postedAt}</span>
        </div>

        {/* Match Percentage */}
        {job.matchPercentage && (
          <div className="rounded-lg border p-4 bg-gray-50">
            <JobKeywordMatch
              matchScore={job.matchPercentage}
              keywordsFound={job.keywordMatch?.found || Math.floor(job.matchPercentage / 10)}
              keywordsTotal={job.keywordMatch?.total || 10}
              keywordsList={job.skills || []}
            />
          </div>
        )}
      </div>
    );
  };

  const renderDescription = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Description</h3>
        <div className="whitespace-pre-line text-gray-700">
          {job.description}
        </div>
      </div>
    );
  };

  const renderRequirements = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Requirements</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {job.requirements.map((requirement, index) => (
            <li key={index}>{requirement}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderResponsibilities = () => {
    if (!job.responsibilities || job.responsibilities.length === 0) return null;
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Responsibilities</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {job.responsibilities.map((responsibility, index) => (
            <li key={index}>{responsibility}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSkills = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {job.skills.map((skill, index) => (
            <Badge key={index} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const renderBenefits = () => {
    if (!job.benefits || job.benefits.length === 0) return null;
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Benefits</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {job.benefits.map((benefit, index) => (
            <li key={index}>{benefit}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <div className="relative bg-white rounded-lg">
        {onClose && !isMobile && (
          <div className="absolute top-1 left-1">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only md:not-sr-only md:ml-2">Back to jobs</span>
            </Button>
          </div>
        )}

        <div className="p-6 pt-10">
          <div className="space-y-6">
            {/* Job Title */}
            <div>
              <h2 className="text-2xl font-bold">{job.title}</h2>
              {job.source && <p className="text-sm text-gray-500">Source: {job.source}</p>}
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[calc(100vh-320px)] md:h-[500px] mt-6 pr-4">
                <TabsContent value="overview" className="space-y-8">
                  {renderJobDetails()}
                  {renderDescription()}
                </TabsContent>

                <TabsContent value="description" className="space-y-8">
                  {renderDescription()}
                  {renderResponsibilities()}
                  {renderBenefits()}
                </TabsContent>

                <TabsContent value="requirements" className="space-y-8">
                  {renderRequirements()}
                  {job.education && job.education.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Education</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {job.education.map((edu, index) => (
                          <li key={index}>{edu}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="skills" className="space-y-8">
                  {renderSkills()}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <Separator />

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                onClick={onSave}
                className={isSaved ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
              >
                <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? "fill-blue-600 text-blue-600" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowLinkedInDialog(true)}>
                  Find Contacts
                </Button>
                
                <Button
                  onClick={handleApplyJob}
                  disabled={isApplied}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Applied
                    </>
                  ) : job.applyUrl ? (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Apply Now
                    </>
                  ) : (
                    <>
                      <BriefcaseBusiness className="mr-2 h-4 w-4" />
                      Apply
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showLinkedInDialog} onOpenChange={setShowLinkedInDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Find connections at {job.company}</DialogTitle>
            <DialogDescription>
              Discover recruiters and alumni who can help you get referred for this job
            </DialogDescription>
          </DialogHeader>

          <LinkedInOutreachPanel 
            companyName={job.company} 
            jobTitle={job.title} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
