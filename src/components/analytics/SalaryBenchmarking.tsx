
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Target } from 'lucide-react';

interface SalaryData {
  avgOfferedSalary: number;
  salaryRangeDistribution: { range: string; count: number }[];
}

interface SalaryBenchmarkingProps {
  data: SalaryData;
}

const SALARY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const SalaryBenchmarking: React.FC<SalaryBenchmarkingProps> = ({ data }) => {
  const chartConfig = {
    count: {
      label: "Count",
      color: "#3b82f6",
    },
  };

  // Mock industry benchmark data
  const industryBenchmarks = {
    avgSalary: 95000,
    percentile25: 75000,
    percentile50: 90000,
    percentile75: 120000,
    percentile90: 150000
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPerformanceVsMarket = () => {
    if (data.avgOfferedSalary > industryBenchmarks.percentile75) return 'above';
    if (data.avgOfferedSalary < industryBenchmarks.percentile25) return 'below';
    return 'average';
  };

  const performance = getPerformanceVsMarket();

  return (
    <div className="space-y-6">
      {/* Salary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Avg Offer</p>
                <p className="text-2xl font-bold">{formatSalary(data.avgOfferedSalary)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4">
              <Badge 
                variant={performance === 'above' ? 'default' : performance === 'below' ? 'destructive' : 'secondary'}
              >
                {performance === 'above' ? 'Above Market' : performance === 'below' ? 'Below Market' : 'Market Rate'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Market Average</p>
                <p className="text-2xl font-bold">{formatSalary(industryBenchmarks.avgSalary)}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Based on industry data
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Uplift</p>
                <p className="text-2xl font-bold">
                  {data.avgOfferedSalary < industryBenchmarks.percentile75 
                    ? formatSalary(industryBenchmarks.percentile75 - data.avgOfferedSalary)
                    : '$0'
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                To reach 75th percentile
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Range Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Your Offer Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.salaryRangeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="range" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="count" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Pie Chart */}
            <div className="flex justify-center">
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.salaryRangeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ range, count }) => `${range}: ${count}`}
                    >
                      {data.salaryRangeDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={SALARY_COLORS[index % SALARY_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Market Salary Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">25th Percentile</p>
                <p className="text-lg font-bold">{formatSalary(industryBenchmarks.percentile25)}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Median</p>
                <p className="text-lg font-bold">{formatSalary(industryBenchmarks.percentile50)}</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-blue-50">
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="text-lg font-bold text-blue-600">{formatSalary(industryBenchmarks.avgSalary)}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">75th Percentile</p>
                <p className="text-lg font-bold">{formatSalary(industryBenchmarks.percentile75)}</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">90th Percentile</p>
                <p className="text-lg font-bold">{formatSalary(industryBenchmarks.percentile90)}</p>
              </div>
            </div>

            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-400"></div>
              <div 
                className="absolute top-0 w-2 h-full bg-black"
                style={{ 
                  left: `${((data.avgOfferedSalary - industryBenchmarks.percentile25) / 
                    (industryBenchmarks.percentile90 - industryBenchmarks.percentile25)) * 100}%` 
                }}
                title={`Your average: ${formatSalary(data.avgOfferedSalary)}`}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Your position in the market (black marker)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Negotiation Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Salary Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Based on your data:</h4>
              <ul className="space-y-2 text-sm">
                {performance === 'below' && (
                  <>
                    <li>• Your offers are below market average - consider negotiating more</li>
                    <li>• Research salary data before interviews</li>
                  </>
                )}
                {performance === 'average' && (
                  <>
                    <li>• You're getting market-rate offers - good foundation</li>
                    <li>• Focus on getting offers from higher-paying companies</li>
                  </>
                )}
                {performance === 'above' && (
                  <>
                    <li>• Excellent! You're getting above-market offers</li>
                    <li>• Continue targeting premium employers</li>
                  </>
                )}
                <li>• Consider total compensation beyond base salary</li>
                <li>• Time your negotiations strategically</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Next steps:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Research specific company salary ranges</li>
                <li>• Prepare your value proposition</li>
                <li>• Practice salary negotiation conversations</li>
                <li>• Consider non-salary benefits in negotiations</li>
                <li>• Track all offer components for better analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryBenchmarking;
