
import { supabase } from '@/integrations/supabase/client';
import { CalendarIntegrationService } from './calendarIntegrationService';
import { LinkedInOAuthService } from './linkedinOAuthService';

export interface LinkedInAuthResult {
  success: boolean;
  profile?: any;
  error?: string;
}

export interface CalendarSyncResult {
  success: boolean;
  eventsCount: number;
  error?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EnhancedIntegrationService {
  // Authenticate LinkedIn OAuth
  static async authenticateLinkedInOAuth(code: string): Promise<LinkedInAuthResult> {
    try {
      console.log('Authenticating LinkedIn OAuth with code:', code);
      
      // Handle the OAuth callback
      const profile = await LinkedInOAuthService.handleCallback(code);
      
      if (!profile) {
        return {
          success: false,
          error: 'Failed to retrieve LinkedIn profile'
        };
      }

      // Mock LinkedIn integration storage since oauth_integrations table doesn't exist
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('Mock oauth: LinkedIn integration stored for user:', user.id, {
          provider: 'linkedin',
          provider_user_id: profile.id,
          profile_data: profile,
          is_active: true,
          connected_at: new Date().toISOString()
        });
      }

      return {
        success: true,
        profile
      };
    } catch (error) {
      console.error('LinkedIn OAuth authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  // Sync calendar events
  static async syncCalendarEvents(userId: string, provider: 'google' | 'outlook'): Promise<CalendarSyncResult> {
    try {
      console.log(`Syncing ${provider} calendar for user:`, userId);

      // Get upcoming events
      const events = await CalendarIntegrationService.getUpcomingInterviews(userId);
      
      // Mock calendar events storage since calendar_events table doesn't exist
      let syncedCount = 0;
      for (const event of events) {
        try {
          console.log('Mock calendar: Syncing event', {
            user_id: userId,
            external_event_id: event.id,
            title: event.title,
            description: event.description,
            start_time: event.startTime.toISOString(),
            end_time: event.endTime.toISOString(),
            location: event.location,
            attendees: event.attendees,
            provider: provider,
            synced_at: new Date().toISOString()
          });
          syncedCount++;
        } catch (error) {
          console.error('Failed to sync event:', event.id, error);
        }
      }

      return {
        success: true,
        eventsCount: syncedCount
      };
    } catch (error) {
      console.error('Calendar sync failed:', error);
      return {
        success: false,
        eventsCount: 0,
        error: error instanceof Error ? error.message : 'Sync failed'
      };
    }
  }

  // Send SMTP email
  static async sendSMTPEmail(
    to: string,
    subject: string,
    content: string,
    templateId?: string
  ): Promise<EmailSendResult> {
    try {
      console.log('Sending SMTP email to:', to);

      // Call the edge function for sending emails
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          content,
          templateId
        }
      });

      if (error) {
        throw error;
      }

      // Mock email logs since email_logs table doesn't exist
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('Mock email log: Email sent', {
          user_id: user.id,
          recipient: to,
          subject: subject,
          template_id: templateId,
          sent_at: new Date().toISOString(),
          status: 'sent',
          message_id: data?.id
        });
      }

      return {
        success: true,
        messageId: data?.id
      };
    } catch (error) {
      console.error('SMTP email failed:', error);
      
      // Mock email failure log
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('Mock email log: Email failed', {
          user_id: user.id,
          recipient: to,
          subject: subject,
          template_id: templateId,
          sent_at: new Date().toISOString(),
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email send failed'
      };
    }
  }

  // Connect to ATS systems
  static async connectATSSystem(
    userId: string,
    atsProvider: string,
    credentials: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Connecting to ${atsProvider} ATS for user:`, userId);

      // Validate ATS credentials
      const isValid = await this.validateATSCredentials(atsProvider, credentials);
      
      if (!isValid) {
        return {
          success: false,
          error: 'Invalid ATS credentials'
        };
      }

      // Mock ATS integration storage since ats_integrations table doesn't exist
      console.log('Mock ATS integration stored:', {
        user_id: userId,
        ats_provider: atsProvider,
        credentials_encrypted: JSON.stringify(credentials), // Would encrypt in real app
        is_active: true,
        connected_at: new Date().toISOString(),
        last_sync: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('ATS connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  private static async validateATSCredentials(
    provider: string,
    credentials: Record<string, any>
  ): Promise<boolean> {
    // This would implement actual ATS API validation
    // For demo purposes, just check if credentials exist
    return Object.keys(credentials).length > 0;
  }

  // Sync ATS job applications
  static async syncATSApplications(userId: string): Promise<{
    success: boolean;
    applicationsCount: number;
    error?: string;
  }> {
    try {
      // Mock ATS integrations since ats_integrations table doesn't exist
      console.log('Mock ATS sync: Getting integrations for user:', userId);
      
      const mockIntegrations = [
        {
          ats_provider: 'workday',
          is_active: true,
          credentials_encrypted: 'mock_credentials'
        }
      ];

      let totalApplications = 0;

      for (const integration of mockIntegrations) {
        const apps = await this.fetchATSApplications(integration);
        totalApplications += apps.length;

        // Store applications in existing job_applications table
        for (const app of apps) {
          await supabase
            .from('job_applications')
            .upsert({
              user_id: userId,
              job_id: app.id,
              // Use existing columns only
              status: app.status,
              applied_at: app.appliedDate,
              notes: `ATS sync from ${integration.ats_provider}`,
              contact_person: app.company
            });
        }
      }

      return {
        success: true,
        applicationsCount: totalApplications
      };
    } catch (error) {
      console.error('ATS sync failed:', error);
      return {
        success: false,
        applicationsCount: 0,
        error: error instanceof Error ? error.message : 'Sync failed'
      };
    }
  }

  private static async fetchATSApplications(integration: any): Promise<any[]> {
    // This would implement actual ATS API calls
    // For demo purposes, return mock data
    return [
      {
        id: 'ats_app_1',
        jobTitle: 'Software Engineer',
        company: 'Tech Corp',
        appliedDate: new Date().toISOString(),
        status: 'applied'
      }
    ];
  }

  // Get integration status
  static async getIntegrationStatus(userId: string): Promise<{
    linkedin: boolean;
    googleCalendar: boolean;
    outlookCalendar: boolean;
    atsIntegrations: string[];
  }> {
    try {
      // Mock integration status since oauth_integrations and ats_integrations tables don't exist
      console.log('Mock integration status for user:', userId);

      return {
        linkedin: false, // Would check oauth_integrations table
        googleCalendar: false, // Would check oauth_integrations table
        outlookCalendar: false, // Would check oauth_integrations table
        atsIntegrations: [] // Would check ats_integrations table
      };
    } catch (error) {
      console.error('Failed to get integration status:', error);
      return {
        linkedin: false,
        googleCalendar: false,
        outlookCalendar: false,
        atsIntegrations: []
      };
    }
  }
}
