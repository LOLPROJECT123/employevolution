
import { useState, useEffect } from 'react';
import { RealTimeService, LiveJobAlert } from '@/services/realTimeService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useLiveJobAlerts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<LiveJobAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = RealTimeService.subscribeToJobAlerts(
      user.id,
      (alert: LiveJobAlert) => {
        setAlerts(prev => [alert, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast({
          title: "New Job Alert",
          description: `New ${alert.job_data.title} position at ${alert.job_data.company}`,
          duration: 5000,
        });

        // Send browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('New Job Alert', {
            body: `${alert.job_data.title} at ${alert.job_data.company}`,
            icon: '/favicon.ico'
          });
        }
      }
    );

    // Load existing alerts
    loadExistingAlerts();

    return unsubscribe;
  }, [user, toast]);

  const loadExistingAlerts = async () => {
    // Implementation would load from Supabase
    console.log('Loading existing job alerts...');
  };

  const markAsViewed = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, is_viewed: true }
          : alert
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    setUnreadCount(0);
  };

  return {
    alerts,
    unreadCount,
    markAsViewed,
    clearAllAlerts
  };
};
