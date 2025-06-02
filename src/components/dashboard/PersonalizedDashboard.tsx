
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const PersonalizedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [applicationsResponse, goalsResponse, profileResponse] = await Promise.all([
        supabase.from('job_applications').select('*').eq('user_id', user.id),
        supabase.from('professional_development').select('*').eq('user_id', user.id),
        supabase.from('user_profiles').select('*').eq('user_id', user.id).single()
      ]);

      const applications = applicationsResponse.data || [];
      const goals = goalsResponse.data || [];
      const profile = profileResponse.data;

      // Calculate metrics
      const totalApplications = applications.length;
      const interviewsScheduled = applications.filter(app => app.status === 'interview_scheduled').length;
      const responseRate = totalApplications > 0 ? Math.round((interviewsScheduled / totalApplications) * 100) : 0;
      
      const completedGoals = goals.filter(goal => goal.status === 'completed').length;
      const activeGoals = goals.filter(goal => goal.status === 'in_progress').length;

      setDashboardData({
        applications: {
          total: totalApplications,
          interviews: interviewsScheduled,
          responseRate
        },
        goals: {
          completed: completedGoals,
          active: activeGoals,
          total: goals.length
        },
        profile: {
          completion: profile?.profile_completion || 0,
          lastUpdated: profile?.updated_at
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Your Career Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile Completion */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-muted-foreground">{dashboardData.profile.completion}%</span>
            </div>
            <Progress value={dashboardData.profile.completion} className="h-2" />
            {dashboardData.profile.completion < 100 && (
              <p className="text-xs text-muted-foreground mt-1">
                Complete your profile to increase job match accuracy
              </p>
            )}
          </div>

          {/* Application Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dashboardData.applications.total}</div>
              <div className="text-xs text-muted-foreground">Applications</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{dashboardData.applications.interviews}</div>
              <div className="text-xs text-muted-foreground">Interviews</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{dashboardData.applications.responseRate}%</div>
              <div className="text-xs text-muted-foreground">Response Rate</div>
            </div>
          </div>

          {/* Goals Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Development Goals</span>
              <Badge variant="outline">
                {dashboardData.goals.completed}/{dashboardData.goals.total} Complete
              </Badge>
            </div>
            {dashboardData.goals.total > 0 ? (
              <Progress 
                value={(dashboardData.goals.completed / dashboardData.goals.total) * 100} 
                className="h-2" 
              />
            ) : (
              <div className="text-xs text-muted-foreground">
                Set development goals to track your professional growth
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Recommended Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dashboardData.profile.completion < 100 && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Complete your profile</span>
              </div>
              <Button size="sm" variant="outline">
                Complete
              </Button>
            </div>
          )}

          {dashboardData.applications.total === 0 && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Start applying to jobs</span>
              </div>
              <Button size="sm" variant="outline">
                Browse Jobs
              </Button>
            </div>
          )}

          {dashboardData.goals.active === 0 && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Set development goals</span>
              </div>
              <Button size="sm" variant="outline">
                Add Goal
              </Button>
            </div>
          )}

          {dashboardData.applications.total > 0 && dashboardData.applications.interviews === 0 && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Follow up on applications</span>
              </div>
              <Button size="sm" variant="outline">
                View Applications
              </Button>
            </div>
          )}

          {dashboardData.profile.completion === 100 && dashboardData.applications.total > 0 && (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">You're on track! Keep it up!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>This Week</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dashboardData.applications.interviews > 0 ? (
              <div className="text-sm">
                You have {dashboardData.applications.interviews} interview{dashboardData.applications.interviews > 1 ? 's' : ''} scheduled
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No interviews scheduled this week
              </div>
            )}
            
            {dashboardData.goals.active > 0 && (
              <div className="text-sm">
                {dashboardData.goals.active} development goal{dashboardData.goals.active > 1 ? 's' : ''} in progress
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedDashboard;
