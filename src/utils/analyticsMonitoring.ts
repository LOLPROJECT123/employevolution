import { supabase } from '@/integrations/supabase/client';

export interface ProfileAnalytics {
  userId: string;
  completionProgress: number;
  timeToComplete: number; // in minutes
  abandonmentPoints: string[];
  mostEditedSections: string[];
}

export interface UserJourneyEvent {
  userId: string;
  event: string;
  section: string;
  timestamp: Date;
  metadata?: any;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}

export class AnalyticsMonitoringService {
  // Track profile completion analytics
  static async trackProfileCompletion(userId: string, completionData: Partial<ProfileAnalytics>): Promise<void> {
    try {
      // Store in local analytics table or send to analytics service
      const analyticsData = {
        user_id: userId,
        event_type: 'profile_completion_progress',
        data: completionData,
        timestamp: new Date().toISOString()
      };

      // For now, store in browser storage - in production, send to analytics service
      const existingData = localStorage.getItem(`analytics_${userId}`) || '[]';
      const analytics = JSON.parse(existingData);
      analytics.push(analyticsData);
      
      // Keep only last 100 events
      if (analytics.length > 100) {
        analytics.splice(0, analytics.length - 100);
      }
      
      localStorage.setItem(`analytics_${userId}`, JSON.stringify(analytics));
    } catch (error) {
      console.error('Error tracking profile completion:', error);
    }
  }

  // Track user journey through onboarding
  static async trackUserJourney(event: UserJourneyEvent): Promise<void> {
    try {
      const journeyData = {
        user_id: event.userId,
        event_type: 'user_journey',
        event_name: event.event,
        section: event.section,
        metadata: event.metadata,
        timestamp: event.timestamp.toISOString()
      };

      // Store journey events
      const existingJourney = localStorage.getItem(`journey_${event.userId}`) || '[]';
      const journey = JSON.parse(existingJourney);
      journey.push(journeyData);
      
      // Keep only last 50 events
      if (journey.length > 50) {
        journey.splice(0, journey.length - 50);
      }
      
      localStorage.setItem(`journey_${event.userId}`, JSON.stringify(journey));
    } catch (error) {
      console.error('Error tracking user journey:', error);
    }
  }

  // Monitor performance of profile operations
  static async trackPerformance(metrics: PerformanceMetrics): Promise<void> {
    try {
      const performanceData = {
        operation: metrics.operation,
        duration: metrics.duration,
        success: metrics.success,
        error_message: metrics.errorMessage,
        timestamp: metrics.timestamp.toISOString()
      };

      // Store performance metrics
      const existingMetrics = localStorage.getItem('performance_metrics') || '[]';
      const allMetrics = JSON.parse(existingMetrics);
      allMetrics.push(performanceData);
      
      // Keep only last 200 metrics
      if (allMetrics.length > 200) {
        allMetrics.splice(0, allMetrics.length - 200);
      }
      
      localStorage.setItem('performance_metrics', JSON.stringify(allMetrics));
    } catch (error) {
      console.error('Error tracking performance:', error);
    }
  }

  // Get analytics summary for a user
  static getAnalyticsSummary(userId: string): any {
    try {
      const analyticsData = localStorage.getItem(`analytics_${userId}`);
      const journeyData = localStorage.getItem(`journey_${userId}`);
      
      if (!analyticsData && !journeyData) {
        return null;
      }

      const analytics = analyticsData ? JSON.parse(analyticsData) : [];
      const journey = journeyData ? JSON.parse(journeyData) : [];

      return {
        totalEvents: analytics.length + journey.length,
        profileEvents: analytics.length,
        journeyEvents: journey.length,
        lastActivity: journey.length > 0 ? journey[journey.length - 1].timestamp : null,
        mostVisitedSections: this.getMostVisitedSections(journey)
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return null;
    }
  }

  // Get performance summary
  static getPerformanceSummary(): any {
    try {
      const metricsData = localStorage.getItem('performance_metrics');
      
      if (!metricsData) {
        return null;
      }

      const metrics = JSON.parse(metricsData);
      const successRate = metrics.filter((m: any) => m.success).length / metrics.length;
      const avgDuration = metrics.reduce((sum: number, m: any) => sum + m.duration, 0) / metrics.length;

      return {
        totalOperations: metrics.length,
        successRate: Math.round(successRate * 100),
        averageDuration: Math.round(avgDuration),
        slowestOperations: metrics
          .sort((a: any, b: any) => b.duration - a.duration)
          .slice(0, 5)
          .map((m: any) => ({ operation: m.operation, duration: m.duration }))
      };
    } catch (error) {
      console.error('Error getting performance summary:', error);
      return null;
    }
  }

  private static getMostVisitedSections(journey: any[]): string[] {
    const sectionCounts: { [key: string]: number } = {};
    
    journey.forEach(event => {
      if (event.section) {
        sectionCounts[event.section] = (sectionCounts[event.section] || 0) + 1;
      }
    });

    return Object.entries(sectionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([section]) => section);
  }
}
