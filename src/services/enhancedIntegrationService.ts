
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

      // Store LinkedIn integration
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('oauth_integrations')
          .upsert({
            user_id: user.id,
            provider: 'linkedin',
            provider_user_id: profile.id,
            access_token_encrypted: 'encrypted_token', // Would encrypt in real app
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
      
      // Store events in our database
      let syncedCount = 0;
      for (const event of events) {
        try {
          await supabase
            .from('calendar_events')
            .upsert({
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

      // Log email sent
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('email_logs')
          .insert({
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
      
      // Log email failure
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('email_logs')
          .insert({
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

      // Store ATS integration
      await supabase
        .from('ats_integrations')
        .upsert({
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
      // Get user's ATS integrations
      const { data: integrations } = await supabase
        .from('ats_integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      let totalApplications = 0;

      if (integrations) {
        for (const integration of integrations) {
          const apps = await this.fetchATSApplications(integration);
          totalApplications += apps.length;

          // Store applications
          for (const app of apps) {
            await supabase
              .from('job_applications')
              .upsert({
                user_id: userId,
                job_title: app.jobTitle,
                company_name: app.company,
                application_date: app.appliedDate,
                status: app.status,
                ats_application_id: app.id,
                ats_provider: integration.ats_provider,
                synced_at: new Date().toISOString()
              });
          }
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
      const { data: oauthIntegrations } = await supabase
        .from('oauth_integrations')
        .select('provider')
        .eq('user_id', userId)
        .eq('is_active', true);

      const { data: atsIntegrations } = await supabase
        .from('ats_integrations')
        .select('ats_provider')
        .eq('user_id', userId)
        .eq('is_active', true);

      const providers = oauthIntegrations?.map(i => i.provider) || [];
      const atsProviders = atsIntegrations?.map(i => i.ats_provider) || [];

      return {
        linkedin: providers.includes('linkedin'),
        googleCalendar: providers.includes('google'),
        outlookCalendar: providers.includes('outlook'),
        atsIntegrations: atsProviders
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
