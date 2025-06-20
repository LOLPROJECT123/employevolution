
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { realtimeJobRecommendationService } from '@/services/realtimeJobRecommendationService';
import { toast } from '@/hooks/use-toast';

export interface RealtimeJobRecommendation {
  id: string;
  job_data: any;
  match_percentage: number;
  recommendation_reason: string;
  created_at: string;
  is_viewed: boolean;
}

export const useRealtimeJobRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RealtimeJobRecommendation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await realtimeJobRecommendationService.getRealtimeRecommendationsForUser(user.id, 20);
      setRecommendations(data);
      setUnreadCount(data.filter(rec => !rec.is_viewed).length);
    } catch (error) {
      console.error('Error loading realtime recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsViewed = useCallback(async (recommendationId: string) => {
    try {
      await realtimeJobRecommendationService.markRecommendationAsViewed(recommendationId);
      
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, is_viewed: true }
            : rec
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking recommendation as viewed:', error);
    }
  }, []);

  const handleNewRecommendation = useCallback((newRecommendation: any) => {
    setRecommendations(prev => [newRecommendation, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast notification
    toast({
      title: "🎯 New Job Match!",
      description: `${newRecommendation.job_data.title} at ${newRecommendation.job_data.company} (${newRecommendation.match_percentage}% match)`,
      duration: 5000,
    });
  }, []);

  useEffect(() => {
    if (user) {
      loadRecommendations();
      
      // Subscribe to realtime updates
      const subscription = realtimeJobRecommendationService.subscribeToUserJobAlerts(
        user.id,
        handleNewRecommendation
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, loadRecommendations, handleNewRecommendation]);

  return {
    recommendations,
    unreadCount,
    loading,
    loadRecommendations,
    markAsViewed
  };
};
