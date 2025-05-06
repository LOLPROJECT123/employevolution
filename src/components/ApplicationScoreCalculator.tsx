
import { useState, useEffect } from "react";
import { Job } from "@/types/job";
import { 
  calculateApplicationScore, 
  scoreToGrade, 
  ApplicationScoreDetails 
} from "@/utils/jobMatchScoring";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ApplicationScoreCalculatorProps {
  job: Job;
  userSkills?: string[];
  userExperience?: number;
  userEducation?: string[];
  userLocation?: string;
}

export function ApplicationScoreCalculator({
  job,
  userSkills = [],
  userExperience = 0,
  userEducation = [],
  userLocation = ""
}: ApplicationScoreCalculatorProps) {
  const [scoreDetails, setScoreDetails] = useState<ApplicationScoreDetails | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (job) {
      const result = calculateApplicationScore(
        job,
        userSkills,
        userExperience,
        userEducation,
        userLocation
      );
      setScoreDetails(result);
    }
  }, [job, userSkills, userExperience, userEducation, userLocation]);

  const handleGenerateCoverLetter = () => {
    setIsGenerating(true);
    
    // Simulate API call to generate cover letter
    setTimeout(() => {
      toast({
        title: "Cover Letter Generated",
        description: "Your customized cover letter has been created based on the job description and your profile",
      });
      setIsGenerating(false);
    }, 2000);
  };

  if (!scoreDetails) {
    return <div>Loading application score...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Application Score</span>
          <div className="text-2xl font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
            {scoreToGrade(scoreDetails.overallScore)}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Match</span>
            <span className="text-sm font-medium">{scoreDetails.overallScore}%</span>
          </div>
          <Progress value={scoreDetails.overallScore} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs">Skills</span>
            <Progress value={scoreDetails.skillScore} className="h-1.5" />
            <span className="text-xs text-gray-500">{scoreDetails.skillScore}%</span>
          </div>
          
          <div className="space-y-1">
            <span className="text-xs">Experience</span>
            <Progress value={scoreDetails.experienceScore} className="h-1.5" />
            <span className="text-xs text-gray-500">{scoreDetails.experienceScore}%</span>
          </div>
          
          <div className="space-y-1">
            <span className="text-xs">Education</span>
            <Progress value={scoreDetails.educationScore} className="h-1.5" />
            <span className="text-xs text-gray-500">{scoreDetails.educationScore}%</span>
          </div>
          
          <div className="space-y-1">
            <span className="text-xs">Location</span>
            <Progress value={scoreDetails.locationScore} className="h-1.5" />
            <span className="text-xs text-gray-500">{scoreDetails.locationScore}%</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </Button>
        
        {showDetails && (
          <div className="space-y-3 pt-2">
            {scoreDetails.keywordMatches.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Keyword Matches</h4>
                <ScrollArea className="h-24 rounded border p-2">
                  <div className="space-y-1">
                    {scoreDetails.keywordMatches.map((match, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{match.keyword}</span>
                        <span className="text-primary font-medium">{match.count} matches</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            
            {scoreDetails.improvementSuggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Improvement Suggestions</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {scoreDetails.improvementSuggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-400">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleGenerateCoverLetter}
          disabled={isGenerating}
        >
          <FileText className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Cover Letter"}
        </Button>
      </CardFooter>
    </Card>
  );
}
