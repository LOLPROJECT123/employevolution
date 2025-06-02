
import { supabase } from '@/integrations/supabase/client';

export interface UserJourney {
  session_id: string;
  user_id?: string;
  steps: NavigationStep[];
  total_duration: number;
  completion_rate: number;
  conversion_events: string[];
  drop_off_point?: string;
}

export interface NavigationStep {
  route: string;
  timestamp: string;
  duration: number;
  interaction_type: string;
  device_type: string;
}

export interface RouteOptimization {
  route: string;
  performance_score: number;
  suggested_improvements: string[];
  user_flow_patterns: FlowPattern[];
}

export interface FlowPattern {
  from_route: string;
  to_route: string;
  frequency: number;
  success_rate: number;
  average_duration: number;
}

export class EnhancedNavigationAnalyticsService {
  static async analyzeUserJourney(sessionId: string): Promise<UserJourney | null> {
    try {
      // Fetch navigation data for the session
      const { data: navigationData, error } = await supabase
        .from('navigation_analytics')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error || !navigationData || navigationData.length === 0) {
        console.error('Error fetching navigation data:', error);
        return null;
      }

      // Fetch conversion events for the session
      const { data: conversionData } = await supabase
        .from('conversion_events')
        .select('*')
        .eq('session_id', sessionId);

      const steps: NavigationStep[] = navigationData.map(item => ({
        route: item.to_route,
        timestamp: item.created_at,
        duration: item.duration_ms || 0,
        interaction_type: item.interaction_type,
        device_type: item.device_type || 'unknown'
      }));

      const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
      const completionRate = this.calculateCompletionRate(steps, conversionData || []);
      const dropOffPoint = this.identifyDropOffPoint(steps);

      return {
        session_id: sessionId,
        user_id: navigationData[0]?.user_id,
        steps,
        total_duration: totalDuration,
        completion_rate: completionRate,
        conversion_events: (conversionData || []).map(event => event.event_name),
        drop_off_point: dropOffPoint
      };
    } catch (error) {
      console.error('Error analyzing user journey:', error);
      return null;
    }
  }

  static async optimizeRouteFlow(route: string): Promise<RouteOptimization> {
    try {
      // Analyze navigation patterns for this route
      const { data: routeData, error } = await supabase
        .from('navigation_analytics')
        .select('*')
        .or(`from_route.eq.${route},to_route.eq.${route}`)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching route data:', error);
        throw error;
      }

      const flowPatterns = this.analyzeFlowPatterns(routeData || []);
      const performanceScore = this.calculateRoutePerformanceScore(routeData || [], flowPatterns);
      const improvements = this.generateImprovementSuggestions(route, flowPatterns, performanceScore);

      return {
        route,
        performance_score: performanceScore,
        suggested_improvements: improvements,
        user_flow_patterns: flowPatterns
      };
    } catch (error) {
      console.error('Error optimizing route flow:', error);
      throw error;
    }
  }

  private static calculateCompletionRate(steps: NavigationStep[], conversions: any[]): number {
    if (steps.length === 0) return 0;

    // Define completion criteria (reaching certain pages or performing actions)
    const completionRoutes = ['/applications', '/profile', '/jobs'];
    const hasCompletionAction = steps.some(step => 
      completionRoutes.some(route => step.route.includes(route))
    );

    const hasConversion = conversions.length > 0;
    
    if (hasConversion) return 100;
    if (hasCompletionAction) return 75;
    if (steps.length >= 3) return 50;
    return 25;
  }

  private static identifyDropOffPoint(steps: NavigationStep[]): string | undefined {
    if (steps.length < 2) return undefined;

    // Find the last meaningful interaction
    const lastStep = steps[steps.length - 1];
    const secondLastStep = steps[steps.length - 2];

    // If user spent very little time on the last page, previous page is drop-off point
    if (lastStep.duration < 5000) { // Less than 5 seconds
      return secondLastStep.route;
    }

    return undefined;
  }

  private static analyzeFlowPatterns(navigationData: any[]): FlowPattern[] {
    const patterns = new Map<string, FlowPattern>();

    navigationData.forEach(item => {
      if (!item.from_route || !item.to_route) return;

      const key = `${item.from_route}->${item.to_route}`;
      const existing = patterns.get(key);

      if (existing) {
        existing.frequency += 1;
        existing.average_duration = (existing.average_duration + (item.duration_ms || 0)) / 2;
      } else {
        patterns.set(key, {
          from_route: item.from_route,
          to_route: item.to_route,
          frequency: 1,
          success_rate: 0.8, // Default success rate, could be calculated from conversions
          average_duration: item.duration_ms || 0
        });
      }
    });

    return Array.from(patterns.values()).sort((a, b) => b.frequency - a.frequency);
  }

  private static calculateRoutePerformanceScore(routeData: any[], patterns: FlowPattern[]): number {
    if (routeData.length === 0) return 50;

    let score = 0;

    // Factor 1: Average time spent on route (optimal range: 30s - 2min)
    const avgDuration = routeData.reduce((sum, item) => sum + (item.duration_ms || 0), 0) / routeData.length;
    if (avgDuration >= 30000 && avgDuration <= 120000) {
      score += 30;
    } else if (avgDuration > 0) {
      score += 15;
    }

    // Factor 2: Flow pattern diversity (more exit routes = better)
    const uniqueExitRoutes = new Set(patterns.map(p => p.to_route)).size;
    score += Math.min(25, uniqueExitRoutes * 5);

    // Factor 3: User engagement (return visits)
    const uniqueSessions = new Set(routeData.map(item => item.session_id)).size;
    const totalVisits = routeData.length;
    const returnRate = uniqueSessions > 0 ? (totalVisits - uniqueSessions) / uniqueSessions : 0;
    score += Math.min(25, returnRate * 50);

    // Factor 4: Device compatibility
    const deviceTypes = new Set(routeData.map(item => item.device_type || 'unknown')).size;
    score += Math.min(20, deviceTypes * 7);

    return Math.round(Math.min(100, score));
  }

  private static generateImprovementSuggestions(
    route: string, 
    patterns: FlowPattern[], 
    performanceScore: number
  ): string[] {
    const suggestions: string[] = [];

    if (performanceScore < 70) {
      suggestions.push('Consider improving page load speed and user engagement');
    }

    // Analyze flow patterns for suggestions
    const topExitRoutes = patterns.slice(0, 3);
    if (topExitRoutes.length > 0) {
      suggestions.push(`Most users navigate to: ${topExitRoutes.map(p => p.to_route).join(', ')}`);
    }

    // Check for high bounce routes
    const shortDurationPatterns = patterns.filter(p => p.average_duration < 10000);
    if (shortDurationPatterns.length > 0) {
      suggestions.push('Some users are leaving quickly - consider improving content relevance');
    }

    // Route-specific suggestions
    if (route.includes('/jobs')) {
      suggestions.push('Add job filtering options to improve user experience');
      suggestions.push('Consider implementing saved search functionality');
    } else if (route.includes('/profile')) {
      suggestions.push('Add progress indicators for profile completion');
      suggestions.push('Implement auto-save to prevent data loss');
    } else if (route.includes('/applications')) {
      suggestions.push('Add application status tracking');
      suggestions.push('Implement bulk actions for better efficiency');
    }

    return suggestions.slice(0, 5);
  }

  static async getRouteAnalytics(route: string, timeRange: number = 30): Promise<any> {
    const startDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('navigation_analytics')
      .select('*')
      .eq('to_route', route)
      .gte('created_at', startDate);

    if (error) {
      console.error('Error fetching route analytics:', error);
      return null;
    }

    return {
      total_visits: data?.length || 0,
      unique_sessions: new Set(data?.map(item => item.session_id) || []).size,
      average_duration: data?.reduce((sum, item) => sum + (item.duration_ms || 0), 0) / (data?.length || 1),
      device_breakdown: this.getDeviceBreakdown(data || []),
      hourly_distribution: this.getHourlyDistribution(data || [])
    };
  }

  private static getDeviceBreakdown(data: any[]) {
    const breakdown: Record<string, number> = {};
    data.forEach(item => {
      const device = item.device_type || 'unknown';
      breakdown[device] = (breakdown[device] || 0) + 1;
    });
    return breakdown;
  }

  private static getHourlyDistribution(data: any[]) {
    const distribution: Record<number, number> = {};
    data.forEach(item => {
      const hour = new Date(item.created_at).getHours();
      distribution[hour] = (distribution[hour] || 0) + 1;
    });
    return distribution;
  }
}
