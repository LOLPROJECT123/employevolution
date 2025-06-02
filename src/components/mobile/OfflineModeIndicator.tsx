
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { WifiOff, Wifi, Cloud, CloudOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const OfflineModeIndicator: React.FC = () => {
  const { isOnline, pendingActions, syncPendingActions } = useOfflineMode();

  const handleSync = async () => {
    try {
      await syncPendingActions();
      toast({
        title: "Sync Complete",
        description: "All pending changes have been synchronized.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Unable to sync pending changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center space-x-1"
      >
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        <span>{isOnline ? "Online" : "Offline"}</span>
      </Badge>

      {pendingActions > 0 && (
        <>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <CloudOff className="h-3 w-3" />
            <span>{pendingActions} pending</span>
          </Badge>
          
          {isOnline && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              className="h-6 px-2 text-xs"
            >
              <Cloud className="h-3 w-3 mr-1" />
              Sync
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default OfflineModeIndicator;
