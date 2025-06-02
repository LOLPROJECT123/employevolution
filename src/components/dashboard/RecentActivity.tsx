
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Send, 
  Calendar, 
  Bookmark, 
  FileText,
  Target,
  Award,
  Users,
  Clock
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'application' | 'interview' | 'saved_job' | 'goal' | 'achievement' | 'profile_update';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

const RecentActivity: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentActivity();
    }
  }, [user]);

  const loadRecentActivity = async () => {
    if (!user) return;

    try {
      // Fetch recent activities from multiple sources
      const [applications, savedJobs, goals, achievements, interviews] = await Promise.all([
        supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('applied_at', { ascending: false })
          .limit(3),
        supabase
          .from('saved_jobs')
          .select('*')
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false })
          .limit(3),
        supabase
          .from('professional_development')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(3),
        supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('interviews')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const activityItems: ActivityItem[] = [];

      // Process applications
      applications.data?.forEach(app => {
        activityItems.push({
          id: `app_${app.id}`,
          type: 'application',
          title: 'Applied to job',
          description: `${app.job_id} - Status: ${app.status}`,
          timestamp: app.applied_at,
          metadata: app
        });
      });

      // Process saved jobs
      savedJobs.data?.forEach(job => {
        activityItems.push({
          id: `saved_${job.id}`,
          type: 'saved_job',
          title: 'Saved job',
          description: `${job.job_data?.title || 'Job'} at ${job.job_data?.company || 'Company'}`,
          timestamp: job.saved_at,
          metadata: job
        });
      });

      // Process development goals
      goals.data?.forEach(goal => {
        activityItems.push({
          id: `goal_${goal.id}`,
          type: 'goal',
          title: goal.status === 'completed' ? 'Completed goal' : 'Updated goal',
          description: goal.goal_title,
          timestamp: goal.updated_at,
          metadata: goal
        });
      });

      // Process achievements
      achievements.data?.forEach(achievement => {
        activityItems.push({
          id: `achievement_${achievement.id}`,
          type: 'achievement',
          title: 'New achievement',
          description: achievement.title,
          timestamp: achievement.created_at,
          metadata: achievement
        });
      });

      // Process interviews
      interviews.data?.forEach(interview => {
        activityItems.push({
          id: `interview_${interview.id}`,
          type: 'interview',
          title: 'Interview scheduled',
          description: `${interview.position_title} at ${interview.company_name}`,
          timestamp: interview.created_at,
          metadata: interview
        });
      });

      // Sort by timestamp and take most recent
      const sortedActivities = activityItems
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application': return <Send className="h-4 w-4 text-blue-500" />;
      case 'interview': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'saved_job': return <Bookmark className="h-4 w-4 text-yellow-500" />;
      case 'goal': return <Target className="h-4 w-4 text-purple-500" />;
      case 'achievement': return <Award className="h-4 w-4 text-orange-500" />;
      case 'profile_update': return <FileText className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'application':
        return (
          <Badge variant="outline" className="text-xs">
            {activity.metadata?.status || 'Applied'}
          </Badge>
        );
      case 'goal':
        return (
          <Badge 
            variant={activity.metadata?.status === 'completed' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {activity.metadata?.progress_percentage || 0}%
          </Badge>
        );
      case 'achievement':
        return activity.metadata?.is_verified ? (
          <Badge variant="default" className="text-xs">Verified</Badge>
        ) : null;
      default:
        return null;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return <div>Loading activity...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getActivityBadge(activity)}
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
            <p className="text-muted-foreground mb-4">
              Start by applying to jobs or setting development goals
            </p>
            <div className="space-x-2">
              <Button size="sm">Browse Jobs</Button>
              <Button size="sm" variant="outline">Set Goals</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
