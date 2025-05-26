
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  action: string;
  tableName?: string;
  recordId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  private static instance: AuditService;

  private constructor() {}

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  private async getClientInfo() {
    return {
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    };
  }

  private async getClientIP(): Promise<string> {
    try {
      // In production, you might want to use a more reliable IP detection service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('Failed to get client IP:', error);
      return 'unknown';
    }
  }

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const clientInfo = await this.getClientInfo();

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.user.id,
          action: entry.action,
          table_name: entry.tableName,
          record_id: entry.recordId,
          old_values: entry.oldValues,
          new_values: entry.newValues,
          ip_address: entry.ipAddress || clientInfo.ipAddress,
          user_agent: entry.userAgent || clientInfo.userAgent
        });

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  // Convenience methods for common actions
  async logCreate(tableName: string, recordId: string, newValues: any): Promise<void> {
    await this.log({
      action: 'CREATE',
      tableName,
      recordId,
      newValues
    });
  }

  async logUpdate(tableName: string, recordId: string, oldValues: any, newValues: any): Promise<void> {
    await this.log({
      action: 'UPDATE',
      tableName,
      recordId,
      oldValues,
      newValues
    });
  }

  async logDelete(tableName: string, recordId: string, oldValues: any): Promise<void> {
    await this.log({
      action: 'DELETE',
      tableName,
      recordId,
      oldValues
    });
  }

  async logLogin(): Promise<void> {
    await this.log({
      action: 'LOGIN'
    });
  }

  async logLogout(): Promise<void> {
    await this.log({
      action: 'LOGOUT'
    });
  }

  async logPasswordChange(): Promise<void> {
    await this.log({
      action: 'PASSWORD_CHANGE'
    });
  }

  async logDataExport(): Promise<void> {
    await this.log({
      action: 'DATA_EXPORT'
    });
  }

  async logDataDeletion(): Promise<void> {
    await this.log({
      action: 'DATA_DELETION'
    });
  }

  // Get audit logs for the current user
  async getUserAuditLogs(limit = 50): Promise<any[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }
}

export const auditService = AuditService.getInstance();
