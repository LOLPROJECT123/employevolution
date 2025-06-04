
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Job } from '@/types/job';
import { User } from '@/types/auth';
import { ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { unifiedSkillsMatchingService } from '@/services/unifiedSkillsMatchingService';

interface JobMatchAnalysisProps {
  job: Job;
  userProfile?: User;
  matchScore: {
    overall: number;
    skills: number;
    experience: boolean;
    education: boolean;
    location: boolean;
    missingSkills: string[];
    matchingSkills: string[];
  };
}

export const JobMatchAnalysis = ({ job, userProfile, matchScore }: JobMatchAnalysisProps) => {
  const [skillsExpanded, setSkillsExpanded] = React.useState(false);
  const [experienceExpanded, setExperienceExpanded] = React.useState(false);
  const [educationExpanded, setEducationExpanded] = React.useState(false);
  const [locationExpanded, setLocationExpanded] = React.useState(false);

  const getMatchColor = (score: number) => {
    return unifiedSkillsMatchingService.getMatchColor(score);
  };

  const getMatchLabel = (score: number) => {
    return unifiedSkillsMatchingService.getMatchLabel(score);
  };

  const getMatchBgColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-4 pb-6">
        {/* Match Score Banner */}
        <Card className={cn("border-2", getMatchBgColor(matchScore.overall))}>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className={cn("text-3xl font-bold", getMatchColor(matchScore.overall))}>
                {matchScore.overall}% {getMatchLabel(matchScore.overall)}
              </div>
              <p className="text-sm text-gray-600">
                Based on your profile, skills, and experience
              </p>
              <div className="mt-4">
                <Progress value={matchScore.overall} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
                <p className="text-lg text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500">{job.location}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500 mr-4">{job.applicantCount || 33} applicants</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Auto Apply
                </Button>
                <Button variant="outline">
                  Save
                </Button>
                <Button variant="outline">
                  View Job
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Salary Range */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Salary Range</h4>
              <p className="text-2xl font-bold">
                ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
              </p>
            </div>

            {/* Description with Scroll */}
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <ScrollArea className="h-32 w-full rounded border p-2">
                <p className="text-gray-700 text-sm leading-relaxed pr-4">{job.description}</p>
              </ScrollArea>
            </div>

            {/* Requirements - Increased height */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <ScrollArea className="h-48 w-full rounded border p-2">
                  <ul className="list-disc list-inside space-y-1 pr-4">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="text-gray-700 text-sm">{req}</li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            )}

            {/* Required Skills */}
            <div>
              <h4 className="font-semibold mb-2">Required Skills ({job.skills?.length || 0} total)</h4>
              <ScrollArea className="h-24 w-full">
                <div className="flex flex-wrap gap-2 pr-4">
                  {job.skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Match Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Match Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-4">Match Score</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Overall Match</span>
                <span className={cn("text-2xl font-bold", getMatchColor(matchScore.overall))}>
                  {matchScore.overall}%
                </span>
              </div>
              <Progress value={matchScore.overall} className="h-2 mb-4" />
              <p className="text-sm text-gray-600">
                You have {matchScore.overall}% of the required skills.
              </p>
            </div>

            {/* Skills Match Collapsible */}
            <Collapsible open={skillsExpanded} onOpenChange={setSkillsExpanded}>
              <CollapsibleTrigger className="w-full">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="font-semibold">Skills Match</span>
                  <div className="flex items-center space-x-2">
                    <span className={cn("font-bold", getMatchColor(matchScore.skills))}>
                      {matchScore.skills}%
                    </span>
                    {skillsExpanded ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border border-gray-200 rounded-lg mt-2">
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-3 pr-4">
                    {matchScore.missingSkills.length > 0 && (
                      <div>
                        <h5 className="font-medium text-red-600 mb-2">Missing Skills ({matchScore.missingSkills.length}):</h5>
                        <div className="flex flex-wrap gap-2">
                          {matchScore.missingSkills.map((skill, index) => (
                            <Badge key={index} variant="destructive" className="bg-red-100 text-red-700">
                              <X className="w-3 h-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {matchScore.matchingSkills.length > 0 && (
                      <div>
                        <h5 className="font-medium text-green-600 mb-2">Matching Skills ({matchScore.matchingSkills.length}):</h5>
                        <div className="flex flex-wrap gap-2">
                          {matchScore.matchingSkills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                              <Check className="w-3 h-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>

            {/* Experience Match */}
            <Collapsible open={experienceExpanded} onOpenChange={setExperienceExpanded}>
              <CollapsibleTrigger className="w-full">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="font-semibold">Experience Match</span>
                  <div className="flex items-center space-x-2">
                    <span className={cn("font-bold", matchScore.experience ? "text-green-600" : "text-red-600")}>
                      {matchScore.experience ? "Yes" : "No"}
                    </span>
                    {experienceExpanded ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border border-gray-200 rounded-lg mt-2">
                <p className="text-sm text-gray-600">
                  Experience match is based on your skills match and profile information.
                </p>
              </CollapsibleContent>
            </Collapsible>

            {/* Education Match */}
            <Collapsible open={educationExpanded} onOpenChange={setEducationExpanded}>
              <CollapsibleTrigger className="w-full">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="font-semibold">Education Match</span>
                  <div className="flex items-center space-x-2">
                    <span className={cn("font-bold", matchScore.education ? "text-green-600" : "text-red-600")}>
                      {matchScore.education ? "Yes" : "No"}
                    </span>
                    {educationExpanded ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border border-gray-200 rounded-lg mt-2">
                <p className="text-sm text-gray-600">
                  Education match is based on your skills match and profile information.
                </p>
              </CollapsibleContent>
            </Collapsible>

            {/* Location Match */}
            <Collapsible open={locationExpanded} onOpenChange={setLocationExpanded}>
              <CollapsibleTrigger className="w-full">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="font-semibold">Location Match</span>
                  <div className="flex items-center space-x-2">
                    <span className={cn("font-bold", matchScore.location ? "text-green-600" : "text-red-600")}>
                      {matchScore.location ? "Yes" : "No"}
                    </span>
                    {locationExpanded ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border border-gray-200 rounded-lg mt-2">
                <p className="text-sm text-gray-600">
                  Location match considers remote work options and your location preferences.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
