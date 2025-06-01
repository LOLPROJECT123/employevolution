
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Trash2 } from 'lucide-react';

interface Activity {
  organization: string;
  role?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface ActivitiesSectionProps {
  data: Activity[];
  onChange: (data: Activity[]) => void;
}

const ActivitiesSection = ({ data, onChange }: ActivitiesSectionProps) => {
  const addActivity = () => {
    onChange([...data, {
      organization: '',
      role: '',
      description: '',
      startDate: '',
      endDate: ''
    }]);
  };

  const updateActivity = (index: number, field: string, value: string) => {
    const updated = data.map((activity, i) => 
      i === index ? { ...activity, [field]: value } : activity
    );
    onChange(updated);
  };

  const removeActivity = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Activities & Leadership
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((activity, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Activity {index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeActivity(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Club/Organization Name *</Label>
                <Input
                  value={activity.organization}
                  onChange={(e) => updateActivity(index, 'organization', e.target.value)}
                  placeholder="Computer Science Club"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Position/Role</Label>
                <Input
                  value={activity.role || ''}
                  onChange={(e) => updateActivity(index, 'role', e.target.value)}
                  placeholder="President, Vice President, Member, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  value={activity.startDate || ''}
                  onChange={(e) => updateActivity(index, 'startDate', e.target.value)}
                  placeholder="September 2022"
                />
              </div>
              
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  value={activity.endDate || ''}
                  onChange={(e) => updateActivity(index, 'endDate', e.target.value)}
                  placeholder="May 2024"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={activity.description || ''}
                onChange={(e) => updateActivity(index, 'description', e.target.value)}
                placeholder="Describe your involvement and achievements..."
                rows={3}
              />
            </div>
          </div>
        ))}
        
        <Button onClick={addActivity} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActivitiesSection;
