
import { supabase } from '@/integrations/supabase/client';

export interface ABTestConfig {
  id: string;
  name: string;
  description: string;
  variants: Array<{
    id: string;
    name: string;
    weight: number;
    config: any;
  }>;
  status: 'draft' | 'running' | 'completed';
  startDate: string;
  endDate?: string;
}

export interface PredictiveAnalyticsModel {
  id: string;
  name: string;
  type: 'job_match' | 'salary_prediction' | 'success_rate';
  accuracy: number;
  lastTrained: string;
  features: string[];
}

export class AdvancedAnalyticsService {
  static async createABTest(testConfig: Omit<ABTestConfig, 'id'>): Promise<{
    success: boolean;
    testId?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .insert(testConfig)
        .select()
        .single();

      if (error) throw error;

      return { success: true, testId: data.id };
    } catch (error) {
      console.error('A/B test creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create A/B test'
      };
    }
  }

  static async trackConversion(userId: string, event: {
    type: 'application_submitted' | 'interview_scheduled' | 'job_offer' | 'job_accepted';
    jobId?: string;
    value?: number;
    metadata?: any;
  }): Promise<void> {
    try {
      await supabase
        .from('conversion_events')
        .insert({
          userId,
          ...event,
          timestamp: new Date().toISOString()
        });

      // Update user's conversion metrics
      await this.updateUserMetrics(userId, event.type);
    } catch (error) {
      console.error('Conversion tracking failed:', error);
    }
  }

  private static async updateUserMetrics(userId: string, eventType: string): Promise<void> {
    const { data: metrics } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('userId', userId)
      .single();

    if (metrics) {
      const updates: any = { updatedAt: new Date().toISOString() };
      
      switch (eventType) {
        case 'application_submitted':
          updates.totalApplications = (metrics.totalApplications || 0) + 1;
          break;
        case 'interview_scheduled':
          updates.totalInterviews = (metrics.totalInterviews || 0) + 1;
          break;
        case 'job_offer':
          updates.totalOffers = (metrics.totalOffers || 0) + 1;
          break;
        case 'job_accepted':
          updates.totalAccepted = (metrics.totalAccepted || 0) + 1;
          break;
      }

      await supabase
        .from('user_metrics')
        .update(updates)
        .eq('userId', userId);
    }
  }

  static async getPredictiveInsights(userId: string): Promise<{
    success: boolean;
    insights?: {
      jobMatchProbability: number;
      salaryRange: { min: number; max: number };
      successFactors: string[];
      recommendations: string[];
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('predictive-analytics', {
        body: { userId }
      });

      if (error) throw error;

      return { success: true, insights: data };
    } catch (error) {
      console.error('Predictive analytics failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get insights'
      };
    }
  }

  static async generateCustomDashboard(userId: string, config: {
    widgets: Array<{
      type: 'chart' | 'metric' | 'table';
      dataSource: string;
      filters: any;
      position: { x: number; y: number; width: number; height: number };
    }>;
  }): Promise<{ success: boolean; dashboardId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('custom_dashboards')
        .insert({
          userId,
          config,
          createdAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, dashboardId: data.id };
    } catch (error) {
      console.error('Dashboard creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create dashboard'
      };
    }
  }

  static async getMarketTrends(industry: string, location?: string): Promise<{
    success: boolean;
    trends?: {
      salaryTrends: Array<{ month: string; averageSalary: number }>;
      demandTrends: Array<{ skill: string; demand: number; growth: number }>;
      competitionIndex: number;
      marketOutlook: string;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('market-analysis', {
        body: { industry, location }
      });

      if (error) throw error;

      return { success: true, trends: data };
    } catch (error) {
      console.error('Market analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get market trends'
      };
    }
  }
}
