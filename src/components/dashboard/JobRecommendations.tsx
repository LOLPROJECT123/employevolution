
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { MLJobMatchingService } from '@/services/mlJobMatchingService';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  MapPin, 
  Building, 
  DollarSign,
  ExternalLink,
  Bookmark
} from 'lucide-react';

const JobRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      // Get existing recommendations or generate new ones
      const { data: existingRecommendations } = await supabase
        .from('job_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (existingRecommendations && existingRecommendations.length > 0) {
        setRecommendations(existingRecommendations);
      } else {
        // Generate mock recommendations
        const mockRecommendations = await generateMockRecommendations();
        setRecommendations(mockRecommendations);
      }
    } catch (error) {
      console.error('Failed to load job recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecommendations = async () => {
    const mockJobs = [
      {
        id: "rec_1",
        title: "Senior React Developer",
        company: "TechFlow Inc.",
        location: "San Francisco, CA",
        salary: "$130,000 - $160,000",
        remote: true,
        match_percentage: 92,
        reason: "Perfect skills match with React and TypeScript"
      },
      {
        id: "rec_2", 
        title: "Full Stack Engineer",
        company: "InnovateLab",
        location: "Austin, TX",
        salary: "$110,000 - $140,000",
        remote: false,
        match_percentage: 87,
        reason: "Great fit for your full-stack experience"
      },
      {
        id: "rec_3",
        title: "Frontend Developer",
        company: "DesignStudio",
        location: "Remote",
        salary: "$95,000 - $125,000",
        remote: true,
        match_percentage: 83,
        reason: "Matches your UI/UX interests"
      }
    ];

    // Calculate match details for each job
    const recommendationsWithDetails = await Promise.all(
      mockJobs.map(async (job) => {
        const matchDetails = await MLJobMatchingService.calculateJobMatchScore(user!.id, job);
        return {
          job_data: job,
          match_percentage: job.match_percentage,
          recommendation_reason: job.reason,
          matching_skills: matchDetails.reasoning,
          missing_skills: matchDetails.recommendations
        };
      })
    );

    return recommendationsWithDetails;
  };

  const handleSaveJob = async (job: any) => {
    if (!user) return;

    try {
      await supabase.from('saved_jobs').insert({
        user_id: user.id,
        job_id: job.id,
        job_data: job,
        notes: 'Saved from recommendations'
      });
      
      // Show success message
      console.log('Job saved successfully');
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5" />
          <span>AI Job Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length > 0 ? (
          recommendations.map((recommendation, index) => {
            const job = recommendation.job_data;
            return (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={recommendation.match_percentage >= 90 ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {recommendation.match_percentage}% Match
                  </Badge>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">{job.salary}</span>
                  {job.remote && (
                    <Badge variant="outline" className="text-xs">Remote</Badge>
                  )}
                </div>

                <p className="text-sm text-blue-600 mb-3">
                  💡 {recommendation.recommendation_reason}
                </p>

                {recommendation.matching_skills && recommendation.matching_skills.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Why it's a good match:</div>
                    <div className="text-xs text-muted-foreground">
                      {recommendation.matching_skills[0]}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Job
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleSaveJob(job)}
                  >
                    <Bookmark className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recommendations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete your profile and set job preferences to get personalized recommendations
            </p>
            <Button variant="outline">
              Complete Profile
            </Button>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobRecommendations;
