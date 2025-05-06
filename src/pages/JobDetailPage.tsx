
import React, { useState } from 'react';
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Briefcase, MapPin, Building, Calendar, ExternalLink, ArrowLeft, MessageSquare } from "lucide-react";
import JobMatchingAnalyzer from "@/components/JobMatchingAnalyzer";
import JobApplicationTracker from "@/components/JobApplicationTracker";
import AutoFillDetector from "@/components/AutoFillDetector";
import { Job, JobApplicationStatus } from "@/types/job";
import { ExtendedJob } from "@/types/jobExtensions";
import { getUserProfile, saveUserProfile } from "@/utils/profileUtils";

// Mock data - in a real app this would come from a context or API
const mockJob: ExtendedJob = {
  id: "job123",
  title: "Senior React Developer",
  company: "Tech Innovations Inc",
  location: "San Francisco (Remote)",
  description: `
  <p>We are looking for a skilled React Developer to join our team. The ideal candidate will have experience with React, TypeScript, and Node.js.</p>
  
  <h3>Responsibilities:</h3>
  <ul>
    <li>Develop new user-facing features using React</li>
    <li>Build reusable components and libraries for future use</li>
    <li>Optimize components for maximum performance</li>
    <li>Collaborate with designers and backend developers</li>
  </ul>
  
  <h3>Requirements:</h3>
  <ul>
    <li>3+ years experience with React</li>
    <li>Strong proficiency in JavaScript, TypeScript, and HTML/CSS</li>
    <li>Experience with RESTful APIs and GraphQL</li>
    <li>Understanding of Redux and state management</li>
    <li>Knowledge of Node.js and Express is a plus</li>
    <li>Experience with testing libraries like Jest and React Testing Library</li>
  </ul>
  
  <h3>Benefits:</h3>
  <ul>
    <li>Competitive salary</li>
    <li>Remote work flexibility</li>
    <li>Health, dental, and vision insurance</li>
    <li>401(k) matching</li>
    <li>Unlimited PTO</li>
  </ul>
  `,
  applyUrl: "https://example.com/apply",
  source: "LinkedIn",
  datePosted: "2023-05-01",
  salary: {
    min: 120000,
    max: 160000,
    currency: "USD"
  },
  skills: ["React", "TypeScript", "JavaScript", "Node.js", "Redux", "GraphQL"],
  status: "saved",
  savedAt: new Date().toISOString(),
  logo: "/placeholder.svg",
  remote: true,
  jobType: "Full-time",
  type: 'full-time',
  level: 'mid',
  postedAt: new Date().toISOString(),
  requirements: []
};

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<ExtendedJob>(mockJob);
  const [autoFillEnabled, setAutoFillEnabled] = useState<boolean>(true);
  
  const handleUpdateStatus = (jobId: string, status: JobApplicationStatus) => {
    setJob(prev => ({
      ...prev,
      status,
      appliedAt: status === 'applied' ? new Date().toISOString() : prev.appliedAt
    }));
  };
  
  const handleApplyClick = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank');
      
      // Update status to applied if not already
      if (job.status === 'saved') {
        handleUpdateStatus(job.id, 'applied');
      }
    } else {
      toast.error("Apply link not available for this job");
    }
  };
  
  const handleAddSkillsToResume = (skills: string[]) => {
    const userProfile = getUserProfile();
    const currentSkills = userProfile.skills || [];
    
    // Add new skills without duplication
    const newSkills = [...new Set([...currentSkills, ...skills])];
    
    // Save updated profile
    saveUserProfile({
      ...userProfile,
      skills: newSkills
    });
    
    toast.success(`${skills.length} skills added to your profile`);
  };
  
  return (
    <div className="container max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/jobs">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold ml-2">Job Details</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Job Header */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Posted {job.datePosted}</span>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <img 
                  src={job.logo} 
                  alt={`${job.company} logo`} 
                  className="w-16 h-16 object-contain"
                />
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {job.remote && (
                <Badge>Remote</Badge>
              )}
              <Badge variant="outline">{job.jobType}</Badge>
              <Badge variant="secondary">{job.source}</Badge>
            </div>
            
            {job.salary && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                <div className="text-sm font-medium">Salary Range</div>
                <div className="text-lg font-semibold">
                  ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} {job.salary.currency}
                </div>
              </div>
            )}
            
            <div className="mt-6 flex gap-3">
              <Button onClick={handleApplyClick} className="flex-1">
                Apply Now <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => toast.success("Job saved to your list")}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </Card>
          
          {/* AutoFill Detector */}
          <AutoFillDetector onToggleAutofill={setAutoFillEnabled} />
          
          {/* Job Description */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Job Description</h3>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
            
            {job.skills?.length > 0 && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="text-lg font-medium mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <Separator className="my-6" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Briefcase className="h-4 w-4" />
                <span>Job ID: {job.id}</span>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleApplyClick}>
                Apply Now <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Application Tracker */}
          <JobApplicationTracker 
            jobs={[job]} 
            job={job} 
            onStatusChange={handleUpdateStatus} 
          />
          
          {/* Job Matching Analysis */}
          <div>
            <h3 className="text-lg font-medium mb-3">Profile Match</h3>
            <JobMatchingAnalyzer 
              jobDescription={job.description} 
              onAddToResume={handleAddSkillsToResume}
            />
          </div>
          
          {/* Similar Jobs */}
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-3">Similar Jobs</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0" />
                  <div>
                    <div className="font-medium">Similar Job Title {i}</div>
                    <div className="text-sm text-gray-500">Company Name</div>
                    <div className="text-sm text-gray-500">Location</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
