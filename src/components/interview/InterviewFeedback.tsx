
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Lightbulb, Target, TrendingUp } from 'lucide-react';

const InterviewFeedback = () => {
  const strengths = [
    {
      area: 'Communication Skills',
      feedback: 'You articulate your thoughts clearly and use appropriate professional language throughout the interview.',
      score: 85
    },
    {
      area: 'Technical Knowledge',
      feedback: 'Strong understanding of core concepts with good examples from your experience.',
      score: 78
    },
    {
      area: 'Problem-Solving Approach',
      feedback: 'You break down complex problems systematically and explain your thought process well.',
      score: 82
    }
  ];

  const improvements = [
    {
      area: 'Confidence Level',
      feedback: 'Work on maintaining eye contact and reducing filler words like "um" and "uh".',
      suggestion: 'Practice speaking in front of a mirror or record yourself to identify speech patterns.',
      priority: 'High'
    },
    {
      area: 'STAR Method Usage',
      feedback: 'Your behavioral examples could be more structured using the STAR method.',
      suggestion: 'Prepare 5-7 strong STAR examples covering different competencies.',
      priority: 'Medium'
    },
    {
      area: 'Question Clarification',
      feedback: 'Ask clarifying questions when requirements are ambiguous.',
      suggestion: 'Practice asking thoughtful questions that show your analytical thinking.',
      priority: 'Medium'
    }
  ];

  const recommendations = [
    {
      title: 'Practice Behavioral Questions',
      description: 'Focus on leadership and teamwork scenarios',
      action: 'Complete 10 more behavioral questions',
      timeframe: 'This week'
    },
    {
      title: 'Mock Interview Session',
      description: 'Schedule a full-length practice interview',
      action: 'Book a 60-minute session',
      timeframe: 'Next 3 days'
    },
    {
      title: 'Industry Research',
      description: 'Study company-specific interview patterns',
      action: 'Research top 5 target companies',
      timeframe: 'Next week'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Feedback Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI-Powered Feedback Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of your latest interview performance based on AI evaluation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">B+</div>
              <div className="text-sm text-muted-foreground">Overall Grade</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">78%</div>
              <div className="text-sm text-muted-foreground">Confidence Score</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">12%</div>
              <div className="text-sm text-muted-foreground">Improvement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Your Strengths
          </CardTitle>
          <CardDescription>
            Areas where you performed exceptionally well
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {strengths.map((strength, index) => (
            <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{strength.area}</h4>
                <Badge className="bg-green-100 text-green-800">
                  {strength.score}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{strength.feedback}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Areas for Improvement
          </CardTitle>
          <CardDescription>
            Specific areas to focus on for better performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {improvements.map((improvement, index) => (
            <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{improvement.area}</h4>
                <Badge variant={getPriorityColor(improvement.priority)}>
                  {improvement.priority} Priority
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{improvement.feedback}</p>
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  💡 Suggestion: {improvement.suggestion}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Action items to accelerate your interview preparation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{rec.title}</h4>
                <Badge variant="outline">{rec.timeframe}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-600">{rec.action}</span>
                <Button size="sm" variant="outline">
                  Start Now
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewFeedback;
