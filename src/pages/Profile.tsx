
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Check, ChevronRightIcon, CircleUser, Mail, Phone, 
  FileText, Briefcase, Users, Settings 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const Profile = () => {
  const userProfile = {
    name: "Victoria Vance",
    email: "victoria.vance@example.com",
    phone: "+1 555-123-4567",
    avatarInitials: "VV",
    resumeUploaded: true,
    completionPercentage: 80,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <div className="w-full bg-background border-b py-4">
        <div className="container mx-auto flex items-center">
          <Link to="/" className="flex items-center space-x-2 font-bold text-2xl">
            <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline Logo" className="w-6 h-6" />
            <span>Streamline</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8 ml-16">
            <Link to="/" className="text-sm font-medium hover:text-primary">Home</Link>
            <Link to="/jobs" className="text-sm font-medium hover:text-primary">Jobs</Link>
            <Link to="/interview-practice" className="text-sm font-medium hover:text-primary">Interview Practice</Link>
            <Link to="/referrals" className="text-sm font-medium hover:text-primary">Referrals</Link>
            <Link to="/resume-tools" className="text-sm font-medium hover:text-primary">Resume/CV Tools</Link>
            <Link to="/leetcode-patterns" className="text-sm font-medium hover:text-primary">LeetCode Patterns</Link>
            <Link to="/salary-negotiations" className="text-sm font-medium hover:text-primary">Salary Negotiations</Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">{userProfile.avatarInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{userProfile.name}</h1>
              <div className="flex flex-col space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userProfile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userProfile.phone}</span>
                </div>
              </div>
              
              {/* Profile completion progress */}
              <div className="space-y-2 max-w-md">
                <div className="flex justify-between text-sm">
                  <span>Profile completion</span>
                  <span>{userProfile.completionPercentage}%</span>
                </div>
                <Progress value={userProfile.completionPercentage} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Complete your profile to increase visibility to employers
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for different sections */}
        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="preferences">Job Preferences</TabsTrigger>
            <TabsTrigger value="equal-employment">Equal Employment</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md" 
                      value={userProfile.name} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input 
                      type="email" 
                      className="w-full p-2 border rounded-md" 
                      value={userProfile.email} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md" 
                      value={userProfile.phone} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md" 
                      placeholder="City, State" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Resume & CV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-6 rounded-lg border border-dashed border-muted-foreground/50 text-center space-y-2">
                  {userProfile.resumeUploaded ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-6 w-6 text-primary" />
                      <span className="font-medium">Resume-Victoria-Vance.pdf</span>
                    </div>
                  ) : (
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                  )}
                  <div className="space-y-2">
                    <h3 className="font-medium">
                      {userProfile.resumeUploaded ? "Resume uploaded" : "Upload your resume"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {userProfile.resumeUploaded 
                        ? "Your resume is being used for job applications" 
                        : "Upload your resume to apply to jobs with a single click"
                      }
                    </p>
                  </div>
                  <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm">
                    {userProfile.resumeUploaded ? "Replace" : "Upload"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Job Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Job Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Job Title</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="border rounded-md p-3 bg-muted/50">
                      <p className="font-medium">Software Engineer</p>
                      <button className="text-sm text-muted-foreground mt-2">Edit</button>
                    </div>
                    <div className="border rounded-md p-3 bg-muted/50">
                      <p className="font-medium">Frontend Developer</p>
                      <button className="text-sm text-muted-foreground mt-2">Edit</button>
                    </div>
                    <div className="border rounded-md p-3 border-dashed flex items-center justify-center">
                      <button className="text-muted-foreground">+ Add job title</button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Job Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="full-time" className="h-4 w-4" checked />
                        <label htmlFor="full-time">Full-time</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="part-time" className="h-4 w-4" />
                        <label htmlFor="part-time">Part-time</label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="contract" className="h-4 w-4" checked />
                        <label htmlFor="contract">Contract</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="internship" className="h-4 w-4" />
                        <label htmlFor="internship">Internship</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Location Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Preferred locations</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md" 
                        placeholder="Add cities or regions"
                        value="San Francisco, CA; Remote"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Willing to relocate?</label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input type="radio" id="relocate-yes" name="relocate" className="h-4 w-4" />
                          <label htmlFor="relocate-yes">Yes</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="radio" id="relocate-no" name="relocate" className="h-4 w-4" checked />
                          <label htmlFor="relocate-no">No</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Salary Expectations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm">Minimum annual salary</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded-md" 
                        placeholder="$"
                        value="$120,000"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm">Currency</label>
                      <select className="w-full p-2 border rounded-md">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      React <button className="text-muted-foreground">✕</button>
                    </div>
                    <div className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      TypeScript <button className="text-muted-foreground">✕</button>
                    </div>
                    <div className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      Node.js <button className="text-muted-foreground">✕</button>
                    </div>
                    <div className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      Python <button className="text-muted-foreground">✕</button>
                    </div>
                    <button className="border border-dashed px-3 py-1 rounded-full text-sm text-muted-foreground">
                      + Add skill
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Equal Employment Tab */}
          <TabsContent value="equal-employment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Equal Employment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This information is collected for equal employment opportunity reporting. 
                  Providing this information is voluntary and will not be shown to employers.
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Prefer not to say</option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Non-binary</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ethnicity</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Prefer not to say</option>
                      <option>Asian</option>
                      <option>Black or African American</option>
                      <option>Hispanic or Latino</option>
                      <option>Native American or Alaska Native</option>
                      <option>Native Hawaiian or Pacific Islander</option>
                      <option>White</option>
                      <option>Two or more races</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Veteran Status</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Prefer not to say</option>
                      <option>I am a veteran</option>
                      <option>I am not a veteran</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Disability Status</label>
                    <select className="w-full p-2 border rounded-md">
                      <option>Prefer not to say</option>
                      <option>I have a disability</option>
                      <option>I do not have a disability</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Password & Security</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm">Password</label>
                      <button className="text-sm text-primary">Change</button>
                    </div>
                    <input 
                      type="password" 
                      className="w-full p-2 border rounded-md" 
                      value="••••••••••"
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm">Two-factor authentication</label>
                      <button className="text-sm text-primary">Enable</button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Job Recommendations</p>
                        <p className="text-sm text-muted-foreground">Get personalized job recommendations based on your profile</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Application Updates</p>
                        <p className="text-sm text-muted-foreground">Updates about your job applications</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Interview Reminders</p>
                        <p className="text-sm text-muted-foreground">Reminders for upcoming interviews</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Account Updates</p>
                        <p className="text-sm text-muted-foreground">Important information about your account</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-muted-foreground">Promotional messages and product updates</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Privacy Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Profile Visibility</p>
                        <p className="text-sm text-muted-foreground">Allow employers to find and view your profile</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Sharing</p>
                        <p className="text-sm text-muted-foreground">Allow us to share anonymized data for service improvement</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <button className="text-destructive font-medium">Delete Account</button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
