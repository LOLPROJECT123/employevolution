
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveJobAlerts } from '@/hooks/useLiveJobAlerts';
import { Bell, X, Eye, ExternalLink, MapPin, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveJobAlertsWidget: React.FC = () => {
  const { user } = useAuth();
  const { alerts, unreadCount, markAsViewed, clearAllAlerts } = useLiveJobAlerts();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user || alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <AnimatePresence>
        {unreadCount > 0 && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="mb-2"
          >
            <Button
              onClick={() => setIsExpanded(true)}
              className="relative shadow-lg"
              size="lg"
            >
              <Bell className="h-5 w-5 mr-2" />
              {unreadCount} New Job Alert{unreadCount !== 1 ? 's' : ''}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
          >
            <Card className="shadow-xl max-h-96 flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Live Job Alerts</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive">{unreadCount}</Badge>
                    )}
                  </CardTitle>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllAlerts}
                      disabled={alerts.length === 0}
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-0">
                <div className="space-y-2 p-4">
                  {alerts.slice(0, 5).map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 border rounded-lg transition-colors ${
                        !alert.is_viewed ? 'bg-blue-50 border-blue-200' : 'bg-background'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm truncate">
                              {alert.job_data.title}
                            </h4>
                            {!alert.is_viewed && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate">
                            {alert.job_data.company}
                          </p>
                          
                          <div className="flex items-center space-x-3 mt-1">
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{alert.job_data.location}</span>
                            </div>
                            
                            {alert.job_data.salary && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <DollarSign className="h-3 w-3" />
                                <span>{alert.job_data.salary}</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex flex-col space-y-1 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsViewed(alert.id)}
                            disabled={alert.is_viewed}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {alerts.length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No job alerts yet</p>
                      <p className="text-xs text-muted-foreground">
                        We'll notify you when matching jobs are found
                      </p>
                    </div>
                  )}
                  
                  {alerts.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm">
                        View All {alerts.length} Alerts
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveJobAlertsWidget;
