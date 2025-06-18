
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { 
  MapPin, 
  DollarSign, 
  Building, 
  ExternalLink,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { keywordJobMatchingService, KeywordMatchResult, JobMatchFilters } from '@/services/keywordJobMatchingService';
import { resumeFileService } from '@/services/resumeFileService';

const JobRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<KeywordMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<JobMatchFilters>({
    limit: 20
  });

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user, filters]);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get user's resume data
      const resumeFile = await resumeFileService.getCurrentResumeFile(user.id);
      
      if (!resumeFile?.parsed_data) {
        toast({
          title: "No Resume Found",
          description: "Please upload a resume to get personalized job recommendations.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Find matching jobs
      const results = await keywordJobMatchingService.findMatchingJobs(
        resumeFile.parsed_data, 
        filters
      );
      
      setRecommendations(results);
      
      if (results.length === 0) {
        toast({
          title: "No Matches Found",
          description: "Try adjusting your filters or updating your resume with more skills.",
        });
      }
      
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
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
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
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setFilters(prev => ({ ...prev, remote: !prev.remote }))}
            className={filters.remote ? 'bg-blue-50 border-blue-200' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            {filters.remote ? 'Remote Only' : 'All Jobs'}
          </Button>
          <Button 
            onClick={refreshRecommendations}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
            <p className="text-muted-foreground mb-4">
              Upload a resume and add your skills to get personalized job recommendations.
            </p>
            <Button variant="outline">
              Upload Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Found {recommendations.length} job matches based on your resume
          </div>
          
          {recommendations.map((recommendation) => (
            <Card key={recommendation.jobId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{recommendation.title}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Building className="h-4 w-4" />
                      <span>{recommendation.company}</span>
                      {recommendation.location && (
                        <>
                          <MapPin className="h-4 w-4 ml-2" />
                          <span>{recommendation.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg border ${getMatchColor(recommendation.matchScore)}`}>
                    <div className="text-xl font-bold">
                      {recommendation.matchScore}%
                    </div>
                    <div className="text-xs">Match</div>
                  </div>
                </div>

                <div className="mb-4">
                  <Progress value={recommendation.matchScore} className="h-2" />
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {recommendation.description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  {recommendation.remote && (
                    <Badge variant="secondary">Remote</Badge>
                  )}
                  {(recommendation.salary_min || recommendation.salary_max) && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatSalary(recommendation.salary_min, recommendation.salary_max)}</span>
                    </div>
                  )}
                </div>

                {recommendation.matchingSkills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Matching Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.matchingSkills.slice(0, 6).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-green-600 border-green-200">
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

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    {recommendation.matchingKeywords.length} keyword matches
                  </div>
                  <Button asChild>
                    <a 
                      href={recommendation.jobUrl} 
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

export default JobRecommendations;
