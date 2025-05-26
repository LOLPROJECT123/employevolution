
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Video, 
  Phone, 
  MapPin,
  Users,
  AlertCircle
} from 'lucide-react';
import { calendarService, Interview, Reminder, ApplicationEvent } from '@/services/calendarService';
import { formatDate, formatRelativeTime } from '@/utils/dateUtils';
import { toast } from '@/hooks/use-toast';

interface CalendarViewProps {
  onCreateInterview: () => void;
  onCreateReminder: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  onCreateInterview, 
  onCreateReminder 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<ApplicationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, [selectedDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      const data = await calendarService.getCalendarData(
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );
      
      setInterviews(data.interviews);
      setReminders(data.reminders);
      setEvents(data.events);
    } catch (error) {
      toast({
        title: "Failed to load calendar data",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDateItems = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const dayInterviews = interviews.filter(interview => 
      interview.scheduled_date.startsWith(dateStr)
    );
    
    const dayReminders = reminders.filter(reminder => 
      reminder.due_date.startsWith(dateStr)
    );
    
    const dayEvents = events.filter(event => 
      event.event_date.startsWith(dateStr)
    );

    return { dayInterviews, dayReminders, dayEvents };
  };

  const getInterviewIcon = (type: Interview['interview_type']) => {
    switch (type) {
      case 'video_call': return <Video className="h-4 w-4" />;
      case 'phone_screen': return <Phone className="h-4 w-4" />;
      case 'in_person': return <MapPin className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Reminder['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
    }
  };

  const { dayInterviews, dayReminders, dayEvents } = getSelectedDateItems();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
          
          <div className="mt-4 space-y-2">
            <Button 
              onClick={onCreateInterview} 
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
            <Button 
              onClick={onCreateReminder} 
              variant="outline"
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {formatDate(selectedDate)} - {dayInterviews.length + dayReminders.length + dayEvents.length} items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading calendar data...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Interviews */}
              {dayInterviews.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Interviews ({dayInterviews.length})
                  </h3>
                  <div className="space-y-2">
                    {dayInterviews.map((interview) => (
                      <div key={interview.id} className="border rounded-lg p-3 bg-blue-50">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getInterviewIcon(interview.interview_type)}
                              <span className="font-medium">{interview.position_title}</span>
                              <Badge variant="outline">{interview.interview_type.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{interview.company_name}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(interview.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span>{interview.duration_minutes} min</span>
                              {interview.location && (
                                <span className="truncate max-w-[200px]">{interview.location}</span>
                              )}
                            </div>
                          </div>
                          <Badge className={interview.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {interview.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminders */}
              {dayReminders.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Reminders ({dayReminders.length})
                  </h3>
                  <div className="space-y-2">
                    {dayReminders.map((reminder) => (
                      <div key={reminder.id} className="border rounded-lg p-3 bg-yellow-50">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{reminder.title}</span>
                              <Badge className={getPriorityColor(reminder.priority)} variant="secondary">
                                {reminder.priority}
                              </Badge>
                            </div>
                            {reminder.description && (
                              <p className="text-sm text-muted-foreground">{reminder.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(reminder.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Events */}
              {dayEvents.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Application Events ({dayEvents.length})
                  </h3>
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <div key={event.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.title}</span>
                            <Badge variant="outline">{event.event_type.replace('_', ' ')}</Badge>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dayInterviews.length === 0 && dayReminders.length === 0 && dayEvents.length === 0 && (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No events scheduled</h3>
                  <p className="text-muted-foreground mb-4">
                    Schedule an interview or add a reminder to get started.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
