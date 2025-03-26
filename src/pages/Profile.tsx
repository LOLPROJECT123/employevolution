
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import SkillsLanguagesManager from "@/components/profile/SkillsLanguagesManager";
import Navbar from "@/components/Navbar";
import { v4 as uuidv4 } from 'uuid';

export default function Profile() {
  // General profile state
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [bio, setBio] = useState("Frontend Developer with 5 years of experience in React and TypeScript. Passionate about creating user-friendly interfaces and optimizing web performance.");
  
  // Account settings state
  const [notifications, setNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [showEmail, setShowEmail] = useState(false);
  
  // Skills and languages state
  const [skills, setSkills] = useState([
    { id: uuidv4(), name: "React.js" },
    { id: uuidv4(), name: "TypeScript" },
    { id: uuidv4(), name: "JavaScript" },
    { id: uuidv4(), name: "HTML/CSS" },
    { id: uuidv4(), name: "Node.js" },
    { id: uuidv4(), name: "Python" },
    { id: uuidv4(), name: "Java" },
    { id: uuidv4(), name: "Git" }
  ]);
  
  const [languages, setLanguages] = useState([
    { id: uuidv4(), name: "English" },
    { id: uuidv4(), name: "Spanish" }
  ]);

  // Handle adding a new skill
  const handleAddSkill = (skillName: string) => {
    setSkills([...skills, { id: uuidv4(), name: skillName }]);
  };

  // Handle removing a skill
  const handleRemoveSkill = (skillId: string) => {
    setSkills(skills.filter(skill => skill.id !== skillId));
  };

  // Handle adding a new language
  const handleAddLanguage = (languageName: string) => {
    setLanguages([...languages, { id: uuidv4(), name: languageName }]);
  };

  // Handle removing a language
  const handleRemoveLanguage = (languageId: string) => {
    setLanguages(languages.filter(language => language.id !== languageId));
  };

  // Save profile changes
  const saveProfileChanges = () => {
    // Save profile data to backend/localStorage
    console.log("Saving profile changes...");
    console.log({ name, email, bio, skills, languages });
    
    // Show success message
    alert("Profile updated successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Sidebar */}
          <div className="md:w-1/4">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4">{name}</CardTitle>
                <CardDescription>{email}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{bio}</p>
              </CardContent>
              <CardFooter className="justify-center">
                <Button variant="outline" size="sm">Upload Photo</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <Tabs defaultValue="general">
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="skillsLanguages">Skills & Languages</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="jobPreferences">Job Preferences</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Update your basic profile information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea 
                        id="bio" 
                        className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={saveProfileChanges}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Skills and Languages */}
              <TabsContent value="skillsLanguages">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills & Languages</CardTitle>
                    <CardDescription>Manage your professional skills and languages.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <SkillsLanguagesManager
                      title="Skills"
                      items={skills}
                      onAddItem={handleAddSkill}
                      onRemoveItem={handleRemoveSkill}
                      colorScheme="skill"
                    />
                    
                    <SkillsLanguagesManager
                      title="Languages"
                      items={languages}
                      onAddItem={handleAddLanguage}
                      onRemoveItem={handleRemoveLanguage}
                      colorScheme="language"
                    />
                  </CardContent>
                  <CardFooter>
                    <Button onClick={saveProfileChanges}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Account Settings */}
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">Receive email notifications about your account activity.</p>
                      </div>
                      <Switch 
                        checked={notifications} 
                        onCheckedChange={setNotifications} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Marketing Emails</h3>
                        <p className="text-sm text-muted-foreground">Receive emails about new features and offers.</p>
                      </div>
                      <Switch 
                        checked={marketingEmails} 
                        onCheckedChange={setMarketingEmails} 
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={saveProfileChanges}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Privacy Settings */}
              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control your profile visibility and privacy options.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profileVisibility">Profile Visibility</Label>
                      <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                        <SelectTrigger id="profileVisibility">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="connections">Connections Only</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Show Email on Profile</h3>
                        <p className="text-sm text-muted-foreground">Allow others to see your email address on your profile.</p>
                      </div>
                      <Switch 
                        checked={showEmail} 
                        onCheckedChange={setShowEmail} 
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={saveProfileChanges}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Job Preferences Tab */}
              <TabsContent value="jobPreferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Preferences</CardTitle>
                    <CardDescription>Set your job search preferences.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-6">
                      Job preferences functionality will be implemented soon.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
