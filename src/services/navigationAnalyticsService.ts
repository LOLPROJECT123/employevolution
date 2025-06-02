
import { supabase } from '@/integrations/supabase/client';

export interface NavigationPattern {
  route: string;
  frequency: number;
  avgDuration: number;
  bounceRate: number;
  conversionRate: number;
}

export interface UserJourney {
  sessionId: string;
  routes: string[];
  totalDuration: number;
  completedGoal: boolean;
  dropoffPoint?: string;
}

export class NavigationAnalyticsService {
  private static sessionId = this.generateSessionId();

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async trackNavigationPatterns(fromRoute: string, toRoute: string, interactionType: 'click' | 'voice' | 'gesture' | 'direct' = 'click'): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('navigation_analytics').insert({
        user_id: user?.id || null,
        session_id: this.sessionId,
        from_route: fromRoute,
        to_route: toRoute,
        interaction_type: interactionType,
        device_type: this.getDeviceType(),
        browser_info: this.getBrowserInfo()
      });
    } catch (error) {
      console.error('Navigation tracking error:', error);
    }
  }

  static async analyzeUserJourney(sessionId?: string): Promise<UserJourney[]> {
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

      // Group by session
      const sessionGroups = analytics.reduce((acc, item) => {
        if (!acc[item.session_id]) {
          acc[item.session_id] = [];
        }
        acc[item.session_id].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      return Object.entries(sessionGroups).map(([sessionId, routes]) => ({
        sessionId,
        routes: routes.map(r => r.to_route),
        totalDuration: routes.reduce((sum, r) => sum + (r.duration_ms || 0), 0),
        completedGoal: this.hasCompletedGoal(routes.map(r => r.to_route)),
        dropoffPoint: this.findDropoffPoint(routes)
      }));
    } catch (error) {
      console.error('User journey analysis error:', error);
      return [];
    }
  }

  static async optimizeRouteFlow(): Promise<{ recommendations: string[]; patterns: NavigationPattern[] }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { recommendations: [], patterns: [] };

      const { data: analytics } = await supabase
        .from('navigation_analytics')
        .select('*')
        .eq('user_id', user.id);

      if (!analytics) return { recommendations: [], patterns: [] };

      // Analyze patterns
      const routeStats = analytics.reduce((acc, item) => {
        const route = item.to_route;
        if (!acc[route]) {
          acc[route] = {
            frequency: 0,
            totalDuration: 0,
            bounces: 0,
            conversions: 0
          };
        }
        acc[route].frequency++;
        acc[route].totalDuration += item.duration_ms || 0;
        return acc;
      }, {} as Record<string, any>);

      const patterns: NavigationPattern[] = Object.entries(routeStats).map(([route, stats]) => ({
        route,
        frequency: stats.frequency,
        avgDuration: stats.totalDuration / stats.frequency,
        bounceRate: (stats.bounces / stats.frequency) * 100,
        conversionRate: (stats.conversions / stats.frequency) * 100
      }));

      const recommendations = this.generateRouteRecommendations(patterns);

      return { recommendations, patterns };
    } catch (error) {
      console.error('Route optimization error:', error);
      return { recommendations: [], patterns: [] };
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
      onLine: navigator.onLine
    };
  }

  private static hasCompletedGoal(routes: string[]): boolean {
    const goalRoutes = ['/applications', '/profile', '/jobs'];
    return goalRoutes.some(goal => routes.includes(goal));
  }

  private static findDropoffPoint(routes: any[]): string | undefined {
    // Find the most common exit point
    const lastRoutes = routes.map(r => r.to_route);
    return lastRoutes[lastRoutes.length - 1];
  }

  private static generateRouteRecommendations(patterns: NavigationPattern[]): string[] {
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
    });

    return recommendations;
  }
}
