
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, FileText, Target, BarChart3, Brain } from 'lucide-react';
import WebcamInterview from './WebcamInterview';

const InterviewSection = () => {
  const [activeTab, setActiveTab] = useState('practice');

  const interviewStats = {
    totalSessions: 15,
    averageScore: 78,
    improvementRate: 12,
    completedQuestions: 45
  };

  const skillAreas = [
    { name: 'Communication', score: 85, trend: 'up' },
    { name: 'Technical Knowledge', score: 72, trend: 'up' },
    { name: 'Problem Solving', score: 80, trend: 'stable' },
    { name: 'Behavioral Responses', score: 75, trend: 'up' },
    { name: 'Confidence', score: 68, trend: 'up' }
  ];

  const recentSessions = [
    { date: '2024-01-15', type: 'Behavioral', score: 82, duration: '25 min' },
    { date: '2024-01-12', type: 'Technical', score: 75, duration: '35 min' },
    { date: '2024-01-10', type: 'Mixed', score: 78, duration: '40 min' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Interview Practice</h1>
        <p className="text-muted-foreground">
          Practice your interview skills with AI-powered feedback and analysis
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="space-y-6">
          <WebcamInterview />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                    <p className="text-2xl font-bold">{interviewStats.totalSessions}</p>
                  </div>
                  <Video className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">{interviewStats.averageScore}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Improvement</p>
                    <p className="text-2xl font-bold">+{interviewStats.improvementRate}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Questions Completed</p>
                    <p className="text-2xl font-bold">{interviewStats.completedQuestions}</p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skill Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Area Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillAreas.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{skill.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                    <Badge
                      variant={skill.trend === 'up' ? 'default' : 'secondary'}
                      className="ml-4"
                    >
                      {skill.trend === 'up' ? '↗' : '→'} {skill.trend}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Practice Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{session.type}</Badge>
                      <span className="text-sm font-medium">{session.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{session.duration}</span>
                      <Badge
                        className={session.score >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {session.score}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-700">Strengths</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Clear and confident communication style</li>
                    <li>• Good use of specific examples from experience</li>
                    <li>• Maintains appropriate eye contact</li>
                    <li>• Well-structured responses using STAR method</li>
                  </ul>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-700">Areas for Improvement</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Reduce use of filler words (um, uh)</li>
                    <li>• Practice speaking more slowly for better clarity</li>
                    <li>• Work on concise answers within time limits</li>
                    <li>• Improve posture and body language</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-700">Recommendations</h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Practice behavioral questions with more diverse examples</li>
                    <li>• Record yourself speaking to identify speech patterns</li>
                    <li>• Research common technical questions for your field</li>
                    <li>• Practice with mock interviews in different scenarios</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Question Banks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Behavioral Questions (50+)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Technical Questions (100+)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Situational Questions (30+)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Industry-Specific Questions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800">Before the Interview</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Research the company, review your resume, and prepare questions
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800">During the Interview</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Listen carefully, give specific examples, and ask thoughtful questions
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800">After the Interview</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Send a thank you note and follow up appropriately
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewSection;
