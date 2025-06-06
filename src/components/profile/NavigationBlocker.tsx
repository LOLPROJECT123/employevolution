
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface NavigationBlockerProps {
  isBlocked: boolean;
  allowedPaths?: string[];
}

const NavigationBlocker = ({ isBlocked, allowedPaths = ['/profile', '/auth'] }: NavigationBlockerProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isBlocked) return;

    const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));
    
    if (!isAllowedPath) {
      // Block navigation and redirect back to profile
      toast({
        title: "Profile completion required",
        description: "Please complete your profile before accessing other features.",
        variant: "destructive",
      });
      
      navigate('/profile', { replace: true });
    }
  }, [location.pathname, isBlocked, allowedPaths, navigate]);

  // Block browser back/forward navigation
  useEffect(() => {
    if (!isBlocked) return;

    const handlePopState = (event: PopStateEvent) => {
      const isAllowedPath = allowedPaths.some(path => window.location.pathname.startsWith(path));
      
      if (!isAllowedPath) {
        event.preventDefault();
        window.history.pushState(null, '', '/profile');
        
        toast({
          title: "Navigation blocked",
          description: "Complete your profile to access other features.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Push current state to prevent back navigation
    window.history.pushState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isBlocked, allowedPaths]);

  return null;
};

export default NavigationBlocker;
