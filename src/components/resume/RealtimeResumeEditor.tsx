
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { RealTimeService, UserPresence } from '@/services/realTimeService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Users, AlertTriangle, Check } from 'lucide-react';

interface RealtimeResumeEditorProps {
  resumeId: string;
  initialContent: any;
  onSave: (content: any) => void;
}

export const RealtimeResumeEditor: React.FC<RealtimeResumeEditorProps> = ({
  resumeId,
  initialContent,
  onSave
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Subscribe to presence
    const unsubscribePresence = RealTimeService.subscribeToPresence(
      `resume_${resumeId}`,
      (users) => {
        setActiveUsers(users.filter(u => u.user_id !== user.id));
      }
    );

    // Subscribe to resume changes
    const unsubscribeChanges = RealTimeService.subscribeToResumeChanges(
      resumeId,
      (change) => {
        handleRealtimeChange(change);
      }
    );

    // Update user presence
    const updatePresence = () => {
      RealTimeService.updatePresence(`resume_${resumeId}`, {
        user_id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        status: 'online',
        last_seen: new Date().toISOString(),
        current_section: 'resume_editor'
      });
    };

    updatePresence();
    const presenceInterval = setInterval(updatePresence, 30000);

    return () => {
      unsubscribePresence();
      unsubscribeChanges();
      clearInterval(presenceInterval);
    };
  }, [user, resumeId]);

  const handleRealtimeChange = (change: any) => {
    if (change.eventType === 'INSERT' && change.new.user_id !== user?.id) {
      const { section, changes } = change.new;
      
      // Check for conflicts
      if (hasConflict(section, changes)) {
        setConflicts(prev => [...prev, {
          id: change.new.id,
          section,
          changes,
          user_id: change.new.user_id,
          timestamp: change.new.created_at
        }]);
        
        toast({
          title: "Conflict Detected",
          description: `Another user modified the ${section} section`,
          variant: "destructive"
        });
      } else {
        // Apply changes
        applyChanges(section, changes);
        toast({
          title: "Resume Updated",
          description: `${section} section updated by collaborator`,
        });
      }
    }
  };

  const hasConflict = (section: string, changes: any): boolean => {
    // Simple conflict detection - in real app would be more sophisticated
    return Math.random() < 0.1; // 10% chance of conflict for demo
  };

  const applyChanges = (section: string, changes: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...changes
      }
    }));
  };

  const handleSectionUpdate = async (section: string, newData: any) => {
    if (!user) return;

    const changes = { [section]: newData };
    setContent(prev => ({ ...prev, ...changes }));

    try {
      await RealTimeService.updateResumeSection(resumeId, user.id, section, newData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    }
  };

  const resolveConflict = async (conflict: any, resolution: 'accept' | 'reject') => {
    try {
      await RealTimeService.resolveConflict(resumeId, conflict.id, {
        resolution,
        resolved_by: user?.id
      });
      
      if (resolution === 'accept') {
        applyChanges(conflict.section, conflict.changes);
      }
      
      setConflicts(prev => prev.filter(c => c.id !== conflict.id));
      
      toast({
        title: "Conflict Resolved",
        description: `Changes ${resolution}ed successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve conflict",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Collaboration Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <CardTitle>Collaborative Resume Editor</CardTitle>
              {isCollaborating && (
                <Badge variant="secondary">Live Collaboration</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {activeUsers.map((user, index) => (
                <div key={user.user_id} className="flex items-center space-x-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{user.name}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conflict Resolution */}
      {conflicts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">
                Conflicts Detected ({conflicts.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="p-4 border rounded-lg">
                <p className="font-medium">
                  Conflict in {conflict.section} section
                </p>
                <p className="text-sm text-muted-foreground">
                  Modified by another user at {new Date(conflict.timestamp).toLocaleTimeString()}
                </p>
                <div className="flex space-x-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => resolveConflict(conflict, 'accept')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveConflict(conflict, 'reject')}
                  >
                    Keep Mine
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resume Content Editor */}
      <Card>
        <CardContent className="space-y-6 p-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Personal Information</label>
            <Textarea
              value={content.personalInfo?.summary || ''}
              onChange={(e) => handleSectionUpdate('personalInfo', {
                ...content.personalInfo,
                summary: e.target.value
              })}
              placeholder="Professional summary..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Work Experience</label>
            <Textarea
              value={content.workExperience?.[0]?.description || ''}
              onChange={(e) => handleSectionUpdate('workExperience', [{
                ...content.workExperience?.[0],
                description: e.target.value
              }])}
              placeholder="Describe your work experience..."
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Skills</label>
            <Textarea
              value={content.skills?.join(', ') || ''}
              onChange={(e) => handleSectionUpdate('skills', 
                e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              )}
              placeholder="List your skills (comma-separated)..."
              rows={2}
            />
          </div>

          <Button onClick={() => onSave(content)} className="w-full">
            Save Resume
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeResumeEditor;
