
import React, { useState, useRef, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshWrapperProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

export const PullToRefreshWrapper: React.FC<PullToRefreshWrapperProps> = ({
  onRefresh,
  children,
  threshold = 80
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    
    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative overflow-hidden"
      style={{
        transform: `translateY(${Math.min(pullDistance * 0.5, 40)}px)`,
        transition: !isPulling ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {/* Pull to refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-primary/10 text-primary"
          style={{
            height: `${Math.min(pullDistance, 60)}px`,
            transform: `translateY(-${Math.min(pullDistance, 60)}px)`,
            opacity: pullDistance / threshold
          }}
        >
          <RefreshCw 
            className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span className="ml-2 text-sm">
            {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default PullToRefreshWrapper;
