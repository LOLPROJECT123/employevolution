
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Plus,
  Building,
  Briefcase
} from 'lucide-react';
import { calendarService, ApplicationEvent } from '@/services/calendarService';
import { formatDate, formatRelativeTime } from '@/utils/dateUtils';
import { toast } from '@/hooks/use-toast';

interface ApplicationTimelineProps {
  applicationId?: string;
  showAll?: boolean;
}

const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ 
  applicationId, 
  showAll = false 
}) => {
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [applicationId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await calendarService.getApplicationEvents(applicationId);
      setEvents(data);
    } catch (error) {
      toast({
        title: "Failed to load timeline",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: ApplicationEvent['event_type']) => {
    switch (eventType) {
      case 'applied': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'viewed': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'phone_screen': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'interview': return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'follow_up': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'offer': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejection': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'withdrawal': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Circle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventColor = (eventType: ApplicationEvent['event_type']) => {
    switch (eventType) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'phone_screen': return 'bg-orange-100 text-orange-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'follow_up': return 'bg-blue-100 text-blue-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejection': return 'bg-red-100 text-red-800';
      case 'withdrawal': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayEvents = showAll ? events : events.slice(0, 5);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading timeline...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Application Timeline
          {!showAll && events.length > 5 && (
            <Badge variant="outline">{events.length} total</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayEvents.length > 0 ? (
          <div className="space-y-4">
            {displayEvents.map((event, index) => (
              <div key={event.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge className={getEventColor(event.event_type)} variant="secondary">
                      {event.event_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(event.event_date)}</span>
                    <span>{formatRelativeTime(event.event_date)}</span>
                  </div>
                </div>
                {index < displayEvents.length - 1 && (
                  <div className="absolute left-2 mt-6 h-8 w-px bg-border" style={{marginLeft: '6px'}} />
                )}
              </div>
            ))}
            
            {!showAll && events.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  View All {events.length} Events
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No timeline events</h3>
            <p className="text-muted-foreground mb-4">
              Timeline events will appear here as you progress through your application process.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper component for circle icon
const Circle: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`rounded-full border-2 ${className}`} style={{ width: '16px', height: '16px' }} />
);

export default ApplicationTimeline;
