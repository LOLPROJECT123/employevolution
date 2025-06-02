import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Award, Users, DollarSign, Clock, Lightbulb } from 'lucide-react';
import { AnalyticsService } from '@/services/analyticsService';
import ApplicationTrendsChart from './ApplicationTrendsChart';
import SuccessPatternAnalysis from './SuccessPatternAnalysis';
import SalaryBenchmarking from './SalaryBenchmarking';
import IndustryInsights from './IndustryInsights';
import RecommendationEngine from './RecommendationEngine';

interface AnalyticsData {
  overview: {
    totalApplications: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    avgResponseTime: number;
    activeApplications: number;
  };
  trends: {
    applicationsOverTime: { date: string; count: number }[];
    responseRateOverTime: { date: string; rate: number }[];
    statusDistribution: { status: string; count: number; percentage: number }[];
  };
  insights: {
    topPerformingSkills: { skill: string; responseRate: number; applications: number }[];
    bestCompanyTypes: { type: string; successRate: number; applications: number }[];
    optimalApplicationTiming: { dayOfWeek: string; successRate: number }[];
    salaryAnalysis: {
      avgOfferedSalary: number;
      salaryRangeDistribution: { range: string; count: number }[];
    };
  };
  recommendations: string[];
  benchmarks: {
    industryAvgResponseRate: number;
    industryAvgInterviewRate: number;
    industryAvgOfferRate: number;
    yourPerformanceVsIndustry: {
      responseRate: 'above' | 'below' | 'average';
      interviewRate: 'above' | 'below' | 'average';
      offerRate: 'above' | 'below' | 'average';
    };
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // Mock user ID - in real app, get from auth context
      const userId = 'mock-user-id';
      const appData = await AnalyticsService.generateApplicationAnalytics(userId);
      
      // Convert to full AnalyticsData structure with mock data
      const fullData: AnalyticsData = {
        overview: {
          totalApplications: appData.totalApplications,
          responseRate: appData.successRate,
          interviewRate: 25,
          offerRate: 10,
          avgResponseTime: appData.averageResponseTime,
          activeApplications: Math.floor(appData.totalApplications * 0.3)
        },
        trends: {
          applicationsOverTime: appData.monthlyTrend.map(item => ({
            date: item.month,
            count: item.applications
          })),
          responseRateOverTime: appData.monthlyTrend.map(item => ({
            date: item.month,
            rate: (item.responses / item.applications) * 100
          })),
          statusDistribution: [
            { status: 'Applied', count: 50, percentage: 50 },
            { status: 'Under Review', count: 30, percentage: 30 },
            { status: 'Interview', count: 15, percentage: 15 },
            { status: 'Offer', count: 5, percentage: 5 }
          ]
        },
        insights: {
          topPerformingSkills: [
            { skill: 'React', responseRate: 85, applications: 20 },
            { skill: 'TypeScript', responseRate: 75, applications: 15 },
            { skill: 'Node.js', responseRate: 70, applications: 12 }
          ],
          bestCompanyTypes: appData.topCompanies.map(company => ({
            type: company.name,
            successRate: 65,
            applications: company.applications
          })),
          optimalApplicationTiming: [
            { dayOfWeek: 'Tuesday', successRate: 75 },
            { dayOfWeek: 'Wednesday', successRate: 70 },
            { dayOfWeek: 'Thursday', successRate: 68 }
          ],
          salaryAnalysis: {
            avgOfferedSalary: 95000,
            salaryRangeDistribution: [
              { range: '$80-90k', count: 3 },
              { range: '$90-100k', count: 5 },
              { range: '$100-110k', count: 4 }
            ]
          }
        },
        recommendations: [
          'Focus on React-based positions for higher response rates',
          'Apply on Tuesdays and Wednesdays for optimal results',
          'Consider highlighting TypeScript skills in your applications'
        ],
        benchmarks: {
          industryAvgResponseRate: 30,
          industryAvgInterviewRate: 20,
          industryAvgOfferRate: 8,
          yourPerformanceVsIndustry: {
            responseRate: appData.successRate > 30 ? 'above' : 'below',
            interviewRate: 'average',
            offerRate: 'above'
          }
        }
      };
      
      setAnalyticsData(fullData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const getPerformanceColor = (performance: 'above' | 'below' | 'average') => {
    switch (performance) {
      case 'above': return 'text-green-600';
      case 'below': return 'text-red-600';
      case 'average': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceIcon = (performance: 'above' | 'below' | 'average') => {
    switch (performance) {
      case 'above': return <TrendingUp className="h-4 w-4" />;
      case 'below': return <TrendingDown className="h-4 w-4" />;
      case 'average': return <Target className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics & Insights</h2>
          <p className="text-muted-foreground">
            Deep dive into your job search performance and get actionable recommendations.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalApplications}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline">{analyticsData.overview.activeApplications} active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{analyticsData.overview.responseRate.toFixed(1)}%</p>
              </div>
              <div className={`flex items-center ${getPerformanceColor(analyticsData.benchmarks.yourPerformanceVsIndustry.responseRate)}`}>
                {getPerformanceIcon(analyticsData.benchmarks.yourPerformanceVsIndustry.responseRate)}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Industry avg: {analyticsData.benchmarks.industryAvgResponseRate}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interview Rate</p>
                <p className="text-2xl font-bold">{analyticsData.overview.interviewRate.toFixed(1)}%</p>
              </div>
              <div className={`flex items-center ${getPerformanceColor(analyticsData.benchmarks.yourPerformanceVsIndustry.interviewRate)}`}>
                {getPerformanceIcon(analyticsData.benchmarks.yourPerformanceVsIndustry.interviewRate)}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Industry avg: {analyticsData.benchmarks.industryAvgInterviewRate}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Offer Rate</p>
                <p className="text-2xl font-bold">{analyticsData.overview.offerRate.toFixed(1)}%</p>
              </div>
              <div className={`flex items-center ${getPerformanceColor(analyticsData.benchmarks.yourPerformanceVsIndustry.offerRate)}`}>
                {getPerformanceIcon(analyticsData.benchmarks.yourPerformanceVsIndustry.offerRate)}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Industry avg: {analyticsData.benchmarks.industryAvgOfferRate}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="patterns">Success Patterns</TabsTrigger>
          <TabsTrigger value="salary">Salary Insights</TabsTrigger>
          <TabsTrigger value="industry">Market Data</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <ApplicationTrendsChart data={analyticsData.trends} />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <SuccessPatternAnalysis data={analyticsData.insights} />
        </TabsContent>

        <TabsContent value="salary" className="space-y-6">
          <SalaryBenchmarking data={analyticsData.insights.salaryAnalysis} />
        </TabsContent>

        <TabsContent value="industry" className="space-y-6">
          <IndustryInsights />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <RecommendationEngine 
            recommendations={analyticsData.recommendations}
            performanceData={analyticsData.benchmarks}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
