
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UseSessionTimeoutProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export const useSessionTimeout = ({ 
  timeoutMinutes = 30, 
  warningMinutes = 5 
}: UseSessionTimeoutProps = {}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const resetTimeout = useCallback(() => {
    setShowWarning(false);
    setTimeLeft(timeoutMinutes * 60);
  }, [timeoutMinutes]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    toast({
      title: "Session expired",
      description: "You have been logged out due to inactivity.",
      variant: "destructive",
    });
  }, []);

  const extendSession = useCallback(() => {
    resetTimeout();
    toast({
      title: "Session extended",
      description: "Your session has been extended.",
    });
  }, [resetTimeout]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        resetTimeout();
        
        interval = setInterval(() => {
          setTimeLeft(prev => {
            const newTime = prev - 1;
            
            if (newTime <= warningMinutes * 60 && !showWarning) {
              setShowWarning(true);
            }
            
            if (newTime <= 0) {
              handleLogout();
              return 0;
            }
            
            return newTime;
          });
        }, 1000);
      } else {
        if (interval) clearInterval(interval);
        setShowWarning(false);
      }
    });

    // Reset timeout on user activity
    const resetOnActivity = () => {
      if (timeLeft > 0) resetTimeout();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetOnActivity, true);
    });

    return () => {
      subscription.unsubscribe();
      if (interval) clearInterval(interval);
      events.forEach(event => {
        document.removeEventListener(event, resetOnActivity, true);
      });
    };
  }, [timeLeft, showWarning, resetTimeout, handleLogout, warningMinutes]);

  return {
    showWarning,
    timeLeft,
    extendSession,
    formatTimeLeft: () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
};
