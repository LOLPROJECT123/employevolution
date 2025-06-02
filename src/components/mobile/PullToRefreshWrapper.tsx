
import React, { useState, useRef, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshWrapperProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export const PullToRefreshWrapper: React.FC<PullToRefreshWrapperProps> = ({
  children,
  onRefresh,
  threshold = 80
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    setPullDistance(Math.min(distance, threshold * 1.5));
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  };

  const refreshIndicatorOpacity = Math.min(pullDistance / threshold, 1);
  const showRefreshIcon = pullDistance >= threshold || isRefreshing;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden"
      style={{ transform: `translateY(${Math.min(pullDistance, threshold)}px)` }}
    >
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center h-16 -mt-16 transition-opacity duration-200"
        style={{ opacity: refreshIndicatorOpacity }}
      >
        <RefreshCw
          className={`h-6 w-6 text-primary ${
            showRefreshIcon ? 'animate-spin' : ''
          }`}
        />
        <span className="ml-2 text-sm text-muted-foreground">
          {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
        </span>
      </div>
      {children}
    </div>
  );
};
