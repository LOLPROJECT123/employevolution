
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Plus,
  BookOpen,
  Award,
  Code,
  Users,
  Briefcase,
  Star
} from 'lucide-react';

interface DevelopmentGoal {
  id: string;
  goal_title: string;
  category: string;
  goal_description?: string;
  status: 'in_progress' | 'completed' | 'paused';
  progress_percentage: number;
  target_date?: string;
  completion_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const ProfessionalDevelopmentTracker: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<DevelopmentGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_title: '',
    category: '',
    goal_description: '',
    target_date: ''
  });

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('professional_development')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load development goals');
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!user || !newGoal.goal_title || !newGoal.category) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('professional_development')
        .insert({
          user_id: user.id,
          goal_title: newGoal.goal_title,
          category: newGoal.category,
          goal_description: newGoal.goal_description,
          target_date: newGoal.target_date || null,
          status: 'in_progress',
          progress_percentage: 0
        })
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [data, ...prev]);
      setNewGoal({ goal_title: '', category: '', goal_description: '', target_date: '' });
      setShowAddForm(false);
      toast.success('Goal added successfully');
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal');
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number, status?: string) => {
    try {
      const updateData: any = { progress_percentage: progress };
      
      if (status) {
        updateData.status = status;
        if (status === 'completed') {
          updateData.completion_date = new Date().toISOString();
          updateData.progress_percentage = 100;
        }
      }

      const { error } = await supabase
        .from('professional_development')
        .update(updateData)
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...updateData }
          : goal
      ));

      toast.success('Progress updated');
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical':
      case 'programming':
        return <Code className="h-4 w-4" />;
      case 'leadership':
      case 'management':
        return <Users className="h-4 w-4" />;
      case 'certification':
      case 'education':
        return <Award className="h-4 w-4" />;
      case 'career':
      case 'professional':
        return <Briefcase className="h-4 w-4" />;
      case 'learning':
      case 'skill':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No target date';
    return new Date(dateString).toLocaleDateString();
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return <div>Loading development goals...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Professional Development</span>
            </CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 border rounded-lg space-y-4">
              <h3 className="font-medium">Add New Development Goal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Goal Title *</label>
                  <Input
                    value={newGoal.goal_title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, goal_title: e.target.value }))}
                    placeholder="e.g., Learn React Native"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <Select
                    value={newGoal.category}
                    onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Skills</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                      <SelectItem value="career">Career Development</SelectItem>
                      <SelectItem value="learning">Learning & Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={newGoal.goal_description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, goal_description: e.target.value }))}
                  placeholder="Describe your goal and how you plan to achieve it"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Date</label>
                  <Input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={addGoal}>Add Goal</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No development goals yet</h3>
              <p>Start tracking your professional growth by adding your first goal!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <h3 className="font-medium">{goal.goal_title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(goal.status)}>
                            {goal.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Target: {formatDate(goal.target_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{goal.progress_percentage}%</div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Progress</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-2" />
                  </div>

                  {goal.goal_description && (
                    <p className="text-sm text-muted-foreground mb-3">{goal.goal_description}</p>
                  )}

                  <div className="flex items-center space-x-2">
                    {goal.status !== 'completed' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress_percentage + 25))}
                        >
                          +25%
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateGoalProgress(goal.id, 100, 'completed')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      </>
                    )}
                    {goal.status === 'completed' && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Completed on {formatDate(goal.completion_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {goals.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {goals.filter(g => g.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {goals.filter(g => g.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(goals.reduce((sum, g) => sum + g.progress_percentage, 0) / goals.length)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Average Progress</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalDevelopmentTracker;
