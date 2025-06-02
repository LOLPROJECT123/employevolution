
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AnalyticsService, UserJourney, ConversionFunnel } from '@/services/analyticsService';
import { ABTestingService, ABTestResult } from '@/services/abTestingService';
import { SecurityEnhancementService, ComplianceReport } from '@/services/securityEnhancementService';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Target, Shield, FileText, Activity } from 'lucide-react';

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [userJourneys, setUserJourneys] = useState<UserJourney[]>([]);
  const [conversionFunnels, setConversionFunnels] = useState<ConversionFunnel[]>([]);
  const [abTestResults, setAbTestResults] = useState<ABTestResult[]>([]);
  const [topEvents, setTopEvents] = useState<Array<{ eventType: string; count: number }>>([]);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user]);

  const loadAnalyticsData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const timeRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
      };

      // Load user journey data
      const journeys = await AnalyticsService.getUserJourney(user.id);
      setUserJourneys(journeys);

      // Load conversion funnel data
      const jobApplicationFunnel = await AnalyticsService.getConversionFunnel('job_application', timeRange);
      const onboardingFunnel = await AnalyticsService.getConversionFunnel('user_onboarding', timeRange);
      setConversionFunnels([jobApplicationFunnel, onboardingFunnel]);

      // Load top events
      const events = await AnalyticsService.getTopEvents(timeRange);
      setTopEvents(events);

      // Load A/B test results
      const activeTests = await ABTestingService.getActiveTests();
      const testResults = await Promise.all(
        activeTests.map(test => ABTestingService.getTestResults(test.id))
      );
      setAbTestResults(testResults.filter(Boolean) as ABTestResult[]);

    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateComplianceReport = async (reportType: 'gdpr' | 'ccpa' | 'security_audit') => {
    setLoading(true);
    try {
      const report = await SecurityEnhancementService.generateComplianceReport(reportType, user?.id);
      setComplianceReport(report);
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Advanced Analytics</h1>
        <Button onClick={loadAnalyticsData} disabled={loading}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="user-journey">User Journey</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userJourneys.length}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(userJourneys.reduce((acc, j) => acc + (j.totalDuration || 0), 0) / userJourneys.length / 1000 / 60)}m
                </div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {conversionFunnels[0]?.steps[conversionFunnels[0].steps.length - 1]?.conversionRate.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">+3.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active A/B Tests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{abTestResults.length}</div>
                <p className="text-xs text-muted-foreground">3 with significant results</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Events (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topEvents}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="eventType" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-journey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userJourneys.slice(0, 5).map((journey, index) => (
                  <div key={journey.sessionId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Session {index + 1}</h4>
                      <Badge variant="outline">
                        {Math.round((journey.totalDuration || 0) / 1000 / 60)}m duration
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {journey.events.slice(0, 10).map((event, eventIndex) => (
                        <Badge key={eventIndex} variant="secondary" className="text-xs">
                          {event.eventType}
                        </Badge>
                      ))}
                      {journey.events.length > 10 && (
                        <Badge variant="outline" className="text-xs">
                          +{journey.events.length - 10} more
                        </Badge>
                      )}
                    </div>
                    {journey.conversionEvents.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-green-600">
                          Conversions: {journey.conversionEvents.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-6">
          {conversionFunnels.map((funnel, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{funnel.name.replace('_', ' ').toUpperCase()} Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnel.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-center space-x-4">
                      <div className="w-32 text-sm font-medium">{step.name}</div>
                      <div className="flex-1">
                        <Progress value={step.conversionRate} className="h-3" />
                      </div>
                      <div className="w-20 text-sm text-right">
                        {step.conversionRate.toFixed(1)}%
                      </div>
                      <div className="w-16 text-sm text-muted-foreground text-right">
                        {step.users} users
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-6">
          <div className="grid gap-6">
            {abTestResults.map((result) => (
              <Card key={result.testId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{result.testName}</CardTitle>
                    {result.winner && result.confidence > 80 && (
                      <Badge variant={result.winner === 'a' ? 'default' : 'secondary'}>
                        Winner: Variant {result.winner.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium">Variant A</h4>
                      <div className="text-2xl font-bold">
                        {result.variantA.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.variantA.conversions}/{result.variantA.users} conversions
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Variant B</h4>
                      <div className="text-2xl font-bold">
                        {result.variantB.conversionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.variantB.conversions}/{result.variantB.users} conversions
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confidence</span>
                      <span className="text-sm">{result.confidence.toFixed(1)}%</span>
                    </div>
                    <Progress value={result.confidence} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="flex space-x-4">
            <Button onClick={() => generateComplianceReport('gdpr')} disabled={loading}>
              <Shield className="h-4 w-4 mr-2" />
              Generate GDPR Report
            </Button>
            <Button onClick={() => generateComplianceReport('ccpa')} disabled={loading}>
              <FileText className="h-4 w-4 mr-2" />
              Generate CCPA Report
            </Button>
            <Button onClick={() => generateComplianceReport('security_audit')} disabled={loading}>
              <Shield className="h-4 w-4 mr-2" />
              Security Audit
            </Button>
          </div>

          {complianceReport && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {complianceReport.reportType.toUpperCase()} Compliance Report
                </CardTitle>
                <Badge variant={complianceReport.status === 'completed' ? 'default' : 'destructive'}>
                  {complianceReport.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(complianceReport.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
