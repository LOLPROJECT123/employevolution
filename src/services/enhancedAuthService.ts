
import { supabase } from '@/integrations/supabase/client';
import { securityService } from './securityService';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface BiometricAuthConfig {
  enabled: boolean;
  supportedMethods: string[];
  fallbackEnabled: boolean;
}

export interface SecurityAlert {
  id: string;
  type: 'login_attempt' | 'password_change' | 'profile_update' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class EnhancedAuthService {
  // Two-factor authentication handling
  static async handleTwoFactorAuth(code: string, secret?: string): Promise<boolean> {
    try {
      // In a real implementation, this would verify the TOTP code
      // For now, we'll simulate the verification
      if (code.length !== 6 || !/^\d+$/.test(code)) {
        throw new Error('Invalid verification code format');
      }

      // Simulate TOTP verification
      const isValid = await this.verifyTOTPCode(code, secret);
      
      if (isValid) {
        // Update user's 2FA status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('user_profiles')
            .update({ 
              two_factor_enabled: true,
              two_factor_verified_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('2FA verification failed:', error);
      await this.logSecurityEvent('2fa_verification_failed', { error: error.message });
      return false;
    }
  }

  private static async verifyTOTPCode(code: string, secret?: string): Promise<boolean> {
    // This would integrate with a TOTP library like otplib in a real implementation
    // For demo purposes, we'll accept specific codes
    const validCodes = ['123456', '000000', '111111'];
    return validCodes.includes(code);
  }

  // Setup biometric authentication
  static async setupBiometricAuth(): Promise<BiometricAuthConfig> {
    try {
      if (!('credentials' in navigator)) {
        throw new Error('WebAuthn not supported');
      }

      const support = await (navigator.credentials as any).create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: 'EmployEvolution' },
          user: {
            id: new Uint8Array(16),
            name: 'user@example.com',
            displayName: 'User'
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          }
        }
      });

      const config: BiometricAuthConfig = {
        enabled: !!support,
        supportedMethods: ['fingerprint', 'face', 'voice'],
        fallbackEnabled: true
      };

      // Save biometric config to user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ 
            biometric_auth_enabled: config.enabled,
            biometric_methods: config.supportedMethods
          })
          .eq('user_id', user.id);
      }

      return config;
    } catch (error) {
      console.error('Biometric setup failed:', error);
      return {
        enabled: false,
        supportedMethods: [],
        fallbackEnabled: true
      };
    }
  }

  // Handle security alerts
  static async handleSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<void> {
    const securityAlert: SecurityAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    try {
      // Store alert in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('security_alerts')
          .insert({
            user_id: user.id,
            alert_type: securityAlert.type,
            severity: securityAlert.severity,
            message: securityAlert.message,
            ip_address: securityAlert.ipAddress,
            user_agent: securityAlert.userAgent,
            created_at: securityAlert.timestamp.toISOString()
          });
      }

      // Send real-time notification for high/critical alerts
      if (['high', 'critical'].includes(securityAlert.severity)) {
        await this.sendSecurityNotification(securityAlert);
      }

      // Log security event
      await this.logSecurityEvent('security_alert_created', {
        alertId: securityAlert.id,
        type: securityAlert.type,
        severity: securityAlert.severity
      });

    } catch (error) {
      console.error('Failed to handle security alert:', error);
    }
  }

  private static async sendSecurityNotification(alert: SecurityAlert): Promise<void> {
    // Send email notification for critical alerts
    if (alert.severity === 'critical') {
      try {
        await fetch('/api/send-security-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: alert.type,
            message: alert.message,
            timestamp: alert.timestamp
          })
        });
      } catch (error) {
        console.error('Failed to send security notification:', error);
      }
    }

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification('Security Alert', {
        body: alert.message,
        icon: '/favicon.ico',
        tag: `security-${alert.id}`
      });
    }
  }

  private static async logSecurityEvent(event: string, data: any): Promise<void> {
    try {
      await securityService.logSecurityEvent(event, data);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Enhanced session management
  static async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return false;
      }

      // Check if session is still valid
      const now = new Date().getTime();
      const expiresAt = new Date(session.expires_at || 0).getTime();
      
      if (now >= expiresAt) {
        await this.handleSecurityAlert({
          type: 'login_attempt',
          severity: 'medium',
          message: 'Session expired, please log in again'
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  // Password strength validation
  static validatePasswordStrength(password: string): { 
    score: number; 
    feedback: string[]; 
    isStrong: boolean 
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Password should be at least 8 characters long');

    // Complexity checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Add special characters');

    // Common patterns check
    const commonPatterns = ['password', '123456', 'qwerty', 'admin'];
    if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
      score -= 2;
      feedback.push('Avoid common passwords and patterns');
    }

    return {
      score: Math.max(0, score),
      feedback,
      isStrong: score >= 4 && feedback.length === 0
    };
  }
}
