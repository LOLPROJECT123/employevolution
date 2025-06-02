
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface JobMatchDetailsProps {
  job: any;
  matchDetails: {
    matchScore: number;
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    culturalFit: number;
    salaryMatch: number;
    reasoning: string[];
    recommendations: string[];
  };
}

export const JobMatchDetails: React.FC<JobMatchDetailsProps> = ({ job, matchDetails }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Job Match Analysis</span>
          </div>
          <Badge 
            variant={matchDetails.matchScore >= 80 ? "default" : matchDetails.matchScore >= 60 ? "secondary" : "destructive"}
            className="text-lg px-3 py-1"
          >
            {matchDetails.matchScore}% Match
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Match Score */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Overall Match</span>
            <span className={`font-bold ${getScoreColor(matchDetails.matchScore)}`}>
              {matchDetails.matchScore}%
            </span>
          </div>
          <Progress value={matchDetails.matchScore} className="h-3" />
        </div>

        {/* Detailed Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Skills Match</span>
              </div>
              <div className="flex items-center space-x-2">
                {getScoreIcon(matchDetails.skillsMatch)}
                <span className={`font-medium ${getScoreColor(matchDetails.skillsMatch)}`}>
                  {matchDetails.skillsMatch}%
                </span>
              </div>
            </div>
            <Progress value={matchDetails.skillsMatch} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                {getScoreIcon(matchDetails.experienceMatch)}
                <span className={`font-medium ${getScoreColor(matchDetails.experienceMatch)}`}>
                  {matchDetails.experienceMatch}%
                </span>
              </div>
            </div>
            <Progress value={matchDetails.experienceMatch} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Location</span>
              </div>
              <div className="flex items-center space-x-2">
                {getScoreIcon(matchDetails.locationMatch)}
                <span className={`font-medium ${getScoreColor(matchDetails.locationMatch)}`}>
                  {matchDetails.locationMatch}%
                </span>
              </div>
            </div>
            <Progress value={matchDetails.locationMatch} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Salary</span>
              </div>
              <div className="flex items-center space-x-2">
                {getScoreIcon(matchDetails.salaryMatch)}
                <span className={`font-medium ${getScoreColor(matchDetails.salaryMatch)}`}>
                  {matchDetails.salaryMatch}%
                </span>
              </div>
            </div>
            <Progress value={matchDetails.salaryMatch} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Cultural Fit</span>
              </div>
              <div className="flex items-center space-x-2">
                {getScoreIcon(matchDetails.culturalFit)}
                <span className={`font-medium ${getScoreColor(matchDetails.culturalFit)}`}>
                  {matchDetails.culturalFit}%
                </span>
              </div>
            </div>
            <Progress value={matchDetails.culturalFit} className="h-2" />
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <h4 className="font-medium mb-3">AI Insights</h4>
          <div className="space-y-2">
            {matchDetails.reasoning.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-medium mb-3">Recommendations</h4>
          <div className="space-y-2">
            {matchDetails.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t">
          <Button className="flex-1">
            Apply Now
          </Button>
          <Button variant="outline" className="flex-1">
            Save Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobMatchDetails;
