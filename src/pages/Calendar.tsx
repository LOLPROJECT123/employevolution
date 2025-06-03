
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarView from '@/components/calendar/CalendarView';
import InterviewScheduler from '@/components/calendar/InterviewScheduler';
import ReminderManager from '@/components/calendar/ReminderManager';
import ApplicationTimeline from '@/components/calendar/ApplicationTimeline';
import { Interview, Reminder } from '@/services/calendarService';

const Calendar: React.FC = () => {
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showReminderManager, setShowReminderManager] = useState(false);

  const handleInterviewCreated = (interview: Interview) => {
    // Refresh calendar view
    window.location.reload();
  };

  const handleReminderCreated = (reminder: Reminder) => {
    // Refresh calendar view
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar & Scheduling</h1>
          <p className="text-muted-foreground">
            Manage your interviews, deadlines, and application timeline in one place.
          </p>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarView
              onCreateInterview={() => setShowInterviewScheduler(true)}
              onCreateReminder={() => setShowReminderManager(true)}
            />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <ApplicationTimeline showAll />
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ApplicationTimeline />
              {/* Add upcoming interviews and reminders components here */}
            </div>
          </TabsContent>
        </Tabs>

        <InterviewScheduler
          open={showInterviewScheduler}
          onClose={() => setShowInterviewScheduler(false)}
          onInterviewCreated={handleInterviewCreated}
        />

        <ReminderManager
          open={showReminderManager}
          onClose={() => setShowReminderManager(false)}
          onReminderCreated={handleReminderCreated}
        />
      </div>
    </div>
  );
};

export default Calendar;
