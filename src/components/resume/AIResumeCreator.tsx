
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { FileTextIcon, DownloadIcon, CopyIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIResumeCreator = () => {
  const { toast } = useToast();
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [skills, setSkills] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [generatedResume, setGeneratedResume] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate AI generation with a timeout
    setTimeout(() => {
      const sampleResume = `
# ${jobTitle || "Software Engineer"}

## Professional Experience
${experience || "- Senior Developer at TechCorp (2018-Present)\n- Software Engineer at InnovateTech (2015-2018)"}

## Education
${education || "- Bachelor of Science in Computer Science, University of Technology (2015)"}

## Skills
${skills || "- Programming Languages: JavaScript, TypeScript, Python\n- Frameworks: React, Node.js, Express\n- Tools: Git, Docker, AWS"}
      `;
      
      setGeneratedResume(sampleResume);
      setIsGenerating(false);
      
      toast({
        title: "Resume Generated",
        description: "Your AI-powered resume has been created successfully.",
      });
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResume);
    toast({
      title: "Copied to clipboard",
      description: "Resume content has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Resume Creator</CardTitle>
              <CardDescription>
                Fill in the details below and our AI will generate a professional resume tailored to your experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Target Job Title</Label>
                <Input 
                  id="jobTitle" 
                  placeholder="e.g. Software Engineer, Product Manager" 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Professional Experience</Label>
                <Textarea 
                  id="experience" 
                  placeholder="List your work experience, roles, and achievements" 
                  rows={5}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea 
                  id="education" 
                  placeholder="List your degrees, institutions, and graduation dates" 
                  rows={3}
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea 
                  id="skills" 
                  placeholder="List your technical skills, tools, and technologies" 
                  rows={3}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Resume"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Resume</span>
                {generatedResume && (
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
              {generatedResume ? (
                <pre className="whitespace-pre-wrap text-sm">{generatedResume}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <FileTextIcon className="h-16 w-16 mb-4 opacity-30" />
                  <p>Your generated resume will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="bg-accent/20 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-2">Resume Writing Tips</h3>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li>Tailor your resume for each job application</li>
          <li>Quantify your achievements with numbers when possible</li>
          <li>Keep your resume to 1-2 pages maximum</li>
          <li>Use action verbs to describe your responsibilities</li>
          <li>Proofread carefully for spelling and grammar errors</li>
          <li>Include keywords from the job description to pass ATS scans</li>
        </ul>
      </div>
    </div>
  );
};

export default AIResumeCreator;
