
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings2Icon, Globe, Building, RefreshCwIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type JobSourceCategory = 'job-board' | 'company' | 'tech' | 'custom-company';

interface JobSource {
  id: string;
  name: string;
  isActive: boolean;
  category: JobSourceCategory;
}

const jobSources: JobSource[] = [
  // Job boards
  { id: 'linkedin', name: 'LinkedIn', isActive: true, category: 'job-board' },
  { id: 'github', name: 'GitHub Jobs', isActive: true, category: 'job-board' },
  { id: 'simplify', name: 'Simplify.jobs', isActive: true, category: 'job-board' },
  { id: 'indeed', name: 'Indeed', isActive: true, category: 'job-board' },
  { id: 'zipRecruiter', name: 'ZipRecruiter', isActive: true, category: 'job-board' },
  { id: 'levelsFyi', name: 'Levels.fyi', isActive: true, category: 'job-board' },
  { id: 'offerPilot', name: 'OfferPilot.ai', isActive: true, category: 'job-board' },
  { id: 'jobRight', name: 'JobRight.ai', isActive: true, category: 'job-board' },
  { id: 'wellfound', name: 'Wellfound', isActive: false, category: 'job-board' },
  { id: 'remoteco', name: 'Remote.co', isActive: false, category: 'job-board' },
  { id: 'weworkremotely', name: 'We Work Remotely', isActive: false, category: 'job-board' },
  { id: 'monster', name: 'Monster', isActive: false, category: 'job-board' },
  { id: 'glassdoor', name: 'Glassdoor', isActive: false, category: 'job-board' },
  { id: 'dice', name: 'Dice', isActive: false, category: 'job-board' },
  { id: 'hired', name: 'Hired', isActive: false, category: 'job-board' },
  
  // Company career pages
  { id: 'google', name: 'Google Careers', isActive: false, category: 'company' },
  { id: 'microsoft', name: 'Microsoft Careers', isActive: false, category: 'company' },
  { id: 'amazon', name: 'Amazon Jobs', isActive: false, category: 'company' },
  { id: 'apple', name: 'Apple Jobs', isActive: false, category: 'company' },
  { id: 'meta', name: 'Meta Careers', isActive: false, category: 'company' },
  { id: 'netflix', name: 'Netflix Jobs', isActive: false, category: 'company' },
  { id: 'salesforce', name: 'Salesforce Careers', isActive: false, category: 'company' },
  { id: 'adobe', name: 'Adobe Careers', isActive: false, category: 'company' },
  { id: 'ibm', name: 'IBM Jobs', isActive: false, category: 'company' },
  { id: 'oracle', name: 'Oracle Careers', isActive: false, category: 'company' },
  
  // Tech-specific job boards
  { id: 'stackOverflow', name: 'Stack Overflow Jobs', isActive: false, category: 'tech' },
  { id: 'yCombinator', name: 'Y Combinator Jobs', isActive: false, category: 'tech' },
  { id: 'hackernews', name: 'Hacker News Jobs', isActive: false, category: 'tech' },
  { id: 'remoteok', name: 'RemoteOK', isActive: false, category: 'tech' },
  { id: 'triplebyte', name: 'Triplebyte', isActive: false, category: 'tech' },
  { id: 'underdog', name: 'Underdog.io', isActive: false, category: 'tech' },
];

export interface JobScraperConfigProps {
  onConfigUpdate: (sources: JobSource[]) => void;
}

export const JobScraperConfig = ({ onConfigUpdate }: JobScraperConfigProps) => {
  const [sources, setSources] = useState<JobSource[]>(jobSources);
  const [refreshInterval, setRefreshInterval] = useState<number>(24);
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [customCompanyUrl, setCustomCompanyUrl] = useState<string>('');
  const [customCompanyName, setCustomCompanyName] = useState<string>('');
  const [autoApplyEnabled, setAutoApplyEnabled] = useState<boolean>(false);

  const handleSourceToggle = (sourceId: string) => {
    const updatedSources = sources.map(source => 
      source.id === sourceId 
        ? { ...source, isActive: !source.isActive } 
        : source
    );
    setSources(updatedSources);
  };

  const handleSave = () => {
    // Ensure all sources are active before saving
    const allActiveSourcesModified = sources.map(source => ({
      ...source,
      isActive: true
    }));
    
    setSources(allActiveSourcesModified);
    onConfigUpdate(allActiveSourcesModified);
    
    toast.success("Job search configuration updated", {
      description: "All available job sources are now enabled for your search"
    });
    setOpen(false);
  };
  
  const handleRefreshNow = () => {
    toast.success("Refreshing job listings", {
      description: "Fetching new jobs from all enabled sources"
    });
  };
  
  const handleAddCustomCompany = () => {
    if (!customCompanyUrl || !customCompanyName) {
      toast.error("Missing information", {
        description: "Please enter both company name and careers page URL"
      });
      return;
    }
    
    try {
      new URL(customCompanyUrl);
    } catch (error) {
      toast.error("Invalid URL format", {
        description: "Please enter a valid URL including http:// or https://"
      });
      return;
    }
    
    const customCompanyId = customCompanyName.toLowerCase().replace(/\s+/g, '-');
    
    if (sources.some(source => source.id === customCompanyId)) {
      toast.error("Company already exists", {
        description: "This company is already in your sources list"
      });
      return;
    }
    
    const newCompany: JobSource = {
      id: customCompanyId,
      name: customCompanyName,
      isActive: true,
      category: 'custom-company'
    };
    
    setSources([...sources, newCompany]);
    setCustomCompanyName('');
    setCustomCompanyUrl('');
    
    toast.success("Company added", {
      description: `${customCompanyName} has been added to your job sources`
    });
  };

  const handleSliderChange = (values: number[]) => {
    if (values.length > 0) {
      setRefreshInterval(values[0]);
    }
  };

  // Hide individual sources from UI by showing only global settings
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Settings2Icon className="w-4 h-4 mr-2" />
          Advanced Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Job Search Settings</DialogTitle>
          <DialogDescription>
            Configure how often to refresh job listings and advanced automation options.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">          
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label htmlFor="refresh-interval">Refresh Interval</Label>
              <Badge variant="outline">{refreshInterval} hours</Badge>
            </div>
            <Slider
              id="refresh-interval"
              value={[refreshInterval]}
              onValueChange={handleSliderChange}
              min={1}
              max={72}
              step={1}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 hour</span>
              <span>24 hours</span>
              <span>72 hours</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Job listings will be refreshed automatically every {refreshInterval} hours.
            </p>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Apply</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically apply to jobs matching your preferences and qualifications
                </p>
              </div>
              <Switch
                checked={autoApplyEnabled}
                onCheckedChange={setAutoApplyEnabled}
              />
            </div>
          </div>
          
          <div className="flex justify-between gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshNow}
              className="flex items-center gap-2"
            >
              <RefreshCwIcon className="w-4 h-4" />
              Refresh Now
            </Button>
            <div>
              <Button variant="outline" onClick={() => setOpen(false)} size="sm" className="mr-2">
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm">
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
