
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Building, Globe } from 'lucide-react';

// Mock industry data - in a real app, this would come from market research APIs
const INDUSTRY_DATA = {
  marketTrends: [
    { month: 'Jan', jobPostings: 15420, avgSalary: 92000, responseRate: 23 },
    { month: 'Feb', jobPostings: 16800, avgSalary: 94000, responseRate: 25 },
    { month: 'Mar', jobPostings: 18200, avgSalary: 95000, responseRate: 24 },
    { month: 'Apr', jobPostings: 19500, avgSalary: 96000, responseRate: 26 },
    { month: 'May', jobPostings: 20100, avgSalary: 97000, responseRate: 28 },
    { month: 'Jun', jobPostings: 18900, avgSalary: 98000, responseRate: 27 }
  ],
  topSkills: [
    { skill: 'React', demand: 95, growth: 12 },
    { skill: 'Python', demand: 88, growth: 8 },
    { skill: 'TypeScript', demand: 82, growth: 15 },
    { skill: 'AWS', demand: 79, growth: 18 },
    { skill: 'Node.js', demand: 75, growth: 6 }
  ],
  topCompanies: [
    { company: 'Meta', openings: 1250, avgSalary: 185000 },
    { company: 'Google', openings: 980, avgSalary: 175000 },
    { company: 'Amazon', openings: 1450, avgSalary: 155000 },
    { company: 'Microsoft', openings: 890, avgSalary: 165000 },
    { company: 'Apple', openings: 650, avgSalary: 170000 }
  ],
  regions: [
    { location: 'San Francisco', openings: 8500, avgSalary: 145000 },
    { location: 'Seattle', openings: 5200, avgSalary: 125000 },
    { location: 'New York', openings: 6800, avgSalary: 135000 },
    { location: 'Austin', openings: 3200, avgSalary: 110000 },
    { location: 'Remote', openings: 12500, avgSalary: 115000 }
  ]
};

const IndustryInsights: React.FC = () => {
  const chartConfig = {
    jobPostings: {
      label: "Job Postings",
      color: "#3b82f6",
    },
    avgSalary: {
      label: "Average Salary",
      color: "#10b981",
    },
    responseRate: {
      label: "Response Rate",
      color: "#f59e0b",
    },
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Job Postings</p>
                <p className="text-2xl font-bold">20.1K</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800">+6.2% vs last month</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Market Salary</p>
                <p className="text-2xl font-bold">$97K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Badge className="bg-green-100 text-green-800">+5.4% YoY</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry Response Rate</p>
                <p className="text-2xl font-bold">27%</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <Badge className="bg-blue-100 text-blue-800">Market average</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remote Opportunities</p>
                <p className="text-2xl font-bold">62%</p>
              </div>
              <Globe className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <Badge className="bg-orange-100 text-orange-800">+12% vs 2023</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Market Trends (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={INDUSTRY_DATA.marketTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => {
                    if (name === 'avgSalary') return [formatSalary(value as number), 'Average Salary'];
                    if (name === 'responseRate') return [`${value}%`, 'Response Rate'];
                    return [value, 'Job Postings'];
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="jobPostings" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="jobPostings"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="responseRate" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="responseRate"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills in Demand */}
        <Card>
          <CardHeader>
            <CardTitle>Most In-Demand Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {INDUSTRY_DATA.topSkills.map((skill, index) => (
                <div key={skill.skill} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{skill.skill}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{skill.demand}% demand</Badge>
                    <Badge className="bg-green-100 text-green-800">
                      +{skill.growth}% growth
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Regions */}
        <Card>
          <CardHeader>
            <CardTitle>Top Job Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {INDUSTRY_DATA.regions.map((region, index) => (
                <div key={region.location} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{region.location}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatSalary(region.avgSalary)}</p>
                    <p className="text-sm text-muted-foreground">{region.openings.toLocaleString()} openings</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Companies Hiring */}
      <Card>
        <CardHeader>
          <CardTitle>Companies with Most Openings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {INDUSTRY_DATA.topCompanies.map((company, index) => (
                <div key={company.company} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{company.company}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatSalary(company.avgSalary)}</p>
                    <p className="text-sm text-muted-foreground">{company.openings} openings</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-medium mb-4">Openings by Company</h4>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={INDUSTRY_DATA.topCompanies}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="company" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="openings" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Market Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">Market Opportunities</h4>
              <ul className="space-y-2 text-sm">
                <li>• TypeScript demand growing fastest (+15% YoY)</li>
                <li>• Remote positions now 62% of all openings</li>
                <li>• Cloud skills (AWS) show 18% growth</li>
                <li>• Average salaries increased 5.4% year-over-year</li>
                <li>• Response rates improving across the board</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-blue-600">Strategic Recommendations</h4>
              <ul className="space-y-2 text-sm">
                <li>• Focus on React + TypeScript combination</li>
                <li>• Consider cloud certifications (AWS/Azure)</li>
                <li>• Target companies with 500+ openings</li>
                <li>• Leverage remote work opportunities</li>
                <li>• Time applications for higher response periods</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndustryInsights;
