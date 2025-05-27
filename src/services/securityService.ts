
import { supabase } from '@/integrations/supabase/client';

export type SecurityEventType = 
  | 'failed_login' 
  | 'suspicious_activity' 
  | 'rate_limit_exceeded' 
  | 'unauthorized_access'
  | 'data_breach_attempt';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

interface SecurityEvent {
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  metadata?: any;
}

class SecurityService {
  private static instance: SecurityService;
  private failedLoginAttempts = new Map<string, number>();

  private constructor() {}

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const clientInfo = await this.getClientInfo();

      // Only log if we have proper authentication or if it's a system event
      const { error } = await supabase
        .from('security_events')
        .insert({
          user_id: user.user?.id || null, // Allow null for system events
          event_type: event.eventType,
          severity: event.severity,
          description: event.description,
          ip_address: clientInfo.ipAddress,
          user_agent: clientInfo.userAgent,
          metadata: event.metadata
        });

      if (error) {
        console.error('Failed to log security event:', error);
        // Don't throw here to avoid breaking auth flow
      }

      // Alert on high/critical events
      if (event.severity === 'high' || event.severity === 'critical') {
        console.warn(`Security Alert [${event.severity.toUpperCase()}]: ${event.description}`);
      }
    } catch (error) {
      console.error('Security event logging failed:', error);
      // Don't throw here to avoid breaking auth flow
    }
  }

  private async getClientInfo() {
    return {
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    };
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

  async recordFailedLogin(email: string): Promise<boolean> {
    const attempts = this.failedLoginAttempts.get(email) || 0;
    const newAttempts = attempts + 1;
    this.failedLoginAttempts.set(email, newAttempts);

    // Log the failed login attempt but don't break if it fails
    await this.logSecurityEvent({
      eventType: 'failed_login',
      severity: newAttempts > 3 ? 'medium' : 'low',
      description: `Failed login attempt for email: ${email}`,
      metadata: { attempts: newAttempts, email }
    });

    // Return true if account should be locked (more than 5 attempts)
    return newAttempts > 5;
  }

  clearFailedLoginAttempts(email: string): void {
    this.failedLoginAttempts.delete(email);
  }

  async checkRateLimit(identifier: string, endpoint: string, maxRequests = 100): Promise<boolean> {
    try {
      const windowStart = new Date(Date.now() - 60 * 60 * 1000); // 1 hour window

      // Get current count for this identifier and endpoint
      const { data: existing, error: selectError } = await supabase
        .from('rate_limits')
        .select('requests_count')
        .eq('identifier', identifier)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Rate limit check failed:', selectError);
        return true; // Allow request if check fails
      }

      const currentCount = existing?.requests_count || 0;

      if (currentCount >= maxRequests) {
        await this.logSecurityEvent({
          eventType: 'rate_limit_exceeded',
          severity: 'medium',
          description: `Rate limit exceeded for ${endpoint}`,
          metadata: { identifier, endpoint, requests: currentCount }
        });
        return false; // Block request
      }

      // Update or insert rate limit record
      const { error: upsertError } = await supabase
        .from('rate_limits')
        .upsert({
          identifier,
          endpoint,
          requests_count: currentCount + 1,
          window_start: existing ? undefined : new Date().toISOString()
        }, {
          onConflict: 'identifier,endpoint'
        });

      if (upsertError) {
        console.error('Rate limit update failed:', upsertError);
      }

      return true; // Allow request
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow request if check fails
    }
  }

  async detectSuspiciousActivity(activity: string, metadata?: any): Promise<void> {
    await this.logSecurityEvent({
      eventType: 'suspicious_activity',
      severity: 'medium',
      description: `Suspicious activity detected: ${activity}`,
      metadata
    });
  }

  // Clean up old rate limit records (call this periodically)
  async cleanupRateLimits(): Promise<void> {
    try {
      const { error } = await supabase.rpc('cleanup_rate_limits');
      if (error) {
        console.error('Rate limit cleanup failed:', error);
      }
    } catch (error) {
      console.error('Rate limit cleanup error:', error);
    }
  }
}

export const securityService = SecurityService.getInstance();
