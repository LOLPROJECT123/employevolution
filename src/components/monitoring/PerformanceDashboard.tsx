
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { monitoringService } from '@/services/monitoringService';
import { healthCheckService } from '@/services/healthCheckService';
import { cacheService } from '@/services/cacheService';
import { Activity, AlertTriangle, CheckCircle, Clock, Database, Memory, Network, Zap } from 'lucide-react';

const PerformanceDashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [performanceInsights, setPerformanceInsights] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [health, insights, cache] = await Promise.all([
          healthCheckService.performHealthCheck(),
          Promise.resolve(monitoringService.getPerformanceInsights()),
          Promise.resolve(cacheService.getStats())
        ]);

        setHealthStatus(health);
        setPerformanceInsights(insights);
        setCacheStats(cache);
      } catch (error) {
        console.error('Failed to load monitoring data:', error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return 'text-green-600';
      case 'degraded':
      case 'warn':
        return 'text-yellow-600';
      case 'unhealthy':
      case 'fail':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy':
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!healthStatus || !performanceInsights || !cacheStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <Badge variant={healthStatus.status === 'healthy' ? 'default' : 'destructive'}>
          {healthStatus.status}
        </Badge>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            {getStatusIcon(healthStatus.status)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(healthStatus.status)}`}>
              {healthStatus.status}
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {Math.floor(healthStatus.uptime / 1000 / 60)} minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceInsights.averagePageLoad.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Average load time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceInsights.errorRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Error percentage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Memory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceInsights.memoryUsage.toFixed(1)}%
            </div>
            <Progress value={performanceInsights.memoryUsage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Health Checks
          </CardTitle>
          <CardDescription>
            Current status of system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthStatus.checks.map((check: any) => (
              <div key={check.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {check.name === 'database' && <Database className="h-4 w-4" />}
                  {check.name === 'network' && <Network className="h-4 w-4" />}
                  {check.name === 'memory' && <Memory className="h-4 w-4" />}
                  {check.name === 'cache' && <Zap className="h-4 w-4" />}
                  <span className="font-medium capitalize">{check.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <span className={`text-sm ${getStatusColor(check.status)}`}>
                    {check.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Cache Performance
          </CardTitle>
          <CardDescription>
            Cache hit rates and memory usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {cacheStats.hitRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Hit Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {cacheStats.size}
              </div>
              <p className="text-sm text-muted-foreground">Cached Items</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {(cacheStats.memory / 1024).toFixed(1)}KB
              </div>
              <p className="text-sm text-muted-foreground">Memory Used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Errors */}
      {performanceInsights.topErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Top Errors
            </CardTitle>
            <CardDescription>
              Most frequent errors in the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {performanceInsights.topErrors.map((error: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <span className="text-sm font-mono truncate flex-1">{error.message}</span>
                  <Badge variant="destructive">{error.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceDashboard;
