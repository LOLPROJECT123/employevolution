
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { OfflineModeIndicator } from '@/components/mobile/OfflineModeIndicator';
import { PullToRefreshWrapper } from '@/components/mobile/PullToRefreshWrapper';
import { WifiOff, Download, Sync, CheckCircle } from 'lucide-react';

export const OfflineFirstPages: React.FC = () => {
  const { isOnline, cacheData, getCachedData, syncPendingActions } = useOfflineMode();
  const [cachedJobs, setCachedJobs] = useState<any[]>([]);
  const [cachedProfile, setCachedProfile] = useState<any>(null);
  const [offlineChanges, setOfflineChanges] = useState<number>(0);

  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = () => {
    const jobs = getCachedData<any[]>('jobs') || [];
    const profile = getCachedData<any>('profile') || null;
    
    setCachedJobs(jobs);
    setCachedProfile(profile);
  };

  const downloadForOffline = async () => {
    try {
      // Cache essential data for offline use
      const mockJobs = [
        {
          id: '1',
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'Remote',
          description: 'Full-stack development position...',
          cached_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Frontend Developer',
          company: 'Web Solutions',
          location: 'New York, NY',
          description: 'React specialist needed...',
          cached_at: new Date().toISOString()
        }
      ];

      const mockProfile = {
        name: 'John Doe',
        title: 'Software Developer',
        skills: ['React', 'Node.js', 'TypeScript'],
        cached_at: new Date().toISOString()
      };

      cacheData('jobs', mockJobs, 24); // Cache for 24 hours
      cacheData('profile', mockProfile, 168); // Cache for 7 days

      loadCachedData();
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  const handleOfflineAction = () => {
    // Simulate offline actions
    setOfflineChanges(prev => prev + 1);
    
    // In a real app, this would use the addPendingAction from useOfflineMode
    console.log('Offline action recorded');
  };

  const handleRefresh = async () => {
    if (isOnline) {
      await syncPendingActions();
      setOfflineChanges(0);
    }
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="space-y-6 p-4">
        {/* Offline Status Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Offline-First Experience</h1>
          <OfflineModeIndicator />
        </div>

        {/* Offline Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {isOnline ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span>Connection Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Current Status:</span>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            
            {offlineChanges > 0 && (
              <div className="flex items-center justify-between">
                <span>Pending Changes:</span>
                <Badge variant="secondary">{offlineChanges}</Badge>
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={downloadForOffline} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Cache for Offline
              </Button>
              
              {isOnline && offlineChanges > 0 && (
                <Button onClick={handleRefresh} size="sm">
                  <Sync className="h-4 w-4 mr-2" />
                  Sync Changes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cached Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Cached Jobs ({cachedJobs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cachedJobs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No cached jobs available. Download data for offline access.
              </p>
            ) : (
              <div className="space-y-3">
                {cachedJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{job.title}</h3>
                      <Badge variant="outline">Cached</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Cached: {new Date(job.cached_at).toLocaleDateString()}
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-3"
                      onClick={handleOfflineAction}
                    >
                      {isOnline ? 'Apply Now' : 'Save Application (Offline)'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cached Profile */}
        {cachedProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Cached Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">{cachedProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">{cachedProfile.title}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {cachedProfile.skills.map((skill: string) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Cached: {new Date(cachedProfile.cached_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offline Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Offline Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Browse cached job listings</p>
              <p>• View and edit your profile</p>
              <p>• Save job applications (synced when online)</p>
              <p>• Access interview notes and preparation materials</p>
              <p>• View cached analytics and insights</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PullToRefreshWrapper>
  );
};

export default OfflineFirstPages;
