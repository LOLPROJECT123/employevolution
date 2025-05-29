import React, { useState, useEffect } from "react";
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
  Plus,
  X
} from "lucide-react";
import EditProfileHeader from "@/components/profile/EditProfileHeader";
import EditContactInfo from "@/components/profile/EditContactInfo";
import EditWorkExperience from "@/components/profile/EditWorkExperience";
import EditEducation from "@/components/profile/EditEducation";
import EditSocialLinks from "@/components/profile/EditSocialLinks";
import EditJobPreferences from "@/components/profile/EditJobPreferences";
import EditEqualEmployment from "@/components/profile/EditEqualEmployment";
import DocumentManager from "@/components/documents/DocumentManager";
import ProfileDetails from "@/components/profile/ProfileDetails";
import { profileService } from "@/services/profileService";
import { ParsedResume } from "@/types/resume";
import { toast } from "sonner";

const Profile = () => {
  const isMobile = useMobile();
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("contact");
  const [showProfileToRecruiters, setShowProfileToRecruiters] = useState(true);
  const [jobSearchStatus, setJobSearchStatus] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Profile edit states
  const [showEditHeader, setShowEditHeader] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [showEditExperience, setShowEditExperience] = useState(false);
  const [showEditEducation, setShowEditEducation] = useState(false);
  const [showEditSocial, setShowEditSocial] = useState(false);
  const [showEditJobPrefs, setShowEditJobPrefs] = useState(false);
  const [showEditEqualEmployment, setShowEditEqualEmployment] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: "",
    jobStatus: "Actively looking",
    email: "",
    phone: "",
    dateOfBirth: "",
    location: "",
    workExperiences: [],
    education: [],
    projects: [],
    activities: [],
    socialLinks: {
      linkedin: "",
      github: "",
      portfolio: "",
      other: ""
    },
    skills: [],
    languages: [],
    jobPreferences: {
      desiredRoles: [],
      experienceLevel: "",
      industries: [],
      companySize: [],
      salaryExpectation: "",
      benefits: [],
      preferredLocations: [],
      workModel: ""
    }
  });

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userData = await profileService.loadUserData(user.id);
      
      setProfileData(prev => ({
        ...prev,
        name: userData.profile?.name || userProfile?.full_name || "",
        email: user.email || "",
        phone: userData.profile?.phone || "",
        location: userData.profile?.location || "",
        jobStatus: userData.profile?.job_status || "Actively looking",
        workExperiences: userData.workExperiences || [],
        education: userData.education || [],
        projects: userData.projects || [],
        activities: userData.activities || [],
        skills: userData.skills || [],
        languages: userData.languages || [],
        socialLinks: {
          linkedin: userData.profile?.linkedin_url || "",
          github: userData.profile?.github_url || "",
          portfolio: userData.profile?.portfolio_url || "",
          other: userData.profile?.other_url || ""
        }
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion percentage
  useEffect(() => {
    const calculateCompletion = () => {
      let completedFields = 0;
      const totalFields = 12;

      if (profileData.name) completedFields++;
      if (profileData.email) completedFields++;
      if (profileData.phone) completedFields++;
      if (profileData.location) completedFields++;
      if (profileData.workExperiences.length > 0) completedFields++;
      if (profileData.education.length > 0) completedFields++;
      if (profileData.projects.length > 0) completedFields++;
      if (profileData.socialLinks.linkedin) completedFields++;
      if (profileData.skills.length > 0) completedFields++;
      if (profileData.languages.length > 0) completedFields++;
      if (profileData.jobPreferences.desiredRoles.length > 0) completedFields++;
      if (profileData.jobPreferences.workModel) completedFields++;

      const completion = Math.round((completedFields / totalFields) * 100);
      setProfileCompletion(completion);
    };

    calculateCompletion();
  }, [profileData]);

  // Handle resume data update and save to database
  const handleResumeDataUpdate = async (resumeData: ParsedResume) => {
    if (!user) return;

    try {
      // Save to database
      await profileService.saveResumeData(user.id, resumeData);
      
      // Update local state
      const updatedProfile = {
        ...profileData,
        name: resumeData.personalInfo?.name || profileData.name,
        phone: resumeData.personalInfo?.phone || profileData.phone,
        location: resumeData.personalInfo?.location || profileData.location,
        workExperiences: resumeData.workExperiences || [],
        education: resumeData.education || [],
        projects: resumeData.projects || [],
        socialLinks: {
          linkedin: resumeData.socialLinks?.linkedin || profileData.socialLinks.linkedin,
          github: resumeData.socialLinks?.github || profileData.socialLinks.github,
          portfolio: resumeData.socialLinks?.portfolio || profileData.socialLinks.portfolio,
          other: resumeData.socialLinks?.other || profileData.socialLinks.other
        },
        skills: resumeData.skills || [],
        languages: resumeData.languages || []
      };
      
      setProfileData(updatedProfile);
      toast.success("Resume data saved to your profile!");
    } catch (error) {
      console.error('Error saving resume data:', error);
      toast.error("Failed to save resume data");
    }
  };

  // Add/remove skills
  const [newSkill, setNewSkill] = useState("");
  
  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      const updatedSkills = [...profileData.skills, newSkill.trim()];
      const updatedProfile = { ...profileData, skills: updatedSkills };
      setProfileData(updatedProfile);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    const updatedSkills = profileData.skills.filter(skill => skill !== skillToRemove);
    const updatedProfile = { ...profileData, skills: updatedSkills };
    setProfileData(updatedProfile);
  };

  // Add/remove languages
  const [newLanguage, setNewLanguage] = useState("");
  
  const addLanguage = () => {
    if (newLanguage.trim() && !profileData.languages.includes(newLanguage.trim())) {
      const updatedLanguages = [...profileData.languages, newLanguage.trim()];
      const updatedProfile = { ...profileData, languages: updatedLanguages };
      setProfileData(updatedProfile);
      setNewLanguage("");
    }
  };

  const removeLanguage = (languageToRemove) => {
    const updatedLanguages = profileData.languages.filter(lang => lang !== languageToRemove);
    const updatedProfile = { ...profileData, languages: updatedLanguages };
    setProfileData(updatedProfile);
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-semibold text-xl border">
                  {profileData.name ? getInitials(profileData.name) : <User className="h-8 w-8" />}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profileData.name || "Complete your profile"}</h1>
                  <p className="text-muted-foreground">Job Search Status</p>
                  <Badge variant={profileData.jobStatus === "Actively looking" ? "default" : "secondary"} className="mt-1">
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
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
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
                  <span>{profileData.email || "No email provided"}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.phone || "No phone number provided"}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.dateOfBirth || "No date of birth provided"}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profileData.location || "No location provided"}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-6">
            {/* Resume Upload */}
            <ProfileDetails onResumeDataUpdate={handleResumeDataUpdate} />

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
                {profileData.workExperiences.length > 0 ? (
                  profileData.workExperiences.map((exp, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{exp.role || exp.title}</h4>
                          <p className="font-medium">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">{exp.location}</p>
                          <p className="text-sm text-muted-foreground">{exp.startDate} - {exp.endDate}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      {exp.description && (
                        <ul className="list-disc list-inside text-sm space-y-1 mt-3">
                          {Array.isArray(exp.description) ? 
                            exp.description.map((desc, i) => <li key={i}>{desc}</li>) :
                            <li>{exp.description}</li>
                          }
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No work experience added yet</p>
                    <p className="text-sm">Upload a resume or add manually</p>
                  </div>
                )}
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
                {profileData.education.length > 0 ? (
                  profileData.education.map((edu, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50 mb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{edu.school}</h4>
                          <p className="text-sm text-muted-foreground">{edu.degree}</p>
                          <p className="text-sm text-muted-foreground">{edu.startDate} - {edu.endDate}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No education added yet</p>
                    <p className="text-sm">Upload a resume or add manually</p>
                  </div>
                )}
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
                {profileData.projects.length > 0 ? (
                  profileData.projects.map((project, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.startDate} - {project.endDate}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      {project.description && (
                        <ul className="list-disc list-inside text-sm space-y-1 mt-3">
                          {Array.isArray(project.description) ? 
                            project.description.map((desc, i) => <li key={i}>{desc}</li>) :
                            <li>{project.description}</li>
                          }
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No projects added yet</p>
                    <p className="text-sm">Upload a resume or add manually</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activities and Leadership */}
            {profileData.activities && profileData.activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Activities & Leadership</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData.activities.map((activity, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{activity.organization}</h4>
                          <p className="font-medium">{activity.role}</p>
                          {activity.description && <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>}
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

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
                    <span className="text-white text-sm font-bold">in</span>
                  </div>
                  <div>
                    <p className="font-medium">LinkedIn URL</p>
                    <p className="text-sm text-blue-600">{profileData.socialLinks.linkedin || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">gh</span>
                  </div>
                  <div>
                    <p className="font-medium">GitHub URL</p>
                    <p className="text-sm text-muted-foreground">{profileData.socialLinks.github || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Add or remove your skills</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {profileData.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {skill}
                      <button 
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add a new skill" 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill}>Add</Button>
                </div>
              </CardContent>
            </Card>

            {/* Languages Section */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Add or remove languages you speak</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {profileData.languages.map((language, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {language}
                      <button 
                        onClick={() => removeLanguage(language)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add a new language" 
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                  />
                  <Button onClick={addLanguage}>Add</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <DocumentManager />
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
                        {profileData.jobPreferences.desiredRoles.length > 0 ? (
                          profileData.jobPreferences.desiredRoles.map((role, i) => (
                            <Badge key={i} variant="outline">{role}</Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No roles specified</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Experience Level</p>
                      <Badge>{profileData.jobPreferences.experienceLevel || "Not specified"}</Badge>
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
                  <p className="text-sm">Not specified</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Work Authorization</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Authorized to work in the US</p>
                      <Badge variant="secondary">Not specified</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Authorized to work in Canada</p>
                      <Badge variant="secondary">Not specified</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ Equal Employment Opportunity (EEO) information is collected for statistical purposes only. 
                    This information will be kept separate from your application and will not be used in the hiring decision.
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input type="password" placeholder="Current password" />
                <Input type="password" placeholder="New password" />
                <Input type="password" placeholder="Confirm new password" />
                <Button className="w-full">Update Password</Button>
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
          const updatedProfile = { ...profileData, name: data.name, jobStatus: data.jobStatus };
          setProfileData(updatedProfile);
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
          const updatedProfile = { ...profileData, ...data };
          setProfileData(updatedProfile);
          setShowEditContact(false);
        }}
      />

      <EditEducation
        open={showEditEducation}
        onClose={() => setShowEditEducation(false)}
        onSave={(edu) => {
          const updatedProfile = { ...profileData };
          const existingIndex = updatedProfile.education.findIndex(e => e.id === edu.id);
          if (existingIndex >= 0) {
            updatedProfile.education[existingIndex] = edu;
          } else {
            updatedProfile.education.push(edu);
          }
          setProfileData(updatedProfile);
          setShowEditEducation(false);
        }}
        onDelete={(id) => {
          const updatedProfile = {
            ...profileData,
            education: profileData.education.filter(e => e.id !== id)
          };
          setProfileData(updatedProfile);
        }}
      />
    </div>
  );
};

export default Profile;
