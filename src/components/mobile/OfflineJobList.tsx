
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedMobileService } from '@/services/enhancedMobileService';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Wifi, 
  WifiOff,
  Heart,
  Share,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  posted: string;
  type: string;
  remote: boolean;
  description: string;
  requirements: string[];
  benefits?: string[];
}

interface SwipeState {
  startX: number;
  currentX: number;
  isDragging: boolean;
  swipeDirection: 'left' | 'right' | null;
}

export const OfflineJobList: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    currentX: 0,
    isDragging: false,
    swipeDirection: null
  });
  const [refreshing, setRefreshing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    loadJobs();
    setupOfflineHandlers();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setupOfflineHandlers = () => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  const handleOnline = () => {
    setIsOnline(true);
    syncOfflineActions();
  };

  const handleOffline = () => {
    setIsOnline(false);
  };

  const loadJobs = async () => {
    try {
      if (isOnline) {
        // Load from server
        const mockJobs: Job[] = [
          {
            id: '1',
            title: 'Senior React Developer',
            company: 'TechFlow Inc.',
            location: 'San Francisco, CA',
            salary: '$130,000 - $160,000',
            posted: '2 hours ago',
            type: 'Full-time',
            remote: true,
            description: 'We are looking for a Senior React Developer to join our growing team...',
            requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience'],
            benefits: ['Health Insurance', 'Remote Work', '401k Matching']
          },
          {
            id: '2',
            title: 'Full Stack Engineer',
            company: 'InnovateLab',
            location: 'Austin, TX',
            salary: '$110,000 - $140,000',
            posted: '1 day ago',
            type: 'Full-time',
            remote: false,
            description: 'Join our innovative team building cutting-edge applications...',
            requirements: ['JavaScript', 'Python', 'AWS', '3+ years experience'],
            benefits: ['Health Insurance', 'Stock Options', 'Learning Budget']
          },
          {
            id: '3',
            title: 'Frontend Developer',
            company: 'DesignStudio',
            location: 'Remote',
            salary: '$95,000 - $125,000',
            posted: '3 days ago',
            type: 'Contract',
            remote: true,
            description: 'We need a talented frontend developer to create amazing user experiences...',
            requirements: ['React', 'CSS', 'Design Systems', '2+ years experience'],
            benefits: ['Flexible Hours', 'Remote Work', 'Equipment Allowance']
          }
        ];
        
        setJobs(mockJobs);
        
        // Cache jobs for offline use
        localStorage.setItem('cachedJobs', JSON.stringify(mockJobs));
      } else {
        // Load from cache
        const cachedJobs = localStorage.getItem('cachedJobs');
        if (cachedJobs) {
          setJobs(JSON.parse(cachedJobs));
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const syncOfflineActions = async () => {
    try {
      const offlineActions = JSON.parse(localStorage.getItem('offlineJobActions') || '[]');
      
      for (const action of offlineActions) {
        if (action.type === 'save') {
          await saveJobToServer(action.jobId);
        } else if (action.type === 'apply') {
          await applyToJobOnServer(action.jobId);
        }
      }
      
      localStorage.removeItem('offlineJobActions');
    } catch (error) {
      console.error('Error syncing offline actions:', error);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setSwipeState({
      startX: touch.clientX,
      currentX: touch.clientX,
      isDragging: true,
      swipeDirection: null
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeState.isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeState.startX;
    
    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX,
      swipeDirection: deltaX > 50 ? 'right' : deltaX < -50 ? 'left' : null
    }));

    // Visual feedback during swipe
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${deltaX * 0.5}px) rotate(${deltaX * 0.05}deg)`;
      cardRef.current.style.opacity = `${1 - Math.abs(deltaX) / 300}`;
    }
  };

  const handleTouchEnd = () => {
    if (!swipeState.isDragging) return;
    
    const deltaX = swipeState.currentX - swipeState.startX;
    
    if (Math.abs(deltaX) > 100) {
      if (deltaX > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    } else {
      // Reset card position
      if (cardRef.current) {
        cardRef.current.style.transform = '';
        cardRef.current.style.opacity = '';
      }
    }
    
    setSwipeState({
      startX: 0,
      currentX: 0,
      isDragging: false,
      swipeDirection: null
    });
  };

  const handleSwipeLeft = () => {
    // Dismiss job (pass)
    nextJob();
  };

  const handleSwipeRight = () => {
    // Save job
    const currentJob = jobs[currentJobIndex];
    if (currentJob) {
      saveJob(currentJob.id);
    }
    nextJob();
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    
    if (timeDiff < 300) {
      // Double tap detected - save job
      const currentJob = jobs[currentJobIndex];
      if (currentJob) {
        saveJob(currentJob.id);
      }
    }
    
    lastTapRef.current = now;
  };

  const nextJob = () => {
    if (currentJobIndex < jobs.length - 1) {
      setCurrentJobIndex(prev => prev + 1);
    }
    
    // Reset card animation
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '';
    }
  };

  const previousJob = () => {
    if (currentJobIndex > 0) {
      setCurrentJobIndex(prev => prev - 1);
    }
  };

  const saveJob = async (jobId: string) => {
    if (!user) return;

    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    if (isOnline) {
      await saveJobToServer(jobId);
    } else {
      // Save action for offline sync
      const offlineActions = JSON.parse(localStorage.getItem('offlineJobActions') || '[]');
      offlineActions.push({ type: 'save', jobId, timestamp: Date.now() });
      localStorage.setItem('offlineJobActions', JSON.stringify(offlineActions));
      
      // Add to offline sync queue
      EnhancedMobileService.addToSyncQueue('create', 'saved_jobs', {
        user_id: user.id,
        job_id: jobId,
        job_data: job,
        notes: 'Saved offline'
      });
    }
  };

  const applyToJob = async (jobId: string) => {
    if (!user) return;

    if (isOnline) {
      await applyToJobOnServer(jobId);
    } else {
      const offlineActions = JSON.parse(localStorage.getItem('offlineJobActions') || '[]');
      offlineActions.push({ type: 'apply', jobId, timestamp: Date.now() });
      localStorage.setItem('offlineJobActions', JSON.stringify(offlineActions));
      
      EnhancedMobileService.addToSyncQueue('create', 'job_applications', {
        user_id: user.id,
        job_id: jobId,
        status: 'applied'
      });
    }
  };

  const saveJobToServer = async (jobId: string) => {
    if (!user) return;
    
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    try {
      await supabase.from('saved_jobs').insert({
        user_id: user.id,
        job_id: jobId,
        job_data: job,
        notes: 'Saved from mobile'
      });
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const applyToJobOnServer = async (jobId: string) => {
    if (!user) return;

    try {
      await supabase.from('job_applications').insert({
        user_id: user.id,
        job_id: jobId,
        status: 'applied'
      });
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const handlePullToRefresh = async () => {
    if (!isOnline) return;
    
    setRefreshing(true);
    await loadJobs();
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 mb-2">No jobs available</div>
          {!isOnline && (
            <div className="flex items-center justify-center text-orange-600">
              <WifiOff className="h-4 w-4 mr-1" />
              <span className="text-sm">Offline mode</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentJob = jobs[currentJobIndex];

  return (
    <div className="relative h-full">
      {/* Connection Status */}
      <div className={`fixed top-4 right-4 z-50 px-2 py-1 rounded-full text-xs ${
        isOnline ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
      }`}>
        {isOnline ? <Wifi className="h-3 w-3 inline mr-1" /> : <WifiOff className="h-3 w-3 inline mr-1" />}
        {isOnline ? 'Online' : 'Offline'}
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mb-4">
        <div className="flex space-x-1">
          {jobs.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors ${
                index === currentJobIndex ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Job Card */}
      <div className="relative h-full">
        <Card
          ref={cardRef}
          className="h-full transition-transform"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleDoubleTap}
        >
          <CardContent className="p-6 h-full overflow-y-auto">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <h2 className="text-xl font-bold">{currentJob.title}</h2>
                <div className="flex items-center space-x-2 text-gray-600 mt-1">
                  <span className="font-medium">{currentJob.company}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {currentJob.location}
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{currentJob.type}</Badge>
                {currentJob.remote && <Badge variant="outline">Remote</Badge>}
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {currentJob.posted}
                </div>
              </div>

              {/* Salary */}
              {currentJob.salary && (
                <div className="flex items-center text-green-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-medium">{currentJob.salary}</span>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {currentJob.description}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <div className="flex flex-wrap gap-1">
                  {currentJob.requirements.map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              {currentJob.benefits && (
                <div>
                  <h3 className="font-semibold mb-2">Benefits</h3>
                  <div className="flex flex-wrap gap-1">
                    {currentJob.benefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Swipe Indicators */}
        {swipeState.isDragging && (
          <>
            <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-opacity ${
              swipeState.swipeDirection === 'right' ? 'opacity-100' : 'opacity-30'
            }`}>
              <div className="bg-green-500 text-white p-3 rounded-full">
                <Heart className="h-6 w-6" />
              </div>
            </div>
            <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-opacity ${
              swipeState.swipeDirection === 'left' ? 'opacity-100' : 'opacity-30'
            }`}>
              <div className="bg-red-500 text-white p-3 rounded-full">
                <span className="text-lg">✕</span>
              </div>
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <Button
            size="sm"
            variant="outline"
            disabled={currentJobIndex === 0}
            onClick={previousJob}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={() => saveJob(currentJob.id)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Heart className="h-4 w-4 mr-1" />
            Save
          </Button>
          
          <Button
            size="sm"
            onClick={() => applyToJob(currentJob.id)}
            className="bg-green-500 hover:bg-green-600"
          >
            Apply
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            disabled={currentJobIndex === jobs.length - 1}
            onClick={nextJob}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center text-xs text-gray-500">
        <p>Swipe right to save • Swipe left to pass • Double tap to save</p>
      </div>

      {/* Pull to Refresh Indicator */}
      {refreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm">
          Refreshing jobs...
        </div>
      )}
    </div>
  );
};

export default OfflineJobList;
