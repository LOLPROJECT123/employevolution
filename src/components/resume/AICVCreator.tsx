
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileTextIcon, DownloadIcon, CopyIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AICVCreator = () => {
  const { toast } = useToast();
  const [workHistory, setWorkHistory] = useState("");
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState("");
  const [researchPublications, setResearchPublications] = useState("");
  const [achievements, setAchievements] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [cvStyle, setCvStyle] = useState("academic");
  const [generatedCV, setGeneratedCV] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate AI generation with a timeout
    setTimeout(() => {
      const sampleCV = `
# Curriculum Vitae

## ${targetRole || "Senior Research Scientist"}

### Professional Experience
${workHistory || "- Lead Researcher, Advanced Technologies Lab (2018-Present)\n- Research Associate, Innovation Institute (2015-2018)"}

### Education
${education || "- Ph.D. in Computer Science, University of Technology (2015)\n- M.Sc. in Artificial Intelligence, University of Science (2012)"}

### Skills & Expertise
${skills || "- Research Methods: Qualitative & Quantitative Analysis\n- Technologies: Machine Learning, Neural Networks\n- Programming: Python, R, MATLAB"}

### Research & Publications
${researchPublications || "- 'Advancements in Neural Network Architectures', Journal of AI Research (2020)\n- 'Deep Learning Applications in Healthcare', International Conference on Medical AI (2019)"}

### Achievements & Awards
${achievements || "- Outstanding Research Award, Technology Association (2021)\n- Research Grant ($250,000), National Science Foundation (2020)"}
      `;
      
      setGeneratedCV(sampleCV);
      setIsGenerating(false);
      
      toast({
        title: "CV Generated",
        description: "Your AI-powered CV has been created successfully.",
      });
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCV);
    toast({
      title: "Copied to clipboard",
      description: "CV content has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI CV Creator</CardTitle>
              <CardDescription>
                Create a comprehensive Curriculum Vitae tailored for academic, research, or professional positions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role</Label>
                <Input 
                  id="targetRole" 
                  placeholder="e.g. Research Scientist, Professor, Senior Developer" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cvStyle">CV Style</Label>
                <Select value={cvStyle} onValueChange={setCvStyle}>
                  <SelectTrigger id="cvStyle">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="research">Research-focused</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workHistory">Work History</Label>
                <Textarea 
                  id="workHistory" 
                  placeholder="Detail your professional experience, roles, and responsibilities" 
                  rows={4}
                  value={workHistory}
                  onChange={(e) => setWorkHistory(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea 
                  id="education" 
                  placeholder="List your degrees, institutions, and academic achievements" 
                  rows={3}
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skills">Skills & Expertise</Label>
                <Textarea 
                  id="skills" 
                  placeholder="List relevant skills, methodologies, and technologies" 
                  rows={3}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="researchPublications">Research & Publications</Label>
                <Textarea 
                  id="researchPublications" 
                  placeholder="List your papers, publications, conferences" 
                  rows={3}
                  value={researchPublications}
                  onChange={(e) => setResearchPublications(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="achievements">Achievements & Awards</Label>
                <Textarea 
                  id="achievements" 
                  placeholder="List notable achievements, grants, awards" 
                  rows={3}
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate CV"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated CV</span>
                {generatedCV && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <CopyIcon className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm">
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto bg-muted/50 rounded-md p-4">
              {generatedCV ? (
                <pre className="whitespace-pre-wrap text-sm">{generatedCV}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <FileTextIcon className="h-16 w-16 mb-4 opacity-30" />
                  <p>Your generated CV will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="bg-accent/20 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-2">CV Writing Best Practices</h3>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>For academic CVs, prioritize education, research, and teaching experience</li>
          <li>Include a comprehensive list of publications, presentations, and grants</li>
          <li>Academic CVs can be longer than standard resumes (3+ pages is acceptable)</li>
          <li>Include relevant professional memberships and committee positions</li>
          <li>Maintain a consistent formatting style throughout the document</li>
          <li>For research positions, highlight methodology expertise and research outputs</li>
        </ul>
      </div>
    </div>
  );
};

export default AICVCreator;
