import { useState } from "react";
import { Job } from "@/types/job";
import { 
  getMatchBgColor, 
  getMatchColor, 
  getMatchLabel 
} from "@/utils/jobMatchingUtils";
import { 
  detectPlatform,
  getDirectApplicationUrl 
} from "@/utils/jobValidationUtils";
import { JobMatchDetails } from "@/components/JobMatchDetails";
import { Button } from "@/components/ui/button";
import { BookmarkIcon, ExternalLink, FileText, Zap, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import AutoApplyModal from "@/components/AutoApplyModal";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ApplicationScoreCalculator } from "@/components/ApplicationScoreCalculator";
import { ResumeGenerator } from "@/components/ResumeGenerator";
import { RealTimeJobAlerts } from "@/components/RealTimeJobAlerts";
import { getUserProfile } from "@/utils/profileUtils";

interface JobDetailViewProps {
  job: Job | null;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  isSaved?: boolean;
  isApplied?: boolean;
}

// Define the profile type for the mockUserProfile to match ResumeGenerator expectation
interface MockUserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: string[];
  workHistory: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
}

export const JobDetailView = ({ 
  job, 
  onApply, 
  onSave,
  isSaved,
  isApplied
}: JobDetailViewProps) => {
  const [showAutoApplyModal, setShowAutoApplyModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Get user profile for job matching
  const userProfile = getUserProfile();
  
  // Function to format experience data for the UI
  const formatProfileExperience = () => {
    if (userProfile.experience && Array.isArray(userProfile.experience)) {
      return userProfile.experience.map(exp => ({
        title: exp.title || '',
        company: exp.company || '',
        duration: exp.startDate ? 
          (exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate || ''}`) : 
          '2020-2022',
        description: exp.description || ''
      }));
    }
    
    return [
      {
        title: "Frontend Developer",
        company: "Tech Solutions Inc.",
        duration: "2020-2022",
        description: "Developed and maintained responsive web applications using React and TypeScript."
      },
      {
        title: "Junior Web Developer",
        company: "Digital Creations",
        duration: "2018-2020",
        description: "Built and styled websites for various clients using HTML, CSS, and JavaScript."
      }
    ];
  };
  
  // Create a mock user profile that matches the expected format for ResumeGenerator
  const mockUserProfile: MockUserProfile = {
    name: userProfile.name || "Alex Johnson",
    email: userProfile.email || "alex.johnson@example.com",
    phone: userProfile.phone || "555-123-4567",
    location: userProfile.location || "San Francisco, CA",
    skills: userProfile.skills || ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Node.js", "Express", "MongoDB", "Git"],
    experience: formatProfileExperience(),
    education: userProfile.education?.map(edu => edu.degree) || ["Bachelor of Science in Computer Science"],
    workHistory: formatProfileExperience()
  };
  
  if (!job) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p>No job selected</p>
      </div>
    );
  }

  function handleApply() {
    if (job) {
      const directUrl = getDirectApplicationUrl(job);
      
      if (!directUrl) {
        toast({
          title: "Application URL not available",
          description: "This job doesn't have a valid application link.",
          variant: "destructive",
        });
        return;
      }

      // Check if job is available before proceeding
      if (!job.applicationDetails?.isAvailable) {
        toast({
          title: "Job no longer available",
          description: "This job posting is no longer active. It may have been filled or removed by the employer.",
          variant: "destructive",
        });
        return;
      }
      
      const canAutoApply = detectPlatform(directUrl) !== null;
      
      if (canAutoApply) {
        setShowAutoApplyModal(true);
      } else {
        // Open in new tab with proper URL
        window.open(directUrl, '_blank', 'noopener,noreferrer');
      }
      
      onApply(job);
    }
  };
  
  function handleViewJob() {
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

  // Helper function to calculate years of experience from profile data
  function calculateYearsOfExperience(experience) {
    if (!experience || !Array.isArray(experience) || experience.length === 0) {
      return 0;
    }
    
    let totalMonths = 0;
    
    experience.forEach(exp => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.current ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
      
      totalMonths += Math.max(0, months);
    });
    
    return Math.round((totalMonths / 12) * 10) / 10;
  }

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="p-6">
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
              onClick={() => handleApply()}
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
                onClick={() => handleViewJob()}
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="match">Match Score</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="whitespace-pre-line">{job.description}</p>
            </div>
            
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Requirements</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {job.skills && job.skills.length > 0 && (
              <div>
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
          </TabsContent>
          
          <TabsContent value="match" className="mt-4">
            <ApplicationScoreCalculator 
              job={job} 
              userSkills={mockUserProfile.skills}
              userExperience={calculateYearsOfExperience(userProfile.experience)}
              userEducation={mockUserProfile.education}
              userLocation={mockUserProfile.location}
            />
            
            {job.matchPercentage && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-xl font-semibold mb-3">Detailed Match Analysis</h2>
                <JobMatchDetails job={job} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="documents" className="mt-4">
            <ResumeGenerator job={job} userProfile={mockUserProfile} />
          </TabsContent>
          
          <TabsContent value="alerts" className="mt-4">
            <RealTimeJobAlerts />
          </TabsContent>
        </Tabs>
        
        <AutoApplyModal
          job={job}
          open={showAutoApplyModal}
          onClose={() => setShowAutoApplyModal(false)}
          onSuccess={onApply}
        />
      </div>
    </ScrollArea>
  );
};
