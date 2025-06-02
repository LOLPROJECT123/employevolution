
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { AdvancedProfileService } from '@/services/advancedProfileService';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  BookOpen,
  Award
} from 'lucide-react';

export const EnhancedProfileValidation: React.FC = () => {
  const { user } = useAuth();
  const [validation, setValidation] = useState<any>(null);
  const [skillGaps, setSkillGaps] = useState<any>(null);
  const [careerRecs, setCareerRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileAnalysis();
    }
  }, [user]);

  const loadProfileAnalysis = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [validationResult, skillGapResult, careerResult] = await Promise.all([
        AdvancedProfileService.validateProfileWithAI(user.id),
        AdvancedProfileService.analyzeSkillGaps(user.id, 'software engineer'),
        AdvancedProfileService.generateCareerRecommendations(user.id)
      ]);

      setValidation(validationResult);
      setSkillGaps(skillGapResult);
      setCareerRecs(careerResult);
    } catch (error) {
      console.error('Profile analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading profile analysis...</div>;
  }

  return (
    <div className="space-y-6">
      {/* AI Profile Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>AI Profile Score</span>
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your profile strength
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={validation?.score || 0} className="h-3" />
            </div>
            <span className="text-2xl font-bold text-primary">
              {validation?.score || 0}%
            </span>
          </div>
          
          {validation?.strengths && validation.strengths.length > 0 && (
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {validation.strengths.map((strength: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {validation?.suggestions && validation.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">Improvement Suggestions</h4>
              <div className="space-y-2">
                {validation.suggestions.map((suggestion: string, index: number) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{suggestion}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skill Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Skill Gap Analysis</span>
          </CardTitle>
          <CardDescription>
            Identify skills to boost your career prospects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">Missing Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skillGaps?.missingSkills?.map((skill: string, index: number) => (
                  <Badge key={index} variant="destructive">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Recommended Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skillGaps?.recommendedSkills?.map((skill: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Current Skill Level</h4>
            <Badge variant="secondary" className="text-lg">
              {skillGaps?.skillLevel || 'Unknown'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Career Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Career Recommendations</span>
          </CardTitle>
          <CardDescription>
            AI-suggested career paths based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerRecs.map((rec, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{rec.jobTitle}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span className="text-sm font-medium">{rec.matchPercentage}% Match</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Salary Range</p>
                    <p className="text-lg font-bold text-green-600">
                      ${rec.salaryRange.min.toLocaleString()} - ${rec.salaryRange.max.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.requiredSkills.slice(0, 3).map((skill: string, skillIndex: number) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Growth Potential:</span> {rec.growthPotential}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={loadProfileAnalysis} disabled={loading}>
          {loading ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>
    </div>
  );
};
