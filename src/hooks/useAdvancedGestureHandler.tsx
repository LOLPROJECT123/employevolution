
import { useRef, useState, useEffect } from 'react';

interface GestureHandlerOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export const useAdvancedGestureHandler = (options: GestureHandlerOptions) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    onDoubleTap,
    swipeThreshold = 50,
    longPressDelay = 800,
    doubleTapDelay = 300
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setStartPos({ x: touch.clientX, y: touch.clientY });
      setIsPressed(true);

      // Start long press timer
      if (onLongPress) {
        const timer = setTimeout(() => {
          onLongPress();
          setIsPressed(false);
        }, longPressDelay);
        setLongPressTimer(timer);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Clear long press timer if user moves
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const endPos = { x: touch.clientX, y: touch.clientY };
      const deltaX = endPos.x - startPos.x;
      const deltaY = endPos.y - startPos.y;

      setIsPressed(false);

      // Clear long press timer
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      // Check for swipe gestures
      if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
        return;
      }

      // Check for double tap
      if (onDoubleTap) {
        const now = Date.now();
        if (now - lastTap < doubleTapDelay) {
          onDoubleTap();
          setLastTap(0);
        } else {
          setLastTap(now);
        }
      }
    };

    // Mouse events for desktop
    const handleMouseDown = (e: MouseEvent) => {
      setStartPos({ x: e.clientX, y: e.clientY });
      setIsPressed(true);

      if (onLongPress) {
        const timer = setTimeout(() => {
          onLongPress();
          setIsPressed(false);
        }, longPressDelay);
        setLongPressTimer(timer);
      }
    };

    const handleMouseMove = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      setIsPressed(false);

      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      // Check for swipe gestures on desktop
      if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
        return;
      }

      // Check for double click
      if (onDoubleTap) {
        const now = Date.now();
        if (now - lastTap < doubleTapDelay) {
          onDoubleTap();
          setLastTap(0);
        } else {
          setLastTap(now);
        }
      }
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
      
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [startPos, longPressTimer, lastTap, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onLongPress, onDoubleTap, swipeThreshold, longPressDelay, doubleTapDelay]);

  return {
    elementRef,
    isPressed
  };
};

export default useAdvancedGestureHandler;
