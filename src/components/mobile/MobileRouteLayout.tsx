
import React from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { PullToRefreshWrapper } from './PullToRefreshWrapper';
import { OfflineModeIndicator } from './OfflineModeIndicator';

interface MobileRouteLayoutProps {
  children: React.ReactNode;
  title: string;
  showOfflineIndicator?: boolean;
  onRefresh?: () => Promise<void>;
  className?: string;
}

export const MobileRouteLayout: React.FC<MobileRouteLayoutProps> = ({
  children,
  title,
  showOfflineIndicator = true,
  onRefresh,
  className = ''
}) => {
  const isMobile = useMobile();

  if (!isMobile) {
    return <>{children}</>;
  }

  const content = (
    <div className={`mobile-route-layout min-h-screen bg-background ${className}`}>
      {/* Mobile header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          {showOfflineIndicator && (
            <div className="flex-shrink-0">
              <OfflineModeIndicator />
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="mobile-content flex-1 overflow-auto">
        {children}
      </div>

      {/* Safe area for home indicator on iOS */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );

  // Wrap with pull-to-refresh if onRefresh is provided
  if (onRefresh) {
    return (
      <PullToRefreshWrapper onRefresh={onRefresh}>
        {content}
      </PullToRefreshWrapper>
    );
  }

  return content;
};

export default MobileRouteLayout;
