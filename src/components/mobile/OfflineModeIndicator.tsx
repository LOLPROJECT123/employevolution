
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { WifiOff, Wifi, Sync } from 'lucide-react';

export const OfflineModeIndicator: React.FC = () => {
  const { isOnline, pendingActions } = useOfflineMode();

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <Badge variant={isOnline ? "default" : "destructive"}>
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>
      
      {pendingActions > 0 && (
        <div className="flex items-center space-x-1">
          <Sync className="h-4 w-4 text-orange-500" />
          <Badge variant="secondary">{pendingActions} pending</Badge>
        </div>
      )}
    </div>
  );
};
