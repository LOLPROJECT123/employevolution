
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
  Bookmark
} from 'lucide-react';
import { enhancedJobMatchingService, JobMatchResult } from '@/services/enhancedJobMatchingService';
import { useAuth } from '@/hooks/useAuth';

export const EnhancedJobRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<JobMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const results = await enhancedJobMatchingService.getJobRecommendations(user.id, 20);
      setRecommendations(results);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load job recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
    toast({
      title: "Recommendations Updated",
      description: "Your job recommendations have been refreshed",
    });
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Job Recommendations</h2>
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
        <h2 className="text-2xl font-bold">Job Recommendations</h2>
        <Button 
          onClick={refreshRecommendations}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
            <p className="text-muted-foreground mb-4">
              Complete your profile and add your skills to get personalized job recommendations.
            </p>
            <Button variant="outline">
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{recommendation.job.title}</h3>
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
                    <div className={`text-2xl font-bold ${getMatchColor(recommendation.matchScore)}`}>
                      {recommendation.matchScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Match</div>
                  </div>
                </div>

                <div className="mb-4">
                  <Progress value={recommendation.matchScore} className="h-2" />
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {recommendation.job.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="capitalize">{recommendation.job.job_type}</span>
                  </div>
                  {recommendation.job.remote && (
                    <Badge variant="secondary">Remote</Badge>
                  )}
                  {(recommendation.job.salary_min || recommendation.job.salary_max) && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatSalary(recommendation.job.salary_min, recommendation.job.salary_max)}</span>
                    </div>
                  )}
                </div>

                {recommendation.matchReasons.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Why this matches:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {recommendation.matchReasons.slice(0, 3).map((reason, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendation.skillMatches.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Matching Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.skillMatches.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-green-600 border-green-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {recommendation.missingSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Skills to develop:</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.missingSkills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-orange-600 border-orange-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4 mr-1" />
                      Bookmark
                    </Button>
                  </div>
                  <Button asChild>
                    <a 
                      href={recommendation.job.apply_url} 
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
        </div>
      )}
    </div>
  );
};
