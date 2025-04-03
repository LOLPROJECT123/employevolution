import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { PenLine, Plus, X, Save, Briefcase, Bookmark, GraduationCap, Link as LinkIcon, MapPin, Building, FileText, Globe, AtSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useForm } from "react-hook-form";

// Define all the sections of the profile
type ProfileSection = 
  | "basic" 
  | "contact" 
  | "workExperience" 
  | "education" 
  | "projects" 
  | "social" 
  | "roleExperience" 
  | "jobPreferences" 
  | "skills" 
  | "workAuthorization" 
  | "demographics";

// Define the function to calculate profile completion
const calculateProfileCompletion = (profile: any): number => {
  // A more sophisticated function would check each field
  // For now, this is a simple placeholder
  return 65;
};

export function ProfileEditForm() {
  const [open, setOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<ProfileSection>("basic");
  const form = useForm();
  
  // Mock user profile data (would come from context or API in real app)
  const [profile, setProfile] = useState({
    name: "Varun Veluri",
    jobSearchStatus: true,
    showToRecruiters: true,
    avatarUrl: "",
    title: "Frontend Developer",
    location: "San Francisco, CA",
    email: "varun.veluri@example.com",
    phone: "(415) 555-1234",
    aboutMe: "Passionate developer with 5+ years of experience building web applications.",
    
    workExperience: [
      {
        id: "1",
        company: "Tech Solutions Inc.",
        title: "Senior Frontend Developer",
        location: "San Francisco, CA",
        startDate: "2021-01",
        endDate: "Present",
        current: true,
        description: "Led development of customer-facing web applications using React and TypeScript."
      },
      {
        id: "2",
        company: "Web Innovations",
        title: "Frontend Developer",
        location: "San Jose, CA",
        startDate: "2018-03",
        endDate: "2020-12",
        current: false,
        description: "Developed responsive web interfaces and collaborated with UX designers."
      }
    ],
    
    education: [
      {
        id: "1",
        school: "University of California, Berkeley",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: "2014-09",
        endDate: "2018-05",
        description: "Graduated with honors. Focus on web technologies and algorithms."
      }
    ],
    
    projects: [
      {
        id: "1",
        name: "E-commerce Platform",
        description: "Built a fully featured e-commerce platform with React, Node.js, and MongoDB.",
        url: "https://github.com/username/ecommerce"
      }
    ],
    
    socialLinks: {
      github: "https://github.com/username",
      linkedin: "https://linkedin.com/in/username",
      twitter: "",
      portfolio: "https://myportfolio.com"
    },
    
    skills: ["JavaScript", "React", "TypeScript", "Node.js", "HTML", "CSS", "GraphQL"],
    
    jobPreferences: {
      roles: ["Frontend Developer", "Full Stack Developer"],
      industries: ["Technology", "Finance", "Healthcare"],
      companies: ["Google", "Microsoft", "Amazon"],
      compensation: {
        minimum: 120000,
        preferred: 150000
      },
      location: "San Francisco, CA",
      workModel: "hybrid",
      jobTypes: ["full-time", "contract"],
      openToRelocation: true
    },
    
    workAuthorization: {
      authorized: true,
      requireSponsorship: false,
      status: "us-citizen"
    },
    
    demographics: {
      gender: "prefer-not-to-say",
      ethnicity: "prefer-not-to-say",
      veteranStatus: "not-a-veteran",
      disabilityStatus: "prefer-not-to-say"
    }
  });
  
  const profileCompletion = calculateProfileCompletion(profile);
  
  // Handler for form submission
  const handleSave = () => {
    // In a real app, you would send this to your backend
    console.log("Saving profile:", profile);
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    setOpen(false);
  };
  
  // Handler for adding new items (work experience, education, projects)
  const handleAddItem = (section: "workExperience" | "education" | "projects") => {
    let newItem;
    
    switch (section) {
      case "workExperience":
        newItem = {
          id: Date.now().toString(),
          company: "",
          title: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: ""
        };
        setProfile({
          ...profile,
          workExperience: [...profile.workExperience, newItem]
        });
        break;
        
      case "education":
        newItem = {
          id: Date.now().toString(),
          school: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          description: ""
        };
        setProfile({
          ...profile,
          education: [...profile.education, newItem]
        });
        break;
        
      case "projects":
        newItem = {
          id: Date.now().toString(),
          name: "",
          description: "",
          url: ""
        };
        setProfile({
          ...profile,
          projects: [...profile.projects, newItem]
        });
        break;
    }
  };
  
  // Handler for removing items
  const handleRemoveItem = (section: "workExperience" | "education" | "projects", id: string) => {
    setProfile({
      ...profile,
      [section]: profile[section].filter((item: any) => item.id !== id)
    });
  };
  
  // Handler for updating work experience
  const handleUpdateWorkExperience = (id: string, field: string, value: any) => {
    setProfile({
      ...profile,
      workExperience: profile.workExperience.map((exp: any) => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };
  
  // Handler for updating education
  const handleUpdateEducation = (id: string, field: string, value: any) => {
    setProfile({
      ...profile,
      education: profile.education.map((edu: any) => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };
  
  // Handler for updating projects
  const handleUpdateProject = (id: string, field: string, value: any) => {
    setProfile({
      ...profile,
      projects: profile.projects.map((proj: any) => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    });
  };
  
  // Handler for adding skills
  const handleAddSkill = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile({
        ...profile,
        skills: [...profile.skills, skill]
      });
    }
  };
  
  // Handler for removing skills
  const handleRemoveSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s: string) => s !== skill)
    });
  };
  
  // Handler for updating basic info
  const handleBasicInfoChange = (field: string, value: any) => {
    setProfile({
      ...profile,
      [field]: value
    });
  };
  
  // Handler for updating job preferences
  const handleJobPreferenceChange = (field: string, value: any) => {
    setProfile({
      ...profile,
      jobPreferences: {
        ...profile.jobPreferences,
        [field]: value
      }
    });
  };
  
  // Handler for updating social links
  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfile({
      ...profile,
      socialLinks: {
        ...profile.socialLinks,
        [platform]: value
      }
    });
  };
  
  // Handler for updating work authorization
  const handleWorkAuthChange = (field: string, value: any) => {
    setProfile({
      ...profile,
      workAuthorization: {
        ...profile.workAuthorization,
        [field]: value
      }
    });
  };
  
  // Handler for updating demographics
  const handleDemographicChange = (field: string, value: any) => {
    setProfile({
      ...profile,
      demographics: {
        ...profile.demographics,
        [field]: value
      }
    });
  };
  
  // Simple form for name and job search status
  const BasicInfoForm = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatarUrl} alt={profile.name} />
          <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input
                value={profile.name}
                onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                placeholder="Your full name"
              />
            </FormControl>
          </FormItem>
        </div>
      </div>
      
      <FormItem>
        <FormLabel>Job Title</FormLabel>
        <FormControl>
          <Input
            value={profile.title}
            onChange={(e) => handleBasicInfoChange('title', e.target.value)}
            placeholder="Your current or desired job title"
          />
        </FormControl>
      </FormItem>
      
      <FormItem>
        <FormLabel>About Me</FormLabel>
        <FormControl>
          <Textarea
            value={profile.aboutMe}
            onChange={(e) => handleBasicInfoChange('aboutMe', e.target.value)}
            placeholder="Tell recruiters about yourself"
            className="min-h-[120px]"
          />
        </FormControl>
        <FormDescription>
          A brief summary of your professional background and career goals.
        </FormDescription>
      </FormItem>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel>Job Search Status</FormLabel>
            <FormDescription>
              Are you actively looking for a job?
            </FormDescription>
          </div>
          <Switch
            checked={profile.jobSearchStatus}
            onCheckedChange={(checked) => handleBasicInfoChange('jobSearchStatus', checked)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <FormLabel>Show Profile to Recruiters</FormLabel>
            <FormDescription>
              Let recruiters discover your profile
            </FormDescription>
          </div>
          <Switch
            checked={profile.showToRecruiters}
            onCheckedChange={(checked) => handleBasicInfoChange('showToRecruiters', checked)}
          />
        </div>
      </div>
    </div>
  );
  
  // Contact information form
  const ContactInfoForm = () => (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Location</FormLabel>
        <FormControl>
          <div className="relative">
            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={profile.location}
              onChange={(e) => handleBasicInfoChange('location', e.target.value)}
              placeholder="City, State"
              className="pl-8"
            />
          </div>
        </FormControl>
      </FormItem>
      
      <FormItem>
        <FormLabel>Email Address</FormLabel>
        <FormControl>
          <div className="relative">
            <AtSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => handleBasicInfoChange('email', e.target.value)}
              placeholder="you@example.com"
              className="pl-8"
            />
          </div>
        </FormControl>
      </FormItem>
      
      <FormItem>
        <FormLabel>Phone Number</FormLabel>
        <FormControl>
          <Input
            type="tel"
            value={profile.phone}
            onChange={(e) => handleBasicInfoChange('phone', e.target.value)}
            placeholder="(123) 456-7890"
          />
        </FormControl>
      </FormItem>
    </div>
  );
  
  // Work experience form
  const WorkExperienceForm = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Work Experience</h3>
        <Button 
          onClick={() => handleAddItem('workExperience')} 
          size="sm" 
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Position
        </Button>
      </div>
      
      <Accordion
        type="multiple"
        defaultValue={profile.workExperience.map((exp: any) => exp.id)}
        className="space-y-4"
      >
        {profile.workExperience.map((experience: any) => (
          <AccordionItem key={experience.id} value={experience.id} className="border rounded-lg p-1">
            <div className="flex justify-between items-center">
              <AccordionTrigger className="hover:no-underline py-2">
                <div className="text-left">
                  <h4 className="font-medium">{experience.title || "New Position"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {experience.company || "Company"} {experience.location ? `• ${experience.location}` : ""}
                  </p>
                </div>
              </AccordionTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem('workExperience', experience.id);
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <AccordionContent className="pt-2">
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input
                      value={experience.title}
                      onChange={(e) => handleUpdateWorkExperience(experience.id, 'title', e.target.value)}
                      placeholder="e.g. Software Engineer"
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input
                      value={experience.company}
                      onChange={(e) => handleUpdateWorkExperience(experience.id, 'company', e.target.value)}
                      placeholder="e.g. Tech Company Inc."
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      value={experience.location}
                      onChange={(e) => handleUpdateWorkExperience(experience.id, 'location', e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </FormControl>
                </FormItem>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="month"
                        value={experience.startDate}
                        onChange={(e) => handleUpdateWorkExperience(experience.id, 'startDate', e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                  
                  <div>
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="month"
                          value={experience.endDate}
                          onChange={(e) => handleUpdateWorkExperience(experience.id, 'endDate', e.target.value)}
                          disabled={experience.current}
                        />
                      </FormControl>
                    </FormItem>
                    
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id={`current-${experience.id}`}
                        checked={experience.current}
                        onChange={(e) => handleUpdateWorkExperience(experience.id, 'current', e.target.checked)}
                        className="mr-2"
                      />
                      <Label htmlFor={`current-${experience.id}`} className="text-sm">
                        I currently work here
                      </Label>
                    </div>
                  </div>
                </div>
                
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      value={experience.description}
                      onChange={(e) => handleUpdateWorkExperience(experience.id, 'description', e.target.value)}
                      placeholder="Describe your responsibilities and achievements"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                </FormItem>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {profile.workExperience.length === 0 && (
        <div className="text-center py-8">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Work Experience Added</h3>
          <p className="text-muted-foreground mb-4">
            Add your professional experience to help recruiters understand your background.
          </p>
          <Button onClick={() => handleAddItem('workExperience')}>
            <Plus className="h-4 w-4 mr-2" /> Add Experience
          </Button>
        </div>
      )}
    </div>
  );
  
  // Education form
  const EducationForm = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Education</h3>
        <Button 
          onClick={() => handleAddItem('education')} 
          size="sm" 
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Education
        </Button>
      </div>
      
      <Accordion
        type="multiple"
        defaultValue={profile.education.map((edu: any) => edu.id)}
        className="space-y-4"
      >
        {profile.education.map((education: any) => (
          <AccordionItem key={education.id} value={education.id} className="border rounded-lg p-1">
            <div className="flex justify-between items-center">
              <AccordionTrigger className="hover:no-underline py-2">
                <div className="text-left">
                  <h4 className="font-medium">{education.school || "School/University"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {education.degree} {education.field ? `in ${education.field}` : ""}
                  </p>
                </div>
              </AccordionTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem('education', education.id);
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <AccordionContent className="pt-2">
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>School/University</FormLabel>
                  <FormControl>
                    <Input
                      value={education.school}
                      onChange={(e) => handleUpdateEducation(education.id, 'school', e.target.value)}
                      placeholder="e.g. Stanford University"
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem>
                  <FormLabel>Degree</FormLabel>
                  <FormControl>
                    <Input
                      value={education.degree}
                      onChange={(e) => handleUpdateEducation(education.id, 'degree', e.target.value)}
                      placeholder="e.g. Bachelor of Science"
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem>
                  <FormLabel>Field of Study</FormLabel>
                  <FormControl>
                    <Input
                      value={education.field}
                      onChange={(e) => handleUpdateEducation(education.id, 'field', e.target.value)}
                      placeholder="e.g. Computer Science"
                    />
                  </FormControl>
                </FormItem>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="month"
                        value={education.startDate}
                        onChange={(e) => handleUpdateEducation(education.id, 'startDate', e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                  
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="month"
                        value={education.endDate}
                        onChange={(e) => handleUpdateEducation(education.id, 'endDate', e.target.value)}
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      value={education.description}
                      onChange={(e) => handleUpdateEducation(education.id, 'description', e.target.value)}
                      placeholder="Additional details about your education"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                </FormItem>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {profile.education.length === 0 && (
        <div className="text-center py-8">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Education Added</h3>
          <p className="text-muted-foreground mb-4">
            Add your educational background to showcase your qualifications.
          </p>
          <Button onClick={() => handleAddItem('education')}>
            <Plus className="h-4 w-4 mr-2" /> Add Education
          </Button>
        </div>
      )}
    </div>
  );
  
  // Projects form
  const ProjectsForm = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Projects</h3>
        <Button 
          onClick={() => handleAddItem('projects')} 
          size="sm" 
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Project
        </Button>
      </div>
      
      <Accordion
        type="multiple"
        defaultValue={profile.projects.map((proj: any) => proj.id)}
        className="space-y-4"
      >
        {profile.projects.map((project: any) => (
          <AccordionItem key={project.id} value={project.id} className="border rounded-lg p-1">
            <div className="flex justify-between items-center">
              <AccordionTrigger className="hover:no-underline py-2">
                <h4 className="font-medium text-left">{project.name || "New Project"}</h4>
              </AccordionTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem('projects', project.id);
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <AccordionContent className="pt-2">
              <div className="space-y-4">
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      value={project.name}
                      onChange={(e) => handleUpdateProject(project.id, 'name', e.target.value)}
                      placeholder="e.g. Personal Portfolio Website"
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input
                      value={project.url}
                      onChange={(e) => handleUpdateProject(project.id, 'url', e.target.value)}
                      placeholder="e.g. https://github.com/username/project"
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      value={project.description}
                      onChange={(e) => handleUpdateProject(project.id, 'description', e.target.value)}
                      placeholder="Describe your project and your role"
                      className="min-h-[100px]"
                    />
                  </FormControl>
                </FormItem>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {profile.projects.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Projects Added</h3>
          <p className="text-muted-foreground mb-4">
            Add projects to showcase your skills and accomplishments.
          </p>
          <Button onClick={() => handleAddItem('projects')}>
            <Plus className="h-4 w-4 mr-2" /> Add Project
          </Button>
        </div>
      )}
    </div>
  );
  
  // Social links form
  const SocialLinksForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Social & Portfolio Links</h3>
      <p className="text-sm text-muted-foreground">
        Add your professional social media accounts and portfolio links.
      </p>
      
      <div className="space-y-4">
        <FormItem>
          <FormLabel>LinkedIn</FormLabel>
          <FormControl>
            <div className="relative">
              <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={profile.socialLinks.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/yourusername"
                className="pl-8"
              />
            </div>
          </FormControl>
        </FormItem>
        
        <FormItem>
          <FormLabel>GitHub</FormLabel>
          <FormControl>
            <div className="relative">
              <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={profile.socialLinks.github}
                onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                placeholder="https://github.com/yourusername"
                className="pl-8"
              />
            </div>
          </FormControl>
        </FormItem>
        
        <FormItem>
          <FormLabel>Portfolio Website</FormLabel>
          <FormControl>
            <div className="relative">
              <Globe className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={profile.socialLinks.portfolio}
                onChange={(e) => handleSocialLinkChange('portfolio', e.target.value)}
                placeholder="https://yourportfolio.com"
                className="pl-8"
              />
            </div>
          </FormControl>
        </FormItem>
        
        <FormItem>
          <FormLabel>Twitter</FormLabel>
          <FormControl>
            <div className="relative">
              <LinkIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={profile.socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourusername"
                className="pl-8"
              />
            </div>
          </FormControl>
        </FormItem>
      </div>
    </div>
  );
  
  // Skills form
  const SkillsForm = () => {
    const [newSkill, setNewSkill] = useState('');
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Skills & Qualifications</h3>
          <p className="text-sm text-muted-foreground">
            Add skills that showcase your expertise to recruiters and employers.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.skills.map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1.5">
                {skill}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill (e.g. JavaScript, Project Management)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSkill.trim()) {
                  e.preventDefault();
                  handleAddSkill(newSkill.trim());
                  setNewSkill('');
                }
              }}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={() => {
                if (newSkill.trim()) {
                  handleAddSkill(newSkill.trim());
                  setNewSkill('');
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Job preferences form 
  const JobPreferencesForm = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Job Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Set your preferences to find the right job opportunities.
          </p>
        </div>
        
        <div className="space-y-4">
          <FormItem>
            <FormLabel>Preferred Roles</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.jobPreferences.roles.map((role: string, index: number) => (
                <Badge key={index} variant="outline">{role}</Badge>
              ))}
            </div>
            <FormControl>
              <Input 
                placeholder="Add a role (e.g. Frontend Developer)" 
              />
            </FormControl>
          </FormItem>
          
          <FormItem>
            <FormLabel>Preferred Industries</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.jobPreferences.industries.map((industry: string, index: number) => (
                <Badge key={index} variant="outline">{industry}</Badge>
              ))}
            </div>
            <FormControl>
              <Input 
                placeholder="Add an industry (e.g. Technology, Finance)" 
              />
            </FormControl>
          </FormItem>
          
          <FormItem>
            <FormLabel>Target Companies</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.jobPreferences.companies.map((company: string, index: number) => (
                <Badge key={index} variant="outline">{company}</Badge>
              ))}
            </div>
            <FormControl>
              <Input 
                placeholder="Add a company (e.g. Google, Amazon)" 
              />
            </FormControl>
          </FormItem>
          
          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Minimum Compensation</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  value={profile.jobPreferences.compensation.minimum}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setProfile({
                      ...profile,
                      jobPreferences: {
                        ...profile.jobPreferences,
                        compensation: {
                          ...profile.jobPreferences.compensation,
                          minimum: isNaN(value) ? 0 : value
                        }
                      }
                    });
                  }}
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Preferred Compensation</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  value={profile.jobPreferences.compensation.preferred}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setProfile({
                      ...profile,
                      jobPreferences: {
                        ...profile.jobPreferences,
                        compensation: {
                          ...profile.jobPreferences.compensation,
                          preferred: isNaN(value) ? 0 : value
                        }
                      }
                    });
                  }}
                />
              </FormControl>
            </FormItem>
          </div>
          
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input 
                value={profile.jobPreferences.location}
                onChange={(e) => handleJobPreferenceChange('location', e.target.value)}
                placeholder="e.g. San Francisco, CA"
              />
            </FormControl>
          </FormItem>
          
          <FormItem>
            <FormLabel>Work Model</FormLabel>
            <Select 
              value={profile.jobPreferences.workModel}
              onValueChange={(value) => handleJobPreferenceChange('workModel', value)}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select work model" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
          
          <FormItem>
            <FormLabel>Job Types</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.jobPreferences.jobTypes.map((type: string, index: number) => (
                <Badge key={index} variant="outline">
                  {type === 'full-time' ? 'Full-time' : 
                   type === 'part-time' ? 'Part-time' : 
                   type === 'contract' ? 'Contract' : 
                   type === 'internship' ? 'Internship' : type}
                </Badge>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="job-type-full-time"
                  checked={profile.jobPreferences.jobTypes.includes('full-time')}
                  onChange={(e) => {
                    const newJobTypes = e.target.checked 
                      ? [...profile.jobPreferences.jobTypes, 'full-time'] 
                      : profile.jobPreferences.jobTypes.filter(t => t !== 'full-time');
                    handleJobPreferenceChange('jobTypes', newJobTypes);
                  }}
                />
                <Label htmlFor="job-type-full-time">Full-time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="job-type-part-time"
                  checked={profile.jobPreferences.jobTypes.includes('part-time')}
                  onChange={(e) => {
                    const newJobTypes = e.target.checked 
                      ? [...profile.jobPreferences.jobTypes, 'part-time'] 
                      : profile.jobPreferences.jobTypes.filter(t => t !== 'part-time');
                    handleJobPreferenceChange('jobTypes', newJobTypes);
                  }}
                />
                <Label htmlFor="job-type-part-time">Part-time</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="job-type-contract"
                  checked={profile.jobPreferences.jobTypes.includes('contract')}
                  onChange={(e) => {
                    const newJobTypes = e.target.checked 
                      ? [...profile.jobPreferences.jobTypes, 'contract'] 
                      : profile.jobPreferences.jobTypes.filter(t => t !== 'contract');
                    handleJobPreferenceChange('jobTypes', newJobTypes);
                  }}
                />
                <Label htmlFor="job-type-contract">Contract</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="job-type-internship"
                  checked={profile.jobPreferences.jobTypes.includes('internship')}
                  onChange={(e) => {
                    const newJobTypes = e.target.checked 
                      ? [...profile.jobPreferences.jobTypes, 'internship'] 
                      : profile.jobPreferences.jobTypes.filter(t => t !== 'internship');
                    handleJobPreferenceChange('jobTypes', newJobTypes);
                  }}
                />
                <Label htmlFor="job-type-internship">Internship</Label>
              </div>
            </div>
          </FormItem>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FormLabel>Open to Relocation</FormLabel>
              <FormDescription>
                Are you willing to relocate for the right opportunity?
              </FormDescription>
            </div>
            <Switch
              checked={profile.jobPreferences.openToRelocation}
              onCheckedChange={(checked) => handleJobPreferenceChange('openToRelocation', checked)}
            />
          </div>
        </div>
      </div>
    );
  };
  
  // Render the component
  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <PenLine className="h-4 w-4 mr-2" />
        Edit
      </Button>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Profile</SheetTitle>
            <SheetDescription>
              Update your profile information to help recruiters find you.
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-2 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Profile Completion</h3>
                  <Badge variant="outline">{profileCompletion}%</Badge>
                </div>
                <Progress value={profileCompletion} className="h-2" />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex overflow-x-auto pb-2 mb-4 snap-x">
              {["basic", "contact", "workExperience", "education", "projects", "social", "skills", "jobPreferences", "workAuthorization", "demographics"].map((section) => (
                <Button
                  key={section}
                  variant={activeSection === section ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveSection(section as ProfileSection)}
                  className="mr-2 whitespace-nowrap snap-start"
                >
                  {section === "basic" && "Basic Info"}
                  {section === "contact" && "Contact"}
                  {section === "workExperience" && "Work Experience"}
                  {section === "education" && "Education"}
                  {section === "projects" && "Projects"}
                  {section === "social" && "Social Links"}
                  {section === "skills" && "Skills"}
                  {section === "jobPreferences" && "Job Preferences"}
                  {section === "workAuthorization" && "Work Authorization"}
                  {section === "demographics" && "Demographics"}
                </Button>
              ))}
            </div>
            
            <div className="mt-2 overflow-y-auto max-h-[calc(100vh-250px)]">
              {activeSection === "basic" && <BasicInfoForm />}
              {activeSection === "contact" && <ContactInfoForm />}
              {activeSection === "workExperience" && <WorkExperienceForm />}
              {activeSection === "education" && <EducationForm />}
              {activeSection === "projects" && <ProjectsForm />}
              {activeSection === "social" && <SocialLinksForm />}
              {activeSection === "skills" && <SkillsForm />}
              {activeSection === "jobPreferences" && <JobPreferencesForm />}
              {activeSection === "workAuthorization" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Work Authorization</h3>
                  <FormItem>
                    <FormLabel>Work Authorization Status</FormLabel>
                    <Select 
                      value={profile.workAuthorization.status}
                      onValueChange={(value) => handleWorkAuthChange('status', value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="us-citizen">US Citizen</SelectItem>
                        <SelectItem value="permanent-resident">Permanent Resident (Green Card)</SelectItem>
                        <SelectItem value="h1b">H-1B Visa</SelectItem>
                        <SelectItem value="opt">OPT/EAD</SelectItem>
                        <SelectItem value="other">Other Visa</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Need Sponsorship</FormLabel>
                      <FormDescription>
                        Do you require visa sponsorship?
                      </FormDescription>
                    </div>
                    <Switch
                      checked={profile.workAuthorization.requireSponsorship}
                      onCheckedChange={(checked) => handleWorkAuthChange('requireSponsorship', checked)}
                    />
                  </div>
                </div>
              )}
              {activeSection === "demographics" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Demographics</h3>
                  <p className="text-sm text-muted-foreground">
                    This information is optional and used only for diversity and inclusion reporting.
                  </p>
                  
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select 
                      value={profile.demographics.gender}
                      onValueChange={(value) => handleDemographicChange('gender', value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                  
                  <FormItem>
                    <FormLabel>Ethnicity</FormLabel>
                    <Select 
                      value={profile.demographics.ethnicity}
                      onValueChange={(value) => handleDemographicChange('ethnicity', value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ethnicity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="asian">Asian</SelectItem>
                        <SelectItem value="black">Black or African American</SelectItem>
                        <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                        <SelectItem value="native-american">Native American</SelectItem>
                        <SelectItem value="pacific-islander">Pacific Islander</SelectItem>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="multiple">Two or More Races</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                  
                  <FormItem>
                    <FormLabel>Veteran Status</FormLabel>
                    <Select 
                      value={profile.demographics.veteranStatus}
                      onValueChange={(value) => handleDemographicChange('veteranStatus', value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select veteran status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="protected-veteran">Protected Veteran</SelectItem>
                        <SelectItem value="not-a-veteran">Not a Veteran</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                </div>
              )}
            </div>
          </div>
          
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
