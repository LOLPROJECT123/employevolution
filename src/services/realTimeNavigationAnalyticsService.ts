
import { supabase } from '@/integrations/supabase/client';

export interface NavigationEvent {
  id: string;
  userId?: string;
  sessionId: string;
  fromRoute: string;
  toRoute: string;
  timestamp: string;
  duration?: number;
  interactionType: 'click' | 'navigation' | 'search' | 'gesture';
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browserInfo: {
    userAgent: string;
    viewport: { width: number; height: number };
    connection?: string;
  };
  metadata?: any;
}

export interface UserJourney {
  sessionId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  totalDuration: number;
  pages: string[];
  conversionEvents: string[];
  dropOffPoint?: string;
  deviceType: string;
  isComplete: boolean;
}

export interface NavigationPattern {
  pattern: string[];
  frequency: number;
  averageDuration: number;
  conversionRate: number;
  dropOffRate: number;
  deviceBreakdown: { [key: string]: number };
}

export interface RealTimeMetrics {
  activeUsers: number;
  topPages: { route: string; users: number }[];
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  realTimeEvents: NavigationEvent[];
}

export class RealTimeNavigationAnalyticsService {
  private static eventBuffer: NavigationEvent[] = [];
  private static currentSession: string = '';
  private static sessionStartTime: number = Date.now();
  private static realTimeSubscription: any = null;

  static init(): void {
    this.currentSession = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.setupRealTimeListening();
    this.startPeriodicFlush();
    this.setupBeforeUnloadHandler();
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static trackNavigation(fromRoute: string, toRoute: string, interactionType: 'click' | 'navigation' | 'search' | 'gesture' = 'navigation'): void {
    const event: NavigationEvent = {
      id: crypto.randomUUID(),
      sessionId: this.currentSession,
      fromRoute,
      toRoute,
      timestamp: new Date().toISOString(),
      interactionType,
      deviceType: this.getDeviceType(),
      browserInfo: this.getBrowserInfo()
    };

    // Add user ID if authenticated
    this.addUserIdToEvent(event);

    this.eventBuffer.push(event);
    
    // Real-time processing
    this.processEventRealTime(event);

    // Flush if buffer is getting large
    if (this.eventBuffer.length >= 10) {
      this.flushEvents();
    }
  }

  private static async addUserIdToEvent(event: NavigationEvent): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        event.userId = user.id;
      }
    } catch (error) {
      // User not authenticated, continue without user ID
    }
  }

  private static processEventRealTime(event: NavigationEvent): void {
    // Broadcast to real-time listeners
    this.broadcastToRealTimeChannel(event);
    
    // Update local metrics
    this.updateLocalMetrics(event);
    
    // Trigger any immediate actions
    this.triggerImmediateActions(event);
  }

  private static broadcastToRealTimeChannel(event: NavigationEvent): void {
    const channel = supabase.channel('navigation-analytics');
    channel.send({
      type: 'broadcast',
      event: 'navigation',
      payload: event
    });
  }

  private static updateLocalMetrics(event: NavigationEvent): void {
    // Update performance metrics in localStorage
    const metrics = this.getLocalMetrics();
    metrics.totalEvents++;
    metrics.lastActivity = event.timestamp;
    metrics.routes[event.toRoute] = (metrics.routes[event.toRoute] || 0) + 1;
    
    localStorage.setItem('navigation_metrics', JSON.stringify(metrics));
  }

  private static getLocalMetrics(): any {
    const stored = localStorage.getItem('navigation_metrics');
    return stored ? JSON.parse(stored) : {
      totalEvents: 0,
      lastActivity: new Date().toISOString(),
      routes: {},
      sessionStart: this.sessionStartTime
    };
  }

  private static triggerImmediateActions(event: NavigationEvent): void {
    // Check for conversion events
    if (this.isConversionPage(event.toRoute)) {
      this.trackConversionEvent(event);
    }

    // Check for drop-off patterns
    if (this.isHighDropOffRoute(event.fromRoute, event.toRoute)) {
      this.trackDropOffEvent(event);
    }

    // Performance monitoring
    if (event.duration && event.duration > 5000) {
      this.trackSlowNavigation(event);
    }
  }

  private static isConversionPage(route: string): boolean {
    const conversionRoutes = ['/applications', '/profile/complete', '/jobs/apply'];
    return conversionRoutes.some(convRoute => route.includes(convRoute));
  }

  private static isHighDropOffRoute(fromRoute: string, toRoute: string): boolean {
    // Define patterns that indicate user confusion or frustration
    const problematicPatterns = [
      { from: '/jobs', to: '/dashboard' }, // Back to dashboard from jobs
      { from: '/profile', to: '/jobs' }, // Profile to jobs without completing
    ];
    
    return problematicPatterns.some(pattern => 
      fromRoute.includes(pattern.from) && toRoute.includes(pattern.to)
    );
  }

  private static trackConversionEvent(event: NavigationEvent): void {
    const conversionEvent = {
      session_id: event.sessionId,
      user_id: event.userId || 'anonymous',
      event_name: 'page_conversion',
      timestamp: event.timestamp,
      properties: {
        route: event.toRoute,
        fromRoute: event.fromRoute,
        deviceType: event.deviceType
      }
    };

    // Store conversion event
    this.storeConversionEvent(conversionEvent);
  }

  private static trackDropOffEvent(event: NavigationEvent): void {
    console.log('Drop-off detected:', { from: event.fromRoute, to: event.toRoute });
    // This could trigger alerts or optimization suggestions
  }

  private static trackSlowNavigation(event: NavigationEvent): void {
    console.log('Slow navigation detected:', { route: event.toRoute, duration: event.duration });
    // This could trigger performance monitoring alerts
  }

  private static async storeConversionEvent(conversionEvent: any): Promise<void> {
    try {
      await supabase.from('conversion_events').insert(conversionEvent);
    } catch (error) {
      console.error('Error storing conversion event:', error);
    }
  }

  static async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // Transform events for database storage
      const dbEvents = eventsToFlush.map(event => ({
        user_id: event.userId,
        session_id: event.sessionId,
        from_route: event.fromRoute,
        to_route: event.toRoute,
        interaction_type: event.interactionType,
        device_type: event.deviceType,
        duration_ms: event.duration,
        browser_info: event.browserInfo,
        created_at: event.timestamp
      }));

      await supabase.from('navigation_analytics').insert(dbEvents);
      console.log(`Flushed ${eventsToFlush.length} navigation events`);
    } catch (error) {
      console.error('Error flushing navigation events:', error);
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...eventsToFlush);
    }
  }

  static async analyzeUserJourney(sessionId?: string, userId?: string): Promise<UserJourney | null> {
    try {
      let query = supabase
        .from('navigation_analytics')
        .select('*')
        .order('created_at', { ascending: true });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('session_id', this.currentSession);
      }

      const { data: events, error } = await query;
      if (error || !events || events.length === 0) return null;

      const firstEvent = events[0];
      const lastEvent = events[events.length - 1];
      
      const journey: UserJourney = {
        sessionId: firstEvent.session_id,
        userId: firstEvent.user_id,
        startTime: firstEvent.created_at,
        endTime: lastEvent.created_at,
        totalDuration: new Date(lastEvent.created_at).getTime() - new Date(firstEvent.created_at).getTime(),
        pages: [...new Set(events.map(e => e.to_route))],
        conversionEvents: await this.getConversionEvents(firstEvent.session_id),
        deviceType: firstEvent.device_type,
        isComplete: this.isJourneyComplete(events)
      };

      // Detect drop-off point
      const dropOffPoint = this.detectDropOffPoint(events);
      if (dropOffPoint) {
        journey.dropOffPoint = dropOffPoint;
      }

      return journey;
    } catch (error) {
      console.error('Error analyzing user journey:', error);
      return null;
    }
  }

  private static async getConversionEvents(sessionId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('conversion_events')
        .select('event_name')
        .eq('session_id', sessionId);

      if (error) return [];
      return data.map(event => event.event_name);
    } catch (error) {
      return [];
    }
  }

  private static isJourneyComplete(events: any[]): boolean {
    const conversionRoutes = ['/applications', '/profile/complete'];
    return events.some(event => 
      conversionRoutes.some(route => event.to_route.includes(route))
    );
  }

  private static detectDropOffPoint(events: any[]): string | undefined {
    // Simple heuristic: if user spent more than 2 minutes on a page and then left
    for (let i = 0; i < events.length - 1; i++) {
      const duration = events[i].duration_ms;
      if (duration && duration > 120000) { // 2 minutes
        return events[i].to_route;
      }
    }
    return undefined;
  }

  static async getNavigationPatterns(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<NavigationPattern[]> {
    try {
      const startTime = this.getTimeframeStart(timeframe);
      
      const { data: events, error } = await supabase
        .from('navigation_analytics')
        .select('session_id, from_route, to_route, duration_ms, device_type, created_at')
        .gte('created_at', startTime)
        .order('session_id, created_at');

      if (error) return [];

      // Group events by session to build patterns
      const sessionJourneys = this.groupEventsBySession(events);
      
      // Extract patterns
      const patterns = this.extractPatterns(sessionJourneys);
      
      return patterns.sort((a, b) => b.frequency - a.frequency);
    } catch (error) {
      console.error('Error getting navigation patterns:', error);
      return [];
    }
  }

  private static getTimeframeStart(timeframe: string): string {
    const now = new Date();
    switch (timeframe) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private static groupEventsBySession(events: any[]): { [sessionId: string]: any[] } {
    return events.reduce((groups, event) => {
      const sessionId = event.session_id;
      if (!groups[sessionId]) {
        groups[sessionId] = [];
      }
      groups[sessionId].push(event);
      return groups;
    }, {});
  }

  private static extractPatterns(sessionJourneys: { [sessionId: string]: any[] }): NavigationPattern[] {
    const patternMap: { [pattern: string]: any } = {};

    Object.values(sessionJourneys).forEach(journey => {
      if (journey.length < 2) return;

      const routes = journey.map(event => event.to_route);
      const patternKey = routes.join(' -> ');
      
      if (!patternMap[patternKey]) {
        patternMap[patternKey] = {
          pattern: routes,
          frequency: 0,
          totalDuration: 0,
          conversions: 0,
          dropOffs: 0,
          deviceBreakdown: {}
        };
      }

      const pattern = patternMap[patternKey];
      pattern.frequency++;
      
      const totalDuration = journey.reduce((sum, event) => sum + (event.duration_ms || 0), 0);
      pattern.totalDuration += totalDuration;

      // Check for conversions and drop-offs
      const lastRoute = routes[routes.length - 1];
      if (this.isConversionPage(lastRoute)) {
        pattern.conversions++;
      } else {
        pattern.dropOffs++;
      }

      // Device breakdown
      const deviceType = journey[0].device_type;
      pattern.deviceBreakdown[deviceType] = (pattern.deviceBreakdown[deviceType] || 0) + 1;
    });

    return Object.values(patternMap).map(pattern => ({
      pattern: pattern.pattern,
      frequency: pattern.frequency,
      averageDuration: pattern.totalDuration / pattern.frequency,
      conversionRate: (pattern.conversions / pattern.frequency) * 100,
      dropOffRate: (pattern.dropOffs / pattern.frequency) * 100,
      deviceBreakdown: pattern.deviceBreakdown
    }));
  }

  static async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: recentEvents } = await supabase
        .from('navigation_analytics')
        .select('*')
        .gte('created_at', fiveMinutesAgo);

      const activeUsers = new Set(recentEvents?.map(e => e.session_id) || []).size;
      
      const routeCounts: { [route: string]: number } = {};
      recentEvents?.forEach(event => {
        routeCounts[event.to_route] = (routeCounts[event.to_route] || 0) + 1;
      });

      const topPages = Object.entries(routeCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([route, users]) => ({ route, users }));

      return {
        activeUsers,
        topPages,
        averageSessionDuration: 0, // Would calculate from actual session data
        bounceRate: 0, // Would calculate from session patterns
        conversionRate: 0, // Would calculate from conversion events
        realTimeEvents: recentEvents || []
      };
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      return {
        activeUsers: 0,
        topPages: [],
        averageSessionDuration: 0,
        bounceRate: 0,
        conversionRate: 0,
        realTimeEvents: []
      };
    }
  }

  private static setupRealTimeListening(): void {
    this.realTimeSubscription = supabase
      .channel('navigation-analytics')
      .on('broadcast', { event: 'navigation' }, (payload) => {
        console.log('Real-time navigation event:', payload);
        // Handle real-time updates
      })
      .subscribe();
  }

  private static startPeriodicFlush(): void {
    setInterval(() => {
      this.flushEvents();
    }, 30000); // Flush every 30 seconds
  }

  private static setupBeforeUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });
  }

  private static getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private static getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: (navigator as any).connection?.effectiveType || 'unknown'
    };
  }

  static destroy(): void {
    this.flushEvents();
    if (this.realTimeSubscription) {
      supabase.removeChannel(this.realTimeSubscription);
    }
  }
}

// Auto-initialize on import
RealTimeNavigationAnalyticsService.init();
