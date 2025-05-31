
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { TrendingUp, Calendar, Clock, Award } from 'lucide-react';

const InterviewAnalytics = () => {
  const skillAreas = [
    { name: 'Communication', score: 85, improvement: '+5%' },
    { name: 'Technical Knowledge', score: 78, improvement: '+12%' },
    { name: 'Problem Solving', score: 82, improvement: '+8%' },
    { name: 'Behavioral Responses', score: 75, improvement: '+15%' },
    { name: 'Confidence', score: 80, improvement: '+10%' }
  ];

  const recentSessions = [
    { date: '2024-01-15', type: 'Behavioral', duration: '45 min', score: 85, status: 'Completed' },
    { date: '2024-01-12', type: 'Coding', duration: '60 min', score: 78, status: 'Completed' },
    { date: '2024-01-10', type: 'Company-Specific', duration: '30 min', score: 82, status: 'Completed' },
    { date: '2024-01-08', type: 'Behavioral', duration: '40 min', score: 75, status: 'Completed' },
    { date: '2024-01-05', type: 'Coding', duration: '55 min', score: 80, status: 'Completed' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Skill Area Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Skill Area Analysis
          </CardTitle>
          <CardDescription>
            Track your progress across different interview skill areas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {skillAreas.map((skill) => (
            <div key={skill.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getScoreColor(skill.score)}`}>
                    {skill.score}%
                  </span>
                  <Badge variant="outline" className="text-green-600">
                    {skill.improvement}
                  </Badge>
                </div>
              </div>
              <Progress value={skill.score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Practice Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Practice Sessions
          </CardTitle>
          <CardDescription>
            Your latest interview practice activities and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSessions.map((session, index) => (
                <TableRow key={index}>
                  <TableCell>{session.date}</TableCell>
                  <TableCell>{session.type}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {session.duration}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getScoreBadgeVariant(session.score)}>
                      {session.score}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600">
                      {session.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Clear Communication</span>
              <Badge>Excellent</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Problem Analysis</span>
              <Badge>Strong</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Technical Knowledge</span>
              <Badge variant="secondary">Good</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Confidence Level</span>
              <Badge variant="outline">Focus Area</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Time Management</span>
              <Badge variant="outline">Practice More</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Behavioral Examples</span>
              <Badge variant="outline">Develop</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewAnalytics;
