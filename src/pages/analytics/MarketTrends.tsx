
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, MapPin } from 'lucide-react';

export const MarketTrends: React.FC = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMarketTrends();
  }, []);

  const loadMarketTrends = async () => {
    // Simulate API call
    setTimeout(() => {
      setMarketData(generateMockMarketData());
      setIsLoading(false);
    }, 1000);
  };

  const generateMockMarketData = () => {
    return {
      salaryTrends: [
        { month: 'Jan', avgSalary: 85000, jobCount: 1200 },
        { month: 'Feb', avgSalary: 87000, jobCount: 1350 },
        { month: 'Mar', avgSalary: 89000, jobCount: 1400 },
        { month: 'Apr', avgSalary: 91000, jobCount: 1600 },
        { month: 'May', avgSalary: 93000, jobCount: 1750 },
        { month: 'Jun', avgSalary: 95000, jobCount: 1800 }
      ],
      topSkills: [
        { skill: 'React', demand: 95, growth: 15 },
        { skill: 'Python', demand: 88, growth: 12 },
        { skill: 'Node.js', demand: 82, growth: 18 },
        { skill: 'AWS', demand: 79, growth: 22 },
        { skill: 'Docker', demand: 75, growth: 25 }
      ],
      industryGrowth: [
        { name: 'Technology', value: 35, growth: 15 },
        { name: 'Healthcare', value: 20, growth: 8 },
        { name: 'Finance', value: 18, growth: 5 },
        { name: 'Education', value: 12, growth: 12 },
        { name: 'Other', value: 15, growth: 7 }
      ],
      locationTrends: [
        { city: 'San Francisco', avgSalary: 145000, costOfLiving: 180, jobs: 2500 },
        { city: 'New York', avgSalary: 130000, costOfLiving: 170, jobs: 3200 },
        { city: 'Seattle', avgSalary: 125000, costOfLiving: 150, jobs: 1800 },
        { city: 'Austin', avgSalary: 110000, costOfLiving: 120, jobs: 1200 },
        { city: 'Remote', avgSalary: 105000, costOfLiving: 100, jobs: 4500 }
      ]
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Market Trends</h1>
        <p className="text-muted-foreground">Industry insights and job market analysis</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Salary Growth</p>
                <p className="text-2xl font-bold">+12%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Job Openings</p>
                <p className="text-2xl font-bold">85,234</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Seekers</p>
                <p className="text-2xl font-bold">12,567</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Market Demand</p>
                <p className="text-2xl font-bold">High</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Salary & Job Count Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marketData.salaryTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="salary" orientation="left" />
              <YAxis yAxisId="jobs" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="salary" type="monotone" dataKey="avgSalary" stroke="#8884d8" name="Average Salary" />
              <Line yAxisId="jobs" type="monotone" dataKey="jobCount" stroke="#82ca9d" name="Job Count" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skills in Demand */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Skills in Demand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.topSkills.map((skill: any, index: number) => (
                <div key={skill.skill} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{skill.skill}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{skill.demand}% demand</Badge>
                      <Badge variant={skill.growth > 15 ? "default" : "secondary"}>
                        +{skill.growth}%
                        <TrendingUp className="h-3 w-3 ml-1" />
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${skill.demand}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={marketData.industryGrowth}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {marketData.industryGrowth.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Location Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Location Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.locationTrends.map((location: any) => (
              <div key={location.city} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{location.city}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${location.avgSalary.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{location.jobs} jobs</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cost of Living Index:</span>
                    <span className="ml-2 font-medium">{location.costOfLiving}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Adjusted Salary:</span>
                    <span className="ml-2 font-medium">
                      ${Math.round(location.avgSalary / (location.costOfLiving / 100)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketTrends;
