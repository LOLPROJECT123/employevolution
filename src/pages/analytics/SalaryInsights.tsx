
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MLJobMatchingService } from '@/services/mlJobMatchingService';
import { DollarSign, TrendingUp, MapPin, Users } from 'lucide-react';

export const SalaryInsights: React.FC = () => {
  const [role, setRole] = useState('Software Engineer');
  const [location, setLocation] = useState('San Francisco, CA');
  const [experience, setExperience] = useState(5);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSalaryInsights();
  }, []);

  const loadSalaryInsights = async () => {
    setIsLoading(true);
    try {
      const data = await MLJobMatchingService.getSalaryInsights(role, location, experience);
      setInsights(data);
    } catch (error) {
      console.error('Failed to load salary insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const salaryByExperience = [
    { years: '0-1', salary: 75000, count: 150 },
    { years: '2-3', salary: 95000, count: 280 },
    { years: '4-5', salary: 120000, count: 220 },
    { years: '6-8', salary: 145000, count: 180 },
    { years: '9-12', salary: 170000, count: 120 },
    { years: '13+', salary: 200000, count: 80 }
  ];

  const salaryDistribution = [
    { range: '$60-80k', count: 45 },
    { range: '$80-100k', count: 120 },
    { range: '$100-120k', count: 180 },
    { range: '$120-150k', count: 220 },
    { range: '$150-180k', count: 150 },
    { range: '$180k+', count: 85 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Salary Insights</h1>
        <p className="text-muted-foreground">Comprehensive salary analysis and market compensation data</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Analysis Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="role">Job Role</Label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                  <SelectItem value="New York, NY">New York, NY</SelectItem>
                  <SelectItem value="Seattle, WA">Seattle, WA</SelectItem>
                  <SelectItem value="Austin, TX">Austin, TX</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                min="0"
                max="20"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={loadSalaryInsights} disabled={isLoading} className="w-full">
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {insights && (
        <>
          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Your Range</p>
                    <p className="text-lg font-bold">
                      ${insights.salaryRange.min.toLocaleString()} - ${insights.salaryRange.max.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Market Growth</p>
                    <p className="text-lg font-bold">{insights.marketTrends.growth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Demand Level</p>
                    <p className="text-lg font-bold">{insights.marketTrends.demand}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Competition</p>
                    <p className="text-lg font-bold">{insights.marketTrends.competition}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Salary by Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Salary by Experience Level</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salaryByExperience}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="years" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Average Salary']} />
                  <Bar dataKey="salary" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Salary Distribution */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Salary Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={salaryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.insights.map((insight: string, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Negotiation Tips</h4>
                    <div className="space-y-2">
                      <Badge variant="outline">Research company salary ranges</Badge>
                      <Badge variant="outline">Highlight unique skills</Badge>
                      <Badge variant="outline">Consider total compensation</Badge>
                      <Badge variant="outline">Practice negotiation scenarios</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default SalaryInsights;
