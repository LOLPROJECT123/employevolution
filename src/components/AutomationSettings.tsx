
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
import { Download, SettingsIcon } from "lucide-react";
import { AutomationConfig, AutomationCredentials, AutomationPlatform, AutomationProfile } from '@/utils/automationUtils';
import { toast } from "sonner";

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
});

type FormValues = z.infer<typeof formSchema>;

// Function to load saved config from localStorage
const loadSavedConfig = (): AutomationConfig | null => {
  const savedConfig = localStorage.getItem('automationConfig');
  if (savedConfig) {
    try {
      return JSON.parse(savedConfig);
    } catch (e) {
      console.error('Failed to parse saved automation config:', e);
    }
  }
  return null;
};

// Function to save config to localStorage
const saveConfig = (config: AutomationConfig): void => {
  localStorage.setItem('automationConfig', JSON.stringify(config));
};

export default function AutomationSettings() {
  const [open, setOpen] = useState(false);
  
  // Initialize form with saved values if available
  const savedConfig = loadSavedConfig();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: savedConfig ? {
      platform: savedConfig.credentials.platform,
      email: savedConfig.credentials.email,
      password: savedConfig.credentials.password,
      enabled: savedConfig.credentials.enabled,
      name: savedConfig.profile.name,
      profileEmail: savedConfig.profile.email,
      phone: savedConfig.profile.phone,
      location: savedConfig.profile.location,
      currentlyEmployed: savedConfig.profile.currentlyEmployed,
      needVisa: savedConfig.profile.needVisa,
      yearsOfCoding: savedConfig.profile.yearsOfCoding,
      experience: savedConfig.profile.experience,
      languagesKnown: savedConfig.profile.languagesKnown.join(', '),
      codingLanguagesKnown: savedConfig.profile.codingLanguagesKnown.join(', '),
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
      }
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
      }
    };
    
    // For this demo, we'll just display a message - in a real app, this would download the script
    toast.info("Download initiated", {
      description: "In a complete implementation, this would download a Python script configured with your settings."
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SettingsIcon className="h-4 w-4" />
          <span>Application Automation</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Automation Settings</DialogTitle>
          <DialogDescription>
            Configure automation for applying to jobs on platforms like Handshake, LinkedIn, and more.
            Your credentials are saved locally and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        onValueChange={field.onChange} 
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
