
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResumeJobMatchIndicator } from '@/components/ResumeJobMatchIndicator';
import { getUserProfile } from '@/utils/profileUtils';
import { Plus, AlertCircle } from 'lucide-react';

interface JobMatchingAnalyzerProps {
  jobDescription: string;
  onAddToResume?: (skills: string[]) => void;
}

const JobMatchingAnalyzer: React.FC<JobMatchingAnalyzerProps> = ({ 
  jobDescription,
  onAddToResume
}) => {
  const [matchPercentage, setMatchPercentage] = useState<number>(0);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  
  useEffect(() => {
    const analyzeJob = () => {
      // In a real app, this would use NLP to extract skills from job description
      const extractedSkills = extractSkillsFromText(jobDescription);
      
      // Get user's skills from profile
      const userProfile = getUserProfile();
      const userSkills = userProfile.skills.map(skill => skill.toLowerCase());
      
      // Find missing and matched skills
      const missing = extractedSkills.filter(skill => !userSkills.includes(skill.toLowerCase()));
      const matched = extractedSkills.filter(skill => userSkills.includes(skill.toLowerCase()));
      
      setMissingSkills(missing);
      setMatchedSkills(matched);
      
      // Calculate match percentage
      const matchPercent = extractedSkills.length > 0
        ? Math.round((matched.length / extractedSkills.length) * 100)
        : 50; // Default if no skills extracted
        
      setMatchPercentage(matchPercent);
    };
    
    analyzeJob();
  }, [jobDescription]);
  
  const handleAddSkills = () => {
    if (onAddToResume && missingSkills.length > 0) {
      onAddToResume(missingSkills);
    }
  };
  
  // Simple skill extraction function (would be more sophisticated in a real app)
  const extractSkillsFromText = (text: string): string[] => {
    const commonTechSkills = [
      'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'python', 'java',
      'html', 'css', 'sass', 'less', 'redux', 'graphql', 'rest api', 'docker',
      'kubernetes', 'aws', 'azure', 'gcp', 'sql', 'nosql', 'mongodb', 'postgres',
      'mysql', 'git', 'ci/cd', 'jenkins', 'github actions', 'jira', 'agile', 'scrum'
    ];
    
    // Convert text to lowercase for case-insensitive matching
    const lowerText = text.toLowerCase();
    
    // Find skills in the text
    return commonTechSkills.filter(skill => lowerText.includes(skill));
  };
  
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <ResumeJobMatchIndicator matchPercentage={matchPercentage} />
        
        {matchedSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Matched Skills</h4>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {missingSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Missing Skills</h4>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  {skill}
                </Badge>
              ))}
            </div>
            
            {onAddToResume && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={handleAddSkills}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Missing Skills to Profile
              </Button>
            )}
          </div>
        )}
        
        {matchedSkills.length === 0 && missingSkills.length === 0 && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>No specific skills detected in the job description.</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default JobMatchingAnalyzer;
