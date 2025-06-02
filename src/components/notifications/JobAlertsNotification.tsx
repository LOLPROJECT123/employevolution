
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealTime } from '@/contexts/RealTimeContext';
import { Bell, BellOff, Eye, Trash2 } from 'lucide-react';

export const JobAlertsNotification: React.FC = () => {
  const { jobAlerts } = useRealTime();
  const { alerts, unreadCount, markAsViewed, clearAllAlerts } = jobAlerts;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No job alerts yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Set up job alerts to get notified of new opportunities
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Job Alerts</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllAlerts}
              disabled={alerts.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  !alert.is_viewed ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{alert.job_data?.title}</h4>
                      {!alert.is_viewed && (
                        <Badge variant="secondary" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.job_data?.company} • {alert.job_data?.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(alert.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    {!alert.is_viewed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsViewed(alert.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {alert.job_data?.salary && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {alert.job_data.salary}
                    </Badge>
                  </div>
                )}
                
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" className="flex-1">
                    View Job
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Save for Later
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default JobAlertsNotification;
