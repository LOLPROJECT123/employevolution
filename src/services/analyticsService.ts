
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  user_id: string;
  event_name: string;
  category: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

interface UserEngagement {
  totalEvents: number;
  averageSessionDuration: number; // in seconds
  mostActiveHour: number; // 0-23
  engagementScore: number; // 0-100
  sessionCount: number;
  bounceRate: number; // 0-100
}

interface ConversionFunnelStage {
  name: string;
  count: number;
  conversionRate: number; // percentage
}

interface ConversionFunnel {
  name: string;
  stages: ConversionFunnelStage[];
}

interface AnalyticsOverview {
  totalApplications: number;
  responseRate: number; // percentage
  interviewRate: number; // percentage
  offerRate: number; // percentage
  avgResponseTime: number; // days
  activeApplications: number;
}

interface AnalyticsTrends {
  applicationsOverTime: Array<{ month: string; count: number }>;
  responseRateOverTime: Array<{ month: string; count: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
}

interface AnalyticsInsights {
  topPerformingSkills: string[];
  industryComparison: {
    responseRate: 'above' | 'below' | 'average';
    timeToInterview: 'faster' | 'slower' | 'average';
  };
  recommendations: string[];
}

interface AnalyticsBenchmarks {
  industryAverages: {
    responseRate: number;
    interviewRate: number;
    offerRate: number;
  };
  yourPerformanceVsIndustry: {
    responseRate: 'above' | 'below' | 'average';
    interviewRate: 'above' | 'below' | 'average';
    offerRate: 'above' | 'below' | 'average';
  };
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  trends: AnalyticsTrends;
  insights: AnalyticsInsights;
  benchmarks: AnalyticsBenchmarks;
  recommendations: string[];
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private batchSize = 50;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.startBatchProcessor();
  }

  // Track events locally instead of using non-existent database table
  trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    this.events.push({
      ...event,
      timestamp: new Date()
    });

    if (this.events.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToFlush = [...this.events];
    this.events = [];

    try {
      // Store events in application_events table
      const { error } = await supabase
        .from('application_events')
        .insert(
          eventsToFlush.map(event => ({
            user_id: event.user_id,
            event_type: event.event_name,
            title: event.category,
            description: JSON.stringify(event.metadata),
            event_date: event.timestamp.toISOString(),
            application_id: event.metadata?.applicationId || 'general'
          }))
        );

      if (error) {
        console.error('Failed to flush analytics events:', error);
        // Re-add events for retry
        this.events.unshift(...eventsToFlush);
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
      this.events.unshift(...eventsToFlush);
    }
  }

  private startBatchProcessor(): void {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  async getUserEngagement(userId: string, days: number = 30): Promise<UserEngagement> {
    try {
      const { data, error } = await supabase
        .from('application_events')
        .select('*')
        .eq('user_id', userId)
        .gte('event_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const events = data || [];
      
      return {
        totalEvents: events.length,
        averageSessionDuration: this.calculateAverageSessionDuration(events),
        mostActiveHour: this.calculateMostActiveHour(events),
        engagementScore: this.calculateEngagementScore(events),
        sessionCount: this.calculateSessionCount(events),
        bounceRate: this.calculateBounceRate(events)
      };
    } catch (error) {
      console.error('Failed to get user engagement:', error);
      return {
        totalEvents: 0,
        averageSessionDuration: 0,
        mostActiveHour: 0,
        engagementScore: 0,
        sessionCount: 0,
        bounceRate: 0
      };
    }
  }

  async getConversionFunnels(userId: string): Promise<ConversionFunnel[]> {
    try {
      const { data: jobApplications, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const applications = jobApplications || [];
      
      return [
        {
          name: 'Job Application Process',
          stages: [
            {
              name: 'Job Views',
              count: applications.length * 3, // Assume 3 views per application
              conversionRate: 100
            },
            {
              name: 'Applications Submitted',
              count: applications.length,
              conversionRate: applications.length > 0 ? (applications.length / (applications.length * 3)) * 100 : 0
            },
            {
              name: 'Interviews',
              count: applications.filter(app => app.status === 'interviewing').length,
              conversionRate: applications.length > 0 ? (applications.filter(app => app.status === 'interviewing').length / applications.length) * 100 : 0
            },
            {
              name: 'Offers',
              count: applications.filter(app => app.status === 'offered').length,
              conversionRate: applications.length > 0 ? (applications.filter(app => app.status === 'offered').length / applications.length) * 100 : 0
            }
          ]
        }
      ];
    } catch (error) {
      console.error('Failed to get conversion funnels:', error);
      return [];
    }
  }

  async generateApplicationAnalytics(): Promise<AnalyticsData> {
    try {
      // Use job_applications table for real data
      const { data: applications, error } = await supabase
        .from('job_applications')
        .select('*');

      if (error) throw error;

      const apps = applications || [];
      
      const overview = {
        totalApplications: apps.length,
        responseRate: apps.length > 0 ? (apps.filter(app => app.status !== 'applied').length / apps.length) * 100 : 0,
        interviewRate: apps.length > 0 ? (apps.filter(app => app.status === 'interviewing').length / apps.length) * 100 : 0,
        offerRate: apps.length > 0 ? (apps.filter(app => app.status === 'offered').length / apps.length) * 100 : 0,
        avgResponseTime: 7, // Mock value
        activeApplications: apps.filter(app => app.status === 'applied').length
      };

      const trends = {
        applicationsOverTime: this.generateMonthlyTrend(apps.length),
        responseRateOverTime: this.generateMonthlyTrend(overview.responseRate),
        statusDistribution: [
          { status: 'Applied', count: apps.filter(app => app.status === 'applied').length },
          { status: 'Interviewing', count: apps.filter(app => app.status === 'interviewing').length },
          { status: 'Offered', count: apps.filter(app => app.status === 'offered').length },
          { status: 'Rejected', count: apps.filter(app => app.status === 'rejected').length }
        ]
      };

      return {
        overview,
        trends,
        insights: {
          topPerformingSkills: ['JavaScript', 'React', 'TypeScript'],
          industryComparison: {
            responseRate: 'above' as const,
            timeToInterview: 'average' as const
          },
          recommendations: [
            'Consider applying to more remote positions',
            'Update your resume with trending skills',
            'Follow up on pending applications'
          ]
        },
        benchmarks: {
          industryAverages: {
            responseRate: 15,
            interviewRate: 8,
            offerRate: 3
          },
          yourPerformanceVsIndustry: {
            responseRate: overview.responseRate > 15 ? 'above' as const : overview.responseRate < 10 ? 'below' as const : 'average' as const,
            interviewRate: overview.interviewRate > 8 ? 'above' as const : overview.interviewRate < 5 ? 'below' as const : 'average' as const,
            offerRate: overview.offerRate > 3 ? 'above' as const : overview.offerRate < 1 ? 'below' as const : 'average' as const
          }
        },
        recommendations: [
          'Focus on quality over quantity in applications',
          'Tailor your resume for each position',
          'Practice interview skills regularly'
        ]
      };
    } catch (error) {
      console.error('Failed to generate analytics:', error);
      // Return mock data on error
      return this.getMockAnalyticsData();
    }
  }

  private generateMonthlyTrend(value: number): Array<{ month: string; count: number }> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      count: Math.floor(value * (0.8 + Math.random() * 0.4))
    }));
  }

  private getMockAnalyticsData(): AnalyticsData {
    return {
      overview: {
        totalApplications: 0,
        responseRate: 0,
        interviewRate: 0,
        offerRate: 0,
        avgResponseTime: 0,
        activeApplications: 0
      },
      trends: {
        applicationsOverTime: [],
        responseRateOverTime: [],
        statusDistribution: []
      },
      insights: {
        topPerformingSkills: [],
        industryComparison: {
          responseRate: 'average' as const,
          timeToInterview: 'average' as const
        },
        recommendations: []
      },
      benchmarks: {
        industryAverages: {
          responseRate: 15,
          interviewRate: 8,
          offerRate: 3
        },
        yourPerformanceVsIndustry: {
          responseRate: 'average' as const,
          interviewRate: 'average' as const,
          offerRate: 'average' as const
        }
      },
      recommendations: []
    };
  }

  private calculateAverageSessionDuration(events: any[]): number {
    // Mock implementation
    return Math.floor(120 + Math.random() * 180);
  }

  private calculateMostActiveHour(events: any[]): number {
    // Mock implementation
    return Math.floor(Math.random() * 24);
  }

  private calculateEngagementScore(events: any[]): number {
    // Mock implementation
    return Math.floor(40 + Math.random() * 60);
  }

  private calculateSessionCount(events: any[]): number {
    // Mock implementation
    return Math.floor(events.length / 10) + 1;
  }

  private calculateBounceRate(events: any[]): number {
    // Mock implementation
    return Math.floor(10 + Math.random() * 30);
  }
}

export const analyticsService = new AnalyticsService();
