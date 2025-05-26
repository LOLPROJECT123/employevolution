
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  reminders?: number[]; // minutes before event
}

interface CalendarProvider {
  name: string;
  isConnected: boolean;
  accountEmail?: string;
}

class CalendarIntegrationService {
  private providers: Map<string, CalendarProvider> = new Map();
  private events: Map<string, CalendarEvent> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    this.providers.set('google', {
      name: 'Google Calendar',
      isConnected: false
    });

    this.providers.set('outlook', {
      name: 'Outlook Calendar',
      isConnected: false
    });

    this.providers.set('apple', {
      name: 'Apple Calendar',
      isConnected: false
    });
  }

  async connectProvider(providerName: string): Promise<boolean> {
    try {
      console.log(`Connecting to ${providerName} calendar...`);
      
      // In a real implementation, this would handle OAuth flow
      // For now, we'll simulate the connection
      await this.simulateOAuthFlow(providerName);
      
      const provider = this.providers.get(providerName);
      if (provider) {
        provider.isConnected = true;
        provider.accountEmail = `user@${providerName}.com`;
        this.providers.set(providerName, provider);
      }
      
      console.log(`Successfully connected to ${providerName} calendar`);
      return true;
    } catch (error) {
      console.error(`Failed to connect to ${providerName}:`, error);
      return false;
    }
  }

  private async simulateOAuthFlow(providerName: string): Promise<void> {
    // Simulate OAuth authorization flow
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('OAuth authorization failed'));
        }
      }, 2000);
    });
  }

  async scheduleInterview(interviewData: {
    jobTitle: string;
    company: string;
    interviewer: string;
    interviewerEmail?: string;
    dateTime: Date;
    duration: number; // minutes
    location?: string;
    notes?: string;
  }): Promise<CalendarEvent | null> {
    try {
      const startTime = new Date(interviewData.dateTime);
      const endTime = new Date(startTime.getTime() + (interviewData.duration * 60 * 1000));

      const event: CalendarEvent = {
        id: `interview-${Date.now()}`,
        title: `Interview: ${interviewData.jobTitle} at ${interviewData.company}`,
        description: this.generateInterviewDescription(interviewData),
        startTime,
        endTime,
        location: interviewData.location,
        attendees: interviewData.interviewerEmail ? [interviewData.interviewerEmail] : [],
        reminders: [60, 15] // 1 hour and 15 minutes before
      };

      // Add to local storage
      this.events.set(event.id, event);

      // Try to add to connected calendar providers
      await this.addToCalendarProviders(event);

      console.log('Interview scheduled successfully:', event);
      return event;
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      return null;
    }
  }

  private generateInterviewDescription(interviewData: any): string {
    return `
Interview Details:
• Position: ${interviewData.jobTitle}
• Company: ${interviewData.company}
• Interviewer: ${interviewData.interviewer}
${interviewData.interviewerEmail ? `• Email: ${interviewData.interviewerEmail}` : ''}
${interviewData.location ? `• Location: ${interviewData.location}` : ''}
${interviewData.notes ? `• Notes: ${interviewData.notes}` : ''}

Preparation Tips:
• Review the job description
• Research the company
• Prepare questions to ask
• Bring copies of your resume
• Test video call setup (if virtual)
    `.trim();
  }

  private async addToCalendarProviders(event: CalendarEvent): Promise<void> {
    const connectedProviders = Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isConnected);

    for (const [providerName, provider] of connectedProviders) {
      try {
        await this.addEventToProvider(providerName, event);
        console.log(`Event added to ${provider.name}`);
      } catch (error) {
        console.error(`Failed to add event to ${provider.name}:`, error);
      }
    }
  }

  private async addEventToProvider(providerName: string, event: CalendarEvent): Promise<void> {
    // In a real implementation, this would use the respective calendar APIs
    console.log(`Adding event to ${providerName}:`, event);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 95% success rate
    if (Math.random() < 0.05) {
      throw new Error(`Failed to add event to ${providerName}`);
    }
  }

  async scheduleFollowUp(followUpData: {
    jobTitle: string;
    company: string;
    applicationDate: Date;
    followUpType: 'email' | 'phone' | 'linkedin';
    daysAfter: number;
  }): Promise<CalendarEvent | null> {
    try {
      const followUpDate = new Date(followUpData.applicationDate);
      followUpDate.setDate(followUpDate.getDate() + followUpData.daysAfter);
      
      const event: CalendarEvent = {
        id: `followup-${Date.now()}`,
        title: `Follow up: ${followUpData.jobTitle} application`,
        description: `Follow up on your application for ${followUpData.jobTitle} at ${followUpData.company} via ${followUpData.followUpType}`,
        startTime: followUpDate,
        endTime: new Date(followUpDate.getTime() + (30 * 60 * 1000)), // 30 minutes
        reminders: [30, 10] // 30 minutes and 10 minutes before
      };

      this.events.set(event.id, event);
      await this.addToCalendarProviders(event);

      return event;
    } catch (error) {
      console.error('Failed to schedule follow-up:', error);
      return null;
    }
  }

  async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

    return Array.from(this.events.values())
      .filter(event => event.startTime >= now && event.startTime <= futureDate)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<boolean> {
    try {
      const event = this.events.get(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      const updatedEvent = { ...event, ...updates };
      this.events.set(eventId, updatedEvent);

      // Update in calendar providers
      await this.updateInCalendarProviders(updatedEvent);

      return true;
    } catch (error) {
      console.error('Failed to update event:', error);
      return false;
    }
  }

  private async updateInCalendarProviders(event: CalendarEvent): Promise<void> {
    const connectedProviders = Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isConnected);

    for (const [providerName] of connectedProviders) {
      try {
        await this.updateEventInProvider(providerName, event);
      } catch (error) {
        console.error(`Failed to update event in ${providerName}:`, error);
      }
    }
  }

  private async updateEventInProvider(providerName: string, event: CalendarEvent): Promise<void> {
    console.log(`Updating event in ${providerName}:`, event);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const event = this.events.get(eventId);
      if (!event) {
        return false;
      }

      this.events.delete(eventId);
      await this.deleteFromCalendarProviders(eventId);

      return true;
    } catch (error) {
      console.error('Failed to delete event:', error);
      return false;
    }
  }

  private async deleteFromCalendarProviders(eventId: string): Promise<void> {
    const connectedProviders = Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isConnected);

    for (const [providerName] of connectedProviders) {
      try {
        await this.deleteEventFromProvider(providerName, eventId);
      } catch (error) {
        console.error(`Failed to delete event from ${providerName}:`, error);
      }
    }
  }

  private async deleteEventFromProvider(providerName: string, eventId: string): Promise<void> {
    console.log(`Deleting event from ${providerName}:`, eventId);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  generateICalInvite(event: CalendarEvent): string {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Emploevolution//Calendar//EN
BEGIN:VEVENT
UID:${event.id}@emploevolution.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startTime)}
DTEND:${formatDate(event.endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
${event.location ? `LOCATION:${event.location}` : ''}
${event.attendees?.length ? `ATTENDEE:${event.attendees.map(email => `mailto:${email}`).join(';')}` : ''}
BEGIN:VALARM
TRIGGER:-PT60M
ACTION:DISPLAY
DESCRIPTION:Interview reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;
  }

  getConnectedProviders(): CalendarProvider[] {
    return Array.from(this.providers.values()).filter(provider => provider.isConnected);
  }

  disconnectProvider(providerName: string): void {
    const provider = this.providers.get(providerName);
    if (provider) {
      provider.isConnected = false;
      provider.accountEmail = undefined;
      this.providers.set(providerName, provider);
    }
  }
}

export const calendarIntegrationService = new CalendarIntegrationService();
