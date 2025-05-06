
/**
 * JobMatchingDemo - Component to demonstrate the job matching functionality
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumeJobMatchIndicator } from "@/components/ResumeJobMatchIndicator";
import { Job } from "@/types/job";
import { calculateJobMatch, addMatchPercentageToJob } from "@/utils/jobMatching";
import { getParsedResumeFromProfile } from "@/utils/profileUtils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface JobMatchingDemoProps {
  job?: Job;
}

export function JobMatchingDemo({ job }: JobMatchingDemoProps) {
  const [jobDescription, setJobDescription] = useState<string>(job?.description || '');
  const [jobSkills, setJobSkills] = useState<string>(job?.skills?.join(', ') || '');
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // If job prop changes, update state
  useEffect(() => {
    if (job) {
      setJobDescription(job.description || '');
      setJobSkills(job.skills?.join(', ') || '');
    }
  }, [job]);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    
    // Create a sample job object from the input
    const testJob: Job = {
      id: 'test-job',
      title: job?.title || 'Test Job',
      company: job?.company || 'Test Company',
      location: job?.location || 'Remote',
      description: jobDescription,
      skills: jobSkills.split(',').map(skill => skill.trim()).filter(Boolean),
      type: job?.type || 'full-time',
      level: job?.level || 'mid',
      requirements: [],
      postedAt: new Date().toISOString(),
      salary: job?.salary || {
        min: 80000,
        max: 120000,
        currency: '$'
      }
    };
    
    // Get resume from profile
    const resume = getParsedResumeFromProfile();
    
    // Calculate match
    try {
      setTimeout(() => {
        const jobWithMatch = addMatchPercentageToJob(testJob, resume);
        setMatchResult(jobWithMatch);
        setIsAnalyzing(false);
      }, 1000);
    } catch (error) {
      console.error('Error analyzing job match:', error);
      toast.error('Error analyzing job match');
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Job-Resume Matching</CardTitle>
        <CardDescription>
          See how well your resume matches the job requirements
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Enter or paste job description here"
              rows={5}
              className="resize-none"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobSkills">Required Skills (comma separated)</Label>
            <Input
              id="jobSkills"
              placeholder="React, JavaScript, TypeScript, HTML, CSS"
              value={jobSkills}
              onChange={(e) => setJobSkills(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleAnalyze} 
            className="w-full"
            disabled={isAnalyzing || (!jobDescription && !jobSkills)}
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                Analyzing Match...
              </>
            ) : (
              'Analyze Match with My Resume'
            )}
          </Button>
          
          {matchResult && (
            <div className="pt-4 space-y-4">
              <Separator />
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-lg mb-2">Match Score</h3>
                <ResumeJobMatchIndicator 
                  matchPercentage={matchResult.matchPercentage || 0} 
                  size="lg"
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Matched Skills</h3>
                <ScrollArea className="h-32 border rounded-md p-2">
                  <div className="space-y-2">
                    {matchResult.matchDetails?.skillMatches?.length ? (
                      matchResult.matchDetails.skillMatches.map((match: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            {match.matched ? (
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                            )}
                            <span>{match.jobSkill}</span>
                          </div>
                          <Badge variant={match.matched ? "default" : "outline"}>
                            {match.matched ? 'Matched' : 'Missing'}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">No skills to match</div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              
              {matchResult.matchDetails?.missingSkills?.length > 0 && (
                <div>
                  <h3 className="font-medium">Suggested Skills to Add</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {matchResult.matchDetails.missingSkills.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <Pencil className="h-3 w-3" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-500">Technical Skills</div>
                  <div className="text-lg font-medium">
                    {matchResult.matchDetails?.technicalSkillsScore || 0}%
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-500">Experience</div>
                  <div className="text-lg font-medium">
                    {matchResult.matchDetails?.experienceScore || 0}%
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-500">Education</div>
                  <div className="text-lg font-medium">
                    {matchResult.matchDetails?.educationScore || 0}%
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-500">Soft Skills</div>
                  <div className="text-lg font-medium">
                    {matchResult.matchDetails?.softSkillsScore || 0}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
