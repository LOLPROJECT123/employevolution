
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GestureNavigationService, GestureAction } from '@/services/gestureNavigationService';
import { toast } from 'sonner';

interface UseGestureNavigationOptions {
  enabled?: boolean;
  onGestureAction?: (action: GestureAction) => void;
}

export const useGestureNavigation = (options: UseGestureNavigationOptions = {}) => {
  const { enabled = true, onGestureAction } = options;
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Register route-specific gesture handlers
    const currentRoute = location.pathname;
    
    switch (currentRoute) {
      case '/jobs':
        GestureNavigationService.registerGestureHandler(
          currentRoute,
          GestureNavigationService.getJobsGestureHandler()
        );
        break;
      case '/applications':
        GestureNavigationService.registerGestureHandler(
          currentRoute,
          GestureNavigationService.getApplicationsGestureHandler()
        );
        break;
      case '/dashboard':
        GestureNavigationService.registerGestureHandler(
          currentRoute,
          GestureNavigationService.getDashboardGestureHandler()
        );
        break;
    }

    // Attach gesture listeners
    cleanupRef.current = GestureNavigationService.attachGestureListeners(
      containerRef.current,
      currentRoute
    );

    // Listen for gesture actions
    const handleGestureAction = (event: CustomEvent<GestureAction>) => {
      const action = event.detail;
      
      if (onGestureAction) {
        onGestureAction(action);
      } else {
        executeDefaultAction(action);
      }
    };

    document.addEventListener('gestureAction', handleGestureAction as EventListener);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      GestureNavigationService.unregisterGestureHandler(currentRoute);
      document.removeEventListener('gestureAction', handleGestureAction as EventListener);
    };
  }, [enabled, location.pathname, onGestureAction]);

  const executeDefaultAction = (action: GestureAction) => {
    switch (action.type) {
      case 'navigate':
        if (action.payload.direction === 'back') {
          navigate(-1);
        } else if (action.payload.route) {
          navigate(action.payload.route);
        }
        break;
        
      case 'action':
        switch (action.payload.action) {
          case 'refresh':
            window.location.reload();
            break;
          case 'saveJob':
            toast.success('Job saved! (Swipe left)');
            break;
          case 'skipJob':
            toast.info('Job skipped (Swipe right)');
            break;
          case 'viewDetails':
            toast.info('View details (Swipe up)');
            break;
          case 'showOptions':
            toast.info('Options menu (Swipe down)');
            break;
          case 'quickActions':
            toast.info('Quick actions available');
            break;
          default:
            console.log('Unhandled gesture action:', action.payload.action);
        }
        break;
        
      case 'scroll':
        // Handle scroll actions
        break;
    }
  };

  const attachToElement = (element: HTMLElement | null) => {
    containerRef.current = element;
  };

  return {
    attachToElement,
    isEnabled: enabled
  };
};
