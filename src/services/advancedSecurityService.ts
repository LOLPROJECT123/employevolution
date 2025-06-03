
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'login_attempt' | 'password_change' | 'data_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface ThreatDetectionRule {
  id: string;
  name: string;
  description: string;
  conditions: any;
  action: 'log' | 'block' | 'alert';
  enabled: boolean;
}

export class AdvancedSecurityService {
  static async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      await supabase
        .from('security_events')
        .insert({
          ...event,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  static async detectSuspiciousActivity(userId: string): Promise<{
    suspicious: boolean;
    reasons: string[];
    riskScore: number;
  }> {
    try {
      // Get recent security events for user
      const { data: events } = await supabase
        .from('security_events')
        .select('*')
        .eq('userId', userId)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      let riskScore = 0;
      const reasons: string[] = [];

      if (events) {
        // Multiple login attempts from different IPs
        const uniqueIPs = new Set(events.map(e => e.ipAddress));
        if (uniqueIPs.size > 3) {
          riskScore += 30;
          reasons.push('Multiple login attempts from different IP addresses');
        }

        // High frequency of events
        if (events.length > 50) {
          riskScore += 25;
          reasons.push('Unusually high activity frequency');
        }

        // Failed login attempts
        const failedLogins = events.filter(e => 
          e.eventType === 'login_attempt' && e.details?.success === false
        );
        if (failedLogins.length > 5) {
          riskScore += 40;
          reasons.push('Multiple failed login attempts');
        }

        // Unusual access patterns
        const accessEvents = events.filter(e => e.eventType === 'data_access');
        if (accessEvents.length > 20) {
          riskScore += 20;
          reasons.push('Unusual data access patterns');
        }
      }

      return {
        suspicious: riskScore > 50,
        reasons,
        riskScore
      };
    } catch (error) {
      console.error('Threat detection failed:', error);
      return { suspicious: false, reasons: [], riskScore: 0 };
    }
  }

  static async enableTwoFactorAuth(userId: string): Promise<{
    success: boolean;
    secret?: string;
    qrCode?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('enable-2fa', {
        body: { userId }
      });

      if (error) throw error;

      return {
        success: true,
        secret: data.secret,
        qrCode: data.qrCode
      };
    } catch (error) {
      console.error('2FA setup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to setup 2FA'
      };
    }
  }

  static async verifyTwoFactorAuth(userId: string, token: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        body: { userId, token }
      });

      if (error) throw error;

      return { success: data.verified };
    } catch (error) {
      console.error('2FA verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  static async generateComplianceReport(type: 'gdpr' | 'ccpa' | 'sox'): Promise<{
    success: boolean;
    report?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('compliance-report', {
        body: { type }
      });

      if (error) throw error;

      return { success: true, report: data };
    } catch (error) {
      console.error('Compliance report generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Report generation failed'
      };
    }
  }
}
