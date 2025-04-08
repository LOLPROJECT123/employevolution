
import React, { useState } from "react";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { 
  Upload, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Linkedin, 
  Github, 
  Globe, 
  Link as LinkIcon,
  Zap, 
  PenLine, 
  Plus,
  Search as SearchIcon,
  UserRound,
  Building2,
  DollarSign,
  MapPin as LocationIcon,
  Clock,
  GraduationCap as EducationIcon,
  Users,
  Sparkles
} from "lucide-react";

const ProfilePage = () => {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState("contact");
  
  // Profile data states
  const [name, setName] = useState("Varun Veluri");
  const [jobStatus, setJobStatus] = useState("Actively looking");
  const [showToRecruiters, setShowToRecruiters] = useState(true);
  const [showJobSearchStatus, setShowJobSearchStatus] = useState(true);
  
  // Contact info
  const [email, setEmail] = useState("vveluri6@gmail.com");
  const [phone, setPhone] = useState("+1 (469) 551-9662");
  const [dateOfBirth, setDateOfBirth] = useState("06/19/2006");
  const [location, setLocation] = useState("Atlanta, GA, USA");
  
  // Work experiences
  const [workExperiences, setWorkExperiences] = useState([
    {
      id: 1,
      role: "Software Engineer Intern/ Co-Lead",
      company: "DIRAC",
      location: "New York, NY, USA",
      startDate: "Oct 2024",
      endDate: "Dec 2024",
      description: [
        "Creating a solution to simulate and calculate the optimal path for installing and removing the wire and the installation and removal of a flexible wire from an electrical cabinet",
        "Using the A* algorithm, PythonOCC, Blender, FreeCAD, CAD, and an RL model to help take into account real-world constraints like collisions with other components and bending behavior of the flexible material and showing the output in animation",
        "The future purpose is to use the script we developed in robots to help build the electrical aspects of houses"
      ]
    },
    {
      id: 2,
      role: "AI Fellowship",
      company: "Headstarter AI",
      location: "Remote",
      startDate: "Jul 2024",
      endDate: "Sep 2024",
      description: [
        "Personal Portfolio (HTML/CSS): Used to showcase individual talents, skills and experience",
        "Pantry Tracker (Next.js, Material UI, React, GCP, Vercel, CI/CD, and Firebase): Built inventory management system with next.js, react, and Firebase, enabling real-time tracking of 1000+ products across 5 warehouses, increasing efficiency by 30%"
      ]
    }
  ]);

  // Education
  const [education, setEducation] = useState([
    {
      id: 1,
      school: "Georgia Institute of Technology",
      degree: "Bachelor's, Computer Science",
      startDate: "Aug 2023",
      endDate: "May 2027"
    }
  ]);

  // Projects
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "AI Malware and Virus Reader For Emails",
      startDate: "May 2024",
      endDate: "May 2024",
      description: [
        "Serves as a tool to ensure your emails are not corrupting the user's device",
        "It uses Python, a Gmail import tool, and an IMAP port to take emails and scan them for malware and viruses"
      ]
    },
    {
      id: 2,
      name: "Trading Algorithm",
      startDate: "Dec 2024",
      endDate: "Present",
      description: [
        "Serves as a tool to help study trends of the stock markets and company and world issues and success and their impacts on stocks to make trading more predictable and help with better trade outcomes"
      ]
    }
  ]);

  // Social links
  const [socialLinks, setSocialLinks] = useState({
    linkedin: "https://www.linkedin.com/in/varun-veluri-6698a628a/",
    github: "",
    portfolio: "",
    other: ""
  });

  // Equal employment data
  const [equalEmploymentData, setEqualEmploymentData] = useState({
    ethnicity: "Southeast Asian",
    workAuthUS: true,
    workAuthCanada: false,
    workAuthUK: false,
    needsSponsorship: false,
    gender: "Male",
    lgbtq: "Not specified",
    disability: "Not specified",
    veteran: "Not specified"
  });

  // Settings
  const [settings, setSettings] = useState({
    emailPreferences: {
      jobAlerts: true,
      newsletters: false,
      accountUpdates: true
    },
    skills: ["React", "TypeScript", "JavaScript", "Node.js", "Python"],
    languages: ["English", "Spanish", "Hindi"]
  });

  // Progress tracking
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(65);
  
  // Job preferences
  const [jobPreferences, setJobPreferences] = useState({
    jobTypes: ["full-time", "internship", "contract"],
    preferredLocations: ["New York, NY", "San Francisco, CA", "Remote"],
    salary: {
      currency: "USD",
      min: 80000,
      max: 120000,
      period: "yearly"
    },
    remotePreference: "hybrid",
    experienceLevel: "entry",
    industries: ["Technology", "Finance", "Healthcare"],
    roles: ["Software Engineer", "Full Stack Developer", "Data Scientist"],
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
    benefits: ["Health Insurance", "401k", "Remote Work", "Professional Development"],
    companySize: ["Startup", "Mid-size"],
    workAuthorization: {
      authorized: true,
      needSponsorship: false,
      countries: ["United States"]
    }
  });

  const renderProfileCard = () => (
    <Card className="mb-6 shadow-none border rounded-lg">
      <CardContent className="p-6">
        <div className={`flex ${isMobile ? 'flex-col' : 'items-start gap-6'}`}>
          <div className="relative mb-4">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-500">
              VV
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold">{name}</h1>
                <p className="text-sm text-muted-foreground mb-1">Job Search Status</p>
                <div className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {jobStatus}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <PenLine className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <div className="flex items-center border rounded-md p-2">
                <Zap className="h-4 w-4 mr-2 text-amber-500" />
                <span className="text-sm">Show Profile to Recruiters</span>
                <div className="ml-auto flex items-center gap-2">
                  <Switch 
                    checked={showToRecruiters} 
                    onCheckedChange={setShowToRecruiters} 
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center border rounded-md p-2">
                <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm">Job Search Status</span>
                <div className="ml-auto flex items-center gap-2">
                  <Switch 
                    checked={showJobSearchStatus} 
                    onCheckedChange={setShowJobSearchStatus} 
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>Get discovered by companies</p>
              <p>Your current employer can't see you</p>
            </div>
            
            {/* Profile Completion Progress */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm font-medium">{profileCompletionPercentage}%</span>
              </div>
              <Progress value={profileCompletionPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContactContent = () => (
    <Card className="shadow-none border rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between p-6">
        <CardTitle>Contact</CardTitle>
        <Button variant="ghost" size="icon">
          <PenLine className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span>{dateOfBirth}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <span>{location}</span>
        </div>
      </CardContent>
    </Card>
  );

  const renderResumeContent = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Resume</h2>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload Resume
        </Button>
      </div>
      <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center mb-6">
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-center mb-1">Drag & drop your resume here</p>
        <p className="text-sm text-muted-foreground text-center mb-4">Supports PDF, DOC, DOCX formats</p>
        <Button variant="outline" size="sm">Browse Files</Button>
      </div>
      
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold">Work Experience</h2>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>
      
      <div className="space-y-6 mb-8">
        {workExperiences.map((experience) => (
          <div key={experience.id} className="bg-card rounded-lg border p-4">
            <div className="flex">
              <div className="bg-blue-100 p-2 rounded-md mr-4">
                <Briefcase className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">{experience.role}</h3>
                  <Button variant="ghost" size="icon">
                    <PenLine className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground font-medium">{experience.company}</p>
                <p className="text-muted-foreground text-sm">{experience.location}</p>
                <p className="text-muted-foreground text-sm">{experience.startDate} - {experience.endDate}</p>
                <div className="mt-3 space-y-2">
                  {experience.description.map((item, index) => (
                    <p key={index} className="text-sm">{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold">Education</h2>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>
      
      <div className="space-y-6 mb-8">
        {education.map((edu) => (
          <div key={edu.id} className="bg-card rounded-lg border p-4">
            <div className="flex">
              <div className="bg-blue-100 p-2 rounded-md mr-4">
                <GraduationCap className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">{edu.school}</h3>
                  <Button variant="ghost" size="icon">
                    <PenLine className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground">{edu.degree}</p>
                <p className="text-muted-foreground text-sm">{edu.startDate} - {edu.endDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold">Projects</h2>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>
      
      <div className="space-y-6 mb-8">
        {projects.map((project) => (
          <div key={project.id} className="bg-card rounded-lg border p-4">
            <div className="flex">
              <div className="bg-blue-100 p-2 rounded-md mr-4">
                <Wrench className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <Button variant="ghost" size="icon">
                    <PenLine className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">{project.startDate} - {project.endDate}</p>
                <div className="mt-3 space-y-2">
                  {project.description.map((item, index) => (
                    <p key={index} className="text-sm">{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 mb-4">
        <h2 className="text-xl font-bold">Social Links</h2>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <Linkedin className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium">LinkedIn URL</p>
            <p className="text-sm text-muted-foreground">{socialLinks.linkedin || "Not provided"}</p>
          </div>
          <Button variant="ghost" size="icon">
            <PenLine className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center">
          <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center mr-3">
            <Github className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium">GitHub URL</p>
            <p className="text-sm text-muted-foreground">{socialLinks.github || "Not provided"}</p>
          </div>
          <Button variant="ghost" size="icon">
            <PenLine className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center">
          <div className="h-10 w-10 bg-pink-500 rounded-full flex items-center justify-center mr-3">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Portfolio URL</p>
            <p className="text-sm text-muted-foreground">{socialLinks.portfolio || "Not provided"}</p>
          </div>
          <Button variant="ghost" size="icon">
            <PenLine className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center">
          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <LinkIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Other URL</p>
            <p className="text-sm text-muted-foreground">{socialLinks.other || "Not provided"}</p>
          </div>
          <Button variant="ghost" size="icon">
            <PenLine className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Profile" />}
      
      <div className={`container mx-auto ${isMobile ? 'px-4 pt-16' : 'py-8 px-4'} max-w-5xl`}>
        {/* Profile Header */}
        {renderProfileCard()}

        {/* Profile Tabs */}
        <Tabs 
          defaultValue="contact" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="overflow-auto">
            <TabsList className={`${isMobile ? 'grid grid-cols-5 w-full' : 'w-full bg-muted/50 rounded-none'} mb-6`}>
              <TabsTrigger value="contact" className="text-xs md:text-sm data-[state=active]:bg-background">
                Contact
              </TabsTrigger>
              <TabsTrigger value="resume" className="text-xs md:text-sm data-[state=active]:bg-background">
                Resume
              </TabsTrigger>
              <TabsTrigger value="jobPreferences" className="text-xs md:text-sm data-[state=active]:bg-background">
                Job Preferences
              </TabsTrigger>
              <TabsTrigger value="equalEmployment" className="text-xs md:text-sm data-[state=active]:bg-background">
                Equal Employment
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs md:text-sm data-[state=active]:bg-background">
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Contact Tab */}
          <TabsContent value="contact" className="mt-0">
            {renderContactContent()}
          </TabsContent>

          <TabsContent value="resume" className="mt-0">
            {renderResumeContent()}
          </TabsContent>

          {/* Other tabs content stays the same */}
          <TabsContent value="jobPreferences" className="mt-0">
            <Card className="mb-6">
              <CardHeader className="p-6">
                <CardTitle>Job Preferences</CardTitle>
                <CardDescription>Set your job preferences to find the perfect match</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                {/* Profile Strength */}
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Profile Strength</h3>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <div className="mt-3 text-sm text-muted-foreground">
                    Complete your profile to increase your chances of finding the perfect job
                  </div>
                </div>
                
                {/* Role & Experience Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <UserRound className="mr-2 h-5 w-5 text-blue-500" />
                      Role & Experience
                    </h3>
                    <Button variant="ghost" size="sm">
                      <PenLine className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Desired Roles</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {jobPreferences.roles.map((role, index) => (
                            <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                              {role}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Experience Level</p>
                        <p className="mt-2 capitalize">{jobPreferences.experienceLevel}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Industries & Companies Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <Building2 className="mr-2 h-5 w-5 text-blue-500" />
                      Industries & Companies
                    </h3>
                    <Button variant="ghost" size="sm">
                      <PenLine className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Industries</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {jobPreferences.industries.map((industry, index) => (
                            <div key={index} className="bg-secondary px-3 py-1 rounded-full text-sm">
                              {industry}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Company Size</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {jobPreferences.companySize.map((size, index) => (
                            <div key={index} className="bg-secondary px-3 py-1 rounded-full text-sm">
                              {size}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Compensation Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <DollarSign className="mr-2 h-5 w-5 text-blue-500" />
                      Compensation
                    </h3>
                    <Button variant="ghost" size="sm">
                      <PenLine className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Salary Expectation</p>
                        <p className="mt-2">{jobPreferences.salary.currency} {jobPreferences.salary.min.toLocaleString()} - {jobPreferences.salary.max.toLocaleString()} per {jobPreferences.salary.period}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Benefits</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {jobPreferences.benefits.map((benefit, index) => (
                            <div key={index} className="bg-secondary px-3 py-1 rounded-full text-sm">
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Location & Work Model Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <LocationIcon className="mr-2 h-5 w-5 text-blue-500" />
                      Location & Work Model
                    </h3>
                    <Button variant="ghost" size="sm">
                      <PenLine className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Preferred Locations</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {jobPreferences.preferredLocations.map((loc, index) => (
                            <div key={index} className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                              {loc}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Work Model</p>
                        <p className="mt-2 capitalize">{jobPreferences.remotePreference}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Job Types Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-blue-500" />
                      Job Types
                    </h3>
                    <Button variant="ghost" size="sm">
                      <PenLine className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <div className="flex flex-wrap gap-2">
                      {jobPreferences.jobTypes.map((type, index) => (
                        <div key={index} className="bg-secondary px-3 py-1 rounded-full text-sm">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Skills & Qualifications Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-blue-500" />
                      Skills & Qualifications
                    </h3>
                    <Button variant="ghost" size="sm">
                      <PenLine className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Skills</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {jobPreferences.skills.map((skill, index) => (
                            <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Work Authorization Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium flex items-center">
                      <Users className="mr-2 h-5 w-5 text-blue-500" />
                      Work Authorization
                    </h3>
                    <Button variant="ghost" size="sm">
                      <PenLine className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Authorized to work in</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {jobPreferences.workAuthorization.countries.map((country, index) => (
                            <div key={index} className="bg-secondary px-3 py-1 rounded-full text-sm">
                              {country}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Need sponsorship for work authorization</p>
                        <p className="mt-2">{jobPreferences.workAuthorization.needSponsorship ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600">Update Job Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equalEmployment" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-6">
                <CardTitle>Equal Employment</CardTitle>
                <Button variant="outline">
                  <PenLine className="h-4 w-4 mr-2" />
                  Edit Data
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Ethnicity</h3>
                  <div className="inline-block bg-secondary px-3 py-1 rounded-md text-sm">
                    {equalEmploymentData.ethnicity}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Work Authorization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <p>Authorized to work in the US</p>
                      <Button 
                        variant={equalEmploymentData.workAuthUS ? "default" : "outline"}
                        size="sm"
                        className={equalEmploymentData.workAuthUS ? "bg-blue-500 hover:bg-blue-600" : ""}
                      >
                        {equalEmploymentData.workAuthUS ? "Yes" : "No"}
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <p>Authorized to work in Canada</p>
                      <Button 
                        variant={equalEmploymentData.workAuthCanada ? "default" : "outline"}
                        size="sm"
                        className={equalEmploymentData.workAuthCanada ? "bg-blue-500 hover:bg-blue-600" : ""}
                      >
                        {equalEmploymentData.workAuthCanada ? "Yes" : "No"}
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <p>Authorized to work in the UK</p>
                      <Button 
                        variant={equalEmploymentData.workAuthUK ? "default" : "outline"}
                        size="sm"
                        className={equalEmploymentData.workAuthUK ? "bg-blue-500 hover:bg-blue-600" : ""}
                      >
                        {equalEmploymentData.workAuthUK ? "Yes" : "No"}
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <p>Need sponsorship for work authorization</p>
                      <Button 
                        variant={equalEmploymentData.needsSponsorship ? "default" : "outline"}
                        size="sm"
                        className={equalEmploymentData.needsSponsorship ? "bg-blue-500 hover:bg-blue-600" : ""}
                      >
                        {equalEmploymentData.needsSponsorship ? "Yes" : "No"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Demographic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <p>Gender</p>
                      <div className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-full"
                        >
                          {equalEmploymentData.gender}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p>LGBTQ+</p>
                      <div className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-full"
                        >
                          {equalEmploymentData.lgbtq}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p>Person with a disability</p>
                      <div className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-full"
                        >
                          {equalEmploymentData.disability}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p>Veteran status</p>
                      <div className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="rounded-full"
                        >
                          {equalEmploymentData.veteran}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-md mt-4 flex items-start gap-3">
                  <div className="text-muted-foreground mt-1">ⓘ</div>
                  <div className="text-sm text-muted-foreground">
                    Equal Employment Opportunity (EEO) information is collected for statistical purposes only. This information will be kept separate from your 
                    application and will not be used in the hiring decision.
                    <br /><br />
                    Providing this information is voluntary and declining to provide it will not subject you to any adverse treatment.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <Card className="mb-6">
              <CardHeader className="p-6">
                <CardTitle>Email Preferences</CardTitle>
                <CardDescription>Manage the emails you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Job Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about new jobs matching your preferences</p>
                  </div>
                  <Switch 
                    checked={settings.emailPreferences.jobAlerts} 
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings, 
                        emailPreferences: {
                          ...settings.emailPreferences,
                          jobAlerts: checked
                        }
                      })
                    }
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Newsletters</p>
                    <p className="text-sm text-muted-foreground">Receive our weekly newsletter with career tips</p>
                  </div>
                  <Switch 
                    checked={settings.emailPreferences.newsletters} 
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings, 
                        emailPreferences: {
                          ...settings.emailPreferences,
                          newsletters: checked
                        }
                      })
                    }
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Account Updates</p>
                    <p className="text-sm text-muted-foreground">Get important updates about your account</p>
                  </div>
                  <Switch 
                    checked={settings.emailPreferences.accountUpdates} 
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings, 
                        emailPreferences: {
                          ...settings.emailPreferences,
                          accountUpdates: checked
                        }
                      })
                    }
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="p-6">
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <input 
                    type="password" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Enter your new password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Confirm your new password"
                  />
                </div>
                <Button className="bg-cyan-500 hover:bg-cyan-600 w-full mt-2">Update Password</Button>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="p-6">
                <CardTitle>Change Email</CardTitle>
                <CardDescription>Update your email address</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Email</label>
                  <input 
                    type="email" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={email}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Email</label>
                  <input 
                    type="email" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Enter your new email address"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <input 
                    type="password" 
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Enter your password to confirm"
                  />
                </div>
                <Button className="bg-cyan-500 hover:bg-cyan-600 w-full mt-2">Update Email</Button>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="p-6">
                <CardTitle>Skills</CardTitle>
                <CardDescription>Add or remove skills from your profile</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  {settings.skills.map((skill, index) => (
                    <div key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {skill}
                      <button 
                        className="text-primary hover:text-primary/80"
                        onClick={() => {
                          const newSkills = [...settings.skills];
                          newSkills.splice(index, 1);
                          setSettings({...settings, skills: newSkills});
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Add a new skill"
                    id="newSkill"
                  />
                  <Button 
                    className="bg-cyan-500 hover:bg-cyan-600"
                    onClick={() => {
                      const input = document.getElementById('newSkill') as HTMLInputElement;
                      if (input.value.trim()) {
                        setSettings({
                          ...settings, 
                          skills: [...settings.skills, input.value.trim()]
                        });
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-6">
                <CardTitle>Languages</CardTitle>
                <CardDescription>Add or remove languages you speak</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  {settings.languages.map((language, index) => (
                    <div key={index} className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      {language}
                      <button 
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          const newLanguages = [...settings.languages];
                          newLanguages.splice(index, 1);
                          setSettings({...settings, languages: newLanguages});
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Add a new language"
                    id="newLanguage"
                  />
                  <Button 
                    className="bg-cyan-500 hover:bg-cyan-600"
                    onClick={() => {
                      const input = document.getElementById('newLanguage') as HTMLInputElement;
                      if (input.value.trim()) {
                        setSettings({
                          ...settings, 
                          languages: [...settings.languages, input.value.trim()]
                        });
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ProfilePage;
