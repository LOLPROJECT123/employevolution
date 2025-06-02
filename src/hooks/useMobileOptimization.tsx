
import { useEffect, useState } from 'react';
import { useMobile } from '@/hooks/use-mobile';

interface MobileOptimizationOptions {
  enableLazyLoading?: boolean;
  enableGestures?: boolean;
  enableHaptics?: boolean;
  enableOfflineMode?: boolean;
}

export const useMobileOptimization = (options: MobileOptimizationOptions = {}) => {
  const isMobile = useMobile();
  const [isCapacitorReady, setIsCapacitorReady] = useState(false);

  useEffect(() => {
    if (isMobile) {
      // Check if Capacitor is available
      if (window.Capacitor) {
        setIsCapacitorReady(true);
        console.log('Capacitor ready for native features');
      }

      // Enable viewport optimizations
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }

      // Disable text selection on mobile for better UX
      document.body.style.webkitUserSelect = 'none';
      document.body.style.userSelect = 'none';
    }

    return () => {
      if (isMobile) {
        document.body.style.webkitUserSelect = '';
        document.body.style.userSelect = '';
      }
    };
  }, [isMobile]);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (isCapacitorReady && window.Capacitor?.Plugins?.Haptics) {
      window.Capacitor.Plugins.Haptics.impact({ style: type });
    } else if (navigator.vibrate) {
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 50;
      navigator.vibrate(duration);
    }
  };

  const requestNotificationPermission = async () => {
    if (isCapacitorReady && window.Capacitor?.Plugins?.PushNotifications) {
      return await window.Capacitor.Plugins.PushNotifications.requestPermissions();
    } else if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return null;
  };

  return {
    isMobile,
    isCapacitorReady,
    triggerHaptic,
    requestNotificationPermission,
  };
};
