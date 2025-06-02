
import { SecurityAuditService } from './securityAudit';
import { supabase } from '@/integrations/supabase/client';

interface DetailedSecurityEvent {
  userId: string;
  sessionId: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceInfo?: any;
  metadata?: any;
  riskScore?: number;
}

interface SecurityPattern {
  pattern: string;
  riskLevel: number;
  description: string;
}

export class EnhancedSecurityAudit extends SecurityAuditService {
  private static securityPatterns: SecurityPattern[] = [
    { pattern: 'rapid_login_attempts', riskLevel: 8, description: 'Multiple login attempts in short time' },
    { pattern: 'unusual_location', riskLevel: 6, description: 'Login from unusual location' },
    { pattern: 'data_export_large', riskLevel: 7, description: 'Large data export request' },
    { pattern: 'profile_mass_changes', riskLevel: 5, description: 'Multiple profile changes rapidly' },
    { pattern: 'api_abuse', riskLevel: 9, description: 'API rate limit exceeded' },
    { pattern: 'suspicious_device', riskLevel: 7, description: 'Login from suspicious device' },
    { pattern: 'admin_action_attempt', riskLevel: 10, description: 'Attempted admin action by non-admin' }
  ];

  // Enhanced security event logging with risk assessment
  static async logEnhancedSecurityEvent(event: DetailedSecurityEvent): Promise<void> {
    try {
      // Calculate risk score if not provided
      if (!event.riskScore) {
        event.riskScore = this.calculateRiskScore(event);
      }

      // Get additional context
      const deviceInfo = this.getDeviceInfo();
      const location = await this.getLocationInfo(event.ipAddress);

      const enhancedEvent = {
        ...event,
        deviceInfo,
        location,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId()
      };

      // Log to Supabase
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: enhancedEvent.userId,
          event_type: enhancedEvent.eventType,
          severity: enhancedEvent.severity,
          description: enhancedEvent.description,
          ip_address: enhancedEvent.ipAddress,
          user_agent: enhancedEvent.userAgent,
          metadata: {
            ...enhancedEvent.metadata,
            deviceInfo: enhancedEvent.deviceInfo,
            location: enhancedEvent.location,
            riskScore: enhancedEvent.riskScore,
            sessionId: enhancedEvent.sessionId
          }
        });

      if (error) {
        console.error('Failed to log enhanced security event:', error);
      }

      // Trigger alerts for high-risk events
      if (event.riskScore >= 8) {
        await this.triggerSecurityAlert(enhancedEvent);
      }

    } catch (error) {
      console.error('Enhanced security logging failed:', error);
    }
  }

  // Calculate risk score based on event characteristics
  private static calculateRiskScore(event: DetailedSecurityEvent): number {
    let riskScore = 1;

    // Base risk from patterns
    const pattern = this.securityPatterns.find(p => p.pattern === event.eventType);
    if (pattern) {
      riskScore = pattern.riskLevel;
    }

    // Increase risk for critical severity
    if (event.severity === 'critical') {
      riskScore += 3;
    } else if (event.severity === 'high') {
      riskScore += 2;
    }

    // Time-based risk (unusual hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 1;
    }

    // Frequency-based risk
    const recentEvents = this.getRecentEventCount(event.userId, event.eventType);
    if (recentEvents > 5) {
      riskScore += 2;
    }

    return Math.min(riskScore, 10); // Cap at 10
  }

  // Get device information
  private static getDeviceInfo(): any {
    return {
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      touchSupport: 'ontouchstart' in window
    };
  }

  // Get location information from IP
  private static async getLocationInfo(ipAddress?: string): Promise<any> {
    if (!ipAddress) return null;

    try {
      // This would typically use a geolocation API
      // For demo purposes, we'll return mock data
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        isp: 'Unknown'
      };
    } catch (error) {
      return null;
    }
  }

  // Get or generate session ID
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('security_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('security_session_id', sessionId);
    }
    return sessionId;
  }

  // Get recent event count for frequency analysis
  private static getRecentEventCount(userId: string, eventType: string): number {
    // This would query recent events from the database
    // For now, return a mock value
    return Math.floor(Math.random() * 10);
  }

  // Trigger security alerts for high-risk events
  private static async triggerSecurityAlert(event: DetailedSecurityEvent): Promise<void> {
    console.warn('HIGH RISK SECURITY EVENT DETECTED:', {
      userId: event.userId,
      eventType: event.eventType,
      riskScore: event.riskScore,
      timestamp: new Date().toISOString()
    });

    // In a real application, this would:
    // 1. Send notifications to security team
    // 2. Log to external security monitoring systems
    // 3. Potentially trigger automated responses
  }

  // Analyze security trends
  static async getSecurityTrends(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const events = data || [];
      
      return {
        totalEvents: events.length,
        riskDistribution: this.calculateRiskDistribution(events),
        eventTypes: this.calculateEventTypeDistribution(events),
        timelineData: this.generateTimelineData(events),
        recommendations: this.generateSecurityRecommendations(events)
      };
    } catch (error) {
      console.error('Failed to get security trends:', error);
      return null;
    }
  }

  private static calculateRiskDistribution(events: any[]): any {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    
    events.forEach(event => {
      const riskScore = event.metadata?.riskScore || 1;
      if (riskScore <= 3) distribution.low++;
      else if (riskScore <= 6) distribution.medium++;
      else if (riskScore <= 8) distribution.high++;
      else distribution.critical++;
    });

    return distribution;
  }

  private static calculateEventTypeDistribution(events: any[]): any {
    const distribution: { [key: string]: number } = {};
    
    events.forEach(event => {
      distribution[event.event_type] = (distribution[event.event_type] || 0) + 1;
    });

    return Object.entries(distribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));
  }

  private static generateTimelineData(events: any[]): any[] {
    const timeline: { [key: string]: number } = {};
    
    events.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });

    return Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private static generateSecurityRecommendations(events: any[]): string[] {
    const recommendations: string[] = [];
    
    const highRiskEvents = events.filter(e => (e.metadata?.riskScore || 1) >= 7);
    const recentEvents = events.filter(e => 
      new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    if (highRiskEvents.length > 0) {
      recommendations.push('Review high-risk security events and consider additional authentication measures');
    }

    if (recentEvents.length > 10) {
      recommendations.push('High activity detected - monitor for unusual patterns');
    }

    const loginEvents = events.filter(e => e.event_type.includes('login'));
    if (loginEvents.length > 20) {
      recommendations.push('Consider enabling two-factor authentication for enhanced security');
    }

    if (recommendations.length === 0) {
      recommendations.push('Security posture looks good - continue monitoring');
    }

    return recommendations;
  }
}
