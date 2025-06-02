import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video,
  Phone,
  Plus,
  Bell,
  Users
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  type: 'interview' | 'deadline' | 'follow-up' | 'networking';
  date: string;
  time: string;
  location?: string;
  company?: string;
  interviewer?: string;
  description?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Technical Interview - Google',
    type: 'interview',
    date: '2024-01-20',
    time: '2:00 PM',
    location: 'Google Meet',
    company: 'Google',
    interviewer: 'Sarah Chen',
    description: 'System design interview focusing on scalable web applications',
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Application Deadline - Meta',
    type: 'deadline',
    date: '2024-01-22',
    time: '11:59 PM',
    company: 'Meta',
    description: 'Submit application for Software Engineer position',
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Follow-up Email - Spotify',
    type: 'follow-up',
    date: '2024-01-18',
    time: '10:00 AM',
    company: 'Spotify',
    description: 'Send follow-up email after initial interview',
    status: 'completed'
  }
];

const Calendar = () => {
  const isMobile = useMobile();
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleRefresh = async () => {
    console.log('Refreshing calendar...');
    // Implement calendar refresh logic
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'interview': return 'bg-blue-100 text-blue-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'follow-up': return 'bg-yellow-100 text-yellow-800';
      case 'networking': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'interview': return <Users className="h-4 w-4" />;
      case 'deadline': return <Clock className="h-4 w-4" />;
      case 'follow-up': return <Bell className="h-4 w-4" />;
      case 'networking': return <Users className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const todayEvents = events.filter(event => 
    event.date === new Date().toISOString().split('T')[0]
  );

  const content = (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      
      <div className="bg-blue-600 dark:bg-blue-900 py-4 px-4 md:py-6 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          {!isMobile && (
            <div className="mb-4">
              <BreadcrumbNav className="text-blue-100" />
            </div>
          )}
          <h1 className="text-xl md:text-3xl font-bold text-white">
            Calendar
          </h1>
          <p className="text-blue-100 mt-2">
            Manage your interviews, deadlines, and job search activities
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Schedule</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  January 2024
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                    const hasEvent = events.some(event => 
                      new Date(event.date).getDate() === day
                    );
                    return (
                      <button
                        key={day}
                        className={`p-2 text-sm rounded hover:bg-accent ${
                          hasEvent ? 'bg-primary text-primary-foreground' : ''
                        } ${day === new Date().getDate() ? 'border-2 border-primary' : ''}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Events</CardTitle>
              </CardHeader>
              <CardContent>
                {todayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-accent/50">
                        {getEventIcon(event.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No events today</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Interviews</span>
                  <Badge variant="secondary">3</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Deadlines</span>
                  <Badge variant="secondary">2</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Follow-ups</span>
                  <Badge variant="secondary">1</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upcoming Events */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.time}
                        </span>
                        {event.location && (
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileRouteLayout
        title="Calendar"
        onRefresh={handleRefresh}
        className="bg-background"
      >
        {content}
      </MobileRouteLayout>
    );
  }

  return content;
};

export default Calendar;
