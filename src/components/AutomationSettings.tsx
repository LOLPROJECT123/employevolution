import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Download, Settings } from "lucide-react";
import { 
  AutomationConfig, 
  AutomationPlatform,
  getAutomationConfig,
  saveAutomationConfig,
  getHandshakeAutomationScript,
  getIndeedAutomationScript
} from '@/utils/automationUtils';
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IndeedAutomationSettings from './IndeedAutomationSettings';

// Define form schema
const formSchema = z.object({
  // Credentials section
  platform: z.enum(['handshake', 'linkedin', 'indeed', 'glassdoor']),
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  enabled: z.boolean(),
  
  // Profile section
  name: z.string().min(1, "Name is required"),
  profileEmail: z.string().email(),
  phone: z.string().min(10, "Valid phone number is required"),
  location: z.string().min(1, "Location is required"),
  currentlyEmployed: z.boolean(),
  needVisa: z.boolean(),
  yearsOfCoding: z.coerce.number().min(0),
  experience: z.string(),
  languagesKnown: z.string(),
  codingLanguagesKnown: z.string(),
  
  // Extended profile for Indeed
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  university: z.string().optional(),
  hasCriminalRecord: z.boolean().optional(),
  needsSponsorship: z.boolean().optional(),
  willingToRelocate: z.boolean().optional(),
  workAuthorized: z.boolean().optional(),
  isCitizen: z.boolean().optional(),
  educationLevel: z.string().optional(),
  salaryExpectation: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Decline']).optional(),
  veteranStatus: z.enum(['Yes', 'No', 'Decline']).optional(),
  disabilityStatus: z.enum(['Yes', 'No', 'Decline']).optional(),
  canCommute: z.boolean().optional(),
  preferredShift: z.enum(['Day shift', 'Night shift', 'Overnight shift']).optional(),
  availableForInterview: z.string().optional(),
  
  // Indeed specific settings
  indeed: z.object({
    experienceYears: z.object({
      java: z.string().optional(),
      aws: z.string().optional(),
      python: z.string().optional(),
      analysis: z.string().optional(),
      django: z.string().optional(),
      php: z.string().optional(),
      react: z.string().optional(),
      node: z.string().optional(),
      angular: z.string().optional(),
      javascript: z.string().optional(),
      orm: z.string().optional(),
      sdet: z.string().optional(),
      selenium: z.string().optional(),
      testautomation: z.string().optional(),
      webdev: z.string().optional(),
      programming: z.string().optional(),
      teaching: z.string().optional(),
      default: z.string().optional(),
    }).optional(),
    applicationSettings: z.object({
      loadDelay: z.number().optional(),
      hasDBS: z.boolean().optional(),
      hasValidCertificate: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Function to load saved config from localStorage
const loadSavedConfig = (): AutomationConfig | null => {
  return getAutomationConfig();
};

// Function to save config to localStorage
const saveConfig = (config: AutomationConfig): void => {
  saveAutomationConfig(config);
};

export default function AutomationSettings() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // Initialize form with saved values if available
  const savedConfig = loadSavedConfig();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: savedConfig ? {
      platform: savedConfig.credentials?.platform || 'handshake',
      email: savedConfig.credentials?.email || '',
      password: savedConfig.credentials?.password || '',
      enabled: savedConfig.credentials?.enabled || false,
      name: savedConfig.profile?.name || savedConfig.name || '',
      profileEmail: savedConfig.profile?.email || savedConfig.email || '',
      phone: savedConfig.profile?.phone || savedConfig.phone || '',
      location: savedConfig.profile?.location || '',
      currentlyEmployed: savedConfig.profile?.currentlyEmployed || false,
      needVisa: savedConfig.profile?.needVisa || false,
      yearsOfCoding: savedConfig.profile?.yearsOfCoding || 0,
      experience: savedConfig.profile?.experience || '',
      languagesKnown: savedConfig.profile?.languagesKnown?.join(', ') || '',
      codingLanguagesKnown: savedConfig.profile?.codingLanguagesKnown?.join(', ') || '',
      
      // Extended profile fields
      address: savedConfig.profile?.address || '',
      city: savedConfig.profile?.city || '',
      state: savedConfig.profile?.state || '',
      postalCode: savedConfig.profile?.postalCode || '',
      githubUrl: savedConfig.profile?.githubUrl || '',
      linkedinUrl: savedConfig.profile?.linkedinUrl || '',
      university: savedConfig.profile?.university || '',
      hasCriminalRecord: savedConfig.profile?.hasCriminalRecord || false,
      needsSponsorship: savedConfig.profile?.needsSponsorship || false,
      willingToRelocate: savedConfig.profile?.willingToRelocate || false,
      workAuthorized: savedConfig.profile?.workAuthorized || false,
      isCitizen: savedConfig.profile?.isCitizen || false,
      educationLevel: savedConfig.profile?.educationLevel || '',
      salaryExpectation: savedConfig.profile?.salaryExpectation || '',
      gender: savedConfig.profile?.gender || 'Decline',
      veteranStatus: savedConfig.profile?.veteranStatus || 'Decline',
      disabilityStatus: savedConfig.profile?.disabilityStatus || 'Decline',
      canCommute: savedConfig.profile?.canCommute || false,
      preferredShift: savedConfig.profile?.preferredShift || 'Day shift',
      availableForInterview: savedConfig.profile?.availableForInterview || '',
      
      // Indeed specific settings
      indeed: savedConfig.platformSpecificSettings?.indeed || {
        experienceYears: {
          default: '0'
        },
        applicationSettings: {
          loadDelay: 1.5,
          hasDBS: false,
          hasValidCertificate: false
        }
      }
    } : {
      platform: 'handshake' as AutomationPlatform,
      email: '',
      password: '',
      enabled: false,
      name: '',
      profileEmail: '',
      phone: '',
      location: '',
      currentlyEmployed: false,
      needVisa: false,
      yearsOfCoding: 0,
      experience: '',
      languagesKnown: '',
      codingLanguagesKnown: '',
      
      // Initialize Indeed-specific settings with defaults
      indeed: {
        experienceYears: {
          default: '0'
        },
        applicationSettings: {
          loadDelay: 1.5,
          hasDBS: false,
          hasValidCertificate: false
        }
      }
    }
  });
  
  const onSubmit = (values: FormValues) => {
    // Convert form values to AutomationConfig
    const config: AutomationConfig = {
      credentials: {
        platform: values.platform,
        email: values.email,
        password: values.password,
        enabled: values.enabled
      },
      profile: {
        name: values.name,
        email: values.profileEmail,
        phone: values.phone,
        location: values.location,
        currentlyEmployed: values.currentlyEmployed,
        needVisa: values.needVisa,
        yearsOfCoding: values.yearsOfCoding,
        experience: values.experience,
        languagesKnown: values.languagesKnown.split(',').map(lang => lang.trim()),
        codingLanguagesKnown: values.codingLanguagesKnown.split(',').map(lang => lang.trim()),
        
        // Extended profile fields
        address: values.address,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        githubUrl: values.githubUrl,
        linkedinUrl: values.linkedinUrl,
        university: values.university,
        hasCriminalRecord: values.hasCriminalRecord,
        needsSponsorship: values.needsSponsorship,
        willingToRelocate: values.willingToRelocate,
        workAuthorized: values.workAuthorized,
        isCitizen: values.isCitizen,
        educationLevel: values.educationLevel,
        salaryExpectation: values.salaryExpectation,
        gender: values.gender,
        veteranStatus: values.veteranStatus,
        disabilityStatus: values.disabilityStatus,
        canCommute: values.canCommute,
        preferredShift: values.preferredShift,
        availableForInterview: values.availableForInterview,
      },
      platformSpecificSettings: {
        indeed: values.indeed
      },
      name: values.name,
      email: values.profileEmail,
      phone: values.phone
    };
    
    // Save config
    saveConfig(config);
    toast.success("Automation settings saved", {
      description: "Your application automation settings have been saved."
    });
    setOpen(false);
  };
  
  const downloadAutomationScript = () => {
    const values = form.getValues();
    const platform = values.platform;
    
    // Convert form values to AutomationConfig
    const config: AutomationConfig = {
      credentials: {
        platform: values.platform,
        email: values.email,
        password: values.password,
        enabled: values.enabled
      },
      profile: {
        name: values.name,
        email: values.profileEmail,
        phone: values.phone,
        location: values.location,
        currentlyEmployed: values.currentlyEmployed,
        needVisa: values.needVisa,
        yearsOfCoding: values.yearsOfCoding,
        experience: values.experience,
        languagesKnown: values.languagesKnown.split(',').map(lang => lang.trim()),
        codingLanguagesKnown: values.codingLanguagesKnown.split(',').map(lang => lang.trim()),
        
        // Extended profile fields
        address: values.address,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        githubUrl: values.githubUrl,
        linkedinUrl: values.linkedinUrl,
        university: values.university,
        hasCriminalRecord: values.hasCriminalRecord,
        needsSponsorship: values.needsSponsorship,
        willingToRelocate: values.willingToRelocate,
        workAuthorized: values.workAuthorized,
        isCitizen: values.isCitizen,
        educationLevel: values.educationLevel,
        salaryExpectation: values.salaryExpectation,
        gender: values.gender,
        veteranStatus: values.veteranStatus,
        disabilityStatus: values.disabilityStatus,
        canCommute: values.canCommute,
        preferredShift: values.preferredShift,
        availableForInterview: values.availableForInterview,
      },
      platformSpecificSettings: {
        indeed: values.indeed
      },
      name: values.name,
      email: values.profileEmail,
      phone: values.phone
    };
    
    // Get script based on platform
    let scriptContent = '';
    let fileName = '';
    
    if (platform === 'handshake') {
      scriptContent = getHandshakeAutomationScript('example.com', config);
      fileName = 'handshake_automation.js';
    } else if (platform === 'indeed') {
      scriptContent = getIndeedAutomationScript('example.com', config);
      fileName = 'indeed_automation.js';
    } else {
      toast.info("Script generation not implemented", {
        description: `Automation script for ${platform} is not yet implemented.`
      });
      return;
    }
    
    // Create and download file
    const element = document.createElement('a');
    const file = new Blob([scriptContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success(`Downloaded ${fileName}`, {
      description: "Run this script with Python to automate your job applications."
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span>Application Automation</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Automation Settings</DialogTitle>
          <DialogDescription>
            Configure automation for applying to jobs on platforms like Handshake, LinkedIn, Indeed, and more.
            Your credentials are saved locally and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
                <TabsTrigger value="indeed" className="flex-1">Indeed Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="pt-4">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Platform Credentials</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="platform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Switch to the appropriate tab when platform changes
                                if (value === 'indeed') {
                                  setActiveTab('indeed');
                                }
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="handshake">Handshake</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="indeed">Indeed</SelectItem>
                                <SelectItem value="glassdoor">Glassdoor</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Enable Automation</FormLabel>
                              <FormDescription>
                                Turn on job application automation
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Stored locally only
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Profile Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="profileEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input placeholder="contact@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(123) 456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="yearsOfCoding"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Coding Experience</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-4">
                        <FormField
                          control={form.control}
                          name="currentlyEmployed"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>Currently Employed</FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="needVisa"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel>Need Visa Sponsorship</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Summary</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description of your work experience" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="languagesKnown"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Languages Known</FormLabel>
                            <FormControl>
                              <Input placeholder="English, Spanish, etc." {...field} />
                            </FormControl>
                            <FormDescription>
                              Comma-separated list
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="codingLanguagesKnown"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coding Languages</FormLabel>
                            <FormControl>
                              <Input placeholder="Python, JavaScript, etc." {...field} />
                            </FormControl>
                            <FormDescription>
                              Comma-separated list
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="indeed" className="pt-4">
                <IndeedAutomationSettings 
                  form={form} 
                  control={form.control} 
                />
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={downloadAutomationScript}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Script</span>
              </Button>
              <Button type="submit">Save Settings</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
