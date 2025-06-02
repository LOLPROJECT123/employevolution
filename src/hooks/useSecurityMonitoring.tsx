
import { useEffect, useCallback } from 'react';
import { securityService } from '@/services/securityService';
import { SecurityAuditService } from '@/utils/securityAudit';
import { useAuth } from '@/hooks/useAuth';

interface SecurityEvent {
  type: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function useSecurityMonitoring() {
  const { user } = useAuth();

  const reportSecurityEvent = useCallback(async (event: SecurityEvent) => {
    if (!user) return;

    try {
      await SecurityAuditService.logSecurityEvent({
        userId: user.id,
        eventType: event.type,
        severity: event.severity,
        description: `Security event: ${event.type}`,
        metadata: event.details
      });

      // Also use the security service for additional monitoring
      await securityService.detectSuspiciousActivity(`${event.type}: ${JSON.stringify(event.details)}`);
    } catch (error) {
      console.error('Failed to report security event:', error);
    }
  }, [user]);

  const checkRateLimit = useCallback(async (endpoint: string, limit: number = 10) => {
    if (!user) return true;

    try {
      const allowed = await securityService.checkRateLimit(user.id, endpoint, limit);
      
      if (!allowed) {
        await reportSecurityEvent({
          type: 'rate_limit_exceeded',
          details: { endpoint, limit },
          severity: 'medium'
        });
      }
      
      return allowed;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error
    }
  }, [user, reportSecurityEvent]);

  useEffect(() => {
    if (!user) return;

    // Monitor for suspicious form interactions
    let formSubmissions = 0;
    const resetFormCount = () => { formSubmissions = 0; };
    const formSubmissionInterval = setInterval(resetFormCount, 60000); // Reset every minute

    const handleFormSubmit = (event: Event) => {
      formSubmissions++;
      
      if (formSubmissions > 5) {
        reportSecurityEvent({
          type: 'rapid_form_submissions',
          details: { count: formSubmissions, timeWindow: '1 minute' },
          severity: 'medium'
        });
      }
    };

    // Monitor for rapid navigation (potential bot behavior)
    let navigationCount = 0;
    const resetNavCount = () => { navigationCount = 0; };
    const navigationInterval = setInterval(resetNavCount, 30000); // Reset every 30 seconds

    const handleNavigation = () => {
      navigationCount++;
      
      if (navigationCount > 10) {
        reportSecurityEvent({
          type: 'rapid_navigation',
          details: { count: navigationCount, timeWindow: '30 seconds' },
          severity: 'low'
        });
      }
    };

    // Add event listeners
    document.addEventListener('submit', handleFormSubmit);
    window.addEventListener('popstate', handleNavigation);

    return () => {
      document.removeEventListener('submit', handleFormSubmit);
      window.removeEventListener('popstate', handleNavigation);
      clearInterval(formSubmissionInterval);
      clearInterval(navigationInterval);
    };
  }, [user, reportSecurityEvent]);

  return {
    reportSecurityEvent,
    checkRateLimit
  };
}
