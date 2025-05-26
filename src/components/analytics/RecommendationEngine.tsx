
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Clock, 
  Users, 
  Award,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface RecommendationEngineProps {
  recommendations: string[];
  performanceData: {
    industryAvgResponseRate: number;
    industryAvgInterviewRate: number;
    industryAvgOfferRate: number;
    yourPerformanceVsIndustry: {
      responseRate: 'above' | 'below' | 'average';
      interviewRate: 'above' | 'below' | 'average';
      offerRate: 'above' | 'below' | 'average';
    };
  };
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ 
  recommendations, 
  performanceData 
}) => {
  // Enhanced recommendations based on performance data
  const getEnhancedRecommendations = () => {
    const enhanced = [...recommendations];
    
    // Add performance-specific recommendations
    if (performanceData.yourPerformanceVsIndustry.responseRate === 'below') {
      enhanced.unshift('Your response rate is below industry average - focus on improving your application materials');
    }
    
    if (performanceData.yourPerformanceVsIndustry.interviewRate === 'below') {
      enhanced.push('Work on converting more responses to interviews - practice your elevator pitch');
    }
    
    if (performanceData.yourPerformanceVsIndustry.offerRate === 'below') {
      enhanced.push('Focus on interview skills to convert more interviews to offers');
    }

    return enhanced;
  };

  const actionableRecommendations = [
    {
      category: 'Immediate Actions',
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
      items: [
        {
          title: 'Update your resume with trending keywords',
          description: 'Add React, TypeScript, and cloud skills to match market demand',
          urgency: 'high',
          effort: 'low'
        },
        {
          title: 'Optimize your LinkedIn profile',
          description: 'Ensure your profile matches your resume and includes key skills',
          urgency: 'high',
          effort: 'medium'
        },
        {
          title: 'Follow up on pending applications',
          description: 'Reach out to applications submitted 1-2 weeks ago',
          urgency: 'medium',
          effort: 'low'
        }
      ]
    },
    {
      category: 'Short-term Strategy',
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
      items: [
        {
          title: 'Target specific company types',
          description: 'Focus on startups and mid-size companies where you show higher success rates',
          urgency: 'medium',
          effort: 'medium'
        },
        {
          title: 'Improve application timing',
          description: 'Apply on Tuesday-Thursday when response rates are highest',
          urgency: 'low',
          effort: 'low'
        },
        {
          title: 'Create targeted cover letters',
          description: 'Customize letters for each application using your best-performing templates',
          urgency: 'medium',
          effort: 'high'
        }
      ]
    },
    {
      category: 'Long-term Growth',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
      items: [
        {
          title: 'Develop in-demand skills',
          description: 'Learn TypeScript and AWS to align with market trends',
          urgency: 'low',
          effort: 'high'
        },
        {
          title: 'Build your professional network',
          description: 'Connect with 5 new professionals in your field each week',
          urgency: 'low',
          effort: 'medium'
        },
        {
          title: 'Create a portfolio website',
          description: 'Showcase your projects and skills with a professional portfolio',
          urgency: 'low',
          effort: 'high'
        }
      ]
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-purple-100 text-purple-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance vs Industry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Response Rate</span>
                <Badge className={performanceData.yourPerformanceVsIndustry.responseRate === 'above' ? 'bg-green-100 text-green-800' : 
                  performanceData.yourPerformanceVsIndustry.responseRate === 'below' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                  {performanceData.yourPerformanceVsIndustry.responseRate}
                </Badge>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground">Industry avg: {performanceData.industryAvgResponseRate}%</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Interview Rate</span>
                <Badge className={performanceData.yourPerformanceVsIndustry.interviewRate === 'above' ? 'bg-green-100 text-green-800' : 
                  performanceData.yourPerformanceVsIndustry.interviewRate === 'below' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                  {performanceData.yourPerformanceVsIndustry.interviewRate}
                </Badge>
              </div>
              <Progress value={60} className="h-2" />
              <p className="text-xs text-muted-foreground">Industry avg: {performanceData.industryAvgInterviewRate}%</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Offer Rate</span>
                <Badge className={performanceData.yourPerformanceVsIndustry.offerRate === 'above' ? 'bg-green-100 text-green-800' : 
                  performanceData.yourPerformanceVsIndustry.offerRate === 'below' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                  {performanceData.yourPerformanceVsIndustry.offerRate}
                </Badge>
              </div>
              <Progress value={45} className="h-2" />
              <p className="text-xs text-muted-foreground">Industry avg: {performanceData.industryAvgOfferRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getEnhancedRecommendations().map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actionable Recommendations */}
      {actionableRecommendations.map((category) => (
        <Card key={category.category} className={category.color}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${category.iconColor}`}>
              {category.icon}
              {category.category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category.items.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getUrgencyColor(item.urgency)}>
                        {item.urgency} priority
                      </Badge>
                      <Badge variant="outline" className={getEffortColor(item.effort)}>
                        {item.effort} effort
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <Button size="sm" variant="outline">
                      Mark as Done
                      <CheckCircle className="h-3 w-3 ml-1" />
                    </Button>
                    <Button size="sm">
                      Start Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Success Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Job Search Success Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">72/100</span>
              <Badge className="bg-blue-100 text-blue-800">Good Performance</Badge>
            </div>
            <Progress value={72} className="h-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-600">Strengths:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Strong technical skills alignment</li>
                  <li>• Good application volume</li>
                  <li>• Consistent follow-up practice</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-orange-600">Areas for Improvement:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Response rate optimization</li>
                  <li>• Interview conversion</li>
                  <li>• Salary negotiation skills</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationEngine;
