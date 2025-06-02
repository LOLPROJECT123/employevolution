
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Plus, 
  Target, 
  Calendar, 
  Award,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DevelopmentGoal {
  id?: string;
  goal_title: string;
  goal_description: string;
  category: 'skill' | 'certification' | 'project' | 'networking';
  target_date: string;
  completion_date?: string;
  progress_percentage: number;
  status: 'in_progress' | 'completed' | 'paused';
  notes?: string;
}

interface Achievement {
  id?: string;
  title: string;
  description: string;
  achievement_type: 'certification' | 'award' | 'milestone' | 'project';
  issuing_organization?: string;
  date_achieved: string;
  verification_url?: string;
  skills_gained: string[];
  is_verified: boolean;
}

export const ProfessionalDevelopmentTracker: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<DevelopmentGoal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<DevelopmentGoal>>({
    category: 'skill',
    progress_percentage: 0,
    status: 'in_progress'
  });
  const [newAchievement, setNewAchievement] = useState<Partial<Achievement>>({
    achievement_type: 'certification',
    skills_gained: [],
    is_verified: false
  });

  useEffect(() => {
    if (user) {
      loadDevelopmentData();
    }
  }, [user]);

  const loadDevelopmentData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [goalsResult, achievementsResult] = await Promise.all([
        supabase.from('professional_development').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('achievements').select('*').eq('user_id', user.id).order('date_achieved', { ascending: false })
      ]);

      if (goalsResult.error) throw goalsResult.error;
      if (achievementsResult.error) throw achievementsResult.error;

      setGoals(goalsResult.data || []);
      setAchievements(achievementsResult.data || []);
    } catch (error) {
      console.error('Failed to load development data:', error);
      toast.error('Failed to load development data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!user || !newGoal.goal_title) return;

    try {
      const { error } = await supabase.from('professional_development').insert({
        ...newGoal,
        user_id: user.id
      });

      if (error) throw error;

      toast.success('Development goal added successfully');
      setShowAddGoal(false);
      setNewGoal({ category: 'skill', progress_percentage: 0, status: 'in_progress' });
      loadDevelopmentData();
    } catch (error) {
      console.error('Failed to add goal:', error);
      toast.error('Failed to add development goal');
    }
  };

  const handleAddAchievement = async () => {
    if (!user || !newAchievement.title) return;

    try {
      const { error } = await supabase.from('achievements').insert({
        ...newAchievement,
        user_id: user.id
      });

      if (error) throw error;

      toast.success('Achievement added successfully');
      setShowAddAchievement(false);
      setNewAchievement({ achievement_type: 'certification', skills_gained: [], is_verified: false });
      loadDevelopmentData();
    } catch (error) {
      console.error('Failed to add achievement:', error);
      toast.error('Failed to add achievement');
    }
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    try {
      const { error } = await supabase
        .from('professional_development')
        .update({ 
          progress_percentage: progress,
          status: progress >= 100 ? 'completed' : 'in_progress',
          completion_date: progress >= 100 ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', goalId);

      if (error) throw error;

      toast.success('Goal progress updated');
      loadDevelopmentData();
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill': return <BookOpen className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'project': return <Target className="h-4 w-4" />;
      case 'networking': return <TrendingUp className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
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

  if (loading) {
    return <div className="p-6">Loading development tracker...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Professional Development</h2>
          <p className="text-muted-foreground">Track your learning goals and achievements</p>
        </div>
        <div className="flex space-x-2">
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
                <DialogDescription>Set a new professional development goal</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal-title">Goal Title</Label>
                  <Input
                    id="goal-title"
                    value={newGoal.goal_title || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, goal_title: e.target.value })}
                    placeholder="e.g., Learn React Native"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea
                    id="goal-description"
                    value={newGoal.goal_description || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, goal_description: e.target.value })}
                    placeholder="Describe your goal..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="skill">Skill</option>
                      <option value="certification">Certification</option>
                      <option value="project">Project</option>
                      <option value="networking">Networking</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="target-date">Target Date</Label>
                    <Input
                      id="target-date"
                      type="date"
                      value={newGoal.target_date || ''}
                      onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddGoal} className="w-full">
                  Add Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddAchievement} onOpenChange={setShowAddAchievement}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Achievement</DialogTitle>
                <DialogDescription>Record a professional achievement</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="achievement-title">Title</Label>
                  <Input
                    id="achievement-title"
                    value={newAchievement.title || ''}
                    onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                    placeholder="e.g., AWS Solutions Architect Certification"
                  />
                </div>
                <div>
                  <Label htmlFor="achievement-description">Description</Label>
                  <Textarea
                    id="achievement-description"
                    value={newAchievement.description || ''}
                    onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                    placeholder="Describe your achievement..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="achievement-type">Type</Label>
                    <select
                      id="achievement-type"
                      value={newAchievement.achievement_type}
                      onChange={(e) => setNewAchievement({ ...newAchievement, achievement_type: e.target.value as any })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="certification">Certification</option>
                      <option value="award">Award</option>
                      <option value="milestone">Milestone</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="date-achieved">Date Achieved</Label>
                    <Input
                      id="date-achieved"
                      type="date"
                      value={newAchievement.date_achieved || ''}
                      onChange={(e) => setNewAchievement({ ...newAchievement, date_achieved: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="issuing-org">Issuing Organization</Label>
                  <Input
                    id="issuing-org"
                    value={newAchievement.issuing_organization || ''}
                    onChange={(e) => setNewAchievement({ ...newAchievement, issuing_organization: e.target.value })}
                    placeholder="e.g., Amazon Web Services"
                  />
                </div>
                <Button onClick={handleAddAchievement} className="w-full">
                  Add Achievement
                </Button>
              </div>
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
          <CardDescription>Track your professional development objectives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(goal.category)}
                      <CardTitle className="text-lg">{goal.goal_title}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {goal.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                      {goal.status}
                    </Badge>
                  </div>
                  {goal.goal_description && (
                    <CardDescription>{goal.goal_description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{goal.progress_percentage}%</span>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-2" />
                  </div>
                  
                  {goal.target_date && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {goal.status !== 'completed' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id!, Math.min(100, goal.progress_percentage + 25))}
                      >
                        +25%
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateGoalProgress(goal.id!, 100)}
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {goals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No development goals yet. Click "Add Goal" to get started!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
          <CardDescription>Your professional accomplishments and certifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{achievement.title}</CardTitle>
                    {achievement.is_verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  {achievement.description && (
                    <CardDescription>{achievement.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Type:</span> {achievement.achievement_type}
                  </div>
                  
                  {achievement.issuing_organization && (
                    <div className="text-sm">
                      <span className="font-medium">Issued by:</span> {achievement.issuing_organization}
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <span className="font-medium">Date:</span> {new Date(achievement.date_achieved).toLocaleDateString()}
                  </div>
                  
                  {achievement.skills_gained && achievement.skills_gained.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Skills Gained:</p>
                      <div className="flex flex-wrap gap-1">
                        {achievement.skills_gained.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {achievements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No achievements recorded yet. Click "Add Achievement" to showcase your accomplishments!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
