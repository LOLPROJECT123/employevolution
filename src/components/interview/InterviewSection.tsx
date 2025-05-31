
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, FileText, Target, BarChart3, Brain, TrendingUp, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import BehavioralInterview from './BehavioralInterview';
import CodingInterview from './CodingInterview';
import CompanyProblems from './CompanyProblems';
import InterviewAnalytics from './InterviewAnalytics';
import InterviewFeedback from './InterviewFeedback';
import InterviewResources from './InterviewResources';

const InterviewSection = () => {
  const [activeTab, setActiveTab] = useState('practice');
  const { user } = useAuth();
  const navigate = useNavigate();

  const interviewStats = {
    totalSessions: 15,
    averageScore: 78,
    improvementRate: 12,
    completedQuestions: 45
  };

  const handleTabChange = (value: string) => {
    // Allow practice tab for everyone, require auth for others
    if (['analytics', 'feedback', 'resources'].includes(value) && !user) {
      navigate('/auth');
      return;
    }
    setActiveTab(value);
  };

  const AuthPrompt = ({ feature }: { feature: string }) => (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Sign in to access {feature}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your free account to unlock detailed analytics, personalized feedback, and comprehensive interview resources.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate('/auth')} size="lg">
          Sign In
        </Button>
        <Button onClick={() => navigate('/auth')} variant="outline" size="lg">
          Create Account
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Practice</h1>
        <p className="text-muted-foreground">
          Master your interview skills with AI-powered practice, analytics, and personalized feedback
        </p>
      </div>

      {/* Performance Overview - only show if authenticated */}
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{interviewStats.totalSessions}</p>
                </div>
                <Video className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{interviewStats.averageScore}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Improvement</p>
                  <p className="text-2xl font-bold">+{interviewStats.improvementRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Questions Completed</p>
                  <p className="text-2xl font-bold">{interviewStats.completedQuestions}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            Analytics
            {!user && <Lock className="h-3 w-3" />}
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            Feedback
            {!user && <Lock className="h-3 w-3" />}
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            Resources
            {!user && <Lock className="h-3 w-3" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="space-y-6">
          <Tabs defaultValue="behavioral" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
              <TabsTrigger value="coding">Coding</TabsTrigger>
              <TabsTrigger value="company">Company Specific</TabsTrigger>
            </TabsList>

            <TabsContent value="behavioral">
              <BehavioralInterview />
            </TabsContent>

            <TabsContent value="coding">
              <CodingInterview />
            </TabsContent>

            <TabsContent value="company">
              <CompanyProblems />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {user ? <InterviewAnalytics /> : <AuthPrompt feature="Analytics" />}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {user ? <InterviewFeedback /> : <AuthPrompt feature="Feedback" />}
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {user ? <InterviewResources /> : <AuthPrompt feature="Resources" />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewSection;
