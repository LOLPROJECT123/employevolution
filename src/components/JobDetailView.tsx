import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Clock, BookmarkIcon, ExternalLinkIcon, BadgeCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface JobDetailViewProps {
  job: Job | null;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
}

export function JobDetailView({ job, onApply, onSave }: JobDetailViewProps) {
  const [isApplying, setIsApplying] = useState(false);

  if (!job) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No Job Selected</h3>
          <p className="text-muted-foreground mt-2">
            Select a job from the list to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  const formattedSalary = `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.currency}${job.salary.max.toLocaleString()}`;
  
  const getMatchColor = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getMatchBgColor = (percentage?: number) => {
    if (!percentage) return "bg-gray-100 dark:bg-gray-800";
    if (percentage >= 70) return "bg-green-50 dark:bg-green-900/30";
    if (percentage >= 50) return "bg-amber-50 dark:bg-amber-900/30";
    return "bg-red-50 dark:bg-red-900/30";
  };

  const getMatchLabel = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 70) return "GOOD MATCH";
    if (percentage >= 50) return "FAIR MATCH";
    return "WEAK MATCH";
  };

  const handleApplyClick = async () => {
    try {
      setIsApplying(true);
      
      if (job.applyUrl) {
        const newWindow = window.open(job.applyUrl, '_blank');
        
        toast.success("Opening application page", {
          description: "Our Chrome extension will automatically complete the application for you."
        });
        
        setTimeout(() => {
          toast.success("Application submitted successfully", {
            description: `Your application to ${job.company} for ${job.title} has been submitted.`
          });
          
          onApply(job);
        }, 3000);
      } else {
        toast.success("Applying to job...");
        
        setTimeout(() => {
          toast.success("Application submitted successfully", {
            description: `Your application to ${job.company} for ${job.title} has been submitted.`
          });
          
          onApply(job);
        }, 2000);
      }
    } catch (error) {
      toast.error("Failed to apply", {
        description: "There was an error submitting your application. Please try again."
      });
      console.error("Application error:", error);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold">{job.title}</h2>
              {job.matchPercentage && (
                <div className={`px-3 py-1 rounded-full ${getMatchBgColor(job.matchPercentage)} ${getMatchColor(job.matchPercentage)} text-sm font-semibold`}>
                  {job.matchPercentage}% Match
                </div>
              )}
              {job.remote && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Remote
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {job.company} • {job.location}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSave(job)}
              className="button-hover"
            >
              <BookmarkIcon className="w-4 h-4" />
            </Button>
            {job.applyUrl && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(job.applyUrl, '_blank')}
                className="button-hover"
              >
                <ExternalLinkIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto pb-0">
        <Tabs defaultValue="summary" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="full-posting">Full Job Posting</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-4 space-y-6">
            {job.matchCriteria && (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <div className="mb-2">
                  <p className="font-medium">You match the following {job.company}'s candidate preferences</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1 mt-1">
                    <span className="text-lg">✨</span> Employers are more likely to interview you if you match these preferences:
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {job.matchCriteria.degree && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span>Degree</span>
                    </div>
                  )}
                  {job.matchCriteria.experience && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span>Experience</span>
                    </div>
                  )}
                  {job.matchCriteria.skills && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span>Skills</span>
                    </div>
                  )}
                  {job.matchCriteria.location && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span>Location</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">About This Role</h3>
              <p className="text-muted-foreground leading-relaxed">
                {job.description.substring(0, 300)}...
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Requirements</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
            
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {job.responsibilities.map((responsibility, idx) => (
                    <li key={idx}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <div key={index} className="px-3 py-1 rounded-full bg-secondary/70 text-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                {job.type}
              </div>
              <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                {job.level}
              </div>
              <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                {formattedSalary}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              Posted on {new Date(job.postedAt).toLocaleDateString()}
            </div>
          </TabsContent>
          
          <TabsContent value="full-posting" className="mt-4 space-y-6">
            {job.matchPercentage && (
              <div className={`p-4 rounded-lg ${getMatchBgColor(job.matchPercentage)} mb-4`}>
                <div className="flex items-center gap-2">
                  <div className={`text-xl font-bold ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}%</div>
                  <div className={`font-semibold ${getMatchColor(job.matchPercentage)}`}>
                    {getMatchLabel(job.matchPercentage)}
                  </div>
                </div>
                <p className="text-sm mt-1">Based on your profile, skills, and experience</p>
              </div>
            )}
            
            {job.matchCriteria && (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <div className="mb-2">
                  <p className="font-medium">You match the following {job.company}'s candidate preferences</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1 mt-1">
                    <span className="text-lg">✨</span> Employers are more likely to interview you if you match these preferences:
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {job.matchCriteria.degree && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span>Degree</span>
                    </div>
                  )}
                  {job.matchCriteria.experience && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span>Experience</span>
                    </div>
                  )}
                  {job.matchCriteria.skills && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span>Skills</span>
                    </div>
                  )}
                  {job.matchCriteria.location && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span>Location</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium mb-3">Job Description</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </div>
            
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {job.responsibilities.map((responsibility, idx) => (
                    <li key={idx}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium mb-3">Requirements</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
            
            {job.education && job.education.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Education</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {job.education.map((edu, idx) => (
                    <li key={idx}>{edu}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {job.benefits && job.benefits.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Benefits</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  {job.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                {job.type}
              </div>
              <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                {job.level}
              </div>
              <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                {formattedSalary}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Clock className="w-4 h-4 mr-2" />
              Posted on {new Date(job.postedAt).toLocaleDateString()}
            </div>
            
            {job.applyUrl && (
              <div className="p-4 rounded-lg bg-secondary/20 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck className="w-5 h-5 text-primary" />
                  <span className="font-medium">Application Details</span>
                </div>
                <p className="text-muted-foreground mb-2">
                  Click the "Apply Now" button to visit the application page.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            className="w-full button-hover"
            onClick={handleApplyClick}
            disabled={isApplying}
          >
            {isApplying ? "Applying..." : "Apply Now"}
          </Button>
          <Button
            variant="outline"
            className="w-full button-hover"
            onClick={() => onSave(job)}
          >
            Save Job
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
