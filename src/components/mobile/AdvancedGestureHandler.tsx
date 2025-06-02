
import React, { useRef, useEffect, useState } from 'react';
import { useMobile } from '@/hooks/use-mobile';

interface GestureHandler {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (angle: number) => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const AdvancedGestureHandler: React.FC<GestureHandler> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onRotate,
  onLongPress,
  children,
  className = ''
}) => {
  const isMobile = useMobile();
  const elementRef = useRef<HTMLDivElement>(null);
  const [touchStartData, setTouchStartData] = useState<{
    x: number;
    y: number;
    time: number;
    touches: number;
  } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isMobile || !elementRef.current) return;

    const element = elementRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStartData({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        touches: e.touches.length
      });

      // Start long press timer
      if (onLongPress) {
        const timer = setTimeout(() => {
          onLongPress();
        }, 500); // 500ms for long press
        setLongPressTimer(timer);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Cancel long press on move
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      if (!touchStartData) return;

      // Handle pinch gesture
      if (e.touches.length === 2 && onPinch) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // You would need to store initial distance to calculate scale
        // This is a simplified version
        onPinch(distance / 100);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Cancel long press timer
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      if (!touchStartData || e.changedTouches.length === 0) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartData.x;
      const deltaY = touch.clientY - touchStartData.y;
      const deltaTime = Date.now() - touchStartData.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      // Swipe detection
      const minSwipeDistance = 50;
      const maxSwipeTime = 300;
      const minSwipeVelocity = 0.1;

      if (
        distance > minSwipeDistance &&
        deltaTime < maxSwipeTime &&
        velocity > minSwipeVelocity
      ) {
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        if (Math.abs(angle) < 45) {
          // Swipe right
          onSwipeRight?.();
        } else if (Math.abs(angle) > 135) {
          // Swipe left
          onSwipeLeft?.();
        } else if (angle > 45 && angle < 135) {
          // Swipe down
          onSwipeDown?.();
        } else if (angle < -45 && angle > -135) {
          // Swipe up
          onSwipeUp?.();
        }
      }

      setTouchStartData(null);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [isMobile, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onRotate, onLongPress, longPressTimer, touchStartData]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div ref={elementRef} className={`touch-action-manipulation ${className}`}>
      {children}
    </div>
  );
};

export default AdvancedGestureHandler;
