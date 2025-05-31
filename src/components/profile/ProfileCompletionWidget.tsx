
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { profileCompletionService, ProfileCompletionItem } from '@/services/profileCompletionService';

const ProfileCompletionWidget: React.FC = () => {
  const { user } = useAuth();
  const [completionItems, setCompletionItems] = useState<ProfileCompletionItem[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileCompletion();
    }
  }, [user]);

  const loadProfileCompletion = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const items = await profileCompletionService.calculateProfileCompletion(user.id);
      setCompletionItems(items);
      
      const completed = items.filter(item => item.completed).length;
      const percentage = Math.round((completed / items.length) * 100);
      setCompletionPercentage(percentage);
    } catch (error) {
      console.error('Error loading profile completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const incompleteItems = completionItems.filter(item => !item.completed);
  const highPriorityIncomplete = incompleteItems.filter(item => item.priority === 'high');

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Profile Completion
          {completionPercentage === 100 ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-orange-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Profile Strength</span>
            <span className="font-semibold">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {completionPercentage < 100 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Complete Your Profile</h4>
            
            {highPriorityIncomplete.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-red-600 font-medium">High Priority Items:</p>
                {highPriorityIncomplete.slice(0, 2).map((item) => (
                  <div key={item.field} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {incompleteItems.length > highPriorityIncomplete.length && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Other Items:</p>
                {incompleteItems
                  .filter(item => item.priority !== 'high')
                  .slice(0, 2)
                  .map((item) => (
                    <div key={item.field} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}

            <Button 
              onClick={() => window.location.href = '/profile'} 
              className="w-full mt-4"
              size="sm"
            >
              Complete Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {completionPercentage === 100 && (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">Profile Complete!</p>
            <p className="text-xs text-green-600">You're ready to find amazing opportunities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionWidget;
