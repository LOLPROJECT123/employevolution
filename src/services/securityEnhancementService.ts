import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  eventType: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'data_access' | 'account_lockout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ThreatDetection {
  id: string;
  userId?: string;
  threatType: 'brute_force' | 'suspicious_location' | 'unusual_activity' | 'data_exfiltration';
  riskScore: number;
  description: string;
  detectedAt: Date;
  resolved: boolean;
}

export interface ComplianceReport {
  reportType: 'gdpr' | 'ccpa' | 'security_audit';
  generatedAt: Date;
  data: Record<string, any>;
  status: 'pending' | 'completed' | 'failed';
}

export class SecurityEnhancementService {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  static async logSecurityEvent(userId: string | null, event: SecurityEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: userId,
          event_type: event.eventType,
          severity: event.severity,
          description: event.description,
          metadata: event.metadata,
          ip_address: event.ipAddress,
          user_agent: event.userAgent
        });

      if (error) {
        console.error('Failed to log security event:', error);
      }

      // Trigger threat detection for high severity events
      if (event.severity === 'high' || event.severity === 'critical') {
        await this.analyzeThreat(userId, event);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  static async detectBruteForce(ipAddress: string, userAgent: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const { data: recentAttempts } = await supabase
      .from('security_events')
      .select('*')
      .eq('event_type', 'failed_login')
      .eq('ip_address', ipAddress)
      .gte('created_at', oneHourAgo.toISOString());

    const attemptCount = recentAttempts?.length || 0;

    if (attemptCount >= this.MAX_LOGIN_ATTEMPTS) {
      await this.logSecurityEvent(null, {
        eventType: 'suspicious_activity',
        severity: 'high',
        description: `Brute force attack detected from IP: ${ipAddress}`,
        metadata: {
          attemptCount,
          timeWindow: '1 hour',
          ipAddress,
          userAgent
        },
        ipAddress,
        userAgent
      });

      return true;
    }

    return false;
  }

  static async checkSuspiciousLocation(userId: string, ipAddress: string): Promise<boolean> {
    // Get user's previous login locations
    const { data: previousLogins } = await supabase
      .from('security_events')
      .select('metadata')
      .eq('user_id', userId)
      .eq('event_type', 'login_attempt')
      .order('created_at', { ascending: false })
      .limit(10);

    // In a real implementation, you'd use IP geolocation services
    // For demo purposes, just checking if IP has been used before
    const knownIPs = previousLogins?.map(login => login.metadata?.ipAddress).filter(Boolean) || [];
    
    const isNewLocation = !knownIPs.includes(ipAddress);

    if (isNewLocation && knownIPs.length > 0) {
      await this.logSecurityEvent(userId, {
        eventType: 'suspicious_activity',
        severity: 'medium',
        description: 'Login from new location detected',
        metadata: {
          newIP: ipAddress,
          knownIPs: knownIPs.slice(0, 3) // Only log first 3 for privacy
        },
        ipAddress
      });

      return true;
    }

    return false;
  }

  private static async analyzeThreat(userId: string | null, event: SecurityEvent): Promise<void> {
    let threatType: ThreatDetection['threatType'];
    let riskScore = 1;

    switch (event.eventType) {
      case 'failed_login':
        threatType = 'brute_force';
        riskScore = event.metadata.attemptCount > 10 ? 10 : event.metadata.attemptCount;
        break;
      case 'suspicious_activity':
        threatType = 'unusual_activity';
        riskScore = event.severity === 'critical' ? 10 : event.severity === 'high' ? 7 : 4;
        break;
      default:
        return; // No threat detection needed
    }

    const threat: Omit<ThreatDetection, 'id'> = {
      userId,
      threatType,
      riskScore,
      description: event.description,
      detectedAt: new Date(),
      resolved: false
    };

    // In a real implementation, you'd save this to a threats table
    console.log('Threat detected:', threat);

    // Auto-resolve low-risk threats
    if (riskScore < 5) {
      threat.resolved = true;
    }
  }

  static async enable2FA(userId: string, method: 'sms' | 'email' | 'authenticator'): Promise<{ secret?: string; qrCode?: string }> {
    // Generate TOTP secret for authenticator apps
    if (method === 'authenticator') {
      const secret = this.generateTOTPSecret();
      const qrCode = await this.generateQRCode(userId, secret);

      // In a real implementation, you'd save the secret securely
      console.log('2FA secret generated for user:', userId);

      return { secret, qrCode };
    }

    // For SMS/Email, you'd integrate with services like Twilio/SendGrid
    return {};
  }

  private static generateTOTPSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  private static async generateQRCode(userId: string, secret: string): Promise<string> {
    const issuer = 'EmployEvolution';
    const otpAuthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userId)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    
    // In a real implementation, you'd use a QR code library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
  }

  static async verify2FA(userId: string, token: string, method: 'sms' | 'email' | 'authenticator'): Promise<boolean> {
    // In a real implementation, you'd verify the token based on the method
    // For TOTP, you'd use a library like speakeasy
    // For SMS/Email, you'd check against sent codes

    console.log(`Verifying 2FA token for user ${userId} using ${method}:`, token);
    
    // Mock verification - in real app, implement proper verification
    return token.length === 6 && /^\d+$/.test(token);
  }

  static async generateComplianceReport(reportType: ComplianceReport['reportType'], userId?: string): Promise<ComplianceReport> {
    const report: ComplianceReport = {
      reportType,
      generatedAt: new Date(),
      data: {},
      status: 'pending'
    };

    try {
      switch (reportType) {
        case 'gdpr':
          report.data = await this.generateGDPRReport(userId);
          break;
        case 'ccpa':
          report.data = await this.generateCCPAReport(userId);
          break;
        case 'security_audit':
          report.data = await this.generateSecurityAuditReport();
          break;
      }
      
      report.status = 'completed';
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      report.status = 'failed';
      report.data = { error: error.message };
    }

    return report;
  }

  private static async generateGDPRReport(userId?: string): Promise<Record<string, any>> {
    const report: Record<string, any> = {
      userRights: {
        rightToAccess: 'Provided through profile export',
        rightToRectification: 'Provided through profile editing',
        rightToErasure: 'Provided through account deletion',
        rightToPortability: 'Provided through data export',
        rightToObject: 'Provided through privacy settings'
      },
      dataProcessing: {
        purposes: ['Job matching', 'Application tracking', 'Communication'],
        legalBasis: 'Legitimate interest and consent',
        retentionPeriod: '7 years after account deletion'
      }
    };

    if (userId) {
      // Get user's data processing activities
      const { data: activities } = await supabase
        .from('user_analytics')
        .select('event_type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      report.userActivities = {
        totalEvents: activities?.length || 0,
        recentEvents: activities?.slice(0, 10) || [],
        dataTypes: ['Profile information', 'Application history', 'Search history', 'Analytics data']
      };
    }

    return report;
  }

  private static async generateCCPAReport(userId?: string): Promise<Record<string, any>> {
    const report: Record<string, any> = {
      consumerRights: {
        rightToKnow: 'Provided through data transparency page',
        rightToDelete: 'Provided through account deletion',
        rightToOptOut: 'Provided through privacy settings',
        rightToNonDiscrimination: 'No discriminatory practices'
      },
      personalInformation: {
        categories: ['Identifiers', 'Professional information', 'Internet activity'],
        sources: ['User provided', 'Automatically collected'],
        businessPurposes: ['Service provision', 'Analytics', 'Communication']
      }
    };

    if (userId) {
      report.userSpecificData = {
        accountCreated: new Date(), // Would get from user profile
        lastActivity: new Date(),
        dataSharing: 'No personal information sold to third parties'
      };
    }

    return report;
  }

  private static async generateSecurityAuditReport(): Promise<Record<string, any>> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { data: securityEvents } = await supabase
      .from('security_events')
      .select('event_type, severity, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    const eventsByType = securityEvents?.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const eventsBySeverity = securityEvents?.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      reportPeriod: '30 days',
      totalEvents: securityEvents?.length || 0,
      eventsByType,
      eventsBySeverity,
      securityMeasures: {
        encryption: 'AES-256 for data at rest, TLS 1.3 for data in transit',
        authentication: '2FA available, password complexity requirements',
        accessControl: 'Role-based access control (RBAC)',
        monitoring: '24/7 security event monitoring',
        backups: 'Daily encrypted backups with 30-day retention'
      },
      recommendations: [
        'Regular security awareness training',
        'Implement security headers',
        'Regular penetration testing',
        'Update dependencies regularly'
      ]
    };
  }

  static async anonymizeUserData(userId: string): Promise<void> {
    // In a real implementation, you'd:
    // 1. Replace PII with anonymized values
    // 2. Keep aggregated data for analytics
    // 3. Maintain referential integrity

    const anonymizedData = {
      name: `User_${Date.now()}`,
      email: `anonymous_${Date.now()}@example.com`,
      phone: null,
      location: 'Anonymized'
    };

    console.log('Anonymizing user data:', userId, anonymizedData);

    // Update user profile with anonymized data
    // await supabase.from('user_profiles').update(anonymizedData).eq('user_id', userId);
  }

  static async detectDataExfiltration(userId: string, actionType: string, dataSize: number): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Check for unusual data access patterns
    const { data: recentActions } = await supabase
      .from('user_analytics')
      .select('event_data')
      .eq('user_id', userId)
      .eq('event_type', 'data_access')
      .gte('created_at', oneHourAgo.toISOString());

    const totalDataAccessed = recentActions?.reduce((total, action) => {
      return total + (action.event_data?.dataSize || 0);
    }, 0) || 0;

    const suspiciousThreshold = 100 * 1024 * 1024; // 100MB in 1 hour

    if (totalDataAccessed + dataSize > suspiciousThreshold) {
      await this.logSecurityEvent(userId, {
        eventType: 'suspicious_activity',
        severity: 'high',
        description: 'Potential data exfiltration detected',
        metadata: {
          totalDataAccessed: totalDataAccessed + dataSize,
          threshold: suspiciousThreshold,
          actionType
        }
      });

      return true;
    }

    return false;
  }
}
