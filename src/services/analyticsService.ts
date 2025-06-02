
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
        eventData: event.event_data,
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
}
