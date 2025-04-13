
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, HelpCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface JobKeywordMatchProps {
  matchScore: number;
  keywordsFound?: number;
  keywordsTotal?: number;
  keywordsList?: string[];
  className?: string;
}

const JobKeywordMatch = ({ 
  matchScore = 0,
  keywordsFound = 0,
  keywordsTotal = 0, 
  keywordsList = [],
  className = ""
}: JobKeywordMatchProps) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();
  
  const getScoreColor = () => {
    if (matchScore >= 80) return "text-green-500";
    if (matchScore >= 60) return "text-amber-500";
    return "text-red-500";
  };
  
  const getProgressColor = () => {
    if (matchScore >= 80) return "bg-green-500";
    if (matchScore >= 60) return "bg-amber-500";
    return "text-red-500";
  };
  
  const getMatchText = () => {
    if (matchScore >= 80) return "Strong";
    if (matchScore >= 60) return "Moderate";
    return "Weak";
  };
  
  const handleOptimize = () => {
    setIsOptimizing(true);
    
    setTimeout(() => {
      setIsOptimizing(false);
      
      toast({
        title: "Resume optimizer opened",
        description: "We've opened the ATS Optimizer with this job's keywords pre-loaded.",
      });
      
      // In a real application, this would navigate to the resume optimizer
      // with the job's keywords pre-loaded
    }, 1000);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">Keyword Match</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="w-[200px] text-xs p-2">
                  This shows how well your resume matches the keywords in this job posting.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className={`font-medium ${getScoreColor()}`}>
            {getMatchText()} - {keywordsFound} of {keywordsTotal} found
          </span>
        </div>
        
        <Progress value={matchScore} className="h-2 w-full" />
        
        <div className="flex flex-wrap gap-1.5 mt-2">
          {keywordsList.map((keyword, index) => (
            <Badge 
              key={index}
              variant="outline"
              className="text-xs py-0.5"
            >
              {keyword}
            </Badge>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2 text-xs"
          onClick={handleOptimize}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <>
              <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"></div>
              Optimizing...
            </>
          ) : (
            <>
              <Info className="mr-1 h-3 w-3" />
              Optimize Resume for This Job
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobKeywordMatch;
