
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { EnhancedProfileService } from '@/services/enhancedProfileService';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EnhancedErrorDisplay } from '@/components/ui/enhanced-error-display';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

const EnhancedProfileCompletionWidget: React.FC = () => {
  const { user } = useAuth();
  const { checkRateLimit } = useSecurityMonitoring();
  const [completionData, setCompletionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadProfileCompletion();
    }
  }, [user, retryCount]);

  const loadProfileCompletion = async () => {
    if (!user) return;
    
    const rateLimitOk = await checkRateLimit('profile_completion', 20);
    if (!rateLimitOk) {
      setError('Too many requests. Please wait a moment.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get user profile data first
      const profileData = await EnhancedProfileService.loadProfileForUI(user.id);
      
      if (profileData) {
        const validation = await EnhancedProfileService.validateProfileCompletionDetailed(
          user.id, 
          profileData
        );
        setCompletionData(validation);
      } else {
        setCompletionData({
          progress: { currentStep: 0, totalSteps: 6, completedSteps: [], percentComplete: 0, canProceed: false },
          completionItems: [],
          qualityMetrics: { completionScore: 0, qualityScore: 0, strengthAreas: [], improvementAreas: [], recommendations: [] },
          nextMilestone: null,
          isReadyForCompletion: false
        });
      }
    } catch (error) {
      console.error('Error loading profile completion:', error);
      setError(error instanceof Error ? error.message : 'Failed to load profile completion');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="hover-scale">
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton lines={4} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="hover-scale">
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedErrorDisplay
            error={error}
            suggestions={[
              'Check your internet connection',
              'Try refreshing the page',
              'Contact support if the problem persists'
            ]}
            onRetry={handleRetry}
            contextHelp="This widget shows your profile completion progress and suggests improvements."
          />
        </CardContent>
      </Card>
    );
  }

  if (!completionData) return null;

  const { qualityMetrics, completionItems, progress } = completionData;
  const incompleteItems = completionItems.filter((item: any) => !item.completed);
  const highPriorityIncomplete = incompleteItems.filter((item: any) => item.priority === 'high');

  return (
    <Card className="hover-scale animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Profile Strength
          {qualityMetrics.completionScore === 100 ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-orange-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Completion Score</span>
            <span className="font-semibold">{qualityMetrics.completionScore}%</span>
          </div>
          <Progress value={qualityMetrics.completionScore} className="h-3" />
          
          <div className="flex justify-between text-sm mt-2 mb-1">
            <span>Quality Score</span>
            <span className="font-semibold">{qualityMetrics.qualityScore}%</span>
          </div>
          <Progress value={qualityMetrics.qualityScore} className="h-2" />
        </div>

        {qualityMetrics.strengthAreas.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-green-600 font-medium">✨ Strengths:</p>
            <div className="flex flex-wrap gap-1">
              {qualityMetrics.strengthAreas.slice(0, 3).map((strength, index) => (
                <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {qualityMetrics.completionScore < 100 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">🚀 Boost Your Profile</h4>
            
            {highPriorityIncomplete.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-red-600 font-medium">🔥 High Impact:</p>
                {highPriorityIncomplete.slice(0, 2).map((item: any) => (
                  <div key={item.field} className={`p-3 rounded-lg border animate-scale-in ${getPriorityColor(item.priority)}`}>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs opacity-75">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {qualityMetrics.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-blue-600 font-medium">💡 Quick Wins:</p>
                {qualityMetrics.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">{rec}</p>
                  </div>
                ))}
              </div>
            )}

            <Button 
              onClick={() => window.location.href = '/profile'} 
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Power Up Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {qualityMetrics.completionScore === 100 && (
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 animate-scale-in">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">🎉 Profile Perfected!</p>
            <p className="text-xs text-green-600">You're ready to attract amazing opportunities</p>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress: {progress.completedSteps.length}/{progress.totalSteps} steps</span>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProfileCompletionWidget;
