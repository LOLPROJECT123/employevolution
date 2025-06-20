
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Star,
  ExternalLink,
  Heart,
  Bookmark,
  TrendingUp,
  Brain,
  Target,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { enhancedJobMatchingV2Service, EnhancedJobMatch } from '@/services/enhancedJobMatchingV2Service';
import { mlJobRecommendationService } from '@/services/mlJobRecommendationService';
import { resumeFileService } from '@/services/resumeFileService';

export const PersonalizedJobFeed: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<EnhancedJobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      loadPersonalizedRecommendations();
    }
  }, [user]);

  const loadPersonalizedRecommendations = async (pageNum: number = 1) => {
    if (!user) return;
    
    try {
      setLoading(pageNum === 1);
      
      // Get user's current resume
      const resumeFile = await resumeFileService.getCurrentResumeFile(user.id);
      
      if (!resumeFile?.parsed_data) {
        toast({
          title: "No Resume Found",
          description: "Please upload a resume to get personalized recommendations.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get base recommendations
      const baseRecommendations = await enhancedJobMatchingV2Service.getPersonalizedJobRecommendations(
        user.id,
        resumeFile.parsed_data,
        20
      );

      // Enhance with ML insights
      const mlEnhancedRecommendations = await mlJobRecommendationService.generateMLEnhancedRecommendations(
        user.id,
        baseRecommendations,
        20
      );

      if (pageNum === 1) {
        setRecommendations(mlEnhancedRecommendations);
      } else {
        setRecommendations(prev => [...prev, ...mlEnhancedRecommendations]);
      }

      setHasMore(mlEnhancedRecommendations.length === 20);
      
    } catch (error) {
      console.error('Error loading personalized recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load personalized recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadPersonalizedRecommendations(1);
    setRefreshing(false);
    toast({
      title: "Feed Refreshed",
      description: "Your personalized job feed has been updated with the latest matches",
    });
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await loadPersonalizedRecommendations(nextPage);
  };

  const handleJobInteraction = async (jobId: string, interactionType: string) => {
    if (!user) return;

    try {
      await enhancedJobMatchingV2Service.trackUserInteraction(user.id, {
        job_id: jobId,
        interaction_type: interactionType as any,
        timestamp: new Date()
      });

      // Update ML preferences based on interaction
      await mlJobRecommendationService.updateUserPreferencesFromBehavior(user.id);
      
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getMatchIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4" />;
    if (score >= 60) return <Target className="h-4 w-4" />;
    return <Brain className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Personalized Job Feed</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personalized Job Feed</h2>
          <p className="text-muted-foreground">AI-powered recommendations based on your resume and preferences</p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No personalized recommendations found</h3>
            <p className="text-muted-foreground mb-4">
              Upload a resume and complete your profile to get AI-powered job recommendations tailored just for you.
            </p>
            <Button variant="outline">
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Brain className="h-4 w-4" />
            Found {recommendations.length} personalized matches using AI analysis
          </div>
          
          {recommendations.map((recommendation) => (
            <Card key={recommendation.job.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{recommendation.job.title}</h3>
                      {(recommendation as any).mlInsights?.skillPreferenceMatch > 2 && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          <Star className="h-3 w-3 mr-1" />
                          Perfect Match
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Building className="h-4 w-4" />
                      <span>{recommendation.job.company}</span>
                      {recommendation.job.location && (
                        <>
                          <MapPin className="h-4 w-4 ml-2" />
                          <span>{recommendation.job.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-2 rounded-lg border-2 ${getMatchColor((recommendation as any).mlEnhancedScore || recommendation.overallScore)}`}>
                      <div className="flex items-center gap-1">
                        {getMatchIcon((recommendation as any).mlEnhancedScore || recommendation.overallScore)}
                        <span className="text-xl font-bold">
                          {(recommendation as any).mlEnhancedScore || recommendation.overallScore}%
                        </span>
                      </div>
                      <div className="text-xs">AI Match</div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <Progress 
                    value={(recommendation as any).mlEnhancedScore || recommendation.overallScore} 
                    className="h-2" 
                  />
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {recommendation.job.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{recommendation.skillsScore}%</div>
                    <div className="text-xs text-muted-foreground">Skills</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{recommendation.experienceScore}%</div>
                    <div className="text-xs text-muted-foreground">Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">{recommendation.locationScore}%</div>
                    <div className="text-xs text-muted-foreground">Location</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-orange-600">{recommendation.salaryScore}%</div>
                    <div className="text-xs text-muted-foreground">Salary</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="capitalize">{recommendation.job.type}</span>
                  </div>
                  {recommendation.job.remote && (
                    <Badge variant="secondary">Remote</Badge>
                  )}
                  {recommendation.job.salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatSalary(recommendation.job.salary.min, recommendation.job.salary.max)}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Why This Job is Perfect for You
                  </h4>
                  <p className="text-sm text-gray-700">{recommendation.whyRecommended}</p>
                </div>

                {recommendation.matchingSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Your Matching Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.matchingSkills.slice(0, 6).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          {skill}
                        </Badge>
                      ))}
                      {recommendation.matchingSkills.length > 6 && (
                        <Badge variant="secondary">
                          +{recommendation.matchingSkills.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {recommendation.missingSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Skills to Highlight:</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.missingSkills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {recommendation.recommendations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">AI Recommendations:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {recommendation.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ChevronRight className="h-3 w-3 mt-0.5 text-blue-500" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleJobInteraction(recommendation.job.id, 'save')}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleJobInteraction(recommendation.job.id, 'interested')}
                    >
                      <Bookmark className="h-4 w-4 mr-1" />
                      Interested
                    </Button>
                  </div>
                  <Button 
                    asChild
                    onClick={() => handleJobInteraction(recommendation.job.id, 'apply')}
                  >
                    <a 
                      href={recommendation.job.applyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Apply Now
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More Recommendations
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalizedJobFeed;
