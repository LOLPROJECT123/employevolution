
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  eventData: any;
  timestamp: string;
  sessionId: string;
  pageUrl?: string;
  referrer?: string;
}

export interface UserJourney {
  sessionId: string;
  userId: string;
  events: AnalyticsEvent[];
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  conversionEvents: string[];
}

export interface ConversionFunnel {
  name: string;
  steps: Array<{
    name: string;
    users: number;
    conversionRate: number;
  }>;
}

export interface UserEngagement {
  userId: string;
  totalSessions: number;
  totalPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  lastActiveDate: string;
}

export class AnalyticsService {
  static async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      console.log('Analytics: Event tracked', {
        ...event,
        timestamp: new Date().toISOString()
      });
      
      // Mock implementation since user_analytics table doesn't exist
      // In a real implementation, you would store this in the database
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  static async generateApplicationAnalytics(userId: string): Promise<{
    totalApplications: number;
    successRate: number;
    averageResponseTime: number;
    topCompanies: Array<{ name: string; applications: number }>;
    monthlyTrend: Array<{ month: string; applications: number; responses: number }>;
  }> {
    try {
      // Get user's applications from job_applications table
      const { data: applications, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to fetch applications:', error);
        return {
          totalApplications: 0,
          successRate: 0,
          averageResponseTime: 0,
          topCompanies: [],
          monthlyTrend: []
        };
      }

      const totalApplications = applications?.length || 0;
      const successfulApplications = applications?.filter(app => 
        ['interview_scheduled', 'offer_received', 'hired'].includes(app.status)
      ).length || 0;
      
      const successRate = totalApplications > 0 ? (successfulApplications / totalApplications) * 100 : 0;

      // Mock data for companies and trends since we don't have detailed job data
      const topCompanies = [
        { name: 'Tech Corp', applications: 5 },
        { name: 'StartupXYZ', applications: 3 },
        { name: 'BigCompany', applications: 2 }
      ];

      const monthlyTrend = [
        { month: '2024-01', applications: 8, responses: 3 },
        { month: '2024-02', applications: 12, responses: 5 },
        { month: '2024-03', applications: 15, responses: 7 }
      ];

      return {
        totalApplications,
        successRate,
        averageResponseTime: 7, // Mock: 7 days average
        topCompanies,
        monthlyTrend
      };
    } catch (error) {
      console.error('Failed to generate application analytics:', error);
      return {
        totalApplications: 0,
        successRate: 0,
        averageResponseTime: 0,
        topCompanies: [],
        monthlyTrend: []
      };
    }
  }

  static async getUserJourney(userId: string): Promise<UserJourney[]> {
    try {
      // Mock implementation since we don't have analytics events table
      const mockJourneys: UserJourney[] = [
        {
          sessionId: 'session-1',
          userId,
          events: [
            {
              id: 'event-1',
              userId,
              eventType: 'page_view',
              eventData: { page: '/dashboard' },
              timestamp: new Date().toISOString(),
              sessionId: 'session-1',
              pageUrl: '/dashboard'
            },
            {
              id: 'event-2',
              userId,
              eventType: 'job_search',
              eventData: { query: 'software engineer' },
              timestamp: new Date().toISOString(),
              sessionId: 'session-1',
              pageUrl: '/jobs'
            }
          ],
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          totalDuration: 30 * 60 * 1000, // 30 minutes
          conversionEvents: ['job_application']
        }
      ];

      return mockJourneys;
    } catch (error) {
      console.error('Failed to get user journey:', error);
      return [];
    }
  }

  static async getConversionFunnel(funnelType: string, timeRange: { start: Date; end: Date }): Promise<ConversionFunnel> {
    try {
      // Mock implementation
      if (funnelType === 'job_application') {
        return {
          name: 'Job Application Funnel',
          steps: [
            { name: 'Job Search', users: 1000, conversionRate: 100 },
            { name: 'Job View', users: 500, conversionRate: 50 },
            { name: 'Application Started', users: 200, conversionRate: 20 },
            { name: 'Application Submitted', users: 150, conversionRate: 15 }
          ]
        };
      }

      return {
        name: 'User Onboarding Funnel',
        steps: [
          { name: 'Sign Up', users: 800, conversionRate: 100 },
          { name: 'Profile Created', users: 600, conversionRate: 75 },
          { name: 'Resume Uploaded', users: 400, conversionRate: 50 },
          { name: 'First Application', users: 200, conversionRate: 25 }
        ]
      };
    } catch (error) {
      console.error('Failed to get conversion funnel:', error);
      return {
        name: 'Error',
        steps: []
      };
    }
  }

  static async getTopEvents(timeRange: { start: Date; end: Date }): Promise<Array<{ eventType: string; count: number }>> {
    try {
      // Mock implementation
      return [
        { eventType: 'page_view', count: 2500 },
        { eventType: 'job_search', count: 800 },
        { eventType: 'job_view', count: 600 },
        { eventType: 'job_application', count: 150 },
        { eventType: 'profile_update', count: 200 }
      ];
    } catch (error) {
      console.error('Failed to get top events:', error);
      return [];
    }
  }

  static async getUserEngagement(userId: string): Promise<UserEngagement> {
    try {
      // Mock implementation
      return {
        userId,
        totalSessions: 25,
        totalPageViews: 150,
        averageSessionDuration: 8.5, // minutes
        bounceRate: 0.25,
        lastActiveDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get user engagement:', error);
      return {
        userId,
        totalSessions: 0,
        totalPageViews: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        lastActiveDate: new Date().toISOString()
      };
    }
  }
}
