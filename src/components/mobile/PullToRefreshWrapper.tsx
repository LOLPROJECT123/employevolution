
import React from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshWrapperProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  maxDistance?: number;
}

export const PullToRefreshWrapper: React.FC<PullToRefreshWrapperProps> = ({
  onRefresh,
  children,
  threshold = 80,
  maxDistance = 120
}) => {
  const {
    containerRef,
    pullToRefreshStyles,
    refreshIndicatorStyles,
    isRefreshing,
    shouldShowIndicator
  } = usePullToRefresh({ onRefresh, threshold, maxDistance });

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull to refresh indicator */}
      {shouldShowIndicator && (
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-10 p-4"
          style={refreshIndicatorStyles}
        >
          <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full shadow-lg">
            <RefreshCw 
              className={`h-6 w-6 text-primary-foreground ${isRefreshing ? 'animate-spin' : ''}`} 
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={pullToRefreshStyles}>
        {children}
      </div>
    </div>
  );
};

export default PullToRefreshWrapper;
