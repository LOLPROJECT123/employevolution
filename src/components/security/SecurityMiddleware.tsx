
import React, { useEffect } from 'react';
import { securityService } from '@/services/securityService';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  useEffect(() => {
    // Set up security headers
    const setSecurityHeaders = () => {
      // Content Security Policy
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.ipify.org https://pmcuyiwuobhqexbpkgnd.supabase.co; font-src 'self' data:;";
      document.head.appendChild(meta);

      // X-Frame-Options
      const frameOptions = document.createElement('meta');
      frameOptions.httpEquiv = 'X-Frame-Options';
      frameOptions.content = 'DENY';
      document.head.appendChild(frameOptions);

      // X-Content-Type-Options
      const contentType = document.createElement('meta');
      contentType.httpEquiv = 'X-Content-Type-Options';
      contentType.content = 'nosniff';
      document.head.appendChild(contentType);
    };

    // Monitor for suspicious activity
    const monitorActivity = () => {
      // Monitor for rapid form submissions
      let formSubmissions = 0;
      const formSubmissionWindow = 60000; // 1 minute
      
      const handleFormSubmit = () => {
        formSubmissions++;
        if (formSubmissions > 10) {
          securityService.detectSuspiciousActivity('Rapid form submissions detected');
        }
        
        setTimeout(() => {
          formSubmissions = Math.max(0, formSubmissions - 1);
        }, formSubmissionWindow);
      };

      // Monitor for console access
      const handleConsoleAccess = () => {
        securityService.detectSuspiciousActivity('Developer console accessed');
      };

      // Add event listeners
      document.addEventListener('submit', handleFormSubmit);
      
      // Detect developer tools
      let devtools = false;
      setInterval(() => {
        const start = performance.now();
        console.log('');
        const end = performance.now();
        if (end - start > 100 && !devtools) {
          devtools = true;
          handleConsoleAccess();
        }
      }, 1000);

      return () => {
        document.removeEventListener('submit', handleFormSubmit);
      };
    };

    // Clean up rate limits periodically
    const cleanupInterval = setInterval(() => {
      securityService.cleanupRateLimits();
    }, 5 * 60 * 1000); // Every 5 minutes

    setSecurityHeaders();
    const cleanup = monitorActivity();

    return () => {
      cleanup();
      clearInterval(cleanupInterval);
    };
  }, []);

  return <>{children}</>;
};

export default SecurityMiddleware;
