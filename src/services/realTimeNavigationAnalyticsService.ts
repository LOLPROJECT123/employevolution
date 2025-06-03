
import { supabase } from '@/integrations/supabase/client';
import { castJsonToStringArray } from '@/types/database';

export interface NavigationEvent {
  id: string;
  sessionId: string;
  fromRoute: string;
  toRoute: string;
  interactionType: 'click' | 'voice' | 'gesture' | 'direct';
  deviceType: string;
  timestamp: string;
  duration: number;
  browserInfo: any;
}

export interface NavigationPattern {
  route: string;
  frequency: number;
  avgDuration: number;
  bounceRate: number;
  conversionRate: number;
  popularNextRoutes: string[];
  dropoffRate: number;
}

export interface UserJourney {
  sessionId: string;
  routes: string[];
  totalDuration: number;
  completedGoal: boolean;
  dropoffPoint?: string;
  conversionEvents: string[];
  deviceInfo: any;
}

export interface RouteOptimization {
  recommendations: string[];
  performanceMetrics: {
    loadTime: number;
    interactionRate: number;
    retentionRate: number;
  };
  userFlow: {
    entryPoints: string[];
    exitPoints: string[];
    commonPaths: string[];
  };
}

export class RealTimeNavigationAnalyticsService {
  private static sessionId = this.generateSessionId();
  private static currentRoute = '';
  private static routeStartTime = Date.now();
  private static eventQueue: NavigationEvent[] = [];
  private static isRealTimeEnabled = true;

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async initializeAnalytics(userId?: string): Promise<void> {
    this.sessionId = this.generateSessionId();
    this.setupRouteTracking();
    this.setupRealTimeSync();
    
    if (userId) {
      await this.trackSessionStart(userId);
    }
  }

  private static setupRouteTracking(): void {
    // Track initial route
    this.currentRoute = window.location.pathname;
    this.routeStartTime = Date.now();

    // Listen for route changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      RealTimeNavigationAnalyticsService.handleRouteChange();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      RealTimeNavigationAnalyticsService.handleRouteChange();
    };

    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });
  }

  private static setupRealTimeSync(): void {
    // Sync events every 5 seconds
    setInterval(() => {
      if (this.eventQueue.length > 0 && this.isRealTimeEnabled) {
        this.syncEvents();
      }
    }, 5000);

    // Sync on page unload
    window.addEventListener('beforeunload', () => {
      this.syncEvents();
    });
  }

  private static handleRouteChange(): void {
    const newRoute = window.location.pathname;
    const duration = Date.now() - this.routeStartTime;

    if (newRoute !== this.currentRoute) {
      this.trackNavigation(this.currentRoute, newRoute, 'direct', duration);
      this.currentRoute = newRoute;
      this.routeStartTime = Date.now();
    }
  }

  static async trackNavigation(
    fromRoute: string, 
    toRoute: string, 
    interactionType: 'click' | 'voice' | 'gesture' | 'direct' = 'click',
    duration?: number
  ): Promise<void> {
    const event: NavigationEvent = {
      id: crypto.randomUUID(),
      sessionId: this.sessionId,
      fromRoute,
      toRoute,
      interactionType,
      deviceType: this.getDeviceType(),
      timestamp: new Date().toISOString(),
      duration: duration || Date.now() - this.routeStartTime,
      browserInfo: this.getBrowserInfo()
    };

    this.eventQueue.push(event);

    // Real-time sync for important navigation events
    if (this.isImportantRoute(toRoute)) {
      await this.syncEvents();
    }
  }

  private static async syncEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const eventsToSync = this.eventQueue.map(event => ({
        user_id: user?.id || null,
        session_id: event.sessionId,
        from_route: event.fromRoute,
        to_route: event.toRoute,
        interaction_type: event.interactionType,
        device_type: event.deviceType,
        duration_ms: event.duration,
        browser_info: event.browserInfo
      }));

      const { error } = await supabase
        .from('navigation_analytics')
        .insert(eventsToSync);

      if (!error) {
        this.eventQueue = [];
      }
    } catch (error) {
      console.error('Failed to sync navigation events:', error);
    }
  }

  static async analyzeNavigationPatterns(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<NavigationPattern[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const timeFilter = this.getTimeFilter(timeRange);
      
      const { data: analytics } = await supabase
        .from('navigation_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', timeFilter)
        .order('created_at', { ascending: true });

      if (!analytics) return [];

      return this.processNavigationPatterns(analytics);
    } catch (error) {
      console.error('Navigation pattern analysis error:', error);
      return [];
    }
  }

  private static processNavigationPatterns(analytics: any[]): NavigationPattern[] {
    const routeStats: { [route: string]: any } = {};

    analytics.forEach(item => {
      const route = item.to_route;
      if (!routeStats[route]) {
        routeStats[route] = {
          frequency: 0,
          totalDuration: 0,
          sessions: new Set(),
          nextRoutes: [],
          bounces: 0,
          conversions: 0
        };
      }

      routeStats[route].frequency++;
      routeStats[route].totalDuration += item.duration_ms || 0;
      routeStats[route].sessions.add(item.session_id);
      
      // Track next routes for flow analysis
      const nextItem = analytics.find(a => 
        a.session_id === item.session_id && 
        a.from_route === route &&
        new Date(a.created_at) > new Date(item.created_at)
      );
      
      if (nextItem) {
        routeStats[route].nextRoutes.push(nextItem.to_route);
      } else {
        routeStats[route].bounces++;
      }

      // Check for conversions (reaching goal pages)
      if (this.isConversionRoute(route)) {
        routeStats[route].conversions++;
      }
    });

    return Object.entries(routeStats).map(([route, stats]) => ({
      route,
      frequency: stats.frequency,
      avgDuration: stats.totalDuration / stats.frequency,
      bounceRate: (stats.bounces / stats.frequency) * 100,
      conversionRate: (stats.conversions / stats.frequency) * 100,
      popularNextRoutes: this.getMostFrequent(stats.nextRoutes, 3),
      dropoffRate: (stats.bounces / stats.sessions.size) * 100
    }));
  }

  static async analyzeUserJourneys(sessionId?: string): Promise<UserJourney[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('navigation_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data: analytics } = await query;
      if (!analytics) return [];

      // Map database response to NavigationEvent format
      const mappedAnalytics: NavigationEvent[] = analytics.map(item => ({
        id: item.id,
        sessionId: item.session_id,
        fromRoute: item.from_route || '',
        toRoute: item.to_route,
        interactionType: item.interaction_type as 'click' | 'voice' | 'gesture' | 'direct',
        deviceType: item.device_type || 'unknown',
        timestamp: item.created_at,
        duration: item.duration_ms || 0,
        browserInfo: item.browser_info
      }));

      return this.processUserJourneys(mappedAnalytics);
    } catch (error) {
      console.error('User journey analysis error:', error);
      return [];
    }
  }

  private static processUserJourneys(analytics: NavigationEvent[]): UserJourney[] {
    const sessionGroups: { [sessionId: string]: NavigationEvent[] } = {};

    analytics.forEach(event => {
      if (!sessionGroups[event.sessionId]) {
        sessionGroups[event.sessionId] = [];
      }
      sessionGroups[event.sessionId].push(event);
    });

    return Object.entries(sessionGroups).map(([sessionId, events]) => {
      const routes = events.map(e => e.toRoute);
      const totalDuration = events.reduce((sum, e) => sum + e.duration, 0);
      const completedGoal = this.hasCompletedGoal(routes);
      const dropoffPoint = this.findDropoffPoint(events);
      const conversionEvents = this.findConversionEvents(routes);

      return {
        sessionId,
        routes,
        totalDuration,
        completedGoal,
        dropoffPoint,
        conversionEvents,
        deviceInfo: events[0]?.browserInfo || {}
      };
    });
  }

  static async optimizeRouteFlow(): Promise<RouteOptimization> {
    try {
      const patterns = await this.analyzeNavigationPatterns('7d');
      const journeys = await this.analyzeUserJourneys();

      const recommendations = this.generateOptimizationRecommendations(patterns, journeys);
      const performanceMetrics = this.calculatePerformanceMetrics(patterns);
      const userFlow = this.analyzeUserFlow(journeys);

      return {
        recommendations,
        performanceMetrics,
        userFlow
      };
    } catch (error) {
      console.error('Route optimization error:', error);
      return {
        recommendations: [],
        performanceMetrics: { loadTime: 0, interactionRate: 0, retentionRate: 0 },
        userFlow: { entryPoints: [], exitPoints: [], commonPaths: [] }
      };
    }
  }

  private static generateOptimizationRecommendations(patterns: NavigationPattern[], journeys: UserJourney[]): string[] {
    const recommendations: string[] = [];

    patterns.forEach(pattern => {
      if (pattern.bounceRate > 70) {
        recommendations.push(`Improve user engagement on ${pattern.route} (high bounce rate: ${pattern.bounceRate.toFixed(1)}%)`);
      }
      if (pattern.avgDuration < 5000) {
        recommendations.push(`Consider adding more content to ${pattern.route} (short visit duration)`);
      }
      if (pattern.frequency > 10 && pattern.conversionRate < 20) {
        recommendations.push(`Optimize conversion flow on ${pattern.route} (low conversion rate)`);
      }
      if (pattern.dropoffRate > 50) {
        recommendations.push(`Reduce friction on ${pattern.route} (high dropoff rate)`);
      }
    });

    // Journey-based recommendations
    const incompletedJourneys = journeys.filter(j => !j.completedGoal);
    if (incompletedJourneys.length > journeys.length * 0.5) {
      recommendations.push('Simplify the user flow to improve goal completion rates');
    }

    return recommendations;
  }

  private static calculatePerformanceMetrics(patterns: NavigationPattern[]) {
    const totalFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0);
    const avgDuration = patterns.reduce((sum, p) => sum + p.avgDuration, 0) / patterns.length;
    const avgBounceRate = patterns.reduce((sum, p) => sum + p.bounceRate, 0) / patterns.length;

    return {
      loadTime: avgDuration,
      interactionRate: 100 - avgBounceRate,
      retentionRate: patterns.reduce((sum, p) => sum + (100 - p.dropoffRate), 0) / patterns.length
    };
  }

  private static analyzeUserFlow(journeys: UserJourney[]) {
    const entryPoints = journeys.map(j => j.routes[0]).filter(Boolean);
    const exitPoints = journeys.map(j => j.routes[j.routes.length - 1]).filter(Boolean);
    const commonPaths = this.findCommonPaths(journeys);

    return {
      entryPoints: this.getMostFrequent(entryPoints, 5),
      exitPoints: this.getMostFrequent(exitPoints, 5),
      commonPaths: commonPaths.slice(0, 5)
    };
  }

  private static findCommonPaths(journeys: UserJourney[]): string[] {
    const pathCounts: { [path: string]: number } = {};

    journeys.forEach(journey => {
      for (let i = 0; i < journey.routes.length - 1; i++) {
        const path = `${journey.routes[i]} → ${journey.routes[i + 1]}`;
        pathCounts[path] = (pathCounts[path] || 0) + 1;
      }
    });

    return Object.entries(pathCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([path]) => path);
  }

  // Utility methods
  private static async trackSessionStart(userId: string): Promise<void> {
    try {
      await supabase.from('navigation_analytics').insert({
        user_id: userId,
        session_id: this.sessionId,
        from_route: '',
        to_route: window.location.pathname,
        interaction_type: 'direct',
        device_type: this.getDeviceType(),
        browser_info: this.getBrowserInfo()
      });
    } catch (error) {
      console.error('Failed to track session start:', error);
    }
  }

  private static getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private static getBrowserInfo(): any {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height
      }
    };
  }

  private static getTimeFilter(timeRange: string): string {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
  }

  private static isImportantRoute(route: string): boolean {
    const importantRoutes = ['/dashboard', '/jobs', '/applications', '/profile'];
    return importantRoutes.includes(route);
  }

  private static isConversionRoute(route: string): boolean {
    const conversionRoutes = ['/applications', '/profile', '/jobs'];
    return conversionRoutes.includes(route);
  }

  private static hasCompletedGoal(routes: string[]): boolean {
    const goalRoutes = ['/applications', '/profile', '/jobs'];
    return goalRoutes.some(goal => routes.includes(goal));
  }

  private static findDropoffPoint(events: NavigationEvent[]): string | undefined {
    return events[events.length - 1]?.toRoute;
  }

  private static findConversionEvents(routes: string[]): string[] {
    const conversionRoutes = ['/applications', '/profile', '/jobs'];
    return routes.filter(route => conversionRoutes.includes(route));
  }

  private static getMostFrequent<T>(array: T[], limit: number): T[] {
    const counts: { [key: string]: number } = {};
    array.forEach(item => {
      const key = String(item);
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([key]) => key as T);
  }

  // Public API methods for real-time control
  static enableRealTimeTracking(): void {
    this.isRealTimeEnabled = true;
  }

  static disableRealTimeTracking(): void {
    this.isRealTimeEnabled = false;
  }

  static async flushEvents(): Promise<void> {
    await this.syncEvents();
  }

  static getQueuedEvents(): NavigationEvent[] {
    return [...this.eventQueue];
  }
}
