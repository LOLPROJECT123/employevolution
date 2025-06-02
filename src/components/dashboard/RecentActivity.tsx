
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  Briefcase, 
  Calendar, 
  FileText, 
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface JobData {
  title?: string;
  company?: string;
  location?: string;
  salary?: string;
  [key: string]: any;
}

interface RecentActivityItem {
  id: string;
  type: 'application' | 'interview' | 'saved_job' | 'document';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  job_data?: JobData;
  metadata?: Record<string, any>;
}

export const RecentActivity: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentActivity();
    }
  }, [user]);

  const loadRecentActivity = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [applicationsRes, savedJobsRes, interviewsRes] = await Promise.all([
        supabase
          .from('job_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('applied_at', { ascending: false })
          .limit(5),
        supabase
          .from('saved_jobs')
          .select('*')
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false })
          .limit(5),
        supabase
          .from('interviews')
          .select('*')
          .eq('user_id', user.id)
          .order('scheduled_date', { ascending: false })
          .limit(5)
      ]);

      const allActivities: RecentActivityItem[] = [];

      // Process applications
      if (applicationsRes.data) {
        applicationsRes.data.forEach(app => {
          allActivities.push({
            id: app.id,
            type: 'application',
            title: `Applied to ${app.job_id}`,
            description: `Status: ${app.status}`,
            timestamp: app.applied_at,
            status: app.status,
            metadata: {
              job_id: app.job_id,
              application_url: app.application_url
            }
          });
        });
      }

      // Process saved jobs - Fix type casting here
      if (savedJobsRes.data) {
        savedJobsRes.data.forEach(job => {
          // Properly cast the job_data Json field to JobData
          const jobData = job.job_data as unknown as JobData;
          allActivities.push({
            id: job.id,
            type: 'saved_job',
            title: `Saved ${jobData?.title || 'Unknown Position'}`,
            description: `At ${jobData?.company || 'Unknown Company'}`,
            timestamp: job.saved_at,
            job_data: jobData,
            metadata: {
              notes: job.notes
            }
          });
        });
      }

      // Process interviews
      if (interviewsRes.data) {
        interviewsRes.data.forEach(interview => {
          allActivities.push({
            id: interview.id,
            type: 'interview',
            title: `Interview scheduled`,
            description: `${interview.position_title} at ${interview.company_name}`,
            timestamp: interview.scheduled_date,
            status: interview.status,
            metadata: {
              interview_type: interview.interview_type,
              duration: interview.duration_minutes
            }
          });
        });
      }

      // Sort all activities by timestamp
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setActivities(allActivities.slice(0, 10));
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application': return <Briefcase className="h-4 w-4" />;
      case 'interview': return <Calendar className="h-4 w-4" />;
      case 'saved_job': return <FileText className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'interview_scheduled': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'offer_received': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity yet.</p>
            <p className="text-sm">Start by applying to jobs or saving positions you're interested in!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {activity.status && (
                      <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status.replace('_', ' ')}
                      </Badge>
                    )}
                    {activity.metadata?.application_url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => window.open(activity.metadata?.application_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
