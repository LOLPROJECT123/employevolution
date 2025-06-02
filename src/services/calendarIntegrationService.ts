
import { supabase } from '@/integrations/supabase/client';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees: string[];
}

export interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook';
  isActive: boolean;
  calendarId: string;
}

export class CalendarIntegrationService {
  // Google Calendar Integration
  static async connectGoogleCalendar(userId: string): Promise<void> {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=your_google_client_id&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&` +
      `response_type=code&` +
      `scope=https://www.googleapis.com/auth/calendar&` +
      `access_type=offline`;

    window.location.href = authUrl;
  }

  // Outlook Calendar Integration
  static async connectOutlookCalendar(userId: string): Promise<void> {
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=your_outlook_client_id&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/outlook/callback')}&` +
      `scope=https://graph.microsoft.com/calendars.readwrite`;

    window.location.href = authUrl;
  }

  static async scheduleInterview(
    userId: string,
    event: Omit<CalendarEvent, 'id'>,
    provider: 'google' | 'outlook'
  ): Promise<string> {
    try {
      // Mock implementation since calendar_integrations table doesn't exist
      console.log('Calendar integration: Mock schedule interview', {
        userId,
        provider,
        event,
        timestamp: new Date().toISOString()
      });

      // Return mock event ID
      return `event-${Date.now()}`;
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      throw error;
    }
  }

  private static async createGoogleEvent(
    integration: any,
    event: Omit<CalendarEvent, 'id'>
  ): Promise<string> {
    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'UTC',
      },
      location: event.location,
      attendees: event.attendees.map(email => ({ email })),
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${integration.calendar_id}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEvent),
      }
    );

    const data = await response.json();
    return data.id;
  }

  private static async createOutlookEvent(
    integration: any,
    event: Omit<CalendarEvent, 'id'>
  ): Promise<string> {
    const outlookEvent = {
      subject: event.title,
      body: {
        contentType: 'Text',
        content: event.description,
      },
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: 'UTC',
      },
      location: {
        displayName: event.location,
      },
      attendees: event.attendees.map(email => ({
        emailAddress: { address: email, name: email },
      })),
    };

    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(outlookEvent),
    });

    const data = await response.json();
    return data.id;
  }

  static async getUpcomingInterviews(userId: string): Promise<CalendarEvent[]> {
    // Mock implementation since calendar_integrations table doesn't exist
    console.log('Calendar integration: Getting mock upcoming interviews for user:', userId);
    
    return [
      {
        id: 'event-1',
        title: 'Interview with TechCorp',
        description: 'Technical interview for Senior Developer position',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // Tomorrow + 1 hour
        location: 'Virtual Meeting',
        attendees: ['interviewer@techcorp.com']
      }
    ];
  }

  private static async fetchGoogleEvents(integration: any): Promise<CalendarEvent[]> {
    const now = new Date().toISOString();
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${integration.calendar_id}/events?` +
      `timeMin=${now}&orderBy=startTime&singleEvents=true`,
      {
        headers: {
          'Authorization': `Bearer ${integration.access_token}`,
        },
      }
    );

    const data = await response.json();
    return data.items.map((item: any) => ({
      id: item.id,
      title: item.summary,
      description: item.description || '',
      startTime: new Date(item.start.dateTime),
      endTime: new Date(item.end.dateTime),
      location: item.location,
      attendees: item.attendees?.map((a: any) => a.email) || [],
    }));
  }

  private static async fetchOutlookEvents(integration: any): Promise<CalendarEvent[]> {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/events?$filter=start/dateTime ge \'' +
      new Date().toISOString() + '\'&$orderby=start/dateTime',
      {
        headers: {
          'Authorization': `Bearer ${integration.access_token}`,
        },
      }
    );

    const data = await response.json();
    return data.value.map((item: any) => ({
      id: item.id,
      title: item.subject,
      description: item.body.content,
      startTime: new Date(item.start.dateTime),
      endTime: new Date(item.end.dateTime),
      location: item.location?.displayName,
      attendees: item.attendees?.map((a: any) => a.emailAddress.address) || [],
    }));
  }
}
