
import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  CalendarIcon, 
  Mail, 
  MapPin, 
  Pencil, 
  Phone, 
  LinkedinIcon, 
  GithubIcon, 
  Link2Icon,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages,
  Check,
  X,
  Plus,
  Upload,
  Trash2,
  FileText
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ContactInfo = {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  location: string;
};

type JobSearchStatus = "Actively looking" | "Open to offers" | "Not looking";

type WorkExperience = {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  isEditingThisItem?: boolean;
};

type Education = {
  id: string;
  school: string;
  degree: string;
  field: string; 
  startDate: string;
  endDate: string;
  isEditingThisItem?: boolean;
};

type Project = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  isEditingThisItem?: boolean;
};

type SocialLink = {
  type: "linkedin" | "github" | "portfolio" | "other";
  url: string;
  isEditingThisItem?: boolean;
};

const Profile = () => {
  const [jobSearchStatus, setJobSearchStatus] = useState<JobSearchStatus>("Actively looking");
  const [showProfile, setShowProfile] = useState(true);
  const [jobSearchEnabled, setJobSearchEnabled] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States for editing different sections
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  
  // State for work experience
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    {
      id: "1",
      title: "Software Engineer Intern/ Co-Lead",
      company: "DIRAC",
      location: "New York, NY, USA",
      startDate: "Oct 2024",
      endDate: "Dec 2024",
      description: "Creating a solution to simulate and calculate the optimal path for installing and removing the wire and the installation and removal of a flexible wire from an electrical cabinet\n\nUsing the A* algorithm, PythonOCC, Blender, FreeCAD, CAD, and an RL model to help take into account real-world constraints like collisions with other components and bending behavior of the flexible material and showing the output in animation\n\nThe future purpose is to use the script we developed in robots to help build the electrical aspects of houses"
    },
    {
      id: "2",
      title: "AI Fellowship",
      company: "Headstarter AI",
      location: "Remote",
      startDate: "Jul 2024",
      endDate: "Sep 2024",
      description: "Personal Portfolio (HTML/CSS): Used to showcase individual talents, skills and experience\n\nPantry Tracker (Next.js, Material UI, React, GCP, Vercel, CI/CD, and Firebase): Built inventory management system with next.js, react, and Firebase, enabling real-time tracking of 1000+ products across 5 warehouses, increasing efficiency by 30%"
    }
  ]);
  
  // State for education
  const [educations, setEducations] = useState<Education[]>([
    {
      id: "1",
      school: "Georgia Institute of Technology",
      degree: "Bachelor's",
      field: "Computer Science",
      startDate: "Aug 2023",
      endDate: "May 2027",
    }
  ]);
  
  // State for projects
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "AI Malware and Virus Reader For Emails",
      startDate: "May 2024",
      endDate: "May 2024",
      description: "Serves as a tool to ensure your emails are not corrupting the user's device\n\nIt uses Python, a Gmail import tool, and an IMAP port to take emails and scan them for malware and viruses"
    },
    {
      id: "2",
      name: "Trading Algorithm",
      startDate: "Dec 2024",
      endDate: "Present",
      description: "Serves as a tool to help study trends of the stock markets and company and world issues and success and their impacts on stocks to make trading more predictable and help with better trade outcomes"
    }
  ]);
  
  // State for social links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    {
      type: "linkedin",
      url: "https://www.linkedin.com/in/varun-veluri-6698a628a/",
    },
    {
      type: "github",
      url: "",
    },
    {
      type: "portfolio",
      url: "",
    },
    {
      type: "other",
      url: "",
    }
  ]);
  
  // Contact information state
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: "Varun Veluri",
    email: "vveluri6@gmail.com",
    phone: "+1 (469) 551-9662",
    birthdate: "06/19/2006",
    location: "Atlanta, GA, USA"
  });
  
  // Form for editing profile
  const profileForm = useForm<{ name: string; status: JobSearchStatus }>({
    defaultValues: {
      name: contactInfo.name,
      status: jobSearchStatus
    }
  });
  
  // Form for editing contact
  const contactForm = useForm<ContactInfo>({
    defaultValues: contactInfo
  });
  
  // Handle saving profile changes
  const handleSaveProfile = (data: { name: string; status: JobSearchStatus }) => {
    setContactInfo(prev => ({ ...prev, name: data.name }));
    setJobSearchStatus(data.status);
    setIsEditingProfile(false);
    toast.success("Profile updated successfully");
  };
  
  // Handle saving contact changes
  const handleSaveContact = (data: ContactInfo) => {
    setContactInfo(data);
    setIsEditingContact(false);
    toast.success("Contact information updated successfully");
  };
  
  // Handle resume upload
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setResumeUploaded(true);
      toast.success("Resume uploaded successfully");
    }
  };
  
  // Handle adding a new work experience
  const handleAddWorkExperience = () => {
    const newWorkExperience: WorkExperience = {
      id: `work-${Date.now()}`,
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      isEditingThisItem: true
    };
    setWorkExperiences(prev => [...prev, newWorkExperience]);
  };
  
  // Handle editing a work experience
  const handleEditWorkExperience = (id: string, data: Partial<WorkExperience>) => {
    setWorkExperiences(prev => 
      prev.map(exp => 
        exp.id === id ? {...exp, ...data} : exp
      )
    );
  };
  
  // Handle saving work experience
  const handleSaveWorkExperience = (id: string) => {
    const experience = workExperiences.find(exp => exp.id === id);
    if (experience && experience.title && experience.company) {
      setWorkExperiences(prev => 
        prev.map(exp => 
          exp.id === id ? {...exp, isEditingThisItem: false} : exp
        )
      );
      toast.success("Work experience updated");
    } else {
      toast.error("Title and company are required");
    }
  };
  
  // Handle deleting a work experience
  const handleDeleteWorkExperience = (id: string) => {
    setWorkExperiences(prev => prev.filter(exp => exp.id !== id));
    toast.success("Work experience deleted");
  };
  
  // Handle adding a new education
  const handleAddEducation = () => {
    const newEducation: Education = {
      id: `edu-${Date.now()}`,
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      isEditingThisItem: true
    };
    setEducations(prev => [...prev, newEducation]);
  };
  
  // Handle editing an education
  const handleEditEducation = (id: string, data: Partial<Education>) => {
    setEducations(prev => 
      prev.map(edu => 
        edu.id === id ? {...edu, ...data} : edu
      )
    );
  };
  
  // Handle saving education
  const handleSaveEducation = (id: string) => {
    const education = educations.find(edu => edu.id === id);
    if (education && education.school && education.degree) {
      setEducations(prev => 
        prev.map(edu => 
          edu.id === id ? {...edu, isEditingThisItem: false} : edu
        )
      );
      toast.success("Education updated");
    } else {
      toast.error("School and degree are required");
    }
  };
  
  // Handle deleting an education
  const handleDeleteEducation = (id: string) => {
    setEducations(prev => prev.filter(edu => edu.id !== id));
    toast.success("Education deleted");
  };
  
  // Handle adding a new project
  const handleAddProject = () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: "",
      startDate: "",
      endDate: "",
      description: "",
      isEditingThisItem: true
    };
    setProjects(prev => [...prev, newProject]);
  };
  
  // Handle editing a project
  const handleEditProject = (id: string, data: Partial<Project>) => {
    setProjects(prev => 
      prev.map(proj => 
        proj.id === id ? {...proj, ...data} : proj
      )
    );
  };
  
  // Handle saving project
  const handleSaveProject = (id: string) => {
    const project = projects.find(proj => proj.id === id);
    if (project && project.name) {
      setProjects(prev => 
        prev.map(proj => 
          proj.id === id ? {...proj, isEditingThisItem: false} : proj
        )
      );
      toast.success("Project updated");
    } else {
      toast.error("Project name is required");
    }
  };
  
  // Handle deleting a project
  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(proj => proj.id !== id));
    toast.success("Project deleted");
  };
  
  // Handle editing social links
  const handleEditSocialLink = (type: SocialLink['type'], url: string) => {
    setSocialLinks(prev => 
      prev.map(link => 
        link.type === type ? {...link, url} : link
      )
    );
  };
  
  const handleSaveSocialLinks = () => {
    setSocialLinks(prev => 
      prev.map(link => ({...link, isEditingThisItem: false}))
    );
    toast.success("Social links updated");
  };
  
  // Function to format social link display
  const getSocialLinkIcon = (type: SocialLink['type']) => {
    switch (type) {
      case 'linkedin':
        return (
          <div className="bg-blue-600 rounded-full p-2">
            <LinkedinIcon className="h-5 w-5 text-white" />
          </div>
        );
      case 'github':
        return (
          <div className="bg-gray-900 rounded-full p-2">
            <GithubIcon className="h-5 w-5 text-white" />
          </div>
        );
      case 'portfolio':
        return (
          <div className="bg-pink-600 rounded-full p-2">
            <ExternalLink className="h-5 w-5 text-white" />
          </div>
        );
      case 'other':
        return (
          <div className="bg-blue-500 rounded-full p-2">
            <Link2Icon className="h-5 w-5 text-white" />
          </div>
        );
    }
  };
  
  const getSocialLinkTitle = (type: SocialLink['type']) => {
    switch (type) {
      case 'linkedin': return 'LinkedIn URL';
      case 'github': return 'GitHub URL';
      case 'portfolio': return 'Portfolio URL';
      case 'other': return 'Other URL';
    }
  };
  
  // Check if any social links are being edited
  const isEditingAnySocialLinks = socialLinks.some(link => link.isEditingThisItem);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24 bg-primary text-white text-4xl">
                  <AvatarFallback>{contactInfo.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  {isEditingProfile ? (
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(handleSaveProfile)} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-full space-y-2">
                            <FormField
                              control={profileForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Your name" {...field} className="text-xl font-bold" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <p className="text-muted-foreground">Job Search Status</p>
                            
                            <FormField
                              control={profileForm.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <select 
                                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                      disabled={!jobSearchEnabled}
                                      {...field}
                                    >
                                      <option value="Actively looking">Actively looking</option>
                                      <option value="Open to offers">Open to offers</option>
                                      <option value="Not looking">Not looking</option>
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsEditingProfile(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">{contactInfo.name}</h1>
                        <p className="text-muted-foreground mt-1">Job Search Status</p>
                        {jobSearchEnabled ? (
                          <Badge className="mt-1 bg-cyan-100 text-cyan-800 hover:bg-cyan-200">
                            {jobSearchStatus}
                          </Badge>
                        ) : (
                          <Badge className="mt-1 bg-gray-100 text-gray-800 hover:bg-gray-200">
                            Not Visible
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditingProfile(true)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        disabled={!jobSearchEnabled}
                      >
                        <span className="text-yellow-500">⚡</span>
                        Show Profile to Recruiters
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">?</span>
                      </Button>
                      <Switch
                        checked={showProfile && jobSearchEnabled}
                        onCheckedChange={setShowProfile}
                        disabled={!jobSearchEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <span className="text-gray-500">🔍</span>
                        Job Search Status
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">?</span>
                      </Button>
                      <Switch
                        checked={jobSearchEnabled}
                        onCheckedChange={(checked) => {
                          setJobSearchEnabled(checked);
                          if (!checked) setShowProfile(false);
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Get discovered by companies
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        Your current employer can't see you
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Profile Tabs */}
          <Tabs defaultValue="contact" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="preferences">Job Preferences</TabsTrigger>
              <TabsTrigger value="equal">Equal Employment</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            {/* Contact Tab */}
            <TabsContent value="contact">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Contact</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      if (isEditingContact) {
                        contactForm.reset(contactInfo);
                        setIsEditingContact(false);
                      } else {
                        contactForm.reset(contactInfo);
                        setIsEditingContact(true);
                      }
                    }}
                  >
                    {isEditingContact ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingContact ? (
                    <Form {...contactForm}>
                      <form onSubmit={contactForm.handleSubmit(handleSaveContact)} className="space-y-4">
                        <FormField
                          control={contactForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={contactForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground" />
                                Phone
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={contactForm.control}
                          name="birthdate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-3">
                                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                Date of Birth
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="MM/DD/YYYY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={contactForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                Location
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="City, State, Country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end">
                          <Button type="submit" className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <span>{contactInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span>{contactInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <span>{contactInfo.birthdate}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span>{contactInfo.location}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Resume Tab */}
            <TabsContent value="resume">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Resume</CardTitle>
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".pdf,.doc,.docx" 
                        onChange={handleResumeUpload} 
                      />
                      <Button 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Resume
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resumeUploaded ? (
                      <div className="flex items-start gap-4">
                        <div className="bg-cyan-100 rounded-md p-3">
                          <FileText className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{resumeFile?.name || "Varun_Veluri_resume"}</h3>
                          <p className="text-sm text-muted-foreground">
                            Uploaded: {new Date().toLocaleString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md">
                        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">Drag & drop your resume here</p>
                        <p className="text-xs text-muted-foreground mb-4">Supports PDF, DOC, DOCX formats</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Browse Files
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Work Experience */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Work Experience</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={handleAddWorkExperience}
                    >
                      <Plus className="h-4 w-4" />
                      Add Experience
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {workExperiences.map((experience, index) => (
                      <div key={experience.id}>
                        {index > 0 && <Separator className="my-6" />}
                        <div className="flex gap-4">
                          <div className="bg-cyan-100 rounded-md p-3 h-12 w-12 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-5 w-5 text-cyan-600" />
                          </div>
                          <div className="space-y-2 flex-1">
                            {experience.isEditingThisItem ? (
                              <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <Input 
                                    placeholder="Job Title" 
                                    value={experience.title}
                                    onChange={(e) => handleEditWorkExperience(experience.id, { title: e.target.value })}
                                  />
                                  <Input 
                                    placeholder="Company Name" 
                                    value={experience.company}
                                    onChange={(e) => handleEditWorkExperience(experience.id, { company: e.target.value })}
                                  />
                                </div>
                                <Input 
                                  placeholder="Location (City, State, Country)" 
                                  value={experience.location}
                                  onChange={(e) => handleEditWorkExperience(experience.id, { location: e.target.value })}
                                />
                                <div className="grid gap-4 md:grid-cols-2">
                                  <Input 
                                    placeholder="Start Date (e.g. Jan 2022)" 
                                    value={experience.startDate}
                                    onChange={(e) => handleEditWorkExperience(experience.id, { startDate: e.target.value })}
                                  />
                                  <Input 
                                    placeholder="End Date (e.g. Dec 2023 or Present)" 
                                    value={experience.endDate}
                                    onChange={(e) => handleEditWorkExperience(experience.id, { endDate: e.target.value })}
                                  />
                                </div>
                                <Textarea 
                                  placeholder="Description of your role and responsibilities" 
                                  value={experience.description}
                                  onChange={(e) => handleEditWorkExperience(experience.id, { description: e.target.value })}
                                  className="min-h-[100px]"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditWorkExperience(experience.id, { isEditingThisItem: false })}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteWorkExperience(experience.id)}
                                  >
                                    Delete
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleSaveWorkExperience(experience.id)}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold">{experience.title}</h3>
                                    <p className="text-sm">{experience.company} • {experience.location}</p>
                                    <p className="text-sm text-muted-foreground">{experience.startDate} - {experience.endDate}</p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => handleEditWorkExperience(experience.id, { isEditingThisItem: true })}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="whitespace-pre-line text-sm">
                                  {experience.description}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {workExperiences.length === 0 && (
                      <div className="text-center p-6">
                        <p className="text-muted-foreground">No work experience added yet.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={handleAddWorkExperience}
                        >
                          Add Your First Work Experience
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Education */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Education</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={handleAddEducation}
                    >
                      <Plus className="h-4 w-4" />
                      Add Education
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {educations.map((education, index) => (
                      <div key={education.id}>
                        {index > 0 && <Separator className="my-6" />}
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/lovable-uploads/8d78f162-7185-4058-b018-02e6724321d1.png" alt="Georgia Tech" />
                              <AvatarFallback>{education.school.split(' ').map(s => s[0]).join('').substring(0, 2)}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1">
                            {education.isEditingThisItem ? (
                              <div className="space-y-4">
                                <Input 
                                  placeholder="School Name" 
                                  value={education.school}
                                  onChange={(e) => handleEditEducation(education.id, { school: e.target.value })}
                                />
                                <div className="grid gap-4 md:grid-cols-2">
                                  <Select
                                    value={education.degree}
                                    onValueChange={(value) => handleEditEducation(education.id, { degree: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Degree Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Associate's">Associate's</SelectItem>
                                      <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                                      <SelectItem value="Master's">Master's</SelectItem>
                                      <SelectItem value="Doctorate">Doctorate</SelectItem>
                                      <SelectItem value="Certificate">Certificate</SelectItem>
                                      <SelectItem value="High School">High School</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input 
                                    placeholder="Field of Study" 
                                    value={education.field}
                                    onChange={(e) => handleEditEducation(education.id, { field: e.target.value })}
                                  />
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <Input 
                                    placeholder="Start Date (e.g. Sep 2022)" 
                                    value={education.startDate}
                                    onChange={(e) => handleEditEducation(education.id, { startDate: e.target.value })}
                                  />
                                  <Input 
                                    placeholder="End Date (e.g. May 2026 or Present)" 
                                    value={education.endDate}
                                    onChange={(e) => handleEditEducation(education.id, { endDate: e.target.value })}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditEducation(education.id, { isEditingThisItem: false })}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteEducation(education.id)}
                                  >
                                    Delete
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleSaveEducation(education.id)}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold">{education.school}</h3>
                                  <p className="text-sm">{education.degree}, {education.field}</p>
                                  <p className="text-sm text-muted-foreground">{education.startDate} - {education.endDate}</p>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleEditEducation(education.id, { isEditingThisItem: true })}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {educations.length === 0 && (
                      <div className="text-center p-6">
                        <p className="text-muted-foreground">No education added yet.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={handleAddEducation}
                        >
                          Add Your Education
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Projects */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Projects & Outside Experience</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={handleAddProject}
                    >
                      <Plus className="h-4 w-4" />
                      Add Project
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {projects.map((project, index) => (
                      <div key={project.id}>
                        {index > 0 && <Separator className="my-6" />}
                        <div className="flex gap-4">
                          <div className="bg-cyan-100 rounded-md p-3 h-12 w-12 flex items-center justify-center flex-shrink-0">
                            <Wrench className="h-5 w-5 text-cyan-600" />
                          </div>
                          <div className="space-y-2 flex-1">
                            {project.isEditingThisItem ? (
                              <div className="space-y-4">
                                <Input 
                                  placeholder="Project Name" 
                                  value={project.name}
                                  onChange={(e) => handleEditProject(project.id, { name: e.target.value })}
                                />
                                <div className="grid gap-4 md:grid-cols-2">
                                  <Input 
                                    placeholder="Start Date (e.g. Jan 2022)" 
                                    value={project.startDate}
                                    onChange={(e) => handleEditProject(project.id, { startDate: e.target.value })}
                                  />
                                  <Input 
                                    placeholder="End Date (e.g. Dec 2023 or Present)" 
                                    value={project.endDate}
                                    onChange={(e) => handleEditProject(project.id, { endDate: e.target.value })}
                                  />
                                </div>
                                <Textarea 
                                  placeholder="Description of your project" 
                                  value={project.description}
                                  onChange={(e) => handleEditProject(project.id, { description: e.target.value })}
                                  className="min-h-[100px]"
                                />
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditProject(project.id, { isEditingThisItem: false })}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteProject(project.id)}
                                  >
                                    Delete
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleSaveProject(project.id)}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold">{project.name}</h3>
                                    <p className="text-sm text-muted-foreground">{project.startDate} - {project.endDate}</p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={() => handleEditProject(project.id, { isEditingThisItem: true })}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="whitespace-pre-line text-sm">
                                  {project.description}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {projects.length === 0 && (
                      <div className="text-center p-6">
                        <p className="text-muted-foreground">No projects added yet.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={handleAddProject}
                        >
                          Add Your First Project
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Portfolio & Socials */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Portfolio & Socials</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (isEditingAnySocialLinks) {
                          setSocialLinks(prev => prev.map(link => ({...link, isEditingThisItem: false})));
                        } else {
                          setSocialLinks(prev => prev.map(link => ({...link, isEditingThisItem: true})));
                        }
                      }}
                    >
                      {isEditingAnySocialLinks ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {socialLinks.map((link) => (
                      <div key={link.type} className="flex items-center gap-3">
                        {getSocialLinkIcon(link.type)}
                        <div className="flex-1">
                          <p className="font-medium">{getSocialLinkTitle(link.type)}</p>
                          {link.isEditingThisItem ? (
                            <Input
                              value={link.url}
                              onChange={(e) => handleEditSocialLink(link.type, e.target.value)}
                              placeholder={`Enter your ${link.type} URL`}
                              className="mt-1"
                            />
                          ) : (
                            link.url ? (
                              <a href={link.url} className="text-sm text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                                {link.url}
                              </a>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">Not provided</p>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isEditingAnySocialLinks && (
                      <div className="flex justify-end mt-4">
                        <Button onClick={handleSaveSocialLinks}>
                          Save Links
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Skills */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Skills</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Python", "Java", "MATLAB", "HTML/CSS", "Blender",
                        "Adobe Premiere Pro", "Adobe Photoshop", "Animation",
                        "C/C++", "Firebase", "Excel/Numbers/Sheets", "Business Analytics",
                        "Adobe Illustrator", "Git", "Agile", "AngularJS",
                        "Arduino", "Assembly", "AutoCAD", "Bash", "CAD",
                        "Adobe Lightroom", "Adobe After Effects", "Adobe Creative Suite",
                        "Canva", "Communications", "Data Analysis", "Data Science",
                        "Data Structures & Algorithms", "Discrete Math", "Flask",
                        "JavaScript", "Jupyter", "Linux/Unix", "MySQL", "MongoDB",
                        "Microeconomics", "React.js", "Wireshark", "Next.js",
                        "Node.js", "NoSQL", "NumPy", "Oscilloscope", "Oracle",
                        "Power BI", "PowerShell", "PowerPoint/Keynote/Slides", "Pandas"
                      ].map((skill, index) => (
                        <Badge key={index} className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Languages */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Languages</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200">
                        Spanish
                      </Badge>
                      <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200">
                        Telugu
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Other tabs - placeholders */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Job Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Your job preferences settings will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="equal">
              <Card>
                <CardHeader>
                  <CardTitle>Equal Employment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Equal employment information will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Account settings will appear here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
