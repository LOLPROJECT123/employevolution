
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: any;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface SecurityThreat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigated: boolean;
  detectedAt: string;
}

export class AdvancedSecurityService {
  static async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .insert({
          user_id: event.userId,
          event_type: event.eventType,
          severity: event.severity,
          description: event.description,
          metadata: event.metadata,
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log security event:', error);
        return;
      }

      console.log('Security event logged:', event);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  static async getSecurityEvents(userId: string, limit: number = 50): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch security events:', error);
        return [];
      }

      return (data || []).map(event => ({
        id: event.id,
        userId: event.user_id,
        eventType: event.event_type,
        severity: event.severity as 'low' | 'medium' | 'high' | 'critical',
        description: event.description,
        metadata: event.metadata,
        timestamp: event.created_at,
        ipAddress: String(event.ip_address || ''),
        userAgent: event.user_agent || ''
      }));
    } catch (error) {
      console.error('Failed to fetch security events:', error);
      return [];
    }
  }

  static async detectAnomalies(userId: string): Promise<SecurityThreat[]> {
    try {
      const events = await this.getSecurityEvents(userId, 100);
      const threats: SecurityThreat[] = [];

      // Simple anomaly detection based on event patterns
      const recentEvents = events.filter(e => 
        new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      // Check for multiple failed login attempts
      const failedLogins = recentEvents.filter(e => e.eventType === 'failed_login');
      if (failedLogins.length > 5) {
        threats.push({
          id: `threat-${Date.now()}`,
          type: 'brute_force',
          severity: 'high',
          description: `${failedLogins.length} failed login attempts detected`,
          mitigated: false,
          detectedAt: new Date().toISOString()
        });
      }

      // Check for suspicious IP addresses
      const ipAddresses = new Set(recentEvents.map(e => e.ipAddress));
      if (ipAddresses.size > 10) {
        threats.push({
          id: `threat-${Date.now() + 1}`,
          type: 'multiple_ips',
          severity: 'medium',
          description: `Access from ${ipAddresses.size} different IP addresses`,
          mitigated: false,
          detectedAt: new Date().toISOString()
        });
      }

      return threats;
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
      return [];
    }
  }

  static async generateSecurityReport(userId: string): Promise<{
    totalEvents: number;
    criticalEvents: number;
    recentThreats: SecurityThreat[];
    recommendations: string[];
  }> {
    try {
      const events = await this.getSecurityEvents(userId);
      const threats = await this.detectAnomalies(userId);

      const criticalEvents = events.filter(e => e.severity === 'critical').length;
      
      const recommendations = [];
      if (criticalEvents > 0) {
        recommendations.push('Review critical security events immediately');
      }
      if (threats.length > 0) {
        recommendations.push('Address detected security threats');
      }
      recommendations.push('Enable two-factor authentication if not already active');
      recommendations.push('Review recent login activity');

      return {
        totalEvents: events.length,
        criticalEvents,
        recentThreats: threats.slice(0, 5),
        recommendations
      };
    } catch (error) {
      console.error('Failed to generate security report:', error);
      return {
        totalEvents: 0,
        criticalEvents: 0,
        recentThreats: [],
        recommendations: ['Unable to generate security report']
      };
    }
  }
}
