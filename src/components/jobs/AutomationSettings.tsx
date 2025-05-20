
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { getAutomationConfig, saveAutomationConfig, checkExtensionInstalled, AutomationConfig } from "@/utils/automationUtils";

export default function AutomationSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExtensionInstalled, setIsExtensionInstalled] = useState<boolean>(false);
  
  const [config, setConfig] = useState<AutomationConfig>({
    credentials: {
      platform: 'indeed',
      email: '',
      password: '',
      enabled: true
    },
    profile: {
      name: '',
      email: '',
      phone: '',
      location: '',
      currentlyEmployed: false,
      needVisa: false,
      yearsOfCoding: 0,
      experience: '',
      languagesKnown: [],
      codingLanguagesKnown: []
    },
    name: "",
    email: "",
    phone: "",
    resumeUrl: "",
    education: [],
    experience: [],
    skills: [] as string[],
    coverLetterTemplate: "Dear Hiring Manager,\n\nI am writing to express my interest in the {position} position at {company}. With my background in {skills}, I am confident that I would be a valuable addition to your team.\n\n[Your experience and qualifications paragraph]\n\nThank you for considering my application. I look forward to the opportunity to discuss how my skills and experience align with your needs.\n\nSincerely,\n{name}",
    preferences: {
      autoFillPersonal: true,
      autoFillEducation: true,
      autoFillExperience: true,
      autoFillSkills: true,
      autoGenerateCoverLetter: false,
      applyWithoutConfirmation: false
    }
  });

  useEffect(() => {
    const loadConfig = async () => {
      // Check if extension is installed
      const extensionInstalled = await checkExtensionInstalled();
      setIsExtensionInstalled(extensionInstalled);
      
      // Load saved config
      const savedConfig = getAutomationConfig();
      
      if (savedConfig) {
        setConfig(prev => ({
          ...prev,
          ...savedConfig,
          preferences: {
            ...prev.preferences,
            ...(savedConfig.preferences || {})
          }
        }));
      }
      
      setIsLoading(false);
    };
    
    loadConfig();
  }, []);

  const handleSaveConfig = () => {
    setIsSaving(true);
    
    try {
      // Validate required fields
      if (!config.name || !config.email) {
        toast.error("Please fill in all required fields", {
          description: "Name and email are required"
        });
        setIsSaving(false);
        return;
      }
      
      // Save the configuration
      saveAutomationConfig(config);
      
      toast.success("Automation settings saved", {
        description: "Your settings have been saved successfully"
      });
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save settings", {
        description: "An error occurred while saving your settings"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSkillsChange = (skillsText: string) => {
    const skillsArray = skillsText
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
      
    setConfig(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Application Automation Settings</CardTitle>
        <CardDescription>
          Configure how Streamline will fill out job applications for you
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!isExtensionInstalled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-800 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Browser Extension Required</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  The Streamline browser extension is required for application automation.
                  Please install it from the Chrome Web Store to enable this feature.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-yellow-800"
                  onClick={() => window.open('https://chrome.google.com/webstore/detail/streamline-extension', '_blank')}
                >
                  Install Extension
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <Tabs defaultValue="personal">
          <TabsList className="mb-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  placeholder="John Smith" 
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john.smith@example.com" 
                  value={config.email}
                  onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="(123) 456-7890" 
                  value={config.phone}
                  onChange={(e) => setConfig(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="resume" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input 
                  id="resumeUrl" 
                  placeholder="https://example.com/resume.pdf" 
                  value={config.resumeUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, resumeUrl: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  Link to your hosted resume (PDF format recommended)
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Textarea 
                  id="skills" 
                  placeholder="JavaScript, React, TypeScript, Node.js"
                  value={config.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="coverLetter">Default Cover Letter Template</Label>
                <Textarea 
                  id="coverLetter" 
                  rows={8}
                  value={config.coverLetterTemplate}
                  onChange={(e) => setConfig(prev => ({ ...prev, coverLetterTemplate: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  Use placeholders like {'{position}'}, {'{company}'}, {'{skills}'}, and {'{name}'} which 
                  will be automatically replaced.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-fill personal information</h4>
                  <p className="text-sm text-gray-500">Fill name, email, and phone fields automatically</p>
                </div>
                <Switch 
                  checked={config.preferences.autoFillPersonal}
                  onCheckedChange={(checked) => setConfig(prev => ({ 
                    ...prev,
                    preferences: { ...prev.preferences, autoFillPersonal: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-fill education</h4>
                  <p className="text-sm text-gray-500">Fill education history automatically</p>
                </div>
                <Switch 
                  checked={config.preferences.autoFillEducation}
                  onCheckedChange={(checked) => setConfig(prev => ({ 
                    ...prev,
                    preferences: { ...prev.preferences, autoFillEducation: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-fill work experience</h4>
                  <p className="text-sm text-gray-500">Fill work history automatically</p>
                </div>
                <Switch 
                  checked={config.preferences.autoFillExperience}
                  onCheckedChange={(checked) => setConfig(prev => ({ 
                    ...prev,
                    preferences: { ...prev.preferences, autoFillExperience: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-fill skills</h4>
                  <p className="text-sm text-gray-500">Fill skills sections automatically</p>
                </div>
                <Switch 
                  checked={config.preferences.autoFillSkills}
                  onCheckedChange={(checked) => setConfig(prev => ({ 
                    ...prev,
                    preferences: { ...prev.preferences, autoFillSkills: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-generate cover letter</h4>
                  <p className="text-sm text-gray-500">Generate a custom cover letter for each job</p>
                </div>
                <Switch 
                  checked={config.preferences.autoGenerateCoverLetter}
                  onCheckedChange={(checked) => setConfig(prev => ({ 
                    ...prev,
                    preferences: { ...prev.preferences, autoGenerateCoverLetter: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Apply without confirmation</h4>
                  <p className="text-sm text-gray-500">Submit applications automatically without asking</p>
                </div>
                <Switch 
                  checked={config.preferences.applyWithoutConfirmation}
                  onCheckedChange={(checked) => setConfig(prev => ({ 
                    ...prev,
                    preferences: { ...prev.preferences, applyWithoutConfirmation: checked }
                  }))}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          {isExtensionInstalled ? (
            <span className="flex items-center text-green-600">
              <Check className="h-4 w-4 mr-1" /> Browser extension connected
            </span>
          ) : (
            <span className="flex items-center text-yellow-600">
              <AlertCircle className="h-4 w-4 mr-1" /> Browser extension not found
            </span>
          )}
        </p>
        
        <Button onClick={handleSaveConfig} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
