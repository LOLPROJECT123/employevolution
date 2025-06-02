
export interface GestureConfig {
  swipeThreshold: number;
  velocityThreshold: number;
  touchTimeThreshold: number;
  hapticFeedback: boolean;
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  startTime: number;
  endTime: number;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
}

export interface GestureAction {
  type: 'navigate' | 'action' | 'scroll';
  payload: any;
  haptic?: 'light' | 'medium' | 'heavy';
}

export class GestureNavigationService {
  private static readonly DEFAULT_CONFIG: GestureConfig = {
    swipeThreshold: 50, // minimum distance for swipe
    velocityThreshold: 0.3, // minimum velocity
    touchTimeThreshold: 500, // maximum time for swipe
    hapticFeedback: true
  };

  private static config: GestureConfig = this.DEFAULT_CONFIG;
  private static gestureCallbacks: Map<string, (gesture: SwipeGesture) => GestureAction | null> = new Map();

  static configure(newConfig: Partial<GestureConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  static registerGestureHandler(route: string, handler: (gesture: SwipeGesture) => GestureAction | null) {
    this.gestureCallbacks.set(route, handler);
  }

  static unregisterGestureHandler(route: string) {
    this.gestureCallbacks.delete(route);
  }

  static attachGestureListeners(element: HTMLElement, currentRoute: string) {
    let startTouch: Touch | null = null;
    let startTime = 0;
    let startPosition = { x: 0, y: 0 };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startTouch = e.touches[0];
        startTime = Date.now();
        startPosition = { x: startTouch.clientX, y: startTouch.clientY };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startTouch || e.changedTouches.length !== 1) return;

      const endTouch = e.changedTouches[0];
      const endTime = Date.now();
      const endPosition = { x: endTouch.clientX, y: endTouch.clientY };

      const gesture = this.calculateGesture(
        startPosition,
        endPosition,
        startTime,
        endTime
      );

      if (this.isValidGesture(gesture)) {
        const action = this.processGesture(gesture, currentRoute);
        if (action) {
          this.executeGestureAction(action);
        }
      }

      startTouch = null;
    };

    const handleTouchCancel = () => {
      startTouch = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }

  private static calculateGesture(
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
    startTime: number,
    endTime: number
  ): SwipeGesture {
    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const time = endTime - startTime;
    const velocity = distance / time;

    let direction: SwipeGesture['direction'];
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    return {
      direction,
      distance,
      velocity,
      startTime,
      endTime,
      startPosition: startPos,
      endPosition: endPos
    };
  }

  private static isValidGesture(gesture: SwipeGesture): boolean {
    const timeDiff = gesture.endTime - gesture.startTime;
    return (
      gesture.distance >= this.config.swipeThreshold &&
      gesture.velocity >= this.config.velocityThreshold &&
      timeDiff <= this.config.touchTimeThreshold
    );
  }

  private static processGesture(gesture: SwipeGesture, currentRoute: string): GestureAction | null {
    // Try route-specific handler first
    const routeHandler = this.gestureCallbacks.get(currentRoute);
    if (routeHandler) {
      const action = routeHandler(gesture);
      if (action) return action;
    }

    // Fall back to default gestures
    return this.getDefaultGestureAction(gesture, currentRoute);
  }

  private static getDefaultGestureAction(gesture: SwipeGesture, currentRoute: string): GestureAction | null {
    switch (gesture.direction) {
      case 'right':
        // Navigate back
        if (currentRoute !== '/dashboard') {
          return {
            type: 'navigate',
            payload: { direction: 'back' },
            haptic: 'light'
          };
        }
        break;

      case 'left':
        // Context-specific forward navigation
        if (currentRoute === '/jobs') {
          return {
            type: 'action',
            payload: { action: 'nextJob' },
            haptic: 'light'
          };
        }
        break;

      case 'up':
        // Refresh/Pull to refresh
        return {
          type: 'action',
          payload: { action: 'refresh' },
          haptic: 'medium'
        };

      case 'down':
        // Context menu or additional options
        return {
          type: 'action',
          payload: { action: 'showOptions' },
          haptic: 'light'
        };
    }

    return null;
  }

  private static executeGestureAction(action: GestureAction) {
    // Trigger haptic feedback if supported and enabled
    if (this.config.hapticFeedback && action.haptic && navigator.vibrate) {
      const vibrationPattern = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(vibrationPattern[action.haptic]);
    }

    // Dispatch custom event for action handling
    const event = new CustomEvent('gestureAction', {
      detail: action
    });
    document.dispatchEvent(event);
  }

  // Predefined gesture handlers for different routes
  static getJobsGestureHandler() {
    return (gesture: SwipeGesture): GestureAction | null => {
      switch (gesture.direction) {
        case 'left':
          return {
            type: 'action',
            payload: { action: 'saveJob' },
            haptic: 'medium'
          };
        case 'right':
          return {
            type: 'action',
            payload: { action: 'skipJob' },
            haptic: 'light'
          };
        case 'up':
          return {
            type: 'action',
            payload: { action: 'viewDetails' },
            haptic: 'light'
          };
        default:
          return null;
      }
    };
  }

  static getApplicationsGestureHandler() {
    return (gesture: SwipeGesture): GestureAction | null => {
      switch (gesture.direction) {
        case 'left':
          return {
            type: 'action',
            payload: { action: 'archiveApplication' },
            haptic: 'medium'
          };
        case 'up':
          return {
            type: 'action',
            payload: { action: 'addNote' },
            haptic: 'light'
          };
        default:
          return null;
      }
    };
  }

  static getDashboardGestureHandler() {
    return (gesture: SwipeGesture): GestureAction | null => {
      switch (gesture.direction) {
        case 'left':
          return {
            type: 'navigate',
            payload: { route: '/jobs' },
            haptic: 'light'
          };
        case 'down':
          return {
            type: 'action',
            payload: { action: 'quickActions' },
            haptic: 'light'
          };
        default:
          return null;
      }
    };
  }
}
