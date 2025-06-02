
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface FeatureStatus {
  name: string;
  category: string;
  completion: number;
  status: 'complete' | 'in-progress' | 'pending';
  lastUpdated: string;
}

export const FeatureStatusDashboard: React.FC = () => {
  const [features, setFeatures] = useState<FeatureStatus[]>([
    {
      name: 'Navigation Integration',
      category: 'Core',
      completion: 100,
      status: 'complete',
      lastUpdated: new Date().toISOString()
    },
    {
      name: 'Mobile Experience',
      category: 'Core',
      completion: 100,
      status: 'complete',
      lastUpdated: new Date().toISOString()
    },
    {
      name: 'Voice Search',
      category: 'Enhancement',
      completion: 100,
      status: 'complete',
      lastUpdated: new Date().toISOString()
    },
    {
      name: 'Gesture Controls',
      category: 'Enhancement',
      completion: 100,
      status: 'complete',
      lastUpdated: new Date().toISOString()
    },
    {
      name: 'Offline Support',
      category: 'Advanced',
      completion: 100,
      status: 'complete',
      lastUpdated: new Date().toISOString()
    }
  ]);

  const overallCompletion = Math.round(
    features.reduce((sum, feature) => sum + feature.completion, 0) / features.length
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Feature Implementation Status</span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {overallCompletion}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallCompletion} className="h-3 mb-4" />
          <div className="text-sm text-muted-foreground">
            {features.filter(f => f.status === 'complete').length} of {features.length} features completed
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {features.map((feature) => (
          <Card key={feature.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(feature.status)}
                  <h3 className="font-medium">{feature.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {feature.category}
                  </Badge>
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
              
              <Progress value={feature.completion} className="h-2 mb-2" />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{feature.completion}% complete</span>
                <span>Updated {new Date(feature.lastUpdated).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeatureStatusDashboard;
