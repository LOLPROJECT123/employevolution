import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyticsService } from "@/services/analyticsService";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    applicationsOverTime: Array<{ month: string; count: number }>;
    responseRateOverTime: Array<{ month: string; count: number }>;
    statusDistribution: Array<{ status: string; count: number }>;
  };
  insights: {
    topPerformingSkills: string[];
    industryComparison: {
      responseRate: 'above' | 'below' | 'average';
      timeToInterview: 'faster' | 'slower' | 'average';
    };
    recommendations: string[];
  };
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
  recommendations: string[];
}

export const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.generateApplicationAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="p-6">Loading analytics data...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!analyticsData) {
    return <div className="p-6">No analytics data available.</div>;
  }

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Applications</div>
              <div className="text-2xl font-bold">{analyticsData.overview.totalApplications}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Response Rate</div>
              <div className="text-2xl font-bold">{analyticsData.overview.responseRate.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Interview Rate</div>
              <div className="text-2xl font-bold">{analyticsData.overview.interviewRate.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Offer Rate</div>
              <div className="text-2xl font-bold">{analyticsData.overview.offerRate.toFixed(1)}%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Applications Over Time</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analyticsData.trends.applicationsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Response Rate Over Time</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analyticsData.trends.responseRateOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.trends.statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#a855f7" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Top Performing Skills</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {analyticsData.insights.topPerformingSkills.map((skill, index) => (
                  <Badge key={index}>{skill}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">Industry Comparison</div>
              <div className="mt-2 space-y-2">
                <div>
                  Response Rate:
                  <Badge className={analyticsData.insights.industryComparison.responseRate === 'above' ? 'bg-green-100 text-green-800' : analyticsData.insights.industryComparison.responseRate === 'below' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                    {analyticsData.insights.industryComparison.responseRate}
                  </Badge>
                </div>
                <div>
                  Time to Interview:
                  <Badge className={analyticsData.insights.industryComparison.timeToInterview === 'faster' ? 'bg-green-100 text-green-800' : analyticsData.insights.industryComparison.timeToInterview === 'slower' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                    {analyticsData.insights.industryComparison.timeToInterview}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">Recommendations</div>
              <ul className="list-disc pl-5 mt-2">
                {analyticsData.insights.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benchmarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Industry Averages</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                  <div className="text-sm font-medium">Response Rate</div>
                  <div className="text-xl font-bold">{analyticsData.benchmarks.industryAverages.responseRate}%</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Interview Rate</div>
                  <div className="text-xl font-bold">{analyticsData.benchmarks.industryAverages.interviewRate}%</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Offer Rate</div>
                  <div className="text-xl font-bold">{analyticsData.benchmarks.industryAverages.offerRate}%</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground">Your Performance vs Industry</div>
              <div className="mt-2 space-y-2">
                <div>
                  Response Rate:
                  <Badge className={analyticsData.benchmarks.yourPerformanceVsIndustry.responseRate === 'above' ? 'bg-green-100 text-green-800' : analyticsData.benchmarks.yourPerformanceVsIndustry.responseRate === 'below' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                    {analyticsData.benchmarks.yourPerformanceVsIndustry.responseRate}
                  </Badge>
                </div>
                <div>
                  Interview Rate:
                  <Badge className={analyticsData.benchmarks.yourPerformanceVsIndustry.interviewRate === 'above' ? 'bg-green-100 text-green-800' : analyticsData.benchmarks.yourPerformanceVsIndustry.interviewRate === 'below' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                    {analyticsData.benchmarks.yourPerformanceVsIndustry.interviewRate}
                  </Badge>
                </div>
                <div>
                  Offer Rate:
                  <Badge className={analyticsData.benchmarks.yourPerformanceVsIndustry.offerRate === 'above' ? 'bg-green-100 text-green-800' : analyticsData.benchmarks.yourPerformanceVsIndustry.offerRate === 'below' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                    {analyticsData.benchmarks.yourPerformanceVsIndustry.offerRate}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {analyticsData.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
