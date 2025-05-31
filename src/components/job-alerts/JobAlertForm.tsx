
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import { useJobAlerts, JobAlert } from '@/hooks/useJobAlerts';

interface JobAlertFormProps {
  alertId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const JobAlertForm: React.FC<JobAlertFormProps> = ({
  alertId,
  onClose,
  onSuccess
}) => {
  const { alerts, createAlert, updateAlert } = useJobAlerts();
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    location: '',
    jobType: '',
    experience: '',
    company: '',
    minSalary: '',
    maxSalary: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'instant',
    is_active: true
  });

  const editingAlert = alertId ? alerts.find(a => a.id === alertId) : null;

  useEffect(() => {
    if (editingAlert) {
      setFormData({
        name: editingAlert.name,
        keywords: editingAlert.criteria.keywords || '',
        location: editingAlert.criteria.location || '',
        jobType: editingAlert.criteria.jobType || '',
        experience: editingAlert.criteria.experience || '',
        company: editingAlert.criteria.company || '',
        minSalary: editingAlert.criteria.salary?.min?.toString() || '',
        maxSalary: editingAlert.criteria.salary?.max?.toString() || '',
        frequency: editingAlert.frequency,
        is_active: editingAlert.is_active
      });
    }
  }, [editingAlert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const alertData = {
      name: formData.name,
      criteria: {
        keywords: formData.keywords || undefined,
        location: formData.location || undefined,
        jobType: formData.jobType || undefined,
        experience: formData.experience || undefined,
        company: formData.company || undefined,
        salary: formData.minSalary || formData.maxSalary ? {
          min: formData.minSalary ? parseInt(formData.minSalary) : undefined,
          max: formData.maxSalary ? parseInt(formData.maxSalary) : undefined
        } : undefined
      },
      frequency: formData.frequency,
      is_active: formData.is_active
    };

    let success = false;
    if (alertId) {
      success = await updateAlert(alertId, alertData);
    } else {
      success = await createAlert(alertData);
    }

    if (success) {
      onSuccess();
    }
  };

  return (
    <Card className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {alertId ? 'Edit Job Alert' : 'Create Job Alert'}
            </CardTitle>
            <CardDescription>
              Set up notifications for jobs that match your criteria
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Alert Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Frontend Developer in NYC"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="e.g., React, TypeScript"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., New York, NY"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobType">Job Type</Label>
              <Select value={formData.jobType} onValueChange={(value) => setFormData(prev => ({ ...prev, jobType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="experience">Experience Level</Label>
              <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="lead">Lead/Principal</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="e.g., Google, Microsoft"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minSalary">Min Salary ($)</Label>
              <Input
                id="minSalary"
                type="number"
                value={formData.minSalary}
                onChange={(e) => setFormData(prev => ({ ...prev, minSalary: e.target.value }))}
                placeholder="e.g., 80000"
              />
            </div>
            <div>
              <Label htmlFor="maxSalary">Max Salary ($)</Label>
              <Input
                id="maxSalary"
                type="number"
                value={formData.maxSalary}
                onChange={(e) => setFormData(prev => ({ ...prev, maxSalary: e.target.value }))}
                placeholder="e.g., 120000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select value={formData.frequency} onValueChange={(value: 'daily' | 'weekly' | 'instant') => setFormData(prev => ({ ...prev, frequency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {alertId ? 'Update Alert' : 'Create Alert'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
