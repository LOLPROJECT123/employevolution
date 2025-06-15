
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, HelpCircle, X, Info, LightbulbIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface KeywordMatchProps {
  jobDescription: string;
  resumeText?: string;
  onAddKeywords?: (keywords: string[]) => void;
}

interface KeywordMatchData {
  score: number;
  found: number;
  total: number;
  highPriority: {
    keywords: Array<{ name: string; matched: boolean }>;
    found: number;
    total: number;
  };
  lowPriority: {
    keywords: Array<{ name: string; matched: boolean }>;
    found: number;
    total: number;
  };
}

const KeywordMatch = ({ jobDescription, resumeText, onAddKeywords }: KeywordMatchProps) => {
  const [keywordData, setKeywordData] = useState<KeywordMatchData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeKeywords = () => {
    if (!jobDescription) {
      toast({
        title: "Missing job description",
        description: "Please provide a job description to analyze keywords.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    // This would typically be an API call to analyze the job description
    // For this implementation, we'll simulate results
    setTimeout(() => {
      // Extract common tech/skill keywords from job description
      const extractedKeywords = extractCommonKeywords(jobDescription);
      const highPriorityKeywords = extractedKeywords.slice(0, 11);
      const lowPriorityKeywords = extractedKeywords.slice(11, 20);
      
      // If we have resume text, check which keywords are matched
      const checkMatched = (keyword: string) => {
        if (!resumeText) return Math.random() > 0.6; // Random for demo
        return resumeText.toLowerCase().includes(keyword.toLowerCase());
      };
      
      const highPriority = {
        keywords: highPriorityKeywords.map(k => ({ name: k, matched: checkMatched(k) })),
        found: 0,
        total: highPriorityKeywords.length
      };
      
      const lowPriority = {
        keywords: lowPriorityKeywords.map(k => ({ name: k, matched: checkMatched(k) })),
        found: 0,
        total: lowPriorityKeywords.length
      };
      
      // Count matched keywords
      highPriority.found = highPriority.keywords.filter(k => k.matched).length;
      lowPriority.found = lowPriority.keywords.filter(k => k.matched).length;
      
      const found = highPriority.found + lowPriority.found;
      const total = highPriority.total + lowPriority.total;
      
      // Calculate score (weighted more toward high priority)
      const score = Math.round(
        ((highPriority.found * 1.5) + (lowPriority.found * 0.5)) / 
        ((highPriority.total * 1.5) + (lowPriority.total * 0.5)) * 100
      );
      
      setKeywordData({
        score,
        found,
        total,
        highPriority,
        lowPriority
      });
      
      setIsAnalyzing(false);
    }, 1500);
  };
  
  const extractCommonKeywords = (text: string) => {
    // This would typically be more sophisticated
    // For demo purposes, we'll use a list of common tech skills and check 
    // which ones appear in the job description
    const commonKeywords = [
      "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", 
      "C++", "C#", "SQL", "MongoDB", "PostgreSQL", "AWS", "Azure", 
      "GCP", "Docker", "Kubernetes", "CI/CD", "Agile", "Scrum", 
      "Machine Learning", "Deep Learning", "Data Science", "TensorFlow",
      "PyTorch", "NLP", "Computer Vision", "Swift", "Flutter", "Excel",
      "PowerPoint", "Word", "cloud technologies", "full-stack", "mobile development",
      "mathematics", "compliance", "embedded systems", "iOS"
    ];
    
    // Filter to keywords that appear in the job description
    return commonKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };
  
  const handleAddKeywords = () => {
    if (!keywordData) return;
    
    const missingKeywords = [
      ...keywordData.highPriority.keywords.filter(k => !k.matched).map(k => k.name),
      ...keywordData.lowPriority.keywords.filter(k => !k.matched).map(k => k.name)
    ];
    
    if (onAddKeywords) {
      onAddKeywords(missingKeywords);
    }
    
    toast({
      title: "Keywords added",
      description: `${missingKeywords.length} keywords have been added to your resume optimization list.`,
    });
  };
  
  const getScoreColor = () => {
    if (!keywordData) return "bg-gray-200";
    if (keywordData.score >= 70) return "bg-green-500";
    if (keywordData.score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };
  
  const getMissingCount = () => {
    if (!keywordData) return 0;
    return keywordData.total - keywordData.found;
  };

  return (
    <div className="space-y-4">
      {!keywordData ? (
        <Button 
          onClick={analyzeKeywords}
          disabled={isAnalyzing || !jobDescription}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Analyzing Keywords...
            </>
          ) : (
            "Analyze Keyword Match"
          )}
        </Button>
      ) : (
        <Card className="p-4 border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-500" />
              <h3 className="font-medium">Keyword Match</h3>
              <span className="text-amber-500 font-medium">
                {keywordData.score < 70 ? "Needs Work" : "Good Match"}
              </span>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setKeywordData(null)}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
            <div className="flex justify-between mb-2">
              <div>
                <span>Your resume has </span>
                <span className="font-bold">{keywordData.found} out of {keywordData.total} ({Math.round((keywordData.found/keywordData.total)*100)}%)</span>
                <span> keywords that appear in the job description.</span>
              </div>
              <div className="relative h-8 w-8 rounded-full bg-gray-200">
                <div 
                  className="absolute inset-1 rounded-full flex items-center justify-center"
                  style={{ 
                    background: `conic-gradient(${getScoreColor()} ${keywordData.score}%, transparent 0)` 
                  }}
                >
                  <div className="h-5 w-5 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md text-amber-800 dark:text-amber-300">
              <LightbulbIcon className="h-5 w-5 text-amber-500" />
              <p className="text-sm">
                Try to get your score above <span className="font-bold">70%</span> to increase your chances!
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-1">
                  <h4 className="font-medium">High Priority Keywords</h4>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">These keywords appear frequently in the job description and are likely crucial for passing ATS filters.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {keywordData.highPriority.found}/{keywordData.highPriority.total}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {keywordData.highPriority.keywords.map((keyword, i) => (
                  <Badge 
                    key={i}
                    variant={keyword.matched ? "default" : "outline"}
                    className={keyword.matched ? 
                      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800" :
                      "text-gray-500 border border-gray-300"
                    }
                  >
                    {keyword.matched && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {keyword.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-1">
                  <h4 className="font-medium">Low Priority Keywords</h4>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px] text-xs">These keywords appear less frequently but still relevant to the job description.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {keywordData.lowPriority.found}/{keywordData.lowPriority.total}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {keywordData.lowPriority.keywords.map((keyword, i) => (
                  <Badge 
                    key={i}
                    variant={keyword.matched ? "default" : "outline"}
                    className={keyword.matched ? 
                      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800" :
                      "text-gray-500 border border-gray-300"
                    }
                  >
                    {keyword.matched && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {keyword.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {getMissingCount() > 0 && (
            <Button 
              className="w-full mt-4"
              onClick={handleAddKeywords}
            >
              Add keywords to resume →
            </Button>
          )}
          
          <div className="text-center mt-4">
            <Button variant="link" size="sm" className="text-xs text-muted-foreground">
              <Info className="h-3 w-3 mr-1" />
              Report Keywords
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default KeywordMatch;
