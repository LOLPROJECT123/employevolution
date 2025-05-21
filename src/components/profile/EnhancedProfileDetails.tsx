
import React, { useState } from "react";
import { parseResume } from "@/utils/resumeParser";
import { ParsedResume } from "@/types/resume";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const COMPANY_SIZES = [
  { value: "startup", label: "Startup (1-10 employees)" },
  { value: "small", label: "Small (11-50 employees)" },
  { value: "medium", label: "Medium (51-200 employees)" },
  { value: "large", label: "Large (201-1000 employees)" },
  { value: "enterprise", label: "Enterprise (1000+ employees)" }
];

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
  "Retail", "Media", "Government", "Non-profit", "Consulting"
];

const COMMON_ROLES = [
  "Software Engineer", "Product Manager", "Data Scientist", "UX Designer",
  "Frontend Developer", "Backend Developer", "Full Stack Developer", 
  "DevOps Engineer", "QA Engineer", "Project Manager", "Business Analyst"
];

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "Vue", "Angular", "Node.js", "Python", 
  "Java", "C#", "C++", "SQL", "NoSQL", "Git", "Docker", "AWS", "Azure", 
  "GCP", "CI/CD", "Agile", "Scrum"
];

const COMMON_LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", 
  "Russian", "Arabic", "Hindi", "Portuguese", "Italian", "Korean"
];

const COMMON_BENEFITS = [
  "Health Insurance", "Dental Insurance", "Vision Insurance", "401k",
  "Remote Work", "Flexible Hours", "Unlimited PTO", "Stock Options",
  "Education Stipend", "Gym Membership", "Relocation Assistance"
];

const LOCATIONS = [
  "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA",
  "Chicago, IL", "Los Angeles, CA", "Denver, CO", "Atlanta, GA", "Remote"
];

const WORK_AUTH_OPTIONS = [
  "U.S. Citizen", "Green Card Holder", "H-1B Visa", "TN Visa", "F-1 Visa/OPT", "E-3 Visa"
];

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  location: z.string().optional(),
  preferredLocations: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  workAuthorization: z.string().optional(),
  desiredRoles: z.array(z.string()).optional(),
  preferredIndustries: z.array(z.string()).optional(),
  preferredCompanySize: z.string().optional(),
  desiredBenefits: z.array(z.string()).optional()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const EnhancedProfileDetails = () => {
  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [parsing, setParsing] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [desiredRoles, setDesiredRoles] = useState<string[]>([]);
  const [newRole, setNewRole] = useState("");
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
    }
  });

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setParsing(true);
    const parsed = await parseResume(file, true); // Enable toast notification
    setResume(parsed);
    
    // Extract name into first and last name
    const nameParts = parsed.personalInfo.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    
    // Fill the form with parsed data
    form.setValue("firstName", firstName);
    form.setValue("lastName", lastName);
    form.setValue("email", parsed.personalInfo.email);
    form.setValue("phone", parsed.personalInfo.phone);
    form.setValue("location", parsed.personalInfo.location);
    
    // Set skills and languages
    setSkills(parsed.skills || []);
    setLanguages(parsed.languages || []);
    
    setParsing(false);
    toast.success("Resume parsed successfully!");
  };

  const onSubmit = (data: ProfileFormValues) => {
    toast.success("Profile updated successfully!");
    console.log("Form submitted:", data);
  };

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addLanguage = () => {
    if (newLanguage && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (language: string) => {
    setLanguages(languages.filter(l => l !== language));
  };

  const addLocation = () => {
    if (newLocation && !preferredLocations.includes(newLocation)) {
      setPreferredLocations([...preferredLocations, newLocation]);
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setPreferredLocations(preferredLocations.filter(l => l !== location));
  };

  const addRole = () => {
    if (newRole && !desiredRoles.includes(newRole)) {
      setDesiredRoles([...desiredRoles, newRole]);
      setNewRole("");
    }
  };

  const removeRole = (role: string) => {
    setDesiredRoles(desiredRoles.filter(r => r !== role));
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">Enhanced Profile Details</h2>
      
      <div className="mb-8 p-4 border rounded-md bg-muted/30">
        <h3 className="text-lg font-medium mb-3">Resume Upload</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload your resume to automatically fill your profile details. We support PDF and TXT formats.
        </p>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".pdf,.txt,.docx"
            className="max-w-xs"
            onChange={handleResumeUpload}
            disabled={parsing}
          />
          {parsing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="animate-spin inline-block h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></span>
              Parsing your resume...
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First Name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone Number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, State" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workAuthorization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Authorization</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work authorization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WORK_AUTH_OPTIONS.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredCompanySize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Company Size</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMPANY_SIZES.map(size => (
                        <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          {/* Skills section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="skills">Skills</Label>
              <div className="flex gap-2 mt-2">
                <Select onValueChange={setNewSkill} value={newSkill}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select or type a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_SKILLS.map(skill => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addSkill}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="px-2 py-1">
                    {skill}
                    <button 
                      type="button" 
                      className="ml-2 text-xs"
                      onClick={() => removeSkill(skill)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Languages section */}
            <div>
              <Label htmlFor="languages">Languages</Label>
              <div className="flex gap-2 mt-2">
                <Select onValueChange={setNewLanguage} value={newLanguage}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select or type a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_LANGUAGES.map(language => (
                      <SelectItem key={language} value={language}>{language}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addLanguage}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {languages.map((language, i) => (
                  <Badge key={i} variant="secondary" className="px-2 py-1">
                    {language}
                    <button 
                      type="button" 
                      className="ml-2 text-xs"
                      onClick={() => removeLanguage(language)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <Label htmlFor="locations">Preferred Locations</Label>
              <div className="flex gap-2 mt-2">
                <Select onValueChange={setNewLocation} value={newLocation}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select or type a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addLocation}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {preferredLocations.map((location, i) => (
                  <Badge key={i} variant="secondary" className="px-2 py-1">
                    {location}
                    <button 
                      type="button" 
                      className="ml-2 text-xs"
                      onClick={() => removeLocation(location)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Desired Roles */}
            <div>
              <Label htmlFor="roles">Desired Roles</Label>
              <div className="flex gap-2 mt-2">
                <Select onValueChange={setNewRole} value={newRole}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select or type a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addRole}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {desiredRoles.map((role, i) => (
                  <Badge key={i} variant="secondary" className="px-2 py-1">
                    {role}
                    <button 
                      type="button" 
                      className="ml-2 text-xs"
                      onClick={() => removeRole(role)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Social Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input 
                  id="linkedin" 
                  placeholder="LinkedIn URL"
                  value={resume?.socialLinks?.linkedin || ""}
                  onChange={(e) => {
                    if (resume) {
                      setResume({
                        ...resume,
                        socialLinks: {...resume.socialLinks, linkedin: e.target.value}
                      });
                    }
                  }}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input 
                  id="github" 
                  placeholder="GitHub URL" 
                  value={resume?.socialLinks?.github || ""}
                  onChange={(e) => {
                    if (resume) {
                      setResume({
                        ...resume,
                        socialLinks: {...resume.socialLinks, github: e.target.value}
                      });
                    }
                  }}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="portfolio">Portfolio Website</Label>
                <Input 
                  id="portfolio" 
                  placeholder="Portfolio URL" 
                  value={resume?.socialLinks?.portfolio || ""}
                  onChange={(e) => {
                    if (resume) {
                      setResume({
                        ...resume,
                        socialLinks: {...resume.socialLinks, portfolio: e.target.value}
                      });
                    }
                  }}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="other">Other Website</Label>
                <Input 
                  id="other" 
                  placeholder="Other URL" 
                  value={resume?.socialLinks?.other || ""}
                  onChange={(e) => {
                    if (resume) {
                      setResume({
                        ...resume,
                        socialLinks: {...resume.socialLinks, other: e.target.value}
                      });
                    }
                  }}
                  className="mt-1"
                />
              </div>
            </div>

          </div>

          <div>
            <Button type="submit" className="mr-2">Save Profile</Button>
            <Button type="button" variant="outline">Cancel</Button>
          </div>
        </form>
      </Form>

      {resume && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Parsed Resume Details</h3>
          
          {/* Work Experience Section */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Work Experience</h4>
            <div className="space-y-4">
              {resume.workExperiences.map((exp, idx) => (
                <div key={idx} className="border rounded p-3 bg-muted/20">
                  <div className="flex justify-between">
                    <div className="font-medium">{exp.role}</div>
                    <div className="text-sm text-muted-foreground">{exp.startDate} - {exp.endDate}</div>
                  </div>
                  <div className="text-sm">{exp.company}, {exp.location}</div>
                  <ul className="list-disc ml-5 text-sm mt-2">
                    {exp.description.map((d, i) => (<li key={i}>{d}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          {/* Education Section */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Education</h4>
            <div className="space-y-3">
              {resume.education.map((edu, idx) => (
                <div key={idx} className="border rounded p-3 bg-muted/20">
                  <div className="font-medium">{edu.school}</div>
                  <div className="text-sm">{edu.degree}</div>
                  <div className="text-sm text-muted-foreground">{edu.startDate} - {edu.endDate}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Projects Section */}
          <div>
            <h4 className="font-medium mb-2">Projects</h4>
            <div className="space-y-3">
              {resume.projects.map((proj, idx) => (
                <div key={idx} className="border rounded p-3 bg-muted/20">
                  <div className="flex justify-between">
                    <div className="font-medium">{proj.name}</div>
                    <div className="text-sm text-muted-foreground">{proj.startDate} - {proj.endDate}</div>
                  </div>
                  <ul className="list-disc ml-5 text-sm mt-2">
                    {proj.description.map((d, i) => (<li key={i}>{d}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProfileDetails;
