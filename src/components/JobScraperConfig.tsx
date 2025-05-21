
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { JobSource } from "@/components/resume/job-application/types";

interface JobScraperConfigProps {
  onConfigUpdate: (sources: JobSource[]) => void;
}

export function JobScraperConfig({ onConfigUpdate }: JobScraperConfigProps) {
  const [jobSources, setJobSources] = useState<JobSource[]>(() => {
    // Initialize from localStorage if available
    try {
      const savedSources = localStorage.getItem('jobSources');
      if (savedSources) {
        return JSON.parse(savedSources);
      }
    } catch (e) {
      console.error('Error loading job sources:', e);
    }
    
    // Default sources include finance/tech job boards
    return [
      { id: 'linkedin', name: 'LinkedIn', url: 'https://www.linkedin.com/jobs', isActive: true, category: 'general', lastScraped: new Date().toISOString(), jobCount: 42 },
      { id: 'indeed', name: 'Indeed', url: 'https://www.indeed.com/jobs', isActive: true, category: 'general', lastScraped: new Date().toISOString(), jobCount: 37 },
      { id: 'worldquant', name: 'WorldQuant', url: 'https://www.worldquant.com/career-listing/', isActive: true, category: 'finance', lastScraped: new Date().toISOString(), jobCount: 15 },
      { id: 'schonfeld', name: 'Schonfeld Advisors', url: 'https://job-boards.greenhouse.io/schonfeld', isActive: true, category: 'finance', lastScraped: new Date().toISOString(), jobCount: 8 },
      { id: 'voleon', name: 'Voleon Group', url: 'https://jobs.lever.co/voleon', isActive: true, category: 'finance', lastScraped: new Date().toISOString(), jobCount: 12 },
      { id: 'google', name: 'Google', url: 'https://www.google.com/about/careers/applications/jobs/results', isActive: true, category: 'tech', lastScraped: new Date().toISOString(), jobCount: 23 },
      { id: 'microsoft', name: 'Microsoft', url: 'https://jobs.careers.microsoft.com/global/en/search', isActive: true, category: 'tech', lastScraped: new Date().toISOString(), jobCount: 31 },
    ];
  });
  
  const [open, setOpen] = useState(false);
  
  const handleToggleSource = (id: string) => {
    const updatedSources = jobSources.map(source => 
      source.id === id ? { ...source, isActive: !source.isActive } : source
    );
    setJobSources(updatedSources);
    onConfigUpdate(updatedSources);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings className="h-3.5 w-3.5" />
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Job Search Sources</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {/* Finance Job Boards Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">Finance & Quant Job Boards</h3>
              <div className="space-y-2">
                {jobSources
                  .filter(source => source.category === 'finance')
                  .map(source => (
                    <div key={source.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{source.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{source.url}</p>
                      </div>
                      <Switch 
                        checked={source.isActive} 
                        onCheckedChange={() => handleToggleSource(source.id)} 
                      />
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Tech Job Boards Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">Tech Job Boards</h3>
              <div className="space-y-2">
                {jobSources
                  .filter(source => source.category === 'tech')
                  .map(source => (
                    <div key={source.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{source.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{source.url}</p>
                      </div>
                      <Switch 
                        checked={source.isActive} 
                        onCheckedChange={() => handleToggleSource(source.id)} 
                      />
                    </div>
                  ))}
              </div>
            </div>
            
            {/* General Job Boards Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">General Job Boards</h3>
              <div className="space-y-2">
                {jobSources
                  .filter(source => source.category === 'general')
                  .map(source => (
                    <div key={source.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{source.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{source.url}</p>
                      </div>
                      <Switch 
                        checked={source.isActive} 
                        onCheckedChange={() => handleToggleSource(source.id)} 
                      />
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Custom Job Boards Section */}
            {jobSources.filter(source => source.category === 'custom' || !source.category).length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Custom Sources</h3>
                <div className="space-y-2">
                  {jobSources
                    .filter(source => source.category === 'custom' || !source.category)
                    .map(source => (
                      <div key={source.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{source.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{source.url}</p>
                        </div>
                        <Switch 
                          checked={source.isActive} 
                          onCheckedChange={() => handleToggleSource(source.id)} 
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="default" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
