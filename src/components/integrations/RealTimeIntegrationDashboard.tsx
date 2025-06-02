
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Activity, 
  Zap, 
  Calendar, 
  Mail, 
  Briefcase, 
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface IntegrationMetrics {
  name: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync: string;
  syncProgress?: number;
  dataCount: number;
  errorCount: number;
}

interface RealTimeEvent {
  id: string;
  type: 'sync' | 'error' | 'connection' | 'data';
  service: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export const RealTimeIntegrationDashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<IntegrationMetrics[]>([]);
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    initializeMetrics();
    if (isMonitoring) {
      startRealTimeMonitoring();
    }
    return () => {
      setIsMonitoring(false);
    };
  }, [isMonitoring]);

  const initializeMetrics = () => {
    const initialMetrics: IntegrationMetrics[] = [
      {
        name: 'LinkedIn',
        status: 'connected',
        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        dataCount: 156,
        errorCount: 0
      },
      {
        name: 'Google Calendar',
        status: 'syncing',
        lastSync: new Date().toISOString(),
        syncProgress: 67,
        dataCount: 23,
        errorCount: 0
      },
      {
        name: 'Greenhouse ATS',
        status: 'connected',
        lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        dataCount: 45,
        errorCount: 2
      },
      {
        name: 'SendGrid',
        status: 'error',
        lastSync: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        dataCount: 78,
        errorCount: 5
      }
    ];
    setMetrics(initialMetrics);
  };

  const startRealTimeMonitoring = () => {
    const interval = setInterval(() => {
      // Simulate real-time events
      const eventTypes = ['sync', 'data', 'connection', 'error'];
      const services = ['LinkedIn', 'Google Calendar', 'Greenhouse ATS', 'SendGrid'];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as RealTimeEvent['type'];
      const service = services[Math.floor(Math.random() * services.length)];
      
      const newEvent: RealTimeEvent = {
        id: Date.now().toString(),
        type: eventType,
        service,
        message: generateEventMessage(eventType, service),
        timestamp: new Date().toISOString(),
        severity: eventType === 'error' ? 'error' : eventType === 'sync' ? 'success' : 'info'
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);

      // Update metrics based on events
      if (eventType === 'sync') {
        setMetrics(prev => prev.map(m => 
          m.name === service 
            ? { ...m, lastSync: new Date().toISOString(), status: 'connected' as const }
            : m
        ));
      }
    }, 3000 + Math.random() * 5000); // Random interval between 3-8 seconds

    return () => clearInterval(interval);
  };

  const generateEventMessage = (type: RealTimeEvent['type'], service: string): string => {
    const messages = {
      sync: [
        `${service} sync completed successfully`,
        `Data updated from ${service}`,
        `${service} synchronization finished`
      ],
      data: [
        `New data received from ${service}`,
        `${service} data processed`,
        `Data transformation completed for ${service}`
      ],
      connection: [
        `${service} connection established`,
        `${service} reconnected`,
        `${service} authentication renewed`
      ],
      error: [
        `${service} sync failed`,
        `${service} connection timeout`,
        `${service} authentication error`
      ]
    };
    
    const typeMessages = messages[type];
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  };

  const getStatusIcon = (status: IntegrationMetrics['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: IntegrationMetrics['status']) => {
    switch (status) {
      case 'connected':
        return 'default';
      case 'syncing':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getSeverityColor = (severity: RealTimeEvent['severity']) => {
    switch (severity) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const handleForceSync = (serviceName: string) => {
    setMetrics(prev => prev.map(m => 
      m.name === serviceName 
        ? { ...m, status: 'syncing' as const, syncProgress: 0 }
        : m
    ));

    // Simulate sync progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        setMetrics(prev => prev.map(m => 
          m.name === serviceName 
            ? { 
                ...m, 
                status: 'connected' as const, 
                syncProgress: undefined,
                lastSync: new Date().toISOString(),
                dataCount: m.dataCount + Math.floor(Math.random() * 10)
              }
            : m
        ));
        clearInterval(progressInterval);
        toast.success(`${serviceName} sync completed`);
      } else {
        setMetrics(prev => prev.map(m => 
          m.name === serviceName 
            ? { ...m, syncProgress: Math.min(progress, 100) }
            : m
        ));
      }
    }, 500);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Real-Time Integration Dashboard</h1>
            <p className="text-muted-foreground">Monitor your integrations in real-time</p>
          </div>
          <Button
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? "destructive" : "default"}
          >
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="events">Live Events</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getStatusIcon(metric.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                    {metric.syncProgress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Syncing...</span>
                          <span>{Math.round(metric.syncProgress)}%</span>
                        </div>
                        <Progress value={metric.syncProgress} className="h-2" />
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <div>Data: {metric.dataCount} items</div>
                      <div>Errors: {metric.errorCount}</div>
                      <div>Last sync: {new Date(metric.lastSync).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Sync Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.name} className="flex justify-between items-center">
                      <span className="text-sm">{metric.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {metric.dataCount} items
                        </span>
                        <Badge 
                          variant={metric.errorCount === 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {metric.errorCount === 0 ? "✓" : `${metric.errorCount} errors`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Active Connections</span>
                    <span className="font-semibold">
                      {metrics.filter(m => m.status === 'connected').length}/{metrics.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Data Points</span>
                    <span className="font-semibold">
                      {metrics.reduce((sum, m) => sum + m.dataCount, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span className="font-semibold text-red-500">
                      {metrics.reduce((sum, m) => sum + m.errorCount, 0)} errors
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monitoring Status</span>
                    <Badge variant={isMonitoring ? "default" : "secondary"}>
                      {isMonitoring ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Live Events</span>
                {isMonitoring && (
                  <Badge variant="secondary" className="animate-pulse">
                    LIVE
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Real-time integration events and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {isMonitoring ? "Waiting for events..." : "Start monitoring to see live events"}
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.severity === 'success' ? 'bg-green-500' :
                        event.severity === 'error' ? 'bg-red-500' :
                        event.severity === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-sm font-medium">{event.service}</span>
                            <span className={`text-xs ml-2 ${getSeverityColor(event.severity)}`}>
                              {event.type}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{event.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {metric.name}
                    {getStatusIcon(metric.status)}
                  </CardTitle>
                  <CardDescription>
                    Last sync: {new Date(metric.lastSync).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {metric.syncProgress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sync Progress</span>
                        <span>{Math.round(metric.syncProgress)}%</span>
                      </div>
                      <Progress value={metric.syncProgress} />
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleForceSync(metric.name)}
                      disabled={metric.status === 'syncing'}
                    >
                      Force Sync
                    </Button>
                    <Button variant="outline" size="sm">
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
