
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Heart, Send, Calendar } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'application' | 'view' | 'save' | 'interview' | 'update';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

const RecentActivity = () => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'application',
      title: 'Applied to Senior Developer at TechCorp',
      description: 'Application submitted with cover letter',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'submitted'
    },
    {
      id: '2',
      type: 'interview',
      title: 'Interview scheduled with StartupXYZ',
      description: 'Technical interview on January 20th at 2:00 PM',
      timestamp: '2024-01-14T16:45:00Z',
      status: 'scheduled'
    },
    {
      id: '3',
      type: 'save',
      title: 'Saved Frontend Developer at WebFlow',
      description: 'Added to saved jobs for future application',
      timestamp: '2024-01-14T09:15:00Z'
    },
    {
      id: '4',
      type: 'view',
      title: 'Viewed Product Manager at InnovateCo',
      description: 'Reviewed job details and requirements',
      timestamp: '2024-01-13T14:20:00Z'
    },
    {
      id: '5',
      type: 'update',
      title: 'Updated resume version',
      description: 'Created new resume version for tech roles',
      timestamp: '2024-01-12T11:00:00Z'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application': return <Send className="h-4 w-4 text-blue-600" />;
      case 'interview': return <Calendar className="h-4 w-4 text-green-600" />;
      case 'save': return <Heart className="h-4 w-4 text-red-600" />;
      case 'view': return <Eye className="h-4 w-4 text-gray-600" />;
      case 'update': return <FileText className="h-4 w-4 text-purple-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  {activity.status && (
                    <Badge className={`mt-2 text-xs ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">23</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-muted-foreground">Responses</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecentActivity;
