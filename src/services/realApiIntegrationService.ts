
import { supabase } from '@/integrations/supabase/client';

export interface LinkedInOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface CalendarConfig {
  provider: 'google' | 'outlook';
  clientId: string;
  clientSecret: string;
}

export interface SMTPConfig {
  provider: 'sendgrid' | 'mailgun';
  apiKey: string;
  domain?: string;
}

export interface ATSConfig {
  provider: 'greenhouse' | 'lever' | 'workday';
  apiKey: string;
  baseUrl: string;
}

export class RealApiIntegrationService {
  // LinkedIn OAuth Integration
  static async authenticateLinkedIn(config: LinkedInOAuthConfig): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-oauth', {
        body: {
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri: config.redirectUri
        }
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('LinkedIn authentication failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  // Google Calendar Integration
  static async syncGoogleCalendar(config: CalendarConfig): Promise<{ success: boolean; events?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: {
          provider: config.provider,
          clientId: config.clientId,
          clientSecret: config.clientSecret
        }
      });

      if (error) throw error;

      return { success: true, events: data.events };
    } catch (error) {
      console.error('Calendar sync failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Calendar sync failed' 
      };
    }
  }

  // SMTP Email Integration
  static async sendEmailViaSMTP(config: SMTPConfig, email: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-smtp', {
        body: {
          provider: config.provider,
          apiKey: config.apiKey,
          domain: config.domain,
          email
        }
      });

      if (error) throw error;

      return { success: true, messageId: data.messageId };
    } catch (error) {
      console.error('SMTP email failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email send failed' 
      };
    }
  }

  // ATS Integration
  static async connectATS(config: ATSConfig): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('ats-integration', {
        body: {
          provider: config.provider,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl
        }
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('ATS connection failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'ATS connection failed' 
      };
    }
  }

  // Job Board API Integration
  static async searchJobBoards(query: {
    keywords: string;
    location: string;
    sources: ('indeed' | 'linkedin' | 'monster')[];
  }): Promise<{ success: boolean; jobs?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('job-board-search', {
        body: query
      });

      if (error) throw error;

      return { success: true, jobs: data.jobs };
    } catch (error) {
      console.error('Job board search failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Job search failed' 
      };
    }
  }
}
