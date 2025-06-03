import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Wifi, WifiOff, Download, Upload } from 'lucide-react';
import { useOfflineMode } from '@/hooks/useOfflineMode';

const OfflineFirstPages = () => {
  const { isOnline, addOfflineAction, syncPendingActions, pendingActions, cacheData, getCachedData } = useOfflineMode();

  const handleCacheData = () => {
    const data = { message: 'Hello from cached data!', timestamp: Date.now() };
    cacheData('exampleData', data);
  };

  const handleGetCachedData = () => {
    const cachedData = getCachedData('exampleData');
    if (cachedData) {
      alert(`Cached Data: ${JSON.stringify(cachedData)}`);
    } else {
      alert('No cached data found.');
    }
  };

  const handleAddPendingAction = () => {
    addOfflineAction('create', 'general_actions', { data: 'Some data to sync' });
  };

  const handleSyncPendingActions = () => {
    syncPendingActions();
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Offline Mode Demo
            {isOnline ? (
              <Badge variant="outline" className="ml-2">
                Online
              </Badge>
            ) : (
              <Badge variant="destructive" className="ml-2">
                Offline
                <WifiOff className="h-4 w-4 ml-1" />
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            This page demonstrates offline capabilities using the <code>useOfflineMode</code> hook.
          </p>

          <div className="space-y-2">
            <h4 className="font-medium">Caching Data</h4>
            <Button onClick={handleCacheData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Cache Data
            </Button>
            <Button onClick={handleGetCachedData} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Get Cached Data
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Pending Actions</h4>
            <Button onClick={handleAddPendingAction} variant="outline">
              Add Pending Action
            </Button>
            <Button onClick={handleSyncPendingActions} variant="outline" disabled={!isOnline || pendingActions.length === 0}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Pending Actions
            </Button>
            {pendingActions.length > 0 && (
              <Badge variant="secondary">
                {pendingActions.length} pending actions
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineFirstPages;
