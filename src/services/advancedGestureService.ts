
export interface GestureEvent {
  type: 'swipe' | 'pinch' | 'pan' | 'tap' | 'longpress' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  velocity?: number;
  scale?: number;
  rotation?: number;
  duration?: number;
  startPoint: { x: number; y: number };
  endPoint?: { x: number; y: number };
  target: Element;
}

export interface GestureConfig {
  swipeThreshold: number;
  pinchThreshold: number;
  longPressDelay: number;
  tapMaxDistance: number;
  tapMaxDelay: number;
}

export class AdvancedGestureService {
  private static readonly DEFAULT_CONFIG: GestureConfig = {
    swipeThreshold: 50,
    pinchThreshold: 10,
    longPressDelay: 500,
    tapMaxDistance: 10,
    tapMaxDelay: 300
  };

  private touchStart: { x: number; y: number; time: number; touches: Touch[] } | null = null;
  private gestureCallbacks: Map<string, (event: GestureEvent) => void> = new Map();
  private config: GestureConfig;
  private longPressTimer: number | null = null;
  private element: Element;

  constructor(element: Element, config: Partial<GestureConfig> = {}) {
    this.element = element;
    this.config = { ...AdvancedGestureService.DEFAULT_CONFIG, ...config };
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
  }

  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      touches: Array.from(event.touches)
    };

    // Start long press timer
    this.longPressTimer = window.setTimeout(() => {
      if (this.touchStart) {
        this.triggerGesture({
          type: 'longpress',
          startPoint: { x: this.touchStart.x, y: this.touchStart.y },
          duration: Date.now() - this.touchStart.time,
          target: event.target as Element
        });
      }
    }, this.config.longPressDelay);

    // Handle multi-touch for pinch
    if (event.touches.length > 1) {
      this.clearLongPressTimer();
      event.preventDefault();
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.touchStart) return;

    this.clearLongPressTimer();

    const touch = event.touches[0];
    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Handle pinch gesture
    if (event.touches.length === 2) {
      this.handlePinchGesture(event);
      return;
    }

    // Handle pan gesture (continuous movement)
    if (distance > this.config.swipeThreshold / 4) {
      const velocity = distance / (Date.now() - this.touchStart.time);
      
      this.triggerGesture({
        type: 'pan',
        startPoint: { x: this.touchStart.x, y: this.touchStart.y },
        endPoint: { x: touch.clientX, y: touch.clientY },
        distance,
        velocity,
        target: event.target as Element
      });
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!this.touchStart) return;

    this.clearLongPressTimer();

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - this.touchStart.time;

    // Determine gesture type
    if (distance < this.config.tapMaxDistance && duration < this.config.tapMaxDelay) {
      // Tap gesture
      this.triggerGesture({
        type: 'tap',
        startPoint: { x: this.touchStart.x, y: this.touchStart.y },
        duration,
        target: event.target as Element
      });
    } else if (distance > this.config.swipeThreshold) {
      // Swipe gesture
      const direction = this.getSwipeDirection(deltaX, deltaY);
      const velocity = distance / duration;
      
      this.triggerGesture({
        type: 'swipe',
        direction,
        distance,
        velocity,
        startPoint: { x: this.touchStart.x, y: this.touchStart.y },
        endPoint: { x: touch.clientX, y: touch.clientY },
        target: event.target as Element
      });
    }

    this.touchStart = null;
  }

  private handleTouchCancel(): void {
    this.clearLongPressTimer();
    this.touchStart = null;
  }

  private handlePinchGesture(event: TouchEvent): void {
    if (event.touches.length !== 2 || !this.touchStart) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    // Calculate current distance between fingers
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    // Calculate initial distance between fingers
    const initialTouch1 = this.touchStart.touches[0];
    const initialTouch2 = this.touchStart.touches[1];
    const initialDistance = Math.sqrt(
      Math.pow(initialTouch2.clientX - initialTouch1.clientX, 2) + 
      Math.pow(initialTouch2.clientY - initialTouch1.clientY, 2)
    );

    const scale = currentDistance / initialDistance;
    
    // Only trigger if scale change is significant
    if (Math.abs(scale - 1) > this.config.pinchThreshold / 100) {
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      this.triggerGesture({
        type: 'pinch',
        scale,
        startPoint: { x: centerX, y: centerY },
        target: event.target as Element
      });
    }
  }

  private getSwipeDirection(deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private triggerGesture(gesture: GestureEvent): void {
    const callback = this.gestureCallbacks.get(gesture.type);
    if (callback) {
      callback(gesture);
    }
    
    // Also trigger generic gesture callback
    const genericCallback = this.gestureCallbacks.get('*');
    if (genericCallback) {
      genericCallback(gesture);
    }
  }

  public on(gestureType: string, callback: (event: GestureEvent) => void): void {
    this.gestureCallbacks.set(gestureType, callback);
  }

  public off(gestureType: string): void {
    this.gestureCallbacks.delete(gestureType);
  }

  public destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));
    this.clearLongPressTimer();
    this.gestureCallbacks.clear();
  }

  // Static utility methods
  static createGestureHandler(element: Element, config?: Partial<GestureConfig>): AdvancedGestureService {
    return new AdvancedGestureService(element, config);
  }

  static isGestureSupported(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  static enableRealGestures(element: Element): AdvancedGestureService {
    const gestureHandler = new AdvancedGestureService(element);
    
    // Add visual feedback for gestures
    gestureHandler.on('longpress', (event) => {
      element.classList.add('gesture-longpress');
      setTimeout(() => element.classList.remove('gesture-longpress'), 200);
    });
    
    gestureHandler.on('pinch', (event) => {
      element.style.transform = `scale(${event.scale})`;
    });
    
    gestureHandler.on('swipe', (event) => {
      element.classList.add(`gesture-swipe-${event.direction}`);
      setTimeout(() => {
        element.classList.remove(`gesture-swipe-${event.direction}`);
      }, 300);
    });
    
    return gestureHandler;
  }
}

// CSS classes for gesture feedback (to be added to global styles)
export const gestureStyles = `
.gesture-longpress {
  animation: pulse 0.2s ease-in-out;
}

.gesture-swipe-left {
  animation: swipeLeft 0.3s ease-out;
}

.gesture-swipe-right {
  animation: swipeRight 0.3s ease-out;
}

.gesture-swipe-up {
  animation: swipeUp 0.3s ease-out;
}

.gesture-swipe-down {
  animation: swipeDown 0.3s ease-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes swipeLeft {
  0% { transform: translateX(0); }
  50% { transform: translateX(-10px); }
  100% { transform: translateX(0); }
}

@keyframes swipeRight {
  0% { transform: translateX(0); }
  50% { transform: translateX(10px); }
  100% { transform: translateX(0); }
}

@keyframes swipeUp {
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
}

@keyframes swipeDown {
  0% { transform: translateY(0); }
  50% { transform: translateY(10px); }
  100% { transform: translateY(0); }
}
`;
