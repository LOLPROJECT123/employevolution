
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { MapPin, Building, Briefcase, GraduationCap, DollarSign, Globe, Bookmark, CheckCircle2, Link as LinkIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useMobile } from "@/hooks/use-mobile";

const Profile = () => {
  const isMobile = useMobile();
  const [profileCompletion, setProfileCompletion] = useState(65);
  
  // Mock user profile data
  const profile = {
    name: "Varun Veluri",
    imageUrl: "",
    title: "Frontend Developer",
    activelyLooking: true,
    showToRecruiters: true,
    location: "San Francisco, CA",
    experience: [
      {
        id: 1,
        company: "Tech Solutions Inc.",
        title: "Senior Frontend Developer",
        location: "San Francisco, CA",
        period: "Jan 2021 - Present",
        description: "Led development of customer-facing web applications using React and TypeScript."
      },
      {
        id: 2,
        company: "Web Innovations",
        title: "Frontend Developer",
        location: "San Jose, CA",
        period: "Mar 2018 - Dec 2020",
        description: "Developed responsive web interfaces and collaborated with UX designers."
      }
    ],
    education: [
      {
        id: 1,
        institution: "University of California, Berkeley",
        degree: "Bachelor of Science, Computer Science",
        period: "2014 - 2018",
        description: "Graduated with honors. Focus on web technologies and algorithms."
      }
    ],
    skills: ["JavaScript", "React", "TypeScript", "Node.js", "HTML", "CSS", "GraphQL"],
    preferences: {
      roles: ["Frontend Developer", "Full Stack Developer"],
      salary: "$120,000 - $150,000",
      location: "San Francisco Bay Area",
      remote: "Hybrid",
      types: ["Full-time", "Contract"]
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isMobile && <Navbar />}
      
      <main className={`flex-1 container max-w-6xl px-4 py-8 ${isMobile ? 'pt-2' : 'pt-20'}`}>
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-32"></div>
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-12">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={profile.imageUrl} alt={profile.name} />
                  <AvatarFallback className="text-2xl">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">{profile.name}</h1>
                      <p className="text-muted-foreground">Job Search Status</p>
                      {profile.activelyLooking && (
                        <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">
                          Actively looking
                        </Badge>
                      )}
                    </div>
                    
                    {/* Profile Edit Component */}
                    <ProfileEditForm />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2 bg-secondary/30 p-3 rounded-lg">
                  <div className="bg-secondary p-2 rounded-md">
                    <Bookmark className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Show Profile to Recruiters</div>
                      <Switch checked={profile.showToRecruiters} />
                    </div>
                    <p className="text-xs text-muted-foreground">Get discovered by companies</p>
                    <p className="text-xs text-muted-foreground">Your current employer can't see you</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-secondary/30 p-3 rounded-lg">
                  <div className="bg-secondary p-2 rounded-md">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Job Search Status</div>
                      <Switch checked={profile.activelyLooking} />
                    </div>
                    <p className="text-xs text-muted-foreground">Actively looking for new opportunities</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Profile Completion</div>
                  <div className="text-sm">{profileCompletion}%</div>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Work Experience */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Work Experience</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.experience.map((job) => (
                  <div key={job.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building className="h-3.5 w-3.5" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{job.period}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">{job.description}</p>
                    {job.id !== profile.experience.length && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Education */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Education</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{edu.institution}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span>{edu.degree}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{edu.period}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">{edu.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Skills */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Job Preferences */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Job Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">Roles</div>
                  <div className="flex flex-wrap gap-1">
                    {profile.preferences.roles.map((role, index) => (
                      <Badge key={index} variant="outline">{role}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Salary Range</div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    {profile.preferences.salary}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Location</div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    {profile.preferences.location}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Remote Preference</div>
                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
                    {profile.preferences.remote}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Job Types</div>
                  <div className="flex flex-wrap gap-1">
                    {profile.preferences.types.map((type, index) => (
                      <Badge key={index} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* External Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>External Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="#" className="flex items-center hover:text-primary">
                  <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  LinkedIn
                </a>
                <a href="#" className="flex items-center hover:text-primary">
                  <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  GitHub
                </a>
                <a href="#" className="flex items-center hover:text-primary">
                  <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  Portfolio
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
