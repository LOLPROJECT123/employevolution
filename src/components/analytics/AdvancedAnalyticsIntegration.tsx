
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedAnalyticsService } from '@/services/enhancedAnalyticsService';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Users, TrendingUp, Target, Activity } from 'lucide-react';

export const AdvancedAnalyticsIntegration: React.FC = () => {
  const { user } = useAuth();
  const [segments, setSegments] = useState<any[]>([]);
  const [cohortData, setCohortData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    // Initialize RUM on component mount
    EnhancedAnalyticsService.initializeRUM();
    setAnalyticsEnabled(true);
    
    // Load existing data
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const userSegments = await EnhancedAnalyticsService.generateUserSegments();
      setSegments(userSegments);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      
      const cohorts = await EnhancedAnalyticsService.calculateCohortAnalysis(startDate, endDate);
      setCohortData(cohorts);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  };

  const handleTrackConversion = async () => {
    if (!user) return;

    await EnhancedAnalyticsService.trackConversionEvent({
      event_name: 'manual_conversion_test',
      user_id: user.id,
      session_id: `session_${Date.now()}`,
      properties: {
        test_event: true,
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      },
      value: 100,
      currency: 'USD'
    });
  };

  const generateNewSegments = async () => {
    setIsGenerating(true);
    try {
      const newSegments = await EnhancedAnalyticsService.generateUserSegments();
      setSegments(newSegments);
    } catch (error) {
      console.error('Failed to generate segments:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart className="h-5 w-5" />
              <CardTitle>Advanced Analytics Dashboard</CardTitle>
            </div>
            <Badge variant={analyticsEnabled ? "default" : "destructive"}>
              {analyticsEnabled ? "Active" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Real User Monitoring</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tracking page loads, interactions, and errors
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Conversion Tracking</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Monitoring user goals and funnel performance
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">User Segmentation</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Analyzing user behavior patterns
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleTrackConversion} variant="outline">
              Test Conversion Event
            </Button>
            <Button onClick={generateNewSegments} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Refresh Segments"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Segments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((segment) => (
              <div key={segment.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{segment.name}</h4>
                  <Badge variant="secondary">{segment.user_count} users</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {segment.description}
                </p>
                <div className="text-xs space-y-1">
                  {Object.entries(segment.criteria).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cohort Analysis Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Cohort Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Retention analysis showing user behavior over time periods
            </p>
            
            {cohortData.length > 0 && (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-8 gap-2 text-xs">
                  <div className="font-medium">Cohort</div>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(period => (
                    <div key={period} className="font-medium text-center">
                      Week {period}
                    </div>
                  ))}
                  
                  {Array.from(new Set(cohortData.map(c => c.cohort_date)))
                    .slice(0, 5)
                    .map(cohortDate => (
                    <React.Fragment key={cohortDate}>
                      <div className="text-xs">{cohortDate}</div>
                      {[0, 1, 2, 3, 4, 5, 6, 7].map(period => {
                        const cohort = cohortData.find(
                          c => c.cohort_date === cohortDate && c.period === period
                        );
                        const rate = cohort ? Math.round(cohort.retention_rate * 100) : 0;
                        return (
                          <div
                            key={period}
                            className={`text-center text-xs p-1 rounded ${
                              rate > 50 ? 'bg-green-100 text-green-800' :
                              rate > 25 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {rate}%
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalyticsIntegration;
