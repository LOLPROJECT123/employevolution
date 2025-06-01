
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  userId: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface SecurityEvent {
  userId: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export class SecurityAuditService {
  // Log profile changes for audit trail
  static async logProfileChange(auditEntry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: auditEntry.userId,
          action: auditEntry.action,
          table_name: auditEntry.tableName,
          record_id: auditEntry.recordId,
          old_values: auditEntry.oldValues,
          new_values: auditEntry.newValues,
          ip_address: auditEntry.ipAddress,
          user_agent: auditEntry.userAgent,
          created_at: auditEntry.timestamp.toISOString()
        });

      if (error) {
        console.error('Error logging audit entry:', error);
      }
    } catch (error) {
      console.error('Error in logProfileChange:', error);
    }
  }

  // Log security events
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: event.userId,
          event_type: event.eventType,
          severity: event.severity,
          description: event.description,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          metadata: event.metadata,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging security event:', error);
      }
    } catch (error) {
      console.error('Error in logSecurityEvent:', error);
    }
  }

  // GDPR compliance - delete user data
  static async deleteUserData(userId: string): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    const tables = [
      'user_profiles',
      'work_experiences',
      'education',
      'user_skills',
      'user_languages',
      'projects',
      'activities_leadership',
      'user_resume_files',
      'user_onboarding',
      'profile_completion_tracking',
      'audit_logs',
      'security_events'
    ];

    try {
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);

        if (error) {
          errors.push(`Failed to delete from ${table}: ${error.message}`);
        }
      }

      // Log the deletion
      if (errors.length === 0) {
        await this.logSecurityEvent({
          userId,
          eventType: 'data_deletion',
          severity: 'medium',
          description: 'User requested complete data deletion (GDPR)',
          metadata: { tables_affected: tables }
        });
      }

      return {
        success: errors.length === 0,
        errors
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Encrypt sensitive data (basic implementation)
  static encryptSensitiveData(data: string, key?: string): string {
    // In production, use proper encryption library like crypto-js
    // This is a basic example
    try {
      const encoded = btoa(data);
      return encoded;
    } catch (error) {
      console.error('Error encrypting data:', error);
      return data;
    }
  }

  // Decrypt sensitive data (basic implementation)
  static decryptSensitiveData(encryptedData: string, key?: string): string {
    // In production, use proper decryption
    try {
      const decoded = atob(encryptedData);
      return decoded;
    } catch (error) {
      console.error('Error decrypting data:', error);
      return encryptedData;
    }
  }

  // Get audit trail for a user
  static async getUserAuditTrail(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching audit trail:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserAuditTrail:', error);
      return [];
    }
  }

  // Get security events for a user
  static async getUserSecurityEvents(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching security events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserSecurityEvents:', error);
      return [];
    }
  }
}
