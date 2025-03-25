import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Clock, BookmarkIcon, ExternalLinkIcon, BadgeCheck, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { detectPlatform, startAutomation } from "@/utils/automationUtils";
import AutomationSettings from "@/components/AutomationSettings";

interface JobDetailViewProps {
  job: Job | null;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
}

export function JobDetailView({ job, onApply, onSave }: JobDetailViewProps) {
  const [isApplying, setIsApplying] = useState(false);
  
  // Check if automation is possible for this job
  const canAutomate = job?.applyUrl ? detectPlatform(job.applyUrl) !== null : false;
  
  // Check if automation is enabled in local storage
  const automationEnabled = (() => {
    try {
      const config = JSON.parse(localStorage.getItem('automationConfig') || '{}');
      return config?.credentials?.enabled || false;
    } catch (e) {
      return false;
    }
  })();

  // Get the platform type for job-specific automation options
  const platform = job?.applyUrl ? detectPlatform(job.applyUrl) : null;

  if (!job) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No Job Selected</h3>
          <p className="text-muted-foreground mt-2">
            Select A Job From The List To View Details
          </p>
        </div>
      </div>
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
      onApply(job);
    } catch (error) {
      toast.error("Failed To Apply", {
        description: "There Was An Error Submitting Your Application. Please Try Again."
      });
      console.error("Application error:", error);
    } finally {
      setIsApplying(false);
    }
  };
  
  const handleAutomatedApply = () => {
    try {
      if (!job.applyUrl) {
        toast.error("Cannot Automate Application", {
          description: "This Job Doesn't Have An Application URL."
        });
        return;
      }
      
      const automationConfig = localStorage.getItem('automationConfig');
      if (!automationConfig) {
        toast.error("Automation Not Configured", {
          description: "Please Configure Your Automation Settings First."
        });
        return;
      }
      
      const config = JSON.parse(automationConfig);
      
      // Start the automation process
      startAutomation(job.applyUrl, config);
      
      toast.success("Automation Initiated", {
        description: `The Automation Script Will Now Apply To This Job On ${platform || 'The Job Platform'}. Please Check The Browser Extension For Details.`
      });
      
      // Also mark as applied in our system
      onApply(job);
    } catch (error) {
      toast.error("Automation Failed", {
        description: "There Was An Error Starting The Automation Process."
      });
      console.error("Automation error:", error);
    }
  };

  const getAutomationButtonText = () => {
    switch(platform) {
      case 'linkedin':
        return "AutoApply With LinkedIn Script";
      case 'indeed':
        return "AutoApply With Indeed Script";
      case 'handshake':
        return "AutoApply With Handshake Script";
      default:
        return "AutoApply With Script";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
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
            <p className="text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" /> {job.company}
            </p>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4" /> {job.location}
            </p>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="w-4 h-4" /> Posted {new Date(job.postedAt).toLocaleDateString()}
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
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary" className="capitalize">{job.type}</Badge>
          <Badge variant="secondary" className="capitalize">{job.level}</Badge>
          <Badge variant="outline">{formattedSalary}</Badge>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="summary" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="full-posting">Full Job Posting</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-4 space-y-6">
            {job.matchCriteria && (
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <div className="mb-2">
                  <p className="font-medium">You Match The Following {job.company}'s Candidate Preferences</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1 mt-1">
                    <span className="text-lg">✨</span> Employers Are More Likely To Interview You If You Match These Preferences:
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
              <h3 className="text-lg font-medium mb-3">About This Role</h3>
              <p className="text-muted-foreground leading-relaxed">
                {job.description.substring(0, 300)}...
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Requirements</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
            
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
                  <p className="font-medium">You Match The Following {job.company}'s Candidate Preferences</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1 mt-1">
                    <span className="text-lg">✨</span> Employers Are More Likely To Interview You If You Match These Preferences:
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
      </div>
      
      <div className="border-t p-4">
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={handleApplyClick}
            disabled={isApplying}
          >
            {isApplying ? "Applying..." : "Apply Now"}
          </Button>
          
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onSave(job)}
          >
            Save Job
          </Button>
        </div>
        
        {canAutomate && automationEnabled && (
          <div className="mt-3">
            <Button
              variant="outline"
              className="w-full bg-primary/10 hover:bg-primary/20"
              onClick={handleAutomatedApply}
            >
              <Zap className="w-4 h-4 mr-2" />
              {getAutomationButtonText()}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
