
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Award, Target, Calendar, Building } from 'lucide-react';

interface InsightsData {
  topPerformingSkills: { skill: string; responseRate: number; applications: number }[];
  bestCompanyTypes: { type: string; successRate: number; applications: number }[];
  optimalApplicationTiming: { dayOfWeek: string; successRate: number }[];
}

interface SuccessPatternAnalysisProps {
  data: InsightsData;
}

const SuccessPatternAnalysis: React.FC<SuccessPatternAnalysisProps> = ({ data }) => {
  const chartConfig = {
    responseRate: {
      label: "Response Rate",
      color: "#10b981",
    },
    successRate: {
      label: "Success Rate", 
      color: "#3b82f6",
    },
  };

  const getSkillColor = (responseRate: number) => {
    if (responseRate >= 40) return 'bg-green-500';
    if (responseRate >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCompanyTypeColor = (successRate: number) => {
    if (successRate >= 35) return 'bg-green-500';
    if (successRate >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Top Performing Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performing Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPerformingSkills.map((skill, index) => (
              <div key={skill.skill} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{skill.skill}</h4>
                    <p className="text-sm text-muted-foreground">
                      {skill.applications} applications
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Progress value={skill.responseRate} className="w-20" />
                    <Badge className={getSkillColor(skill.responseRate)}>
                      {skill.responseRate}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-4">Response Rate by Skill</h4>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topPerformingSkills}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="skill" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${value}%`, 'Response Rate']}
                  />
                  <Bar 
                    dataKey="responseRate" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Best Company Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Best Performing Company Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {data.bestCompanyTypes.map((company, index) => (
                <div key={company.type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{company.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {company.applications} applications
                      </p>
                    </div>
                  </div>
                  <Badge className={getCompanyTypeColor(company.successRate)}>
                    {company.successRate}%
                  </Badge>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-medium mb-4">Success Rate by Company Type</h4>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.bestCompanyTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="type" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`${value}%`, 'Success Rate']}
                    />
                    <Bar 
                      dataKey="successRate" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimal Application Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Optimal Application Timing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Best Days to Apply</h4>
              {data.optimalApplicationTiming.map((timing) => (
                <div key={timing.dayOfWeek} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{timing.dayOfWeek}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={timing.successRate} className="w-20" />
                    <span className="text-sm font-medium">{timing.successRate}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-medium mb-4">Success Rate by Day</h4>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.optimalApplicationTiming}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="dayOfWeek" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`${value}%`, 'Success Rate']}
                    />
                    <Bar 
                      dataKey="successRate" 
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Key Insights</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {data.optimalApplicationTiming[0]?.dayOfWeek} shows the highest success rate</li>
              <li>• Focus on your top-performing skills: {data.topPerformingSkills.slice(0, 2).map(s => s.skill).join(', ')}</li>
              <li>• {data.bestCompanyTypes[0]?.type} companies respond best to your profile</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessPatternAnalysis;
