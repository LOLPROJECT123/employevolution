import { useState } from "react";
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
  Languages
} from "lucide-react";

const Profile = () => {
  const [jobSearchStatus, setJobSearchStatus] = useState("Actively looking");
  const [showProfile, setShowProfile] = useState(true);
  
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
                  <AvatarFallback>VV</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">Varun Veluri</h1>
                      <p className="text-muted-foreground mt-1">Job Search Status</p>
                      <Badge className="mt-1 bg-cyan-100 text-cyan-800 hover:bg-cyan-200">
                        {jobSearchStatus}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <span className="text-yellow-500">⚡</span>
                        Show Profile to Recruiters
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">?</span>
                      </Button>
                      <Switch
                        checked={showProfile}
                        onCheckedChange={setShowProfile}
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
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>vveluri6@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>+1 (469) 551-9662</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <span>06/19/2006</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>Atlanta, GA, USA</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Resume Tab */}
            <TabsContent value="resume">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Resume</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="bg-cyan-100 rounded-md p-3">
                        <Mail className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Varun_Veluri_resume</h3>
                        <p className="text-sm text-muted-foreground">
                          View last uploaded: 2/13/2025, 11:26:57 AM CST
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Work Experience */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Work Experience</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Job 1 */}
                    <div className="flex gap-4">
                      <div className="bg-cyan-100 rounded-md p-3 h-12 w-12 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">Software Engineer Intern/ Co-Lead</h3>
                            <p className="text-sm">DIRAC • New York, NY, USA</p>
                            <p className="text-sm text-muted-foreground">Oct 2024 - Dec 2024</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">Creating a solution to simulate and calculate the optimal path for installing and removing the wire and the installation and removal of a flexible wire from an electrical cabinet</p>
                        <p className="text-sm">Using the A* algorithm, PythonOCC, Blender, FreeCAD, CAD, and an RL model to help take into account real-world constraints like collisions with other components and bending behavior of the flexible material and showing the output in animation</p>
                        <p className="text-sm">The future purpose is to use the script we developed in robots to help build the electrical aspects of houses</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Job 2 */}
                    <div className="flex gap-4">
                      <div className="bg-cyan-100 rounded-md p-3 h-12 w-12 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">AI Fellowship</h3>
                            <p className="text-sm">Headstarter AI • Remote</p>
                            <p className="text-sm text-muted-foreground">Jul 2024 - Sep 2024</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">Personal Portfolio (HTML/CSS): Used to showcase individual talents, skills and experience</p>
                        <p className="text-sm">Pantry Tracker (Next.js, Material UI, React, GCP, Vercel, CI/CD, and Firebase): Built inventory management system with next.js, react, and Firebase, enabling real-time tracking of 1000+ products across 5 warehouses, increasing efficiency by 30%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Education */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Education</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/lovable-uploads/8d78f162-7185-4058-b018-02e6724321d1.png" alt="Georgia Tech" />
                          <AvatarFallback>GT</AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">Georgia Institute of Technology</h3>
                            <p className="text-sm">Bachelor's, Computer Science</p>
                            <p className="text-sm text-muted-foreground">Aug 2023 - May 2027</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Projects */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Projects & Outside Experience</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Project 1 */}
                    <div className="flex gap-4">
                      <div className="bg-cyan-100 rounded-md p-3 h-12 w-12 flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">AI Malware and Virus Reader For Emails</h3>
                            <p className="text-sm text-muted-foreground">May 2024 - May 2024</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">Serves as a tool to ensure your emails are not corrupting the user's device</p>
                        <p className="text-sm">It uses Python, a Gmail import tool, and an IMAP port to take emails and scan them for malware and viruses</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Project 2 */}
                    <div className="flex gap-4">
                      <div className="bg-cyan-100 rounded-md p-3 h-12 w-12 flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">Trading Algorithm</h3>
                            <p className="text-sm text-muted-foreground">Dec 2024 - Present</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">Serves as a tool to help study trends of the stock markets and company and world issues and success and their impacts on stocks to make trading more predictable and help with better trade outcomes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Portfolio & Socials */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Portfolio & Socials</CardTitle>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 rounded-full p-2">
                        <LinkedinIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">LinkedIn URL</p>
                        <a href="https://www.linkedin.com/in/varun-veluri-6698a628a/" className="text-sm text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                          https://www.linkedin.com/in/varun-veluri-6698a628a/
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-900 rounded-full p-2">
                        <GithubIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">GitHub URL</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-pink-600 rounded-full p-2">
                        <ExternalLink className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Portfolio URL</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 rounded-full p-2">
                        <Link2Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Other URL</p>
                      </div>
                    </div>
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
