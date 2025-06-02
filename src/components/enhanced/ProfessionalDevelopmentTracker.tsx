
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Target, 
  Award, 
  Plus, 
  BookOpen, 
  Code, 
  Users, 
  Trophy,
  Calendar,
  CheckCircle,
  Clock,
  Pause
} from 'lucide-react';

interface DevelopmentGoal {
  id: string;
  user_id: string;
  goal_title: string;
  goal_description: string;
  category: 'skill' | 'certification' | 'project' | 'networking';
  target_date: string;
  completion_date?: string;
  progress_percentage: number;
  status: 'in_progress' | 'completed' | 'paused';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  achievement_type: 'certification' | 'project' | 'award' | 'milestone';
  issuing_organization?: string;
  date_achieved?: string;
  verification_url?: string;
  skills_gained: string[];
  is_verified: boolean;
  created_at: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'skill': return <Code className="h-4 w-4" />;
    case 'certification': return <Award className="h-4 w-4" />;
    case 'project': return <Target className="h-4 w-4" />;
    case 'networking': return <Users className="h-4 w-4" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'paused': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const ProfessionalDevelopmentTracker: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<DevelopmentGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);

  useEffect(() => {
    if (user) {
      loadDevelopmentData();
    }
  }, [user]);

  const loadDevelopmentData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [goalsResponse, achievementsResponse] = await Promise.all([
        supabase.from('professional_development').select('*').eq('user_id', user.id),
        supabase.from('achievements').select('*').eq('user_id', user.id)
      ]);

      if (goalsResponse.data) {
        const mappedGoals: DevelopmentGoal[] = goalsResponse.data.map(goal => ({
          ...goal,
          category: goal.category as DevelopmentGoal['category'],
          status: goal.status as DevelopmentGoal['status']
        }));
        setGoals(mappedGoals);
      }
      
      if (achievementsResponse.data) {
        const mappedAchievements: Achievement[] = achievementsResponse.data.map(achievement => ({
          ...achievement,
          achievement_type: achievement.achievement_type as Achievement['achievement_type'],
          skills_gained: Array.isArray(achievement.skills_gained) 
            ? achievement.skills_gained.map(skill => String(skill))
            : []
        }));
        setAchievements(mappedAchievements);
      }
    } catch (error) {
      console.error('Failed to load development data:', error);
      toast.error('Failed to load development data');
    } finally {
      setLoading(false);
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('professional_development')
        .update({ 
          progress_percentage: progress,
          status: progress >= 100 ? 'completed' : 'in_progress',
          completion_date: progress >= 100 ? new Date().toISOString() : null
        })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.map(goal => 
        goal.id === goalId 
          ? { 
              ...goal, 
              progress_percentage: progress,
              status: progress >= 100 ? 'completed' : 'in_progress',
              completion_date: progress >= 100 ? new Date().toISOString() : goal.completion_date
            }
          : goal
      ));

      toast.success('Progress updated successfully');
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const addGoal = async (goalData: Partial<DevelopmentGoal>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('professional_development')
        .insert({
          user_id: user.id,
          goal_title: goalData.goal_title || '',
          goal_description: goalData.goal_description || '',
          category: goalData.category || 'skill',
          target_date: goalData.target_date || '',
          progress_percentage: 0,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal: DevelopmentGoal = {
        ...data,
        category: data.category as DevelopmentGoal['category'],
        status: data.status as DevelopmentGoal['status']
      };

      setGoals(prev => [...prev, newGoal]);
      setShowAddGoal(false);
      toast.success('Goal added successfully');
    } catch (error) {
      console.error('Failed to add goal:', error);
      toast.error('Failed to add goal');
    }
  };

  const addAchievement = async (achievementData: Partial<Achievement>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .insert({
          user_id: user.id,
          title: achievementData.title || '',
          description: achievementData.description || '',
          achievement_type: achievementData.achievement_type || 'milestone',
          issuing_organization: achievementData.issuing_organization || '',
          date_achieved: achievementData.date_achieved || new Date().toISOString(),
          verification_url: achievementData.verification_url || '',
          skills_gained: achievementData.skills_gained || [],
          is_verified: false
        })
        .select()
        .single();

      if (error) throw error;

      const newAchievement: Achievement = {
        ...data,
        achievement_type: data.achievement_type as Achievement['achievement_type'],
        skills_gained: Array.isArray(data.skills_gained) 
          ? data.skills_gained.map(skill => String(skill))
          : []
      };

      setAchievements(prev => [...prev, newAchievement]);
      setShowAddAchievement(false);
      toast.success('Achievement added successfully');
    } catch (error) {
      console.error('Failed to add achievement:', error);
      toast.error('Failed to add achievement');
    }
  };

  if (loading) {
    return <div>Loading development tracker...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Professional Development</h2>
          <p className="text-muted-foreground">Track your learning goals and achievements</p>
        </div>
        <div className="space-x-2">
          <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Development Goal</DialogTitle>
              </DialogHeader>
              <AddGoalForm onSubmit={addGoal} onCancel={() => setShowAddGoal(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={showAddAchievement} onOpenChange={setShowAddAchievement}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Trophy className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Achievement</DialogTitle>
              </DialogHeader>
              <AddAchievementForm onSubmit={addAchievement} onCancel={() => setShowAddAchievement(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Development Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Development Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(goal.category)}
                    <h3 className="font-medium">{goal.goal_title}</h3>
                  </div>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {goal.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                    {goal.status === 'paused' && <Pause className="h-3 w-3 mr-1" />}
                    {goal.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{goal.goal_description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{goal.progress_percentage}%</span>
                  </div>
                  <Progress value={goal.progress_percentage} />
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="text-sm text-muted-foreground">
                    Target: {new Date(goal.target_date).toLocaleDateString()}
                  </div>
                  <div className="space-x-2">
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
                      onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress_percentage + 10))}
                    >
                      +10%
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {goals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No development goals yet. Add your first goal to start tracking progress!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {achievement.is_verified && (
                    <Badge variant="default">Verified</Badge>
                  )}
                </div>
                
                <h3 className="font-medium mb-1">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                
                {achievement.issuing_organization && (
                  <p className="text-sm font-medium text-blue-600 mb-2">
                    {achievement.issuing_organization}
                  </p>
                )}
                
                {achievement.skills_gained.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {achievement.skills_gained.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {achievement.skills_gained.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{achievement.skills_gained.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {achievement.date_achieved && (
                  <div className="text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {new Date(achievement.date_achieved).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
            
            {achievements.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No achievements recorded yet. Add your first achievement!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper components for forms
const AddGoalForm: React.FC<{
  onSubmit: (data: Partial<DevelopmentGoal>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<DevelopmentGoal>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.goal_title && formData.category) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="goal_title">Goal Title</Label>
        <Input
          id="goal_title"
          value={formData.goal_title || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, goal_title: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="goal_description">Description</Label>
        <Textarea
          id="goal_description"
          value={formData.goal_description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, goal_description: e.target.value }))}
        />
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as DevelopmentGoal['category'] }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="skill">Skill Development</SelectItem>
            <SelectItem value="certification">Certification</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="networking">Networking</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="target_date">Target Date</Label>
        <Input
          id="target_date"
          type="date"
          value={formData.target_date || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
        />
      </div>
      
      <div className="flex space-x-2">
        <Button type="submit">Add Goal</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

const AddAchievementForm: React.FC<{
  onSubmit: (data: Partial<Achievement>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Achievement>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.achievement_type) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Achievement Title</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
      
      <div>
        <Label htmlFor="achievement_type">Type</Label>
        <Select onValueChange={(value) => setFormData(prev => ({ ...prev, achievement_type: value as Achievement['achievement_type'] }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="certification">Certification</SelectItem>
            <SelectItem value="project">Project</SelectItem>
            <SelectItem value="award">Award</SelectItem>
            <SelectItem value="milestone">Milestone</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="issuing_organization">Issuing Organization</Label>
        <Input
          id="issuing_organization"
          value={formData.issuing_organization || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, issuing_organization: e.target.value }))}
        />
      </div>
      
      <div>
        <Label htmlFor="date_achieved">Date Achieved</Label>
        <Input
          id="date_achieved"
          type="date"
          value={formData.date_achieved || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, date_achieved: e.target.value }))}
        />
      </div>
      
      <div className="flex space-x-2">
        <Button type="submit">Add Achievement</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default ProfessionalDevelopmentTracker;
