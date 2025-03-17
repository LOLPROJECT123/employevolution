
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
import { Settings2Icon } from 'lucide-react';

const jobSources = [
  { id: 'linkedin', name: 'LinkedIn', isActive: true },
  { id: 'github', name: 'GitHub Jobs', isActive: true },
  { id: 'simplify', name: 'Simplify.jobs', isActive: true },
  { id: 'indeed', name: 'Indeed', isActive: true },
  { id: 'zipRecruiter', name: 'ZipRecruiter', isActive: true },
  { id: 'levelsFyi', name: 'Levels.fyi', isActive: true },
  { id: 'offerPilot', name: 'OfferPilot.ai', isActive: true },
  { id: 'jobRight', name: 'JobRight.ai', isActive: true },
  { id: 'wellfound', name: 'Wellfound', isActive: false },
  { id: 'remoteco', name: 'Remote.co', isActive: false },
  { id: 'weworkremotely', name: 'We Work Remotely', isActive: false },
];

export interface JobScraperConfigProps {
  onConfigUpdate: (sources: {id: string, name: string, isActive: boolean}[]) => void;
}

export const JobScraperConfig = ({ onConfigUpdate }: JobScraperConfigProps) => {
  const [sources, setSources] = useState(jobSources);
  const [refreshInterval, setRefreshInterval] = useState(24);
  const [open, setOpen] = useState(false);

  const handleSourceToggle = (sourceId: string) => {
    const updatedSources = sources.map(source => 
      source.id === sourceId 
        ? { ...source, isActive: !source.isActive } 
        : source
    );
    setSources(updatedSources);
  };

  const handleSave = () => {
    onConfigUpdate(sources);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Settings2Icon className="w-4 h-4 mr-2" />
          Configure Job Sources
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Job Search Sources</DialogTitle>
          <DialogDescription>
            Select which job platforms to search for opportunities.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={source.id}
                    checked={source.isActive}
                    onCheckedChange={() => handleSourceToggle(source.id)}
                  />
                  <Label 
                    htmlFor={source.id} 
                    className="text-sm cursor-pointer"
                  >
                    {source.name}
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="refresh-interval">Refresh Interval (hours)</Label>
              <Input
                id="refresh-interval"
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 24)}
                min="1"
                max="72"
              />
              <p className="text-xs text-muted-foreground">
                Job listings will be refreshed automatically every {refreshInterval} hours.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
