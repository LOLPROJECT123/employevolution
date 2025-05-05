import React, { useState, useRef, ChangeEvent } from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChartBig,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Edit3,
  FileText,
  GraduationCap,
  Github,
  Globe,
  Link as LinkIcon,
  Linkedin,
  Mail,
  MapPin,
  PenLine,
  Phone,
  Plus,
  Settings,
  Upload,
  Users,
  Sparkles,
  Wrench,
  Briefcase,
  Zap,
  UserRound
} from 'lucide-react';

import { parseResume } from "@/utils/resumeParser";
import { ParsedResume } from "@/types/resume";

import EditProfileHeader from "@/components/profile/EditProfileHeader";
import EditContactInfo from "@/components/profile/EditContactInfo";
import EditWorkExperience from "@/components/profile/EditWorkExperience";
import EditEducation from "@/components/profile/EditEducation";
import EditProject from "@/components/profile/EditProject";
import EditSocialLinks from "@/components/profile/EditSocialLinks";
import EditJobPreferences from "@/components/profile/EditJobPreferences";
import EditEqualEmployment from "@/components/profile/EditEqualEmployment";

// Define the WorkExperience type to match what's expected
interface WorkExperience {
  id: number;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

// Define the Project type to match what's expected
interface Project {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description: string[];
}

const ProfilePage = () => {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState('contact');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileHeaderModalOpen, setProfileHeaderModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [workExperienceModalOpen, setWorkExperienceModalOpen] = useState(false);
  const [editingWorkExperience, setEditingWorkExperience] = useState<any>(null);
  const [educationModalOpen, setEducationModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<any>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [socialLinksModalOpen, setSocialLinksModalOpen] = useState(false);
  const [roleExperienceModalOpen, setRoleExperienceModalOpen] = useState(false);
  const [industriesModalOpen, setIndustriesModalOpen] = useState(false);
  const [compensationModalOpen, setCompensationModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [jobTypesModalOpen, setJobTypesModalOpen] = useState(false);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [workAuthModalOpen, setWorkAuthModalOpen] = useState(false);
  const [equalEmploymentModalOpen, setEqualEmploymentModalOpen] = useState(false);

  const [name, setName] = useState("Varun Veluri");
  const [jobStatus, setJobStatus] = useState("Actively looking");
  const [showToRecruiters, setShowToRecruiters] = useState(true);
  const [showJobSearchStatus, setShowJobSearchStatus] = useState(true);
  
  const [email, setEmail] = useState("vveluri6@gmail.com");
  const [phone, setPhone] = useState("+1 (469) 551-9662");
  const [dateOfBirth, setDateOfBirth] = useState("06/19/2006");
  const [location, setLocation] = useState("Atlanta, GA, USA");
  
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
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

  const [education, setEducation] = useState([
    {
      id: 1,
      school: "Georgia Institute of Technology",
      degree: "Bachelor's, Computer Science",
      startDate: "Aug 2023",
      endDate: "May 2027"
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
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

  const [socialLinks, setSocialLinks] = useState({
    linkedin: "https://www.linkedin.com/in/varun-veluri-6698a628a/",
    github: "",
    portfolio: "",
    other: ""
  });

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

  const [settings, setSettings] = useState({
    emailPreferences: {
      jobAlerts: true,
      newsletters: false,
      accountUpdates: true
    },
    skills: ["React", "TypeScript", "JavaScript", "Node.js", "Python"],
    languages: ["English", "Spanish", "Hindi"]
  });

  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(65);
  
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

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Parsing resume...");
      const parsedData: ParsedResume = await parseResume(file);
      
      if (parsedData.personalInfo.name) setName(parsedData.personalInfo.name);
      if (parsedData.personalInfo.email) setEmail(parsedData.personalInfo.email);
      if (parsedData.personalInfo.phone) setPhone(parsedData.personalInfo.phone);
      if (parsedData.personalInfo.location) setLocation(parsedData.personalInfo.location);
      
      if (parsedData.workExperiences.length > 0) {
        // Make sure all required fields are present and description is an array
        const formattedExperiences = parsedData.workExperiences.map((exp, i) => {
          // Ensure description is an array
          const descriptionArray = Array.isArray(exp.description) 
            ? exp.description 
            : exp.description ? [exp.description] : [];
          
          return {
            id: i + 1,
            role: exp.role || '',
            company: exp.company || '',
            location: exp.location || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            description: descriptionArray
          };
        });
        
        setWorkExperiences(formattedExperiences);
      }
      
      if (parsedData.education.length > 0) {
        setEducation(
          parsedData.education.map((edu, i) => ({ ...edu, id: i + 1 }))
        );
      }
      
      if (parsedData.projects.length > 0) {
        // Make sure all required fields are present and description is an array
        const formattedProjects = parsedData.projects.map((project, i) => {
          // Ensure description is an array
          const descriptionArray = Array.isArray(project.description) 
            ? project.description 
            : project.description ? [project.description] : [];
          
          return {
            id: i + 1,
            name: project.name || '',
            startDate: project.startDate || '',
            endDate: project.endDate || '',
            description: descriptionArray
          };
        });
        
        setProjects(formattedProjects);
      }
      
      if (parsedData.skills.length > 0) {
        setSettings({
          ...settings,
          skills: parsedData.skills
        });
      }
      
      if (parsedData.languages.length > 0) {
        setSettings({
          ...settings,
          languages: parsedData.languages
        });
      }
      
      if (parsedData.socialLinks.linkedin) {
        setSocialLinks({
          ...socialLinks,
          ...parsedData.socialLinks
        });
      }

      const newCompletionPercentage = calculateProfileCompletion();
      setProfileCompletionPercentage(newCompletionPercentage);
      
      toast.success("Resume parsed successfully!");
    } catch (error) {
      toast.error("Error parsing resume. Please try again or enter information manually.");
      console.error("Resume parsing error:", error);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const calculateProfileCompletion = () => {
    let score = 0;
    const totalFields = 10;
    
    if (name) score++;
    if (email) score++;
    if (phone) score++;
    if (location) score++;
    if (workExperiences.length > 0) score++;
    if (education.length > 0) score++;
    if (projects.length > 0) score++;
    if (settings.skills.length > 0) score++;
    if (settings.languages.length > 0) score++;
    if (socialLinks.linkedin || socialLinks.github || socialLinks.portfolio || socialLinks.other) score++;
    
    return Math.round((score / totalFields) * 100);
  };

  const handleUpdateProfileHeader = (data: { name: string; jobStatus: string }) => {
    setName(data.name);
    setJobStatus(data.jobStatus);
    toast.success("Profile updated successfully!");
  };

  const handleUpdateContactInfo = (data: { email: string; phone: string; dateOfBirth: string; location: string }) => {
    setEmail(data.email);
    setPhone(data.phone);
    setDateOfBirth(data.dateOfBirth);
    setLocation(data.location);
    toast.success("Contact information updated successfully!");
  };

  const handleAddWorkExperience = () => {
    setEditingWorkExperience(null);
    setWorkExperienceModalOpen(true);
  };

  const handleEditWorkExperience = (experience: any) => {
    setEditingWorkExperience(experience);
    setWorkExperienceModalOpen(true);
  };

  const handleSaveWorkExperience = (experience: any) => {
    if (editingWorkExperience) {
      setWorkExperiences(workExperiences.map(exp => 
        exp.id === experience.id ? experience : exp
      ));
      toast.success("Work experience updated!");
    } else {
      setWorkExperiences([...workExperiences, experience]);
      toast.success("Work experience added!");
    }
  };

  const handleDeleteWorkExperience = (id: number) => {
    setWorkExperiences(workExperiences.filter(exp => exp.id !== id));
    toast.success("Work experience deleted!");
  };

  const handleAddEducation = () => {
    setEditingEducation(null);
    setEducationModalOpen(true);
  };

  const handleEditEducation = (edu: any) => {
    setEditingEducation(edu);
    setEducationModalOpen(true);
  };

  const handleSaveEducation = (edu: any) => {
    if (editingEducation) {
      setEducation(education.map(item => 
        item.id === edu.id ? edu : item
      ));
      toast.success("Education updated!");
    } else {
      setEducation([...education, edu]);
      toast.success("Education added!");
    }
  };

  const handleDeleteEducation = (id: number) => {
    setEducation(education.filter(edu => edu.id !== id));
    toast.success("Education deleted!");
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleSaveProject = (project: any) => {
    if (editingProject) {
      setProjects(projects.map(item => 
        item.id === project.id ? project : item
      ));
      toast.success("Project updated!");
    } else {
      setProjects([...projects, project]);
      toast.success("Project added!");
    }
  };

  const handleDeleteProject = (id: number) => {
    setProjects(projects.filter(project => project.id !== id));
    toast.success("Project deleted!");
  };

  const handleUpdateSocialLinks = (data: any) => {
    setSocialLinks(data);
    toast.success("Social links updated!");
  };

  const handleUpdateJobPreferences = (data: any) => {
    setJobPreferences({
      ...jobPreferences,
      ...data
    });
    toast.success("Job preferences updated!");
  };

  const handleUpdateEqualEmployment = (data: any) => {
    setEqualEmploymentData(data);
    toast.success("Equal employment data updated!");
  };

  
  const renderProfileCard = () => (
    <Card className="mb-6 shadow-none border rounded-lg">
      <CardContent className="p-6">
        <div className={`flex ${isMobile ? 'flex-col' : 'items-start gap-6'}`}>
          <div className="relative mb-4">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-500">
              {name.split(' ').map(n => n[0]).join('')}
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setProfileHeaderModalOpen(true)}
              >
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
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setContactModalOpen(true)}
        >
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
        <Button variant="outline" onClick={() => handleBrowseFiles()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Resume
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
        />
      </div>

      <div 
        className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center mb-6 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => handleBrowseFiles()}
      >
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-center mb-1">Drag & drop your resume here</p>
        <p className="text-sm text-muted-foreground text-center mb-4">Supports PDF, DOC, DOCX formats</p>
        <Button variant="outline" size="sm">Browse Files</Button>
      </div>
      
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-bold">Work Experience</h2>
        <Button variant="outline" onClick={handleAddWorkExperience}>
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
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditWorkExperience(experience)}
                  >
                    <PenLine className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground font-medium">{experience.company}</p>
                <p className="text-muted-foreground text-sm">{experience.location || "Remote"}</p>
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
        <Button variant="outline" onClick={handleAddEducation}>
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
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditEducation(edu)}
                  >
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
        <Button variant="outline" onClick={handleAddProject}>
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
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditProject(project)}
                  >
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSocialLinksModalOpen(true)}
          >
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSocialLinksModalOpen(true)}
          >
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSocialLinksModalOpen(true)}
          >
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSocialLinksModalOpen(true)}
          >
            <PenLine className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader showLogo={true} />}
      
      <div className={`container mx-auto ${isMobile ? 'px-4 pt-16' : 'py-8 px-4'} max-w-5xl`}>
        {renderProfileCard()}
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="overflow-auto">
            {isMobile ? (
              <>
                <TabsList className="grid grid-cols-3 w-full mb-2">
                  <TabsTrigger value="contact" className="text-xs md:text-sm data-[state=active]:bg-background">
                    Contact
                  </TabsTrigger>
                  <TabsTrigger value="resume" className="text-xs md:text-sm data-[state=active]:bg-background">
                    Resume
                  </TabsTrigger>
                  <TabsTrigger value="jobPreferences" className="text-xs md:text-sm data-[state=active]:bg-background">
                    Job Preferences
                  </TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-2 w-full mb-6">
                  <TabsTrigger value="equalEmployment" className="text-xs md:text-sm data-[state=active]:bg-background">
                    Equal Employment
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs md:text-sm data-[state=active]:bg-background">
                    Settings
                  </TabsTrigger>
                </TabsList>
              </>
            ) : (
              <TabsList className="w-full bg-muted/50 rounded-none mb-6">
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
            )}
          </div>

          <TabsContent value="contact" className="mt-0">
            {renderContactContent()}
          </TabsContent>

          <TabsContent value="resume" className="mt-0">
            {renderResumeContent()}
          </TabsContent>

          <TabsContent value="jobPreferences" className="mt-0">
            <Card className="mb-6">
              <CardHeader className="p-6">
                <CardTitle>Job Preferences</CardTitle>
                <CardDescription>Set your job preferences to find the perfect match</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-6">
                <div className="bg-muted/30 rounded-lg p-4 mb-6">
