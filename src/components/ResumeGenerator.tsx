
import { useState } from "react";
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Download, Copy, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { extractSkillsFromDescription } from "@/utils/jobApplicationUtils";

interface ResumeGeneratorProps {
  job: Job;
  userProfile?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    skills?: string[];
    experience?: Array<{title: string; company: string; duration: string; description: string}>;
  };
}

export function ResumeGenerator({ job, userProfile }: ResumeGeneratorProps) {
  const [activeTab, setActiveTab] = useState<string>("resume");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeContent, setResumeContent] = useState("");
  const [coverLetterContent, setCoverLetterContent] = useState("");
  const [copied, setCopied] = useState(false);

  // Function to generate resume tailored to the job
  const generateResume = () => {
    setIsGenerating(true);
    
    // Extract key skills from job description
    const jobSkills = extractSkillsFromDescription(job.description);
    
    // In a real implementation, this would call an AI service
    setTimeout(() => {
      const generatedResume = generateResumeTemplate(job, userProfile, jobSkills);
      setResumeContent(generatedResume);
      setIsGenerating(false);
      
      toast({
        title: "Resume Generated",
        description: "Your tailored resume has been created based on the job description",
      });
    }, 2000);
  };
  
  // Function to generate cover letter tailored to the job
  const generateCoverLetter = () => {
    setIsGenerating(true);
    
    // In a real implementation, this would call an AI service
    setTimeout(() => {
      const generatedCoverLetter = generateCoverLetterTemplate(job, userProfile);
      setCoverLetterContent(generatedCoverLetter);
      setIsGenerating(false);
      
      toast({
        title: "Cover Letter Generated",
        description: "Your personalized cover letter has been created based on the job description",
      });
    }, 2000);
  };
  
  // Function to handle copy to clipboard
  const handleCopy = () => {
    const contentToCopy = activeTab === "resume" ? resumeContent : coverLetterContent;
    
    navigator.clipboard.writeText(contentToCopy).then(() => {
      setCopied(true);
      
      toast({
        title: "Copied to clipboard",
        description: activeTab === "resume" 
          ? "Resume content copied to clipboard" 
          : "Cover letter content copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Function to handle download
  const handleDownload = () => {
    const contentToDownload = activeTab === "resume" ? resumeContent : coverLetterContent;
    const filename = activeTab === "resume" 
      ? `Resume_${job.title.replace(/\s+/g, '_')}.txt`
      : `CoverLetter_${job.title.replace(/\s+/g, '_')}.txt`;
    
    const blob = new Blob([contentToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Downloaded",
      description: `${activeTab === "resume" ? "Resume" : "Cover Letter"} downloaded as ${filename}`,
    });
  };
  
  // Switch between resume and cover letter tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    if (value === "resume" && !resumeContent) {
      generateResume();
    } else if (value === "coverLetter" && !coverLetterContent) {
      generateCoverLetter();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Application Document Generator</CardTitle>
        <CardDescription>
          Create tailored resume and cover letters for {job.title} at {job.company}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="coverLetter">Cover Letter</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resume" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Tailored Resume</h3>
              
              <div className="flex gap-2">
                <Badge variant="outline">ATS-Optimized</Badge>
                <Badge variant="outline">Job-Targeted</Badge>
              </div>
            </div>
            
            {!resumeContent ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Creating your tailored resume...
                    </p>
                  </>
                ) : (
                  <Button onClick={generateResume} disabled={isGenerating}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Resume
                  </Button>
                )}
              </div>
            ) : (
              <Textarea 
                className="min-h-[300px] font-mono text-sm" 
                value={resumeContent}
                onChange={(e) => setResumeContent(e.target.value)}
              />
            )}
          </TabsContent>
          
          <TabsContent value="coverLetter" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Personalized Cover Letter</h3>
              
              <div className="flex gap-2">
                <Badge variant="outline">Customized</Badge>
                <Badge variant="outline">Professional</Badge>
              </div>
            </div>
            
            {!coverLetterContent ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Creating your cover letter...
                    </p>
                  </>
                ) : (
                  <Button onClick={generateCoverLetter} disabled={isGenerating}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Cover Letter
                  </Button>
                )}
              </div>
            ) : (
              <Textarea 
                className="min-h-[300px] font-mono text-sm" 
                value={coverLetterContent}
                onChange={(e) => setCoverLetterContent(e.target.value)}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={activeTab === "resume" ? generateResume : generateCoverLetter}
          disabled={isGenerating}
        >
          <FileText className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={isGenerating || (!resumeContent && !coverLetterContent)}
          >
            {copied ? (
              <CheckCircle className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copy
          </Button>
          
          <Button
            onClick={handleDownload}
            disabled={isGenerating || (!resumeContent && !coverLetterContent)}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Template generator functions
function generateResumeTemplate(
  job: Job, 
  userProfile?: ResumeGeneratorProps['userProfile'],
  jobSkills?: string[]
): string {
  const name = userProfile?.name || "YOUR NAME";
  const email = userProfile?.email || "your.email@example.com";
  const phone = userProfile?.phone || "555-555-5555";
  const location = userProfile?.location || "City, State";
  const skills = userProfile?.skills || [];
  
  // Prioritize skills that match the job
  const prioritizedSkills = [...skills].sort((a, b) => {
    const aInJob = jobSkills?.includes(a) ? 1 : 0;
    const bInJob = jobSkills?.includes(b) ? 1 : 0;
    return bInJob - aInJob;
  });
  
  // Create a simple resume template
  return `${name}
${email} | ${phone} | ${location}

PROFESSIONAL SUMMARY
Experienced professional with a strong background in ${job.category || job.title}. Skilled in ${
    prioritizedSkills.slice(0, 3).join(', ')}${
    prioritizedSkills.length > 3 ? `, and ${prioritizedSkills.length - 3} more skills` : ''
  }. Seeking a ${job.level} position as a ${job.title} at ${job.company}.

EXPERIENCE
${userProfile?.experience?.map(exp => 
  `${exp.title} | ${exp.company} | ${exp.duration}
${exp.description}
`).join('\n') || "[Your relevant experience here]"}

EDUCATION
[Your relevant education here]

SKILLS
${prioritizedSkills.join(', ')}

CERTIFICATIONS
[Your relevant certifications here]
`;
}

function generateCoverLetterTemplate(
  job: Job, 
  userProfile?: ResumeGeneratorProps['userProfile']
): string {
  const name = userProfile?.name || "YOUR NAME";
  const email = userProfile?.email || "your.email@example.com";
  const phone = userProfile?.phone || "555-555-5555";
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create a simple cover letter template
  return `${currentDate}

${name}
${email}
${phone}

Hiring Manager
${job.company}
${job.location}

RE: Application for ${job.title} Position

Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}. With my background in ${job.category || job.title} and passion for ${job.company}'s mission, I believe I would be a valuable addition to your team.

The job description mentions the need for skills in ${job.skills?.slice(0, 3).join(', ') || "[specific skills]"}, which align well with my experience. In my previous roles, I have successfully [your relevant achievements that match the job requirements].

I am particularly drawn to ${job.company} because of [something specific about the company that interests you]. I am confident that my skills in ${userProfile?.skills?.slice(0, 3).join(', ') || "[your key skills]"} make me well-suited to contribute to your team's success.

I look forward to the opportunity to discuss how my background, skills, and experience would be beneficial for the ${job.title} position. Thank you for your time and consideration.

Sincerely,

${name}
`;
}
