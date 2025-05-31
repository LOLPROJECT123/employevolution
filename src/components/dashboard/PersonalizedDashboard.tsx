
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight,
  Briefcase,
  Star,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Job } from '@/types/job';

interface CareerRecommendation {
  id: string;
  title: string;
  type: 'job_match' | 'skill_development' | 'career_path' | 'industry_trend';
  priority: 'high' | 'medium' | 'low';
  description: string;
  actionItems: string[];
  matchPercentage?: number;
  relatedJobs?: Job[];
  timeToAchieve?: string;
}

interface SkillGap {
  skill: string;
  importance: 'critical' | 'important' | 'nice-to-have';
  demandGrowth: number;
  learningResources: string[];
  jobsRequiring: number;
}

const PersonalizedDashboard = () => {
  const { user, userProfile } = useAuth();
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userProfile) {
      generateRecommendations();
      analyzeSkillGaps();
    }
  }, [user, userProfile]);

  const generateRecommendations = async () => {
    // Mock AI-powered recommendations based on user profile
    const mockRecommendations: CareerRecommendation[] = [
      {
        id: '1',
        title: 'High-Match Frontend Developer Roles',
        type: 'job_match',
        priority: 'high',
        description: 'Found 15 jobs with 85%+ skill match in your preferred location',
        actionItems: [
          'Update your portfolio with recent projects',
          'Practice system design interviews',
          'Apply within the next 2 weeks for best results'
        ],
        matchPercentage: 87,
        timeToAchieve: '2-4 weeks'
      },
      {
        id: '2',
        title: 'Learn TypeScript for Better Opportunities',
        type: 'skill_development',
        priority: 'high',
        description: 'TypeScript appears in 78% of jobs you\'re interested in but missing from your profile',
        actionItems: [
          'Complete TypeScript fundamentals course',
          'Build a project using TypeScript',
          'Add TypeScript to your resume and LinkedIn'
        ],
        timeToAchieve: '4-6 weeks'
      },
      {
        id: '3',
        title: 'Senior Developer Career Path',
        type: 'career_path',
        priority: 'medium',
        description: 'Based on your experience, you\'re ready to target senior-level positions',
        actionItems: [
          'Highlight leadership experience in applications',
          'Prepare for system architecture questions',
          'Consider mentoring junior developers'
        ],
        timeToAchieve: '6-12 months'
      },
      {
        id: '4',
        title: 'Remote Work Trends in Tech',
        type: 'industry_trend',
        priority: 'low',
        description: 'Remote positions in your field increased by 34% this quarter',
        actionItems: [
          'Optimize your home office setup',
          'Highlight remote work experience',
          'Consider companies with remote-first culture'
        ],
        timeToAchieve: 'Immediate'
      }
    ];

    setRecommendations(mockRecommendations);
  };

  const analyzeSkillGaps = async () => {
    // Mock skill gap analysis
    const mockSkillGaps: SkillGap[] = [
      {
        skill: 'TypeScript',
        importance: 'critical',
        demandGrowth: 45,
        learningResources: ['TypeScript Handbook', 'Udemy Course', 'freeCodeCamp'],
        jobsRequiring: 156
      },
      {
        skill: 'Docker',
        importance: 'important',
        demandGrowth: 32,
        learningResources: ['Docker Official Tutorial', 'Kubernetes Course'],
        jobsRequiring: 89
      },
      {
        skill: 'GraphQL',
        importance: 'nice-to-have',
        demandGrowth: 28,
        learningResources: ['Apollo GraphQL Tutorial', 'The Road to GraphQL'],
        jobsRequiring: 43
      }
    ];

    setSkillGaps(mockSkillGaps);
    setLoading(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-orange-100 text-orange-800';
      case 'nice-to-have': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'job_match': return <Briefcase className="h-5 w-5" />;
      case 'skill_development': return <BookOpen className="h-5 w-5" />;
      case 'career_path': return <TrendingUp className="h-5 w-5" />;
      case 'industry_trend': return <Users className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Career Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Your Career Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">87%</div>
              <div className="text-sm text-muted-foreground">Average Job Match</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">23</div>
              <div className="text-sm text-muted-foreground">Matching Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">3</div>
              <div className="text-sm text-muted-foreground">Skills to Develop</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Personalized Career Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getRecommendationIcon(rec.type)}
                  <div>
                    <h4 className="font-semibold">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                  {rec.matchPercentage && (
                    <Badge variant="outline">
                      {rec.matchPercentage}% match
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Action Items:</p>
                <ul className="text-sm space-y-1">
                  {rec.actionItems.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {rec.timeToAchieve && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Timeline: {rec.timeToAchieve}
                  </span>
                  <Button size="sm" variant="outline">
                    Start Now
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skill Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Skills Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {skillGaps.map((gap, index) => (
            <div key={index} className="space-y-3 pb-4 border-b last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">{gap.skill}</h4>
                  <Badge className={getImportanceColor(gap.importance)}>
                    {gap.importance}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    +{gap.demandGrowth}% demand growth
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {gap.jobsRequiring} jobs require this skill
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Market Demand</span>
                  <span>{gap.demandGrowth}%</span>
                </div>
                <Progress value={gap.demandGrowth} className="h-2" />
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Learning Resources:</p>
                <div className="flex flex-wrap gap-2">
                  {gap.learningResources.map((resource, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex-col">
              <Briefcase className="h-8 w-8 mb-2" />
              <span>Browse Matching Jobs</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <BookOpen className="h-8 w-8 mb-2" />
              <span>Start Learning Path</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Users className="h-8 w-8 mb-2" />
              <span>Network & Connect</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedDashboard;
