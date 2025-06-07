
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Trash2, Edit } from 'lucide-react';
import { useJobAlerts } from '@/hooks/useJobAlerts';
import { JobAlertForm } from './JobAlertForm';

export const JobAlertsManager: React.FC = () => {
  const { alerts, loading, toggleAlert, deleteAlert } = useJobAlerts();
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<string | null>(null);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Job Alerts
              </CardTitle>
              <CardDescription>
                Get notified when new jobs match your criteria
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-muted rounded-full">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No job alerts yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first job alert to get notified about relevant opportunities that match your preferences.
              </p>
              <Button onClick={() => setShowForm(true)} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Alert
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border border-border rounded-lg p-4 bg-card">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2 text-card-foreground">{alert.name}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={alert.is_active ? "default" : "secondary"}>
                          {alert.is_active ? "Active" : "Paused"}
                        </Badge>
                        <Badge variant="outline">{alert.frequency}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAlert(alert.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {alert.criteria.keywords && (
                        <div>
                          <span className="font-medium text-foreground">Keywords:</span> {alert.criteria.keywords}
                        </div>
                      )}
                      {alert.criteria.location && (
                        <div>
                          <span className="font-medium text-foreground">Location:</span> {alert.criteria.location}
                        </div>
                      )}
                      {alert.criteria.jobType && (
                        <div>
                          <span className="font-medium text-foreground">Job Type:</span> {alert.criteria.jobType}
                        </div>
                      )}
                      {alert.criteria.experience && (
                        <div>
                          <span className="font-medium text-foreground">Experience:</span> {alert.criteria.experience}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {alert.last_triggered && (
                    <div className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                      Last triggered: {new Date(alert.last_triggered).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <JobAlertForm
          onClose={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {editingAlert && (
        <JobAlertForm
          alertId={editingAlert}
          onClose={() => setEditingAlert(null)}
          onSuccess={() => setEditingAlert(null)}
        />
      )}
    </div>
  );
};
