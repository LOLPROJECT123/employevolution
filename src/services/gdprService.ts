
import { supabase } from '@/integrations/supabase/client';
import { auditService } from './auditService';
import { encryptionService } from './encryptionService';

export type ConsentType = 'terms' | 'privacy' | 'marketing' | 'analytics' | 'cookies';

interface UserConsent {
  id: string;
  user_id: string;
  consent_type: ConsentType;
  consented: boolean;
  consent_date: string;
  ip_address?: string;
  withdrawn_date?: string;
}

class GDPRService {
  private static instance: GDPRService;

  private constructor() {}

  static getInstance(): GDPRService {
    if (!GDPRService.instance) {
      GDPRService.instance = new GDPRService();
    }
    return GDPRService.instance;
  }

  async recordConsent(consentType: ConsentType, consented: boolean): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const ipAddress = await this.getClientIP();

      const { error } = await supabase
        .from('user_consents')
        .upsert({
          user_id: user.user.id,
          consent_type: consentType,
          consented,
          consent_date: new Date().toISOString(),
          ip_address: ipAddress,
          withdrawn_date: consented ? null : new Date().toISOString()
        }, {
          onConflict: 'user_id,consent_type'
        });

      if (error) throw error;

      await auditService.log({
        action: `CONSENT_${consented ? 'GRANTED' : 'WITHDRAWN'}`,
        tableName: 'user_consents',
        newValues: { consent_type: consentType, consented }
      });
    } catch (error) {
      console.error('Failed to record consent:', error);
      throw error;
    }
  }

  async getUserConsents(): Promise<UserConsent[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', user.user.id);

      if (error) throw error;
      return (data || []) as UserConsent[];
    } catch (error) {
      console.error('Failed to fetch user consents:', error);
      return [];
    }
  }

  async hasConsent(consentType: ConsentType): Promise<boolean> {
    try {
      const consents = await this.getUserConsents();
      const consent = consents.find(c => c.consent_type === consentType);
      return consent?.consented || false;
    } catch (error) {
      console.error('Failed to check consent:', error);
      return false;
    }
  }

  async exportUserData(): Promise<any> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Collect all user data from various tables
      const [
        profile,
        applications,
        savedJobs,
        resumes,
        coverLetters,
        contacts,
        communications,
        interviews,
        notifications,
        documents,
        consents,
        auditLogs
      ] = await Promise.all([
        this.getUserProfile(user.user.id),
        this.getUserApplications(user.user.id),
        this.getUserSavedJobs(user.user.id),
        this.getUserResumes(user.user.id),
        this.getUserCoverLetters(user.user.id),
        this.getUserContacts(user.user.id),
        this.getUserCommunications(user.user.id),
        this.getUserInterviews(user.user.id),
        this.getUserNotifications(user.user.id),
        this.getUserDocuments(user.user.id),
        this.getUserConsents(),
        auditService.getUserAuditLogs(1000)
      ]);

      const exportData = {
        user_info: {
          id: user.user.id,
          email: user.user.email,
          created_at: user.user.created_at
        },
        profile,
        job_applications: applications,
        saved_jobs: savedJobs,
        resumes,
        cover_letters: coverLetters,
        contacts,
        communications,
        interviews,
        notifications,
        documents,
        consents,
        audit_logs: auditLogs,
        export_date: new Date().toISOString()
      };

      await auditService.logDataExport();

      return exportData;
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  async deleteUserData(): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Delete user data from all tables (in reverse dependency order)
      const tableNames = [
        'document_usage',
        'follow_up_sequence_steps',
        'follow_up_sequences',
        'user_documents',
        'communications',
        'contacts',
        'interviews',
        'cover_letters',
        'resumes',
        'saved_jobs',
        'job_applications',
        'notifications',
        'reminders',
        'saved_searches',
        'job_alerts',
        'user_consents',
        'audit_logs',
        'security_events',
        'profiles'
      ];

      for (const tableName of tableNames) {
        const { error } = await supabase
          .from(tableName as any)
          .delete()
          .eq('user_id', user.user.id);

        if (error && error.code !== 'PGRST116') {
          console.error(`Failed to delete data from ${tableName}:`, error);
        }
      }

      await auditService.logDataDeletion();

      // Finally delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(user.user.id);
      if (authError) {
        console.error('Failed to delete auth user:', authError);
      }
    } catch (error) {
      console.error('Failed to delete user data:', error);
      throw error;
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  // Helper methods to fetch data from different tables
  private async getUserProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    return data;
  }

  private async getUserApplications(userId: string) {
    const { data } = await supabase.from('job_applications').select('*').eq('user_id', userId);
    return data || [];
  }

  private async getUserSavedJobs(userId: string) {
    const { data } = await supabase.from('saved_jobs').select('*').eq('user_id', userId);
    return data || [];
  }

  private async getUserResumes(userId: string) {
    const { data } = await supabase.from('resumes').select('*').eq('user_id', userId);
    return data || [];
  }

  private async getUserCoverLetters(userId: string) {
    const { data } = await supabase.from('cover_letters').select('*').eq('user_id', userId);
    return data || [];
  }

  private async getUserContacts(userId: string) {
    const { data } = await supabase.from('contacts').select('*').eq('user_id', userId);
    return data || [];
  }

  private async getUserCommunications(userId: string) {
    const { data } = await supabase.from('communications').select('*').eq('user_id', userId);
    return data || [];
  }

  private async getUserInterviews(userId: string) {
    const { data } = await supabase.from('interviews').select('*').eq('user_id', userId);
    return data || [];
  }

  private async getUserNotifications(userId: string) {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId);
    return data || [];
  }

  private async getUserDocuments(userId: string) {
    const { data } = await supabase.from('user_documents').select('*').eq('user_id', userId);
    return data || [];
  }
}

export const gdprService = GDPRService.getInstance();
