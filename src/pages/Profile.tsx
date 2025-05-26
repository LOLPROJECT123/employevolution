import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Edit,
  Upload,
  Download,
  Plus,
  Settings as SettingsIcon,
  X
} from "lucide-react";
import EditProfileHeader from "@/components/profile/EditProfileHeader";
import EditContactInfo from "@/components/profile/EditContactInfo";
import EditWorkExperience from "@/components/profile/EditWorkExperience";
import EditEducation from "@/components/profile/EditEducation";
import EditSocialLinks from "@/components/profile/EditSocialLinks";
import EditJobPreferences from "@/components/profile/EditJobPreferences";
import EditEqualEmployment from "@/components/profile/EditEqualEmployment";

const Profile = () => {
  const isMobile = useMobile();
  const { user, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("contact");
  const [showProfileToRecruiters, setShowProfileToRecruiters] = useState(true);
  const [jobSearchStatus, setJobSearchStatus] = useState(true);
  const [profileCompletion] = useState(65);
  
  // Profile edit states
  const [showEditHeader, setShowEditHeader] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [showEditExperience, setShowEditExperience] = useState(false);
  const [showEditEducation, setShowEditEducation] = useState(false);
  const [showEditSocial, setShowEditSocial] = useState(false);
  const [showEditJobPrefs, setShowEditJobPrefs] = useState(false);
  const [showEditEqualEmployment, setShowEditEqualEmployment] = useState(false);

  // Sample data (in real app, this would come from user context)
  const [profileData, setProfileData] = useState({
    name: userProfile?.full_name || user?.email || "User",
    jobStatus: "Actively looking",
    email: user?.email || "",
    phone: "+1 (469) 551-9662",
    dateOfBirth: "06/19/2006",
    location: "Atlanta, GA, USA",
    workExperiences: [
      {
        id: 1,
        title: "Software Engineer Intern/ Co-Lead",
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
        title: "AI Fellowship",
        company: "Headstarter AI",
        location: "Remote",
        startDate: "Jul 2024",
        endDate: "Sep 2024",
        description: [
          "Personal Portfolio (HTML/CSS): Used to showcase individual talents, skills and experience",
          "Pantry Tracker (Next.js, Material UI, React, GCP, Vercel, CI/CD, and Firebase): Built inventory management system with next.js, react, and Firebase, enabling real-time tracking of 1000+ products across 5 warehouses, increasing efficiency by 30%"
        ]
      }
    ],
    education: [
      {
        id: 1,
        school: "Georgia Institute of Technology",
        degree: "Bachelor's, Computer Science",
        startDate: "Aug 2023",
        endDate: "May 2027"
      }
    ],
    projects: [
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
    ],
    socialLinks: {
      linkedin: "https://www.linkedin.com/in/varun-veluri-66986628a/",
      github: "",
      portfolio: "",
      other: ""
    },
    skills: ["React", "TypeScript", "JavaScript", "Node.js", "Python"],
    languages: ["English", "Spanish", "Hindi"]
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
              <p className="text-muted-foreground mb-6">
                Please log in to view your profile.
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Log In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Profile" />}
      
      <div className={`container mx-auto px-4 ${isMobile ? 'pt-4' : 'pt-20'} pb-12 max-w-4xl`}>
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xl">
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profileData.name}</h1>
                  <p className="text-muted-foreground">Job Search Status</p>
                  <Badge variant="default" className="mt-1">
                    {profileData.jobStatus}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowEditHeader(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">⚡ Show Profile to Recruiters</span>
                </div>
                <Switch
                  checked={showProfileToRecruiters}
                  onCheckedChange={setShowProfileToRecruiters}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm">Job Search Status</span>
                </div>
                <Switch
                  checked={jobSearchStatus}
                  onCheckedChange={setJobSearchStatus}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Profile Completion</span>
                  <span>{profileCompletion}%</span>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="preferences">Job Preferences</TabsTrigger>
            <TabsTrigger value="equal">Equal Employment</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowEditContact(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.dateOfBirth}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.location}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-6">
            {/* Resume Upload */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resume</CardTitle>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resume
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">Drag & drop your resume here</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF, DOC, DOCX formats
                  </p>
                  <Button variant="outline">Browse Files</Button>
                </div>
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Work Experience</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowEditExperience(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.workExperiences.map((exp) => (
                  <div key={exp.id} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{exp.title}</h4>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <p className="text-sm text-muted-foreground">{exp.location}</p>
                        <p className="text-sm text-muted-foreground">{exp.startDate} - {exp.endDate}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {exp.description.map((desc, index) => (
                        <li key={index}>{desc}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Education</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowEditEducation(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{edu.school}</h4>
                        <p className="text-sm text-muted-foreground">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.startDate} - {edu.endDate}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Projects</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">{project.startDate} - {project.endDate}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {project.description.map((desc, index) => (
                        <li key={index}>{desc}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Social Links</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowEditSocial(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm">in</span>
                  </div>
                  <div>
                    <p className="font-medium">LinkedIn URL</p>
                    <p className="text-sm text-blue-600">{profileData.socialLinks.linkedin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-white text-sm">gh</span>
                  </div>
                  <div>
                    <p className="font-medium">GitHub URL</p>
                    <p className="text-sm text-muted-foreground">Not provided</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Job Preferences</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowEditJobPrefs(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Profile Strength</span>
                    <span>{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete your profile to increase your chances of finding the perfect job
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Role & Experience</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Desired Roles</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Software Engineer</Badge>
                        <Badge variant="outline">Full Stack Developer</Badge>
                        <Badge variant="outline">Data Scientist</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Experience Level</p>
                      <Badge>Entry</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Industries & Companies</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Industries</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Technology</Badge>
                        <Badge variant="outline">Finance</Badge>
                        <Badge variant="outline">Healthcare</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Company Size</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Startup</Badge>
                        <Badge variant="outline">Mid-size</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Compensation</h3>
                  <div>
                    <p className="text-sm font-medium mb-2">Salary Expectation</p>
                    <p className="text-sm">USD 80,000 - 120,000 per yearly</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Health Insurance</Badge>
                      <Badge variant="outline">401k</Badge>
                      <Badge variant="outline">Remote Work</Badge>
                      <Badge variant="outline">Professional Development</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Location & Work Model</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Preferred Locations</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">New York, NY</Badge>
                        <Badge variant="outline">San Francisco, CA</Badge>
                        <Badge variant="outline">Remote</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Work Model</p>
                      <Badge>Hybrid</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Skills & Qualifications</h3>
                  <div>
                    <p className="text-sm font-medium mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="w-full">Update Job Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Equal Employment Tab */}
          <TabsContent value="equal" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Equal Employment</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowEditEqualEmployment(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Ethnicity</h3>
                  <p className="text-sm">Southeast Asian</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Work Authorization</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Authorized to work in the US</p>
                      <Badge variant="default">Yes</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Authorized to work in Canada</p>
                      <Badge variant="secondary">No</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium">Authorized to work in the UK</p>
                      <Badge variant="secondary">No</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Need sponsorship for work authorization</p>
                      <Badge variant="secondary">No</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Demographic Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium">Gender</p>
                      <div className="flex gap-2 mt-1">
                        <Badge>Male</Badge>
                        <Badge variant="outline">LGBTQ+</Badge>
                        <Badge variant="outline">Not specified</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Person with a disability</p>
                      <Badge variant="outline">Not specified</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Veteran status</p>
                      <Badge variant="outline">Not specified</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ Equal Employment Opportunity (EEO) information is collected for statistical purposes only. 
                    This information will be kept separate from your application and will not be used in the hiring decision.
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    Providing this information is voluntary and declining to provide it will not subject you to any adverse treatment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Job Alerts</h4>
                    <p className="text-sm text-muted-foreground">Get notified about new jobs matching your preferences</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Newsletters</h4>
                    <p className="text-sm text-muted-foreground">Receive our weekly newsletter with career tips</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Account Updates</h4>
                    <p className="text-sm text-muted-foreground">Get important updates about your account</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="current-password">
                    Current Password
                  </label>
                  <Input id="current-password" type="password" placeholder="Enter your current password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="new-password">
                    New Password
                  </label>
                  <Input id="new-password" type="password" placeholder="Enter your new password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="confirm-password">
                    Confirm New Password
                  </label>
                  <Input id="confirm-password" type="password" placeholder="Confirm your new password" />
                </div>
                <Button className="w-full">Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="current-email">
                    Current Email
                  </label>
                  <Input id="current-email" type="email" value={profileData.email} disabled />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="new-email">
                    New Email
                  </label>
                  <Input id="new-email" type="email" placeholder="Enter your new email address" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <Input id="password" type="password" placeholder="Enter your password to confirm" />
                </div>
                <Button className="w-full">Update Email</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Add or remove skills from your profile</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profileData.skills.map((skill, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {skill}
                      <button className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add a new skill" />
                  <Button>Add</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Add or remove languages you speak</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profileData.languages.map((language, index) => (
                    <Badge key={index} className="flex items-center gap-1">
                      {language}
                      <button className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Add a new language" />
                  <Button>Add</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-500">Delete Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Deleting your account will remove all your data from our system. This action cannot be undone.
                </p>
                <Button variant="destructive">Delete My Account</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialogs */}
      <EditProfileHeader
        open={showEditHeader}
        onClose={() => setShowEditHeader(false)}
        initialData={{
          name: profileData.name,
          jobStatus: profileData.jobStatus
        }}
        onSave={(data) => {
          setProfileData((prev) => ({...prev, name: data.name, jobStatus: data.jobStatus}));
          setShowEditHeader(false);
        }}
      />

      <EditContactInfo
        open={showEditContact}
        onClose={() => setShowEditContact(false)}
        initialData={{
          email: profileData.email,
          phone: profileData.phone,
          dateOfBirth: profileData.dateOfBirth,
          location: profileData.location
        }}
        onSave={(data) => {
          setProfileData((prev) => ({...prev, ...data}));
          setShowEditContact(false);
        }}
      />

      {/* Using existing components */}
      <EditEducation
        open={showEditEducation}
        onClose={() => setShowEditEducation(false)}
        onSave={(edu) => {
          setProfileData((prev) => {
            const existingIndex = prev.education.findIndex(e => e.id === edu.id);
            if (existingIndex >= 0) {
              const updatedEdu = [...prev.education];
              updatedEdu[existingIndex] = edu;
              return {...prev, education: updatedEdu};
            } else {
              return {...prev, education: [...prev.education, edu]};
            }
          });
          setShowEditEducation(false);
        }}
        onDelete={(id) => {
          setProfileData((prev) => ({
            ...prev,
            education: prev.education.filter(e => e.id !== id)
          }));
        }}
      />
    </div>
  );
};

export default Profile;
