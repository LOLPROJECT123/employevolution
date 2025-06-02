
import React, { useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isMobileScreenSize } from '@/utils/mobileUtils';

interface TouchGestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  threshold?: number;
}

export const TouchGestureHandler: React.FC<TouchGestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onDoubleTap,
  threshold = 50
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const initialDistanceRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isMobileScreenSize()) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Handle pinch gesture
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistanceRef.current = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isMobileScreenSize() || !touchStartRef.current) return;

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      const scale = currentDistance / initialDistanceRef.current;
      onPinch(scale);
    }
  }, [onPinch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isMobileScreenSize() || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Handle double tap
    if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      const now = Date.now();
      if (now - lastTapRef.current < 300 && onDoubleTap) {
        onDoubleTap();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
    }

    // Handle swipe gestures
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
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
    }

    touchStartRef.current = null;
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap]);

  // Default swipe handlers for navigation
  const defaultSwipeLeft = useCallback(() => {
    // Navigate forward in common flow
    const currentPath = window.location.pathname;
    const navigationMap: Record<string, string> = {
      '/': '/jobs',
      '/jobs': '/applications',
      '/applications': '/calendar',
      '/calendar': '/profile'
    };
    
    const nextPath = navigationMap[currentPath];
    if (nextPath) {
      navigate(nextPath);
    }
  }, [navigate]);

  const defaultSwipeRight = useCallback(() => {
    // Navigate backward
    window.history.back();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full touch-manipulation"
      style={{ touchAction: 'pan-y pinch-zoom' }}
    >
      {children}
    </div>
  );
};

export default TouchGestureHandler;
