
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ATSSystem = {
  name: string;
  logo: string;
  popularity: "high" | "medium" | "low";
  description: string;
};

const atsSystems: ATSSystem[] = [
  {
    name: "Greenhouse",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "high",
    description: "Popular among tech startups and mid-size companies",
  },
  {
    name: "Workday",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "high",
    description: "Used by large enterprises and Fortune 500 companies",
  },
  {
    name: "Lever",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "high",
    description: "Popular among tech and mid-size companies",
  },
  {
    name: "Taleo",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "high",
    description: "Oracle's ATS used by many large corporations",
  },
  {
    name: "iCIMS",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Enterprise-level ATS with comprehensive features",
  },
  {
    name: "BambooHR",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Popular among small to mid-size businesses",
  },
  {
    name: "JazzHR",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Designed for SMBs and growing companies",
  },
  {
    name: "Jobvite",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Recruitment marketing and applicant tracking system",
  },
  {
    name: "Bullhorn ATS",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Popular in staffing and recruiting agencies",
  },
  {
    name: "Zoho Recruit",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Part of Zoho suite, popular among small businesses",
  },
  {
    name: "SmartRecruiters",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Enterprise talent acquisition suite",
  },
  {
    name: "Avature",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "medium",
    description: "Enterprise SaaS for talent acquisition and management",
  },
  {
    name: "Recruitee",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "low",
    description: "Collaborative hiring platform for growing teams",
  },
  {
    name: "Breezy HR",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "low",
    description: "Visual recruiting software for small teams",
  },
  {
    name: "Freshteam",
    logo: "/lovable-uploads/87ed6ecf-b5c7-43e9-ada4-0daed6864418.png",
    popularity: "low",
    description: "Part of Freshworks suite, for SMBs",
  },
];

const CommonATSSystems = () => {
  const [expandedSystem, setExpandedSystem] = useState<string | null>(null);

  const toggleExpand = (systemName: string) => {
    if (expandedSystem === systemName) {
      setExpandedSystem(null);
    } else {
      setExpandedSystem(systemName);
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {atsSystems.map((system) => (
            <div 
              key={system.name}
              className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors"
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
                  {expandedSystem === system.name && (
                    <p className="text-sm text-muted-foreground mt-1">{system.description}</p>
                  )}
                </div>
              </div>
              <ChevronDown 
                className={`h-5 w-5 text-muted-foreground transition-transform ${
                  expandedSystem === system.name ? "transform rotate-180" : ""
                }`} 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommonATSSystems;
