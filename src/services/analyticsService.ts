import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  overview: {
    totalApplications: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    avgResponseTime: number;
    activeApplications: number;
  };
  trends: {
    applicationsOverTime: Array<{ month: string; count: number }>;
    responseRateOverTime: Array<{ month: string; rate: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
  };
  insights: {
    topPerformingSkills: string[];
    bestApplicationDays: string[];
    optimalApplicationTime: string;
  };
  recommendations: string[];
  benchmarks: {
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
  };
}

class AnalyticsService {
  async recordEvent(
    userId: string | undefined,
    event: string,
    category: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!userId) {
      console.warn('User ID is missing, cannot record event.');
      return;
    }

    try {
      const { error } = await supabase.from('user_events').insert([
        {
          user_id: userId,
          event_name: event,
          category: category,
          timestamp: new Date(),
          metadata: metadata,
        },
      ]);

      if (error) {
        console.error('Failed to record event:', error);
      }
    } catch (err) {
      console.error('Error recording event:', err);
    }
  }

  async getUserEvents(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user events:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error fetching user events:', err);
      return null;
    }
  }

  async getAggregateEvents(event: string, category: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('event_name', event)
        .eq('category', category);

      if (error) {
        console.error('Error fetching aggregate events:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error fetching aggregate events:', err);
      return null;
    }
  }

  async getTopEvents(limit: number = 10): Promise<any> {
    try {
      const { data, error } = await supabase.from('user_events')
        .select('event_name, category')
        .limit(limit);

      if (error) {
        console.error('Error fetching top events:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error fetching top events:', err);
      return null;
    }
  }

  async getEventsByCategory(category: string, limit: number = 10): Promise<any> {
    try {
      const { data, error } = await supabase.from('user_events')
        .select('event_name')
        .eq('category', category)
        .limit(limit);

      if (error) {
        console.error('Error fetching events by category:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error fetching events by category:', err);
      return null;
    }
  }

  async getEventCountsOverTime(event: string, category: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase.from('user_events')
        .select('timestamp')
        .eq('event_name', event)
        .eq('category', category)
        .gte('timestamp', startDate.toISOString());

      if (error) {
        console.error('Error fetching event counts over time:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error fetching event counts over time:', err);
      return null;
    }
  }

  async getMetadataForEvent(event: string, category: string, metadataKey: string): Promise<any> {
    try {
      const { data, error } = await supabase.from('user_events')
        .select('metadata')
        .eq('event_name', event)
        .eq('category', category)
        .not('metadata', 'is', null);

      if (error) {
        console.error('Error fetching metadata for event:', error);
        return null;
      }

      // Extract the specific metadata value from each event
      const metadataValues = data.map(item => item.metadata?.[metadataKey]).filter(value => value !== undefined);
      return metadataValues;
    } catch (err) {
      console.error('Error fetching metadata for event:', err);
      return null;
    }
  }

  async analyzeUserBehavior(userId: string): Promise<any> {
    try {
      const { data: searches, error: searchError } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_name', 'job_search')
        .order('timestamp', { ascending: false });

      if (searchError) {
        console.error('Error fetching job searches:', searchError);
        return null;
      }

      const { data: applications, error: applicationError } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_name', 'job_application')
        .order('timestamp', { ascending: false });

      if (applicationError) {
        console.error('Error fetching job applications:', applicationError);
        return null;
      }

      return {
        searches: searches,
        applications: applications
      };
    } catch (err) {
      console.error('Error analyzing user behavior:', err);
      return null;
    }
  }

  async getFunnelConversionRates(userId: string): Promise<any> {
    try {
      const { data: searches, error: searchError } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_name', 'job_search');

      if (searchError) {
        console.error('Error fetching job searches:', searchError);
        return null;
      }

      const { data: applications, error: applicationError } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_name', 'job_application');

      if (applicationError) {
        console.error('Error fetching job applications:', applicationError);
        return null;
      }

      const searchCount = searches ? searches.length : 0;
      const applicationCount = applications ? applications.length : 0;

      const searchToApplicationRate = searchCount > 0 ? (applicationCount / searchCount) * 100 : 0;

      return {
        searchToApplicationRate: searchToApplicationRate
      };
    } catch (err) {
      console.error('Error calculating funnel conversion rates:', err);
      return null;
    }
  }

  async getAverageSalaryRange(userId: string): Promise<any> {
    try {
      const { data: searches, error: searchError } = await supabase
        .from('user_events')
        .select('metadata')
        .eq('user_id', userId)
        .eq('event_name', 'job_search');

      if (searchError) {
        console.error('Error fetching job searches:', searchError);
        return null;
      }

      let totalSalary = 0;
      let salaryCount = 0;

      if (searches) {
        searches.forEach(search => {
          if (search.metadata && search.metadata.salary) {
            totalSalary += search.metadata.salary;
            salaryCount++;
          }
        });
      }

      const averageSalary = salaryCount > 0 ? totalSalary / salaryCount : 0;

      return {
        averageSalary: averageSalary
      };
    } catch (err) {
      console.error('Error calculating average salary range:', err);
      return null;
    }
  }

  async getMostCommonSkills(userId: string): Promise<any> {
    try {
      const { data: searches, error: searchError } = await supabase
        .from('user_events')
        .select('metadata')
        .eq('user_id', userId)
        .eq('event_name', 'job_search');

      if (searchError) {
        console.error('Error fetching job searches:', searchError);
        return null;
      }

      const skillCounts: { [skill: string]: number } = {};

      if (searches) {
        searches.forEach(search => {
          if (search.metadata && search.metadata.skills) {
            const skillsArray = Array.isArray(search.metadata.skills) ? search.metadata.skills : [search.metadata.skills];
            skillsArray.forEach(skill => {
              skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
          }
        });
      }

      const sortedSkills = Object.entries(skillCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([skill]) => skill);

      return sortedSkills;
    } catch (err) {
      console.error('Error calculating most common skills:', err);
      return null;
    }
  }

  async getApplicationSources(userId: string): Promise<any> {
    try {
      const { data: applications, error: applicationError } = await supabase
        .from('user_events')
        .select('metadata')
        .eq('user_id', userId)
        .eq('event_name', 'job_application');

      if (applicationError) {
        console.error('Error fetching job applications:', applicationError);
        return null;
      }

      const sourceCounts: { [source: string]: number } = {};

      if (applications) {
        applications.forEach(application => {
          const source = application.metadata?.source || 'Unknown';
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });
      }

      return sourceCounts;
    } catch (err) {
      console.error('Error calculating application sources:', err);
      return null;
    }
  }

  async getSearchToApplicationConversionRate(userId: string): Promise<any> {
    try {
      const { data: searches, error: searchError } = await supabase
        .from('user_events')
        .select('metadata')
        .eq('user_id', userId)
        .eq('event_name', 'job_search');

      if (searchError) {
        console.error('Error fetching job searches:', searchError);
        return null;
      }

      const { data: applications, error: applicationError } = await supabase
        .from('user_events')
        .select('metadata')
        .eq('user_id', userId)
        .eq('event_name', 'job_application');

      if (applicationError) {
        console.error('Error fetching job applications:', applicationError);
        return null;
      }

      const searchCount = searches ? searches.length : 0;
      const applicationCount = applications ? applications.length : 0;

      const conversionRate = searchCount > 0 ? (applicationCount / searchCount) * 100 : 0;

      return {
        conversionRate: conversionRate
      };
    } catch (err) {
      console.error('Error calculating search to application conversion rate:', err);
      return null;
    }
  }

  async generateApplicationAnalytics(): Promise<any> {
    try {
      // Mock data structure with proper types
      const mockData = {
        applications: 150,
        responses: 45,
        successes: 12
      };

      const responseRate = mockData.applications > 0 
        ? (mockData.responses / mockData.applications * 100).toFixed(1)
        : '0.0';

      const successRate = mockData.applications > 0
        ? (mockData.successes / mockData.applications * 100).toFixed(1) 
        : '0.0';

      return {
        overview: {
          totalApplications: mockData.applications,
          responseRate: parseFloat(responseRate),
          interviewRate: parseFloat(successRate),
          offerRate: parseFloat(successRate),
          avgResponseTime: 7,
          activeApplications: 23
        },
        trends: {
          applicationsOverTime: this.generateMonthlyTrend(12),
          responseRateOverTime: this.generateResponseRateTrend(12),
          statusDistribution: [
            { status: 'Applied', count: 89 },
            { status: 'Interview', count: 34 },
            { status: 'Offer', count: 12 },
            { status: 'Rejected', count: 15 }
          ]
        },
        insights: {
          topPerformingSkills: ['React', 'TypeScript', 'Node.js'],
          bestApplicationDays: ['Tuesday', 'Wednesday', 'Thursday'],
          optimalApplicationTime: '10:00 AM'
        },
        recommendations: [
          'Apply to more positions on Tuesday-Thursday',
          'Highlight React and TypeScript skills',
          'Follow up on applications after 1 week'
        ],
        benchmarks: {
          industryAverages: {
            responseRate: 15,
            interviewRate: 8,
            offerRate: 3
          },
          yourPerformanceVsIndustry: {
            responseRate: parseFloat(responseRate) > 15 ? 'above' as const : 'below' as const,
            interviewRate: parseFloat(successRate) > 8 ? 'above' as const : 'below' as const,
            offerRate: parseFloat(successRate) > 3 ? 'above' as const : 'below' as const
          }
        }
      };
    } catch (error) {
      console.error('Error generating application analytics:', error);
      throw error;
    }
  }

  private generateMonthlyTrend(months: number): Array<{ month: string; count: number }> {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      trend.push({
        month: monthNames[date.getMonth()],
        count: Math.floor(Math.random() * 20) + 5
      });
    }
    
    return trend;
  }

  private generateResponseRateTrend(months: number): Array<{ month: string; rate: number }> {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      trend.push({
        month: monthNames[date.getMonth()],
        rate: Math.floor(Math.random() * 30) + 10
      });
    }
    
    return trend;
  }

  private calculateMetrics(data: any): any {
    const mockMetrics = {
      searches: 250,
      applications: 150,
      salaryCount: 120,
      totalSalary: 12000000
    };

    const conversionRate = mockMetrics.searches > 0 
      ? (mockMetrics.applications / mockMetrics.searches * 100).toFixed(1)
      : '0.0';

    const avgSalary = mockMetrics.salaryCount > 0
      ? (mockMetrics.totalSalary / mockMetrics.salaryCount).toFixed(0)
      : '0';

    return {
      searchToApplicationRate: parseFloat(conversionRate),
      averageSalary: parseInt(avgSalary),
      totalSearches: mockMetrics.searches,
      searchToApplicationConversion: mockMetrics.searches > 0 
        ? (mockMetrics.applications / mockMetrics.searches)
        : 0
    };
  }
}

export const analyticsService = new AnalyticsService();
