
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  Target,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useEnhancedProfileData } from '@/hooks/useEnhancedProfileData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const EnhancedProfileCompletionWidget: React.FC = () => {
  const {
    metrics,
    validation,
    loading,
    completionPercentage,
    qualityScore,
    strengthScore,
    missingFields,
    recommendations,
    nextSteps,
    refreshData
  } = useEnhancedProfileData();

  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Profile Health Dashboard
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(completionPercentage)}`}>
              {completionPercentage}%
            </div>
            <div className="text-sm text-gray-500">Completion</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(qualityScore)}`}>
              {qualityScore}%
            </div>
            <div className="text-sm text-gray-500">Quality</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(strengthScore)}`}>
              {strengthScore}%
            </div>
            <div className="text-sm text-gray-500">Strength</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Profile Completion</span>
              <Badge variant={getScoreBadgeVariant(completionPercentage)}>
                {completionPercentage}%
              </Badge>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Data Quality</span>
              <Badge variant={getScoreBadgeVariant(qualityScore)}>
                {qualityScore}%
              </Badge>
            </div>
            <Progress value={qualityScore} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Profile Strength</span>
              <Badge variant={getScoreBadgeVariant(strengthScore)}>
                {strengthScore}%
              </Badge>
            </div>
            <Progress value={strengthScore} className="h-2" />
          </div>
        </div>

        {/* Critical Issues */}
        {validation && validation.errors && validation.errors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="font-medium text-red-800 mb-1">Critical Issues Found</div>
              <ul className="text-sm text-red-700 space-y-1">
                {validation.errors.slice(0, 3).map((error, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="font-medium">•</span>
                    {error.message}
                  </li>
                ))}
              </ul>
              {validation.errors.length > 3 && (
                <div className="text-xs text-red-600 mt-1">
                  +{validation.errors.length - 3} more issues
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Top Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.slice(0, 2).map((rec, index) => (
                <Alert key={index} className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    {rec}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        {nextSteps && nextSteps.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Priority Actions
            </h4>
            <div className="space-y-2">
              {nextSteps.slice(0, 3).map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Section Scores */}
        {metrics && (
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                {showDetails ? 'Hide' : 'Show'} Section Details
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(metrics.sectionScores).map(([section, score]) => (
                  <div key={section} className="flex justify-between items-center">
                    <span className="capitalize">{section.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={score} className="w-16 h-2" />
                      <span className={`font-medium ${getScoreColor(score)}`}>
                        {score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Overall Status */}
        <div className="pt-3 border-t">
          {completionPercentage >= 90 ? (
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Excellent! Your profile is highly optimized</span>
            </div>
          ) : completionPercentage >= 70 ? (
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Good progress! A few improvements will boost your profile</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Your profile needs attention to attract opportunities</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedProfileCompletionWidget;
