import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Info, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateAtsUrlTemplate } from "@/utils/jobValidationUtils";

type ATSSystem = {
  name: string;
  logo: string;
  popularity: "high" | "medium" | "low";
  description: string;
  urlPattern?: string;
  type: string;
};

const atsSystems: ATSSystem[] = [
  {
    name: "Greenhouse",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "high",
    description: "Popular among tech startups and mid-size companies",
    urlPattern: "https://boards.greenhouse.io/{company}",
    type: "greenhouse"
  },
  {
    name: "Workday",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "high",
    description: "Used by large enterprises and Fortune 500 companies",
    urlPattern: "https://{company}.wd5.myworkdayjobs.com/en-US/External",
    type: "workday"
  },
  {
    name: "Lever",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "high",
    description: "Popular among tech and mid-size companies",
    urlPattern: "https://jobs.lever.co/{company}",
    type: "lever"
  },
  {
    name: "Taleo",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "high",
    description: "Oracle's ATS used by many large corporations",
    urlPattern: "https://{company}.taleo.net/careersection/2/jobsearch.ftl",
    type: "taleo"
  },
  {
    name: "iCIMS",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Enterprise-level ATS with comprehensive features",
    urlPattern: "https://careers-{company}.icims.com/jobs/search",
    type: "icims"
  },
  {
    name: "BambooHR",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Popular among small to mid-size businesses",
    type: "bamboohr"
  },
  {
    name: "JazzHR",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Designed for SMBs and growing companies",
    type: "jazzhr"
  },
  {
    name: "Jobvite",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Recruitment marketing and applicant tracking system",
    type: "jobvite"
  },
  {
    name: "Bullhorn ATS",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Popular in staffing and recruiting agencies",
    type: "bullhorn"
  },
  {
    name: "Zoho Recruit",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Part of Zoho suite, popular among small businesses",
    type: "zoho"
  },
  {
    name: "SmartRecruiters",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Enterprise talent acquisition suite",
    urlPattern: "https://jobs.smartrecruiters.com/{Company}",
    type: "smartrecruiters"
  },
  {
    name: "Avature",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Enterprise SaaS for talent acquisition and management",
    type: "avature"
  },
  {
    name: "Recruitee",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "low",
    description: "Collaborative hiring platform for growing teams",
    type: "recruitee"
  },
  {
    name: "Breezy HR",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "low",
    description: "Visual recruiting software for small teams",
    type: "breezy"
  },
  {
    name: "Freshteam",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "low",
    description: "Part of Freshworks suite, for SMBs",
    type: "freshteam"
  },
];

interface CommonATSSystemsProps {
  onAddToJobSources?: (name: string, url: string, type: string) => void;
}

const CommonATSSystems = ({ onAddToJobSources }: CommonATSSystemsProps = {}) => {
  const [expandedSystem, setExpandedSystem] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');

  const toggleExpand = (systemName: string) => {
    if (expandedSystem === systemName) {
      setExpandedSystem(null);
    } else {
      setExpandedSystem(systemName);
    }
  };
  
  const handleGenerateUrl = (system: ATSSystem) => {
    if (!companyName.trim()) {
      toast.error("Please enter a company name first");
      return;
    }
    
    if (!system.urlPattern) {
      toast.error(`URL pattern not available for ${system.name}`);
      return;
    }
    
    // Generate the URL
    const url = generateAtsUrlTemplate(companyName, system.type);
    
    // If the onAddToJobSources callback is provided, use it
    if (onAddToJobSources) {
      onAddToJobSources(companyName, url, system.type);
      toast.success(`Added ${companyName} ${system.name} URL to job sources`);
    } else {
      // Otherwise just copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success(`Generated and copied URL to clipboard: ${url}`);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Common ATS Systems</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-full bg-secondary p-1 cursor-help">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  These are the most common Applicant Tracking Systems (ATS) used by employers. 
                  Optimizing your resume for these systems can increase your chances of getting 
                  through the initial screening.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {onAddToJobSources && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Enter Company Name to Generate ATS URLs
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Acme Corporation"
              className="border rounded px-3 py-2 w-full text-sm"
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {atsSystems.map((system) => (
            <div 
              key={system.name}
              className="flex flex-col p-3 border rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors"
            >
              <div 
                className="flex items-center justify-between"
                onClick={() => toggleExpand(system.name)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                    {system.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{system.name}</span>
                      {system.popularity === "high" && (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">Popular</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    expandedSystem === system.name ? "transform rotate-180" : ""
                  }`} 
                />
              </div>
              
              {expandedSystem === system.name && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-muted-foreground">{system.description}</p>
                  
                  {system.urlPattern && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">URL Pattern:</span> {system.urlPattern}
                    </div>
                  )}
                  
                  {system.urlPattern && onAddToJobSources && companyName && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2 flex items-center justify-center gap-2 text-xs"
                      onClick={() => handleGenerateUrl(system)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Add to Job Sources
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommonATSSystems;
