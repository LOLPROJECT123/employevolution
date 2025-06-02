
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineModeIndicator: React.FC = () => {
  const { isOnline, pendingActions } = useOfflineMode();

  if (isOnline && pendingActions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        variant={isOnline ? "secondary" : "destructive"}
        className="flex items-center space-x-1"
      >
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </Badge>
      
      {pendingActions.length > 0 && (
        <Badge variant="outline" className="text-xs">
          {pendingActions.length} pending
        </Badge>
      )}
    </div>
  );
};

export default OfflineModeIndicator;
