
import { useState, useCallback, useRef, useEffect } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxDistance?: number;
}

export const usePullToRefresh = ({ onRefresh, threshold = 80, maxDistance = 120 }: PullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0) {
      e.preventDefault();
      const pullDistance = Math.min(distance * 0.5, maxDistance);
      setPullDistance(pullDistance);
    }
  }, [isPulling, startY, maxDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [isPulling, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullToRefreshStyles = {
    transform: `translateY(${pullDistance}px)`,
    transition: isPulling ? 'none' : 'transform 0.3s ease-out',
  };

  const refreshIndicatorStyles = {
    opacity: pullDistance > 0 ? Math.min(pullDistance / threshold, 1) : 0,
    transform: `translateY(${Math.max(0, pullDistance - 40)}px) rotate(${pullDistance * 2}deg)`,
  };

  return {
    containerRef,
    pullToRefreshStyles,
    refreshIndicatorStyles,
    isRefreshing,
    isPulling,
    pullDistance,
    shouldShowIndicator: pullDistance > 0 || isRefreshing,
  };
};
