
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, BarChart, Check, AlertCircle, FileType, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import KeywordMatch from "./KeywordMatch";

const ATSOptimizer = () => {
  const [activeTab, setActiveTab] = useState<"resume" | "coverLetter">("resume");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [optimizationTips, setOptimizationTips] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Read file content for keyword matching
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setResumeText(event.target.result);
        }
      };
      reader.readAsText(selectedFile);
      
      toast({
        title: "File uploaded",
        description: `Your ${activeTab === "resume" ? "resume" : "cover letter"} has been uploaded successfully.`,
      });
    }
  };

  const analyzeDocument = () => {
    if (!file || !jobDescription) {
      toast({
        title: "Missing information",
        description: "Please upload a file and provide a job description.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    // Simulate API call for analysis
    setTimeout(() => {
      // Simulate analysis results
      const simulatedScore = Math.floor(Math.random() * 41) + 60; // 60-100
      setMatchScore(simulatedScore);
      
      const mockTips = [
        "Add more quantifiable achievements with metrics",
        "Match keywords more closely with the job description",
        "Use industry-specific terminology to pass ATS filters",
        "Structure your sections to highlight relevant experience first",
        "Use a clean, ATS-friendly format without complex tables or graphics"
      ];
      
      const mockMissingKeywords = [
        "project management",
        "agile methodology",
        "cross-functional teams",
        "data analysis",
        "strategic planning"
      ];
      
      setOptimizationTips(mockTips.slice(0, Math.floor(Math.random() * 3) + 3));
      setMissingKeywords(mockMissingKeywords.slice(0, Math.floor(Math.random() * 4) + 2));
      
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      
      toast({
        title: "Analysis Complete",
        description: `Your ${activeTab === "resume" ? "resume" : "cover letter"} has been analyzed against the job description.`,
      });
    }, 3000);
  };

  const getScoreColor = () => {
    if (matchScore >= 85) return "text-green-500";
    if (matchScore >= 70) return "text-amber-500";
    return "text-red-500";
  };

  const getProgressColor = () => {
    if (matchScore >= 85) return "bg-green-500";
    if (matchScore >= 70) return "bg-amber-500";
    return "bg-red-500";
  };
  
  const handleAddKeywords = (keywords: string[]) => {
    setMissingKeywords([...new Set([...missingKeywords, ...keywords])]);
    
    toast({
      title: "Keywords added",
      description: `${keywords.length} keywords have been added to your optimization list.`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ATS Optimization Tool</CardTitle>
        <CardDescription>
          Upload your resume or cover letter to check its compatibility with ATS systems and get optimization tips
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resume" onValueChange={(value) => setActiveTab(value as "resume" | "coverLetter")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="coverLetter">Cover Letter</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resume" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Upload Your Resume</h3>
              <div className="flex items-center space-x-2">
                <label 
                  htmlFor="resume-upload" 
                  className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-secondary/50"
                >
                  {file && activeTab === "resume" ? (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-6 w-6 text-primary" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Drop your resume here or click to browse</span>
                    </div>
                  )}
                </label>
                <Input 
                  id="resume-upload" 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  className="sr-only"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Job Description</h3>
              <Textarea 
                placeholder="Paste the job description here to analyze compatibility..." 
                className="min-h-[150px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This helps our system identify key requirements and skills to match against your resume.
              </p>
            </div>
            
            {/* Add Keyword Match component */}
            {file && jobDescription && (
              <div className="space-y-2">
                <KeywordMatch 
                  jobDescription={jobDescription}
                  resumeText={resumeText}
                  onAddKeywords={handleAddKeywords}
                />
              </div>
            )}
            
            <Button 
              className="w-full"
              onClick={analyzeDocument}
              disabled={isAnalyzing || !file || !jobDescription}
            >
              {isAnalyzing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Analyzing Your Resume...
                </>
              ) : (
                <>
                  <BarChart className="mr-2 h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="coverLetter" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Upload Your Cover Letter</h3>
              <div className="flex items-center space-x-2">
                <label 
                  htmlFor="cover-letter-upload" 
                  className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer hover:bg-secondary/50"
                >
                  {file && activeTab === "coverLetter" ? (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-6 w-6 text-primary" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Drop your cover letter here or click to browse</span>
                    </div>
                  )}
                </label>
                <Input 
                  id="cover-letter-upload" 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  className="sr-only"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Job Description</h3>
              <Textarea 
                placeholder="Paste the job description here to analyze compatibility..." 
                className="min-h-[150px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This helps our system identify key requirements to enhance your cover letter.
              </p>
            </div>
            
            {/* Add Keyword Match component for cover letters too */}
            {file && jobDescription && activeTab === "coverLetter" && (
              <div className="space-y-2">
                <KeywordMatch 
                  jobDescription={jobDescription}
                  resumeText={resumeText}
                  onAddKeywords={handleAddKeywords}
                />
              </div>
            )}
            
            <Button 
              className="w-full"
              onClick={analyzeDocument}
              disabled={isAnalyzing || !file || !jobDescription}
            >
              {isAnalyzing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Analyzing Your Cover Letter...
                </>
              ) : (
                <>
                  <BarChart className="mr-2 h-4 w-4" />
                  Analyze Cover Letter
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
        
        {analysisComplete && (
          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">ATS Compatibility Score</h3>
                <span className={`text-2xl font-bold ${getScoreColor()}`}>{matchScore}%</span>
              </div>
              <Progress value={matchScore} className={`h-2 ${getProgressColor()}`} />
              <p className="text-sm text-muted-foreground">
                {matchScore >= 85 
                  ? "Great job! Your document is well-optimized for ATS systems." 
                  : matchScore >= 70 
                    ? "Your document is moderately optimized. Make some improvements to increase your chances." 
                    : "Your document needs improvement to pass ATS filters."}
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">Optimization Tips</h3>
              <ul className="space-y-2">
                {optimizationTips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">Missing Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {keyword}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Consider adding these keywords to your {activeTab === "resume" ? "resume" : "cover letter"} to improve ATS compatibility.
              </p>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-secondary/20">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Pro Tips</h4>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <FileType className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Use standard section headings like "Experience", "Education", and "Skills".</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FileType className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Incorporate exact keywords and phrases from the job description.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FileType className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Use a simple, clean format without tables, headers, or footers.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        {analysisComplete && (
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button className="w-full">
              Download Optimized Version
            </Button>
            <Button variant="outline" className="w-full" onClick={() => {
              setFile(null);
              setJobDescription("");
              setAnalysisComplete(false);
              setMatchScore(0);
              setOptimizationTips([]);
              setMissingKeywords([]);
              setResumeText("");
            }}>
              Start New Analysis
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ATSOptimizer;
