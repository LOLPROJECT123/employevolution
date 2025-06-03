
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { useIndexedDB, jobCacheDBConfig } from '@/hooks/useIndexedDB';
import { AdvancedGestureService, GestureEvent } from '@/services/advancedGestureService';
import { DatabaseJob, castJobData } from '@/types/database';
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
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface SwipeState {
  startX: number;
  currentX: number;
  isDragging: boolean;
  swipeDirection: 'left' | 'right' | null;
}

export const OfflineJobList: React.FC = () => {
  const { user } = useAuth();
  const { isOnline, addOfflineAction } = useOfflineMode();
  const indexedDB = useIndexedDB(jobCacheDBConfig);
  const [jobs, setJobs] = useState<DatabaseJob[]>([]);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    currentX: 0,
    isDragging: false,
    swipeDirection: null
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const gestureHandlerRef = useRef<AdvancedGestureService | null>(null);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    loadJobs();
    setupGestureHandling();
    
    return () => {
      if (gestureHandlerRef.current) {
        gestureHandlerRef.current.destroy();
      }
    };
  }, []);

  const setupGestureHandling = () => {
    if (cardRef.current && AdvancedGestureService.isGestureSupported()) {
      gestureHandlerRef.current = AdvancedGestureService.enableRealGestures(cardRef.current);
      
      gestureHandlerRef.current.on('swipe', handleGestureSwipe);
      gestureHandlerRef.current.on('tap', handleGestureTap);
      gestureHandlerRef.current.on('longpress', handleGestureLongPress);
      gestureHandlerRef.current.on('pinch', handleGesturePinch);
    }
  };

  const handleGestureSwipe = (event: GestureEvent) => {
    if (event.direction === 'left') {
      saveJob(jobs[currentJobIndex]);
    } else if (event.direction === 'right') {
      nextJob();
    } else if (event.direction === 'up') {
      // Pull to refresh
      handlePullToRefresh();
    }
  };

  const handleGestureTap = (event: GestureEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    lastTapRef.current = now;
    
    if (timeSinceLastTap < 300) {
      // Double tap - apply to job
      applyToJob(jobs[currentJobIndex]);
    }
  };

  const handleGestureLongPress = (event: GestureEvent) => {
    // Show job details
    showJobDetails(jobs[currentJobIndex]);
  };

  const handleGesturePinch = (event: GestureEvent) => {
    // Zoom functionality could be added here
    console.log('Pinch gesture detected, scale:', event.scale);
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      if (isOnline) {
        // Load from server and cache
        await loadJobsFromServer();
      } else {
        // Load from cache
        await loadJobsFromCache();
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJobsFromServer = async () => {
    try {
      // Mock job data - in real implementation, this would come from job APIs
      const mockJobs: DatabaseJob[] = [
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
      
      const typedJobs = mockJobs.map(castJobData);
      setJobs(typedJobs);
      
      // Cache jobs for offline use
      if (!indexedDB.isLoading && indexedDB.bulkPut) {
        await indexedDB.bulkPut('jobs', typedJobs);
      }
    } catch (error) {
      console.error('Error loading jobs from server:', error);
    }
  };

  const loadJobsFromCache = async () => {
    try {
      if (!indexedDB.isLoading && indexedDB.getAll) {
        const cachedJobs = await indexedDB.getAll('jobs');
        const typedJobs = cachedJobs.map(castJobData);
        setJobs(typedJobs);
      }
    } catch (error) {
      console.error('Error loading jobs from cache:', error);
    }
  };

  const handlePullToRefresh = async () => {
    if (!isOnline || refreshing) return;
    
    setRefreshing(true);
    try {
      await loadJobsFromServer();
    } finally {
      setRefreshing(false);
    }
  };

  const saveJob = async (job: DatabaseJob) => {
    if (!user) return;

    try {
      const jobData = {
        user_id: user.id,
        job_id: job.id,
        job_data: job,
        notes: ''
      };

      if (isOnline) {
        const { error } = await supabase.from('saved_jobs').insert(jobData);
        if (error) throw error;
      } else {
        addOfflineAction('create', 'saved_jobs', jobData);
      }

      // Visual feedback
      if (cardRef.current) {
        cardRef.current.classList.add('gesture-swipe-left');
        setTimeout(() => {
          cardRef.current?.classList.remove('gesture-swipe-left');
        }, 300);
      }

      nextJob();
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const applyToJob = async (job: DatabaseJob) => {
    if (!user) return;

    try {
      const applicationData = {
        user_id: user.id,
        job_id: job.id,
        status: 'applied',
        applied_at: new Date().toISOString()
      };

      if (isOnline) {
        const { error } = await supabase.from('job_applications').insert(applicationData);
        if (error) throw error;
      } else {
        addOfflineAction('create', 'job_applications', applicationData);
      }

      // Visual feedback
      if (cardRef.current) {
        cardRef.current.classList.add('gesture-longpress');
        setTimeout(() => {
          cardRef.current?.classList.remove('gesture-longpress');
        }, 200);
      }

      nextJob();
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  const nextJob = () => {
    setCurrentJobIndex(prev => (prev + 1) % jobs.length);
  };

  const previousJob = () => {
    setCurrentJobIndex(prev => (prev - 1 + jobs.length) % jobs.length);
  };

  const showJobDetails = (job: DatabaseJob) => {
    // This could open a modal or navigate to a detailed view
    console.log('Showing details for:', job.title);
    // For now, just log the details
  };

  const shareJob = async (job: DatabaseJob) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `${job.title} at ${job.company}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing job:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading jobs...</span>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No jobs available</p>
        {!isOnline && (
          <p className="text-sm text-orange-600 mt-2">
            <WifiOff className="h-4 w-4 inline mr-1" />
            You're offline. Connect to internet to load new jobs.
          </p>
        )}
      </div>
    );
  }

  const currentJob = jobs[currentJobIndex];

  return (
    <div className="space-y-4">
      {/* Status indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-orange-500" />
          )}
          <span className="text-sm text-muted-foreground">
            {isOnline ? 'Online' : 'Offline'} • {currentJobIndex + 1} of {jobs.length}
          </span>
        </div>
        
        {refreshing && (
          <RefreshCw className="h-4 w-4 animate-spin" />
        )}
      </div>

      {/* Job card */}
      <Card ref={cardRef} className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{currentJob.title}</h3>
                <p className="text-muted-foreground">{currentJob.company}</p>
              </div>
              <Badge variant={currentJob.remote ? 'default' : 'secondary'}>
                {currentJob.remote ? 'Remote' : 'On-site'}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{currentJob.location}</span>
              </div>
              {currentJob.salary && (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{currentJob.salary}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{currentJob.posted}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">
              {currentJob.description}
            </p>

            {currentJob.requirements && (
              <div>
                <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                <div className="flex flex-wrap gap-1">
                  {currentJob.requirements.slice(0, 4).map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                  {currentJob.requirements.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{currentJob.requirements.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center justify-between space-x-4">
        <Button variant="outline" size="sm" onClick={previousJob}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => saveJob(currentJob)}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => shareJob(currentJob)}
          >
            <Share className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('#', '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          size="sm" 
          onClick={() => applyToJob(currentJob)}
        >
          Apply Now
        </Button>

        <Button variant="outline" size="sm" onClick={nextJob}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Gesture instructions */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>👈 Swipe left to save • 👉 Swipe right for next job</p>
        <p>👆 Pull down to refresh • Double tap to apply</p>
        <p>Long press for details</p>
      </div>
    </div>
  );
};

export default OfflineJobList;
