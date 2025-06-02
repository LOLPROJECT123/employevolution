
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { MLJobMatchingService, PredictiveAnalytics as PredictiveAnalyticsType } from '@/services/mlJobMatchingService';
import { TrendingUp, Target, Clock, DollarSign, Users, AlertCircle } from 'lucide-react';

export const PredictiveAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PredictiveAnalyticsType | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedJobId) {
      loadPredictiveAnalytics();
    }
  }, [selectedJobId]);

  const loadPredictiveAnalytics = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await MLJobMatchingService.getPredictiveAnalytics(user.id, selectedJobId);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load predictive analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
          <p className="text-muted-foreground">AI-powered insights for your job search success</p>
        </div>
        
        <Button onClick={() => setSelectedJobId('demo-job-id')}>
          Generate Sample Analysis
        </Button>
      </div>

      {analytics && (
        <>
          {/* Success Probability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Application Success Probability</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {Math.round(analytics.successProbability * 100)}%
                  </span>
                  <Badge variant={analytics.successProbability > 0.7 ? "default" : analytics.successProbability > 0.4 ? "secondary" : "destructive"}>
                    {analytics.successProbability > 0.7 ? 'High' : analytics.successProbability > 0.4 ? 'Medium' : 'Low'} Confidence
                  </Badge>
                </div>
                <Progress value={analytics.successProbability * 100} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Based on your profile, similar roles, and market conditions
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Time and Salary Predictions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Estimated Time to Hire</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold">{analytics.timeToHire}</div>
                  <div className="text-muted-foreground">days</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Average for similar positions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Salary Prediction</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    ${analytics.salaryPrediction.min.toLocaleString()} - ${analytics.salaryPrediction.max.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(analytics.salaryPrediction.confidence * 100)}% confidence
                  </div>
                  <Progress value={analytics.salaryPrediction.confidence * 100} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Competition Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Competition Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span>Competition Level:</span>
                <Badge variant={analytics.competitionLevel === 'low' ? "default" : analytics.competitionLevel === 'medium' ? "secondary" : "destructive"}>
                  {analytics.competitionLevel.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {analytics.competitionLevel === 'low' && 'Fewer qualified candidates apply for similar roles'}
                {analytics.competitionLevel === 'medium' && 'Moderate competition from qualified candidates'}
                {analytics.competitionLevel === 'high' && 'High competition - consider strengthening your profile'}
              </p>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>AI Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!analytics && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Analysis Selected</h3>
            <p className="text-muted-foreground mb-4">
              Click "Generate Sample Analysis" to see predictive insights for your job applications
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictiveAnalytics;
