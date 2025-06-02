
import { supabase } from '@/integrations/supabase/client';

export interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivity: number;
  blockedIPs: string[];
  activeThreats: number;
}

export interface SecurityAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  userId?: string;
  ipAddress?: string;
  timestamp: string;
}

export class SecurityEnhancementService {
  private static alertThresholds = {
    failedLoginAttempts: 5,
    suspiciousActivityScore: 80,
    rateLimitExceeded: 100
  };

  static async analyzeSecurityEvents(timeRange: {
    startDate: string;
    endDate: string;
  }): Promise<SecurityMetrics> {
    try {
      // Get security events from existing security_events table
      const { data: securityEvents } = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', timeRange.startDate)
        .lte('created_at', timeRange.endDate);

      const events = securityEvents || [];

      // Analyze failed logins
      const failedLogins = events.filter(e => 
        e.event_type === 'failed_login'
      ).length;

      // Count suspicious activities
      const suspiciousActivity = events.filter(e => 
        e.severity === 'high' || e.severity === 'critical'
      ).length;

      // Extract blocked IPs from metadata
      const blockedIPs: string[] = [];
      events.forEach(event => {
        if (event.metadata && typeof event.metadata === 'object') {
          const metadata = event.metadata as any;
          if (metadata.ipAddress && metadata.blocked) {
            blockedIPs.push(metadata.ipAddress);
          }
        }
      });

      // Count active threats
      const activeThreats = events.filter(e => 
        e.severity === 'critical' && 
        new Date(e.created_at || '').getTime() > Date.now() - (24 * 60 * 60 * 1000)
      ).length;

      return {
        failedLogins,
        suspiciousActivity,
        blockedIPs: [...new Set(blockedIPs)],
        activeThreats
      };
    } catch (error) {
      console.error('Failed to analyze security events:', error);
      return {
        failedLogins: 0,
        suspiciousActivity: 0,
        blockedIPs: [],
        activeThreats: 0
      };
    }
  }

  static async detectAnomalousActivity(userId: string): Promise<{
    score: number;
    anomalies: string[];
    recommendations: string[];
  }> {
    try {
      // Get user's security events
      const { data: userEvents } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      const events = userEvents || [];
      let anomalyScore = 0;
      const anomalies: string[] = [];
      const recommendations: string[] = [];

      // Check for rapid login attempts
      const recentLogins = events.filter(e => 
        e.event_type === 'failed_login' &&
        new Date(e.created_at || '').getTime() > Date.now() - (60 * 60 * 1000)
      );

      if (recentLogins.length > this.alertThresholds.failedLoginAttempts) {
        anomalyScore += 30;
        anomalies.push('Multiple failed login attempts detected');
        recommendations.push('Enable two-factor authentication');
      }

      // Check for unusual IP addresses
      const ipAddresses = new Set(
        events
          .map(e => e.ip_address)
          .filter(Boolean)
      );

      if (ipAddresses.size > 5) {
        anomalyScore += 20;
        anomalies.push('Access from multiple IP addresses');
        recommendations.push('Review recent login locations');
      }

      // Check for high-severity events
      const criticalEvents = events.filter(e => e.severity === 'critical');
      if (criticalEvents.length > 0) {
        anomalyScore += 50;
        anomalies.push('Critical security events detected');
        recommendations.push('Immediate security review required');
      }

      return {
        score: Math.min(anomalyScore, 100),
        anomalies,
        recommendations
      };
    } catch (error) {
      console.error('Failed to detect anomalous activity:', error);
      return {
        score: 0,
        anomalies: [],
        recommendations: []
      };
    }
  }

  static async generateSecurityReport(organizationId?: string): Promise<{
    overview: SecurityMetrics;
    alerts: SecurityAlert[];
    recommendations: string[];
    complianceStatus: Record<string, boolean>;
  }> {
    try {
      const timeRange = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      };

      const overview = await this.analyzeSecurityEvents(timeRange);

      // Mock alerts since user_analytics table doesn't exist
      const alerts: SecurityAlert[] = [];
      console.log('Mock security: Generating alerts for organization:', organizationId);

      const recommendations = [
        'Enable multi-factor authentication for all users',
        'Implement regular security training sessions',
        'Review and update access controls quarterly',
        'Monitor for unusual login patterns',
        'Keep security policies up to date'
      ];

      const complianceStatus = {
        gdprCompliant: true,
        iso27001Compliant: false,
        socCompliant: false,
        hipaaCompliant: false
      };

      return {
        overview,
        alerts,
        recommendations,
        complianceStatus
      };
    } catch (error) {
      console.error('Failed to generate security report:', error);
      throw error;
    }
  }

  static async trackUserBehavior(userId: string, action: string, metadata: any): Promise<void> {
    try {
      // Mock tracking since user_analytics table doesn't exist
      console.log('Mock security: Tracking user behavior', {
        user_id: userId,
        action,
        metadata,
        timestamp: new Date().toISOString()
      });

      // Also log to audit trail
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: `behavior_${action}`,
          metadata: metadata,
          ip_address: 'unknown',
          user_agent: navigator.userAgent,
          table_name: 'user_behavior'
        });
    } catch (error) {
      console.error('Failed to track user behavior:', error);
    }
  }

  static async analyzeUserPatterns(userId: string): Promise<{
    riskScore: number;
    patterns: string[];
    alerts: SecurityAlert[];
  }> {
    try {
      // Mock analysis since user_analytics table doesn't exist
      console.log('Mock security: Analyzing patterns for user:', userId);

      // Get audit logs as a proxy for user behavior
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      const logs = auditLogs || [];
      
      const patterns: string[] = [];
      const alerts: SecurityAlert[] = [];
      let riskScore = 0;

      // Analyze login patterns from audit logs
      const loginActions = logs.filter(log => 
        log.action.includes('login') || log.action.includes('auth')
      );

      if (loginActions.length > 20) {
        patterns.push('High frequency login activity');
        riskScore += 10;
      }

      // Check for data access patterns
      const dataActions = logs.filter(log =>
        log.action.includes('select') || log.action.includes('export')
      );

      if (dataActions.length > 10) {
        patterns.push('Frequent data access');
        riskScore += 5;
      }

      return {
        riskScore: Math.min(riskScore, 100),
        patterns,
        alerts
      };
    } catch (error) {
      console.error('Failed to analyze user patterns:', error);
      return {
        riskScore: 0,
        patterns: [],
        alerts: []
      };
    }
  }
}
