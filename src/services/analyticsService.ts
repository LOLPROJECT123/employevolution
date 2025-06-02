import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  userId?: string;
  eventType: string;
  eventData: Record<string, any>;
  pageUrl?: string;
  sessionId: string;
  timestamp: Date;
}

export interface UserJourney {
  sessionId: string;
  userId?: string;
  events: AnalyticsEvent[];
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  conversionEvents: string[];
}

export interface ConversionFunnel {
  name: string;
  steps: {
    name: string;
    eventType: string;
    users: number;
    conversionRate: number;
  }[];
}

export class AnalyticsService {
  private static sessionId: string = this.generateSessionId();
  private static eventQueue: AnalyticsEvent[] = [];
  private static isOnline: boolean = navigator.onLine;

  static {
    // Set up online/offline listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEventQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      this.flushEventQueue();
    });

    // Periodic flush
    setInterval(() => {
      this.flushEventQueue();
    }, 30000); // Every 30 seconds
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static track(eventType: string, eventData: Record<string, any> = {}, userId?: string): void {
    const event: AnalyticsEvent = {
      userId,
      eventType,
      eventData: {
        ...eventData,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        referrer: document.referrer
      },
      pageUrl: window.location.href,
      sessionId: this.sessionId,
      timestamp: new Date()
    };

    this.eventQueue.push(event);

    // Flush immediately for important events
    const immediateFlushEvents = ['page_view', 'application_submitted', 'user_signup'];
    if (immediateFlushEvents.includes(eventType) && this.isOnline) {
      this.flushEventQueue();
    }
  }

  static trackPageView(userId?: string): void {
    this.track('page_view', {
      page: window.location.pathname,
      title: document.title,
      loadTime: performance.now()
    }, userId);
  }

  static trackUserAction(action: string, details: Record<string, any> = {}, userId?: string): void {
    this.track('user_action', {
      action,
      ...details
    }, userId);
  }

  static trackJobInteraction(jobId: string, action: 'view' | 'apply' | 'save' | 'share', userId?: string): void {
    this.track('job_interaction', {
      jobId,
      action,
      timestamp: new Date().toISOString()
    }, userId);
  }

  static trackSearchQuery(query: string, filters: Record<string, any>, resultCount: number, userId?: string): void {
    this.track('search_query', {
      query,
      filters,
      resultCount,
      searchDuration: performance.now()
    }, userId);
  }

  static trackConversion(conversionType: string, value?: number, userId?: string): void {
    this.track('conversion', {
      conversionType,
      value,
      conversionTime: new Date().toISOString()
    }, userId);
  }

  private static async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.isOnline) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from('user_analytics')
        .insert(
          eventsToFlush.map(event => ({
            user_id: event.userId,
            event_type: event.eventType,
            event_data: event.eventData,
            page_url: event.pageUrl,
            session_id: event.sessionId,
            user_agent: event.eventData.userAgent,
            created_at: event.timestamp.toISOString()
          }))
        );

      if (error) {
        // Re-queue events if failed
        this.eventQueue.unshift(...eventsToFlush);
        console.error('Failed to flush analytics events:', error);
      }
    } catch (error) {
      // Re-queue events if failed
      this.eventQueue.unshift(...eventsToFlush);
      console.error('Failed to flush analytics events:', error);
    }
  }

  static async getUserJourney(userId: string, sessionId?: string): Promise<UserJourney[]> {
    let query = supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch user journey: ${error.message}`);
    }

    // Group events by session
    const sessionGroups = data?.reduce((groups, event) => {
      const sessionId = event.session_id;
      if (!groups[sessionId]) {
        groups[sessionId] = [];
      }
      groups[sessionId].push({
        userId: event.user_id,
        eventType: event.event_type,
        eventData: event.eventData,
        pageUrl: event.page_url,
        sessionId: event.session_id,
        timestamp: new Date(event.created_at)
      });
      return groups;
    }, {} as Record<string, AnalyticsEvent[]>) || {};

    return Object.entries(sessionGroups).map(([sessionId, events]) => {
      const startTime = events[0].timestamp;
      const endTime = events[events.length - 1].timestamp;
      const conversionEvents = events
        .filter(e => e.eventType === 'conversion')
        .map(e => e.eventData.conversionType);

      return {
        sessionId,
        userId,
        events,
        startTime,
        endTime,
        totalDuration: endTime.getTime() - startTime.getTime(),
        conversionEvents
      };
    });
  }

  static async getConversionFunnel(funnelName: string, timeRange: { start: Date; end: Date }): Promise<ConversionFunnel> {
    // Define common funnels
    const funnels = {
      job_application: [
        { name: 'Job View', eventType: 'job_interaction' },
        { name: 'Application Started', eventType: 'user_action' },
        { name: 'Application Submitted', eventType: 'conversion' }
      ],
      user_onboarding: [
        { name: 'Signup', eventType: 'user_signup' },
        { name: 'Profile Created', eventType: 'profile_completed' },
        { name: 'First Job Search', eventType: 'search_query' }
      ]
    };

    const funnelSteps = funnels[funnelName as keyof typeof funnels] || [];
    const steps = [];

    let previousStepUsers = new Set<string>();
    let isFirstStep = true;

    for (const step of funnelSteps) {
      const { data } = await supabase
        .from('user_analytics')
        .select('user_id')
        .eq('event_type', step.eventType)
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      const stepUsers = new Set(data?.map(d => d.user_id) || []);
      const uniqueUsers = isFirstStep ? stepUsers : new Set([...stepUsers].filter(u => previousStepUsers.has(u)));
      
      const conversionRate = isFirstStep ? 100 : (uniqueUsers.size / previousStepUsers.size) * 100;

      steps.push({
        name: step.name,
        eventType: step.eventType,
        users: uniqueUsers.size,
        conversionRate
      });

      previousStepUsers = uniqueUsers;
      isFirstStep = false;
    }

    return {
      name: funnelName,
      steps
    };
  }

  static async getTopEvents(timeRange: { start: Date; end: Date }, limit = 10): Promise<Array<{ eventType: string; count: number }>> {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('event_type')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString());

    if (error) {
      throw new Error(`Failed to fetch top events: ${error.message}`);
    }

    const eventCounts = data?.reduce((counts, event) => {
      counts[event.event_type] = (counts[event.event_type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>) || {};

    return Object.entries(eventCounts)
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  static startNewSession(): void {
    this.sessionId = this.generateSessionId();
  }

  static getCurrentSessionId(): string {
    return this.sessionId;
  }

  static generateApplicationAnalytics(userId: string) {
    // Mock data for analytics dashboard
    return {
      overview: {
        totalApplications: 45,
        responseRate: 24.4,
        interviewRate: 13.3,
        offerRate: 6.7,
        avgResponseTime: 5.2,
        activeApplications: 8
      },
      trends: {
        applicationsOverTime: [
          { date: '2024-01-01', count: 5 },
          { date: '2024-01-08', count: 8 },
          { date: '2024-01-15', count: 6 },
          { date: '2024-01-22', count: 12 },
          { date: '2024-01-29', count: 14 }
        ],
        responseRateOverTime: [
          { date: '2024-01-01', rate: 20 },
          { date: '2024-01-08', rate: 25 },
          { date: '2024-01-15', rate: 22 },
          { date: '2024-01-22', rate: 28 },
          { date: '2024-01-29', rate: 24 }
        ],
        statusDistribution: [
          { status: 'applied', count: 20, percentage: 44.4 },
          { status: 'reviewed', count: 11, percentage: 24.4 },
          { status: 'interview', count: 6, percentage: 13.3 },
          { status: 'offer', count: 3, percentage: 6.7 },
          { status: 'rejected', count: 5, percentage: 11.1 }
        ]
      },
      insights: {
        topPerformingSkills: [
          { skill: 'React', responseRate: 35, applications: 15 },
          { skill: 'TypeScript', responseRate: 30, applications: 12 },
          { skill: 'Node.js', responseRate: 25, applications: 10 }
        ],
        bestCompanyTypes: [
          { type: 'Startup', successRate: 40, applications: 10 },
          { type: 'Enterprise', successRate: 20, applications: 25 },
          { type: 'Mid-size', successRate: 30, applications: 10 }
        ],
        optimalApplicationTiming: [
          { dayOfWeek: 'Tuesday', successRate: 35 },
          { dayOfWeek: 'Wednesday', successRate: 32 },
          { dayOfWeek: 'Thursday', successRate: 28 }
        ],
        salaryAnalysis: {
          avgOfferedSalary: 95000,
          salaryRangeDistribution: [
            { range: '80-90k', count: 5 },
            { range: '90-100k', count: 8 },
            { range: '100-120k', count: 4 }
          ]
        }
      },
      recommendations: [
        'Focus on React-based positions for higher response rates',
        'Apply on Tuesday-Wednesday for optimal results',
        'Target startup companies for better success rates'
      ],
      benchmarks: {
        industryAvgResponseRate: 20,
        industryAvgInterviewRate: 10,
        industryAvgOfferRate: 5,
        yourPerformanceVsIndustry: {
          responseRate: 'above' as const,
          interviewRate: 'above' as const,
          offerRate: 'above' as const
        }
      }
    };
  }
}
