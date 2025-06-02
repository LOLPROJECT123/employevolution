
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Shield, Zap, FileText, TestTube } from 'lucide-react';
import { monitoringService } from '@/services/monitoringService';
import { cacheService } from '@/services/cacheService';
import { IntegrationTestHelper } from '@/utils/integrationTestHelper';
import { DocumentationGenerator } from '@/utils/documentationGenerator';
import { PerformanceOptimizer } from '@/utils/performanceOptimizer';

const SystemHealthDashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      // Load health status
      const health = await monitoringService.runHealthChecks();
      setHealthStatus(health);

      // Load performance insights
      const performance = monitoringService.getPerformanceInsights();
      setPerformanceData(performance);

      // Load cache statistics
      const cache = cacheService.getStats();
      setCacheStats(cache);
    } catch (error) {
      console.error('Failed to load system data:', error);
    }
  };

  const runIntegrationTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await IntegrationTestHelper.runTestSuite();
      setTestResults(results);
    } catch (error) {
      console.error('Integration tests failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unhealthy': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const downloadDocumentation = () => {
    const markdown = DocumentationGenerator.exportDocumentation();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'enhanced-profile-system-docs.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">System Health Dashboard</h1>
        <div className="flex space-x-2">
          <Button onClick={downloadDocumentation} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Docs
          </Button>
          <Button 
            onClick={runIntegrationTests} 
            disabled={isRunningTests}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isRunningTests ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="health">
            <Shield className="h-4 w-4 mr-2" />
            Health
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="cache">
            <Activity className="h-4 w-4 mr-2" />
            Cache
          </TabsTrigger>
          <TabsTrigger value="tests">
            <TestTube className="h-4 w-4 mr-2" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="docs">
            <FileText className="h-4 w-4 mr-2" />
            Docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {healthStatus ? (
                  <div className="space-y-4">
                    <Badge className={getHealthStatusColor(healthStatus.status)}>
                      {healthStatus.status.toUpperCase()}
                    </Badge>
                    <div className="space-y-2">
                      {Object.entries(healthStatus.checks).map(([check, passed]) => (
                        <div key={check} className="flex justify-between items-center">
                          <span className="text-sm">{check}</span>
                          <Badge variant={passed ? 'default' : 'destructive'}>
                            {passed ? '✓' : '✗'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceData ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Usage</span>
                      <span>{performanceData.memoryUsage.toFixed(1)}%</span>
                    </div>
                    <Progress value={performanceData.memoryUsage} className="h-2" />
                    <p className="text-xs text-gray-600">
                      {performanceData.memoryUsage > 80 ? 'High usage detected' : 'Normal usage'}
                    </p>
                  </div>
                ) : (
                  <div className="animate-pulse h-16"></div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceData ? (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {performanceData.errorRate.toFixed(2)}%
                    </div>
                    <Progress 
                      value={Math.min(performanceData.errorRate, 100)} 
                      className="h-2"
                    />
                    <p className="text-xs text-gray-600">
                      {performanceData.errorRate < 5 ? 'Excellent' : 'Needs attention'}
                    </p>
                  </div>
                ) : (
                  <div className="animate-pulse h-16"></div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceData ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Avg Page Load</span>
                      <span className="font-semibold">
                        {performanceData.averagePageLoad.toFixed(0)}ms
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Top Errors</h4>
                      {performanceData.topErrors.slice(0, 3).map((error: any, index: number) => (
                        <div key={index} className="text-sm p-2 bg-red-50 rounded">
                          <div className="font-medium text-red-800">
                            {error.message.substring(0, 50)}...
                          </div>
                          <div className="text-red-600">Count: {error.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800">Cache Performance</div>
                    <div className="text-sm text-blue-600">
                      Hit rate: {cacheStats?.hitRate?.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800">Memory Usage</div>
                    <div className="text-sm text-green-600">
                      {cacheStats?.memory ? `${(cacheStats.memory / 1024).toFixed(1)} KB used` : 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-800">Cache Size</div>
                    <div className="text-sm text-yellow-600">
                      {cacheStats?.size || 0} entries
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {cacheStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{cacheStats.size}</div>
                    <div className="text-sm text-blue-800">Cache Entries</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {cacheStats.hitRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-800">Hit Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(cacheStats.memory / 1024).toFixed(1)}KB
                    </div>
                    <div className="text-sm text-purple-800">Memory Used</div>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse h-32"></div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <Badge className="bg-green-100 text-green-800">
                        ✓ {testResults.passed} Passed
                      </Badge>
                      <Badge className="bg-red-100 text-red-800">
                        ✗ {testResults.failed} Failed
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Success Rate: {((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {testResults.results.map((result: any, index: number) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        result.passed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{result.name}</div>
                            <div className="text-sm opacity-75">{result.description}</div>
                            {result.error && (
                              <div className="text-sm text-red-600 mt-1">
                                Error: {result.error}
                              </div>
                            )}
                          </div>
                          <Badge variant={result.passed ? 'default' : 'destructive'}>
                            {result.passed ? 'PASS' : 'FAIL'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No test results yet</p>
                  <p className="text-sm text-gray-500">Click "Run Tests" to execute the integration test suite</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Comprehensive documentation for all enhanced profile system features.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">📚 API Documentation</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete API reference for all enhanced services and utilities.
                    </p>
                    <Button onClick={downloadDocumentation} size="sm">
                      Download Markdown
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">🔧 Integration Guide</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Step-by-step guide for implementing enhanced features.
                    </p>
                    <Button size="sm" variant="outline">
                      View Guide
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthDashboard;
