
import { supabase } from '@/integrations/supabase/client';

export interface RealTimeNavigationEvent {
  sessionId: string;
  userId?: string;
  route: string;
  timestamp: string;
  duration: number;
  interactions: NavigationInteraction[];
  deviceInfo: DeviceInfo;
  conversionEvents: string[];
}

export interface NavigationInteraction {
  type: 'click' | 'scroll' | 'hover' | 'form_submit' | 'search';
  element: string;
  timestamp: string;
  coordinates?: { x: number; y: number };
  value?: string;
}

export interface DeviceInfo {
  userAgent: string;
  screenSize: { width: number; height: number };
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
}

export interface RouteOptimizationInsight {
  route: string;
  issues: string[];
  recommendations: string[];
  performanceScore: number;
  conversionRate: number;
  dropOffRate: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

export class EnhancedRealTimeNavigationService {
  private static currentSession: string = '';
  private static navigationBuffer: RealTimeNavigationEvent[] = [];
  private static interactions: NavigationInteraction[] = [];

  static initializeSession(): string {
    this.currentSession = crypto.randomUUID();
    this.setupRealTimeTracking();
    return this.currentSession;
  }

  private static setupRealTimeTracking(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushNavigationBuffer();
      }
    });

    // Track interactions
    document.addEventListener('click', (e) => {
      this.recordInteraction({
        type: 'click',
        element: this.getElementSelector(e.target as Element),
        timestamp: new Date().toISOString(),
        coordinates: { x: e.clientX, y: e.clientY }
      });
    });

    document.addEventListener('scroll', () => {
      this.recordInteraction({
        type: 'scroll',
        element: 'window',
        timestamp: new Date().toISOString(),
        coordinates: { x: window.scrollX, y: window.scrollY }
      });
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.recordInteraction({
        type: 'form_submit',
        element: this.getElementSelector(e.target as Element),
        timestamp: new Date().toISOString()
      });
    });
  }

  private static getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  static recordNavigation(fromRoute: string, toRoute: string, duration: number): void {
    const navigationEvent: RealTimeNavigationEvent = {
      sessionId: this.currentSession,
      route: toRoute,
      timestamp: new Date().toISOString(),
      duration,
      interactions: [...this.interactions],
      deviceInfo: this.getDeviceInfo(),
      conversionEvents: this.getConversionEvents()
    };

    this.navigationBuffer.push(navigationEvent);
    this.interactions = []; // Reset interactions for new page

    // Save to database
    this.saveNavigationEvent(fromRoute, toRoute, duration);

    // Process real-time analytics
    this.processRealTimeAnalytics(navigationEvent);
  }

  private static recordInteraction(interaction: NavigationInteraction): void {
    this.interactions.push(interaction);
  }

  private static getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    const screen = window.screen;
    
    return {
      userAgent: ua,
      screenSize: { width: screen.width, height: screen.height },
      deviceType: this.detectDeviceType(),
      browser: this.detectBrowser(ua),
      os: this.detectOS(ua)
    };
  }

  private static detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.screen.width;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private static detectBrowser(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private static detectOS(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private static getConversionEvents(): string[] {
    // Check for conversion actions in current session
    const conversions: string[] = [];
    
    // Check localStorage for recent actions
    const recentActions = JSON.parse(localStorage.getItem('recentActions') || '[]');
    const conversionActions = ['job_applied', 'profile_updated', 'resume_uploaded'];
    
    for (const action of recentActions) {
      if (conversionActions.includes(action.type)) {
        conversions.push(action.type);
      }
    }
    
    return conversions;
  }

  private static async saveNavigationEvent(fromRoute: string, toRoute: string, duration: number): Promise<void> {
    try {
      await supabase.from('navigation_analytics').insert({
        session_id: this.currentSession,
        from_route: fromRoute,
        to_route: toRoute,
        duration_ms: duration,
        interaction_type: 'navigation',
        device_type: this.detectDeviceType(),
        browser_info: {
          browser: this.detectBrowser(navigator.userAgent),
          os: this.detectOS(navigator.userAgent),
          screenSize: { width: screen.width, height: screen.height }
        }
      });
    } catch (error) {
      console.error('Error saving navigation event:', error);
    }
  }

  private static processRealTimeAnalytics(event: RealTimeNavigationEvent): void {
    // Real-time processing for immediate insights
    this.detectAnomalies(event);
    this.updateRealTimeMetrics(event);
    this.triggerRealTimeAlerts(event);
  }

  private static detectAnomalies(event: RealTimeNavigationEvent): void {
    // Detect unusual patterns
    if (event.duration < 1000 && !event.conversionEvents.length) {
      console.warn('Potential bounce detected:', event.route);
    }
    
    if (event.interactions.length === 0 && event.duration > 30000) {
      console.warn('User inactive on page:', event.route);
    }
  }

  private static updateRealTimeMetrics(event: RealTimeNavigationEvent): void {
    // Update real-time dashboard metrics
    const metrics = JSON.parse(sessionStorage.getItem('realtimeMetrics') || '{}');
    
    metrics[event.route] = {
      visits: (metrics[event.route]?.visits || 0) + 1,
      avgDuration: ((metrics[event.route]?.avgDuration || 0) + event.duration) / 2,
      interactions: event.interactions.length,
      lastVisit: event.timestamp
    };
    
    sessionStorage.setItem('realtimeMetrics', JSON.stringify(metrics));
  }

  private static triggerRealTimeAlerts(event: RealTimeNavigationEvent): void {
    // Trigger alerts for critical events
    if (event.conversionEvents.length > 0) {
      this.notifyConversion(event.route, event.conversionEvents);
    }
    
    if (event.duration > 300000) { // 5 minutes
      this.notifyLongSession(event.route, event.duration);
    }
  }

  private static notifyConversion(route: string, events: string[]): void {
    console.log(`Conversion detected on ${route}:`, events);
    // In real implementation, this would trigger webhooks or notifications
  }

  private static notifyLongSession(route: string, duration: number): void {
    console.log(`Long session detected on ${route}: ${duration}ms`);
    // Could trigger engagement tracking or help offers
  }

  static async analyzeUserJourney(sessionId: string): Promise<any> {
    try {
      const { data: journeyData } = await supabase
        .from('navigation_analytics')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (!journeyData || journeyData.length === 0) {
        return null;
      }

      const journey = {
        sessionId,
        totalDuration: journeyData.reduce((sum, event) => sum + (event.duration_ms || 0), 0),
        pageCount: journeyData.length,
        conversionEvents: this.extractConversions(journeyData),
        dropOffPoint: this.identifyDropOffPoint(journeyData),
        engagementScore: this.calculateEngagementScore(journeyData),
        deviceInfo: journeyData[0]?.browser_info,
        journey: journeyData.map(event => ({
          route: event.to_route,
          duration: event.duration_ms,
          timestamp: event.created_at
        }))
      };

      return journey;
    } catch (error) {
      console.error('Error analyzing user journey:', error);
      return null;
    }
  }

  private static extractConversions(journeyData: any[]): string[] {
    // Extract conversion events from journey data
    const conversions: string[] = [];
    const conversionRoutes = ['/applications', '/profile/edit', '/resume/upload'];
    
    for (const event of journeyData) {
      if (conversionRoutes.some(route => event.to_route?.includes(route))) {
        conversions.push(event.to_route);
      }
    }
    
    return conversions;
  }

  private static identifyDropOffPoint(journeyData: any[]): string | null {
    if (journeyData.length < 2) return null;
    
    const lastEvent = journeyData[journeyData.length - 1];
    const secondLastEvent = journeyData[journeyData.length - 2];
    
    // If last page had very short duration, previous page might be drop-off point
    if (lastEvent.duration_ms < 5000) {
      return secondLastEvent.to_route;
    }
    
    return null;
  }

  private static calculateEngagementScore(journeyData: any[]): number {
    let score = 0;
    
    // Points for page depth
    score += Math.min(journeyData.length * 10, 50);
    
    // Points for time spent
    const totalTime = journeyData.reduce((sum, event) => sum + (event.duration_ms || 0), 0);
    score += Math.min(totalTime / 1000 / 60 * 5, 30); // 5 points per minute, max 30
    
    // Points for interactions
    const hasInteractions = journeyData.some(event => 
      event.interaction_type && event.interaction_type !== 'navigation'
    );
    if (hasInteractions) score += 20;
    
    return Math.min(100, score);
  }

  static async getRouteOptimizationInsights(route: string): Promise<RouteOptimizationInsight> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: routeData } = await supabase
        .from('navigation_analytics')
        .select('*')
        .eq('to_route', route)
        .gte('created_at', thirtyDaysAgo);

      if (!routeData || routeData.length === 0) {
        return {
          route,
          issues: ['Insufficient data'],
          recommendations: ['Increase traffic to gather insights'],
          performanceScore: 50,
          conversionRate: 0,
          dropOffRate: 0,
          avgTimeOnPage: 0,
          bounceRate: 0
        };
      }

      const totalVisits = routeData.length;
      const avgDuration = routeData.reduce((sum, event) => sum + (event.duration_ms || 0), 0) / totalVisits;
      const shortVisits = routeData.filter(event => (event.duration_ms || 0) < 10000).length;
      const bounceRate = (shortVisits / totalVisits) * 100;
      
      // Calculate conversion rate (simplified)
      const conversions = routeData.filter(event => 
        this.extractConversions([event]).length > 0
      ).length;
      const conversionRate = (conversions / totalVisits) * 100;

      const issues: string[] = [];
      const recommendations: string[] = [];
      
      if (bounceRate > 60) {
        issues.push('High bounce rate');
        recommendations.push('Improve page loading speed and content relevance');
      }
      
      if (avgDuration < 30000) {
        issues.push('Low engagement time');
        recommendations.push('Add more engaging content and clear call-to-actions');
      }
      
      if (conversionRate < 5) {
        issues.push('Low conversion rate');
        recommendations.push('Optimize conversion funnel and reduce friction');
      }

      const performanceScore = Math.max(0, 100 - bounceRate - (avgDuration < 30000 ? 20 : 0) - (conversionRate < 5 ? 20 : 0));

      return {
        route,
        issues,
        recommendations,
        performanceScore: Math.round(performanceScore),
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropOffRate: Math.round(bounceRate * 100) / 100,
        avgTimeOnPage: Math.round(avgDuration / 1000),
        bounceRate: Math.round(bounceRate * 100) / 100
      };
    } catch (error) {
      console.error('Error getting route optimization insights:', error);
      throw error;
    }
  }

  private static flushNavigationBuffer(): void {
    // Send any buffered navigation events
    if (this.navigationBuffer.length > 0) {
      // In real implementation, this would batch send to analytics service
      console.log('Flushing navigation buffer:', this.navigationBuffer.length, 'events');
      this.navigationBuffer = [];
    }
  }
}
