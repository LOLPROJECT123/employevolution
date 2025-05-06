import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, AlertCircle, PlusCircle, Star, Info } from "lucide-react";
import { getUserProfile } from "@/utils/profileUtils";

interface JobMatchingAnalyzerProps {
  jobDescription: string;
  onAddToResume?: (skills: string[]) => void;
}

interface MatchResult {
  score: number;
  matches: string[];
  missing: string[];
  education: {
    matches: boolean;
    level: string;
  };
  experience: {
    matches: boolean;
    yearsRequired: number;
    yearsMatched: number;
  };
  skills: {
    critical: {
      matches: string[];
      missing: string[];
      score: number;
    };
    preferred: {
      matches: string[];
      missing: string[];
      score: number;
    };
  };
}

const JobMatchingAnalyzer: React.FC<JobMatchingAnalyzerProps> = ({
  jobDescription,
  onAddToResume
}) => {
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  
  const analyzeMatch = () => {
    if (!jobDescription) {
      toast.error("No job description provided");
      return;
    }
    
    setAnalyzing(true);
    
    // In a real app, this would call an API
    // For now, we'll simulate analysis
    setTimeout(() => {
      const userProfile = getUserProfile();
      
      // Extract skills from job description (simplified)
      const extractedSkills = extractSkillsFromDescription(jobDescription);
      
      // Generate mock analysis results
      const mockResult = generateMockAnalysis(userProfile, extractedSkills);
      
      setResult(mockResult);
      setAnalyzing(false);
    }, 1500);
  };
  
  const extractSkillsFromDescription = (description: string): string[] => {
    // In a real app, this would use NLP/ML to extract skills
    // For now, use a simplified approach with common tech skills
    const commonSkills = [
      "React", "JavaScript", "TypeScript", "Node.js", "Python", "Java",
      "C#", "Azure", "AWS", "Docker", "Kubernetes", "SQL", "MongoDB",
      "PostgreSQL", "CI/CD", "Git", "Agile", "Scrum", "REST API",
      "GraphQL", "Redux", "Vue.js", "Angular", "Express", "Django",
      "Flask", "Spring Boot", "Cloud", "DevOps", "HTML", "CSS", "SASS"
    ];
    
    return commonSkills.filter(skill => 
      description.toLowerCase().includes(skill.toLowerCase())
    );
  };
  
  const generateMockAnalysis = (userProfile: any, jobSkills: string[]): MatchResult => {
    // Get user skills
    const userSkills = userProfile?.skills || [];
    
    // Divide job skills into critical and preferred
    const critical = jobSkills.slice(0, Math.ceil(jobSkills.length * 0.6));
    const preferred = jobSkills.slice(Math.ceil(jobSkills.length * 0.6));
    
    // Calculate matches
    const criticalMatches = critical.filter(skill => 
      userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
    );
    
    const preferredMatches = preferred.filter(skill => 
      userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase())
    );
    
    // Calculate scores
    const criticalScore = critical.length ? (criticalMatches.length / critical.length) * 100 : 100;
    const preferredScore = preferred.length ? (preferredMatches.length / preferred.length) * 100 : 100;
    
    // Overall score (weighted more heavily toward critical skills)
    const overallScore = Math.round((criticalScore * 0.7) + (preferredScore * 0.3));
    
    // Experience analysis
    const userExperience = calculateYearsOfExperience(userProfile);
    const requiredExperience = Math.floor(Math.random() * 5) + 1; // 1-5 years required (mock)
    
    // Education analysis
    const userEducation = getHighestEducation(userProfile);
    const mockEducationMatch = Math.random() > 0.3; // 70% chance of matching education
    
    return {
      score: overallScore,
      matches: [...criticalMatches, ...preferredMatches],
      missing: [
        ...critical.filter(s => !criticalMatches.includes(s)),
        ...preferred.filter(s => !preferredMatches.includes(s))
      ],
      education: {
        matches: mockEducationMatch,
        level: userEducation
      },
      experience: {
        matches: userExperience >= requiredExperience,
        yearsRequired: requiredExperience,
        yearsMatched: userExperience
      },
      skills: {
        critical: {
          matches: criticalMatches,
          missing: critical.filter(s => !criticalMatches.includes(s)),
          score: criticalScore
        },
        preferred: {
          matches: preferredMatches,
          missing: preferred.filter(s => !preferredMatches.includes(s)),
          score: preferredScore
        }
      }
    };
  };
  
  const calculateYearsOfExperience = (profile: any): number => {
    if (!profile?.experience?.length) return 0;
    
    let totalMonths = 0;
    profile.experience.forEach((exp: any) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.current ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth());
      
      totalMonths += Math.max(0, months);
    });
    
    return Math.round((totalMonths / 12) * 10) / 10; // Years with one decimal place
  };
  
  const getHighestEducation = (profile: any): string => {
    if (!profile?.education?.length) return 'None';
    
    const degrees = profile.education.map((edu: any) => edu.degree || '').filter(Boolean);
    
    if (degrees.some((d: string) => d.toLowerCase().includes('phd') || d.toLowerCase().includes('doctor'))) {
      return 'PhD';
    }
    
    if (degrees.some((d: string) => d.toLowerCase().includes('master'))) {
      return 'Master\'s';
    }
    
    if (degrees.some((d: string) => d.toLowerCase().includes('bachelor'))) {
      return 'Bachelor\'s';
    }
    
    if (degrees.some((d: string) => d.toLowerCase().includes('associate'))) {
      return 'Associate\'s';
    }
    
    return 'Other';
  };
  
  const handleAddToResume = () => {
    if (result && result.missing.length && onAddToResume) {
      onAddToResume(result.missing);
      toast.success(`Added ${result.missing.length} skills to your resume optimization list`);
    }
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };
  
  const getScoreBackgroundColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };
  
  return (
    <div className="space-y-4">
      {!result ? (
        <Button
          onClick={analyzeMatch}
          disabled={analyzing || !jobDescription}
          className="w-full"
        >
          {analyzing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Analyzing Matching...
            </>
          ) : (
            "Analyze Match with Your Profile"
          )}
        </Button>
      ) : (
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Match Analysis</h3>
              <Badge variant={result.score >= 70 ? "default" : "secondary"} className={result.score >= 70 ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400"}>
                {result.score >= 70 ? "Good Match" : "Needs Improvement"}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-lg font-bold ${getScoreColor(result.score)}`}>{result.score}%</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">match</span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Match Score</span>
              <span>{result.score}%</span>
            </div>
            <Progress 
              value={result.score} 
              className={`h-2 ${getScoreColor(result.score)}`} 
            />
          </div>
          
          <div className="space-y-4">
            {/* Critical Skills Section */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500" />
                Critical Skills ({Math.round(result.skills.critical.score)}% match)
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {result.skills.critical.matches.map((skill, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" /> {skill}
                  </Badge>
                ))}
                
                {result.skills.critical.missing.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-red-600 border border-red-200 dark:border-red-900 dark:text-red-400">
                    <AlertCircle className="h-3 w-3 mr-1" /> {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Preferred Skills Section */}
            <div>
              <h4 className="text-sm font-medium mb-2">
                Preferred Skills ({Math.round(result.skills.preferred.score)}% match)
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {result.skills.preferred.matches.map((skill, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" /> {skill}
                  </Badge>
                ))}
                
                {result.skills.preferred.missing.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-gray-600 border border-gray-200 dark:border-gray-700 dark:text-gray-400">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Experience & Education Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Experience</div>
                <div className="flex items-center">
                  {result.experience.matches ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  )}
                  <span>
                    {result.experience.yearsMatched} yr{result.experience.yearsMatched !== 1 ? 's' : ''} / {result.experience.yearsRequired} yr{result.experience.yearsRequired !== 1 ? 's' : ''} required
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Education</div>
                <div className="flex items-center">
                  {result.education.matches ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  )}
                  <span>{result.education.level}</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Actions Section */}
            {result.missing.length > 0 && (
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Info className="h-4 w-4 mr-1" />
                  <span>{result.missing.length} skills missing from your profile</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900 dark:hover:bg-blue-900/20"
                  onClick={handleAddToResume}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  Add to Resume
                </Button>
              </div>
            )}
            
            <div className="text-center">
              <Button variant="link" size="sm" className="text-xs text-muted-foreground" onClick={() => setResult(null)}>
                Re-analyze
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default JobMatchingAnalyzer;
