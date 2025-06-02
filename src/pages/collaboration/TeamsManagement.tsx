
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Settings, UserPlus, Mail, MoreVertical } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  owner: string;
  createdAt: Date;
  projects: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  lastActive: Date;
}

export const TeamsManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');

  useEffect(() => {
    loadTeams();
  }, [user]);

  const loadTeams = async () => {
    if (!user) return;
    
    // Mock teams data - in real app, load from Supabase
    const mockTeams: Team[] = [
      {
        id: '1',
        name: 'Resume Review Team',
        description: 'Collaborative resume review and optimization',
        owner: user.id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        projects: 12,
        members: [
          {
            id: user.id,
            name: user.user_metadata?.full_name || 'You',
            email: user.email || '',
            role: 'owner',
            joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lastActive: new Date()
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            role: 'admin',
            joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000)
          },
          {
            id: '3',
            name: 'Mike Chen',
            email: 'mike@example.com',
            role: 'member',
            joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];
    
    setTeams(mockTeams);
  };

  const createTeam = async () => {
    if (!newTeamName.trim() || !user) return;
    
    const newTeam: Team = {
      id: Date.now().toString(),
      name: newTeamName,
      description: newTeamDescription,
      owner: user.id,
      createdAt: new Date(),
      projects: 0,
      members: [{
        id: user.id,
        name: user.user_metadata?.full_name || 'You',
        email: user.email || '',
        role: 'owner',
        joinedAt: new Date(),
        lastActive: new Date()
      }]
    };
    
    setTeams(prev => [newTeam, ...prev]);
    setNewTeamName('');
    setNewTeamDescription('');
    setShowCreateTeam(false);
    
    toast({
      title: "Team Created",
      description: `"${newTeam.name}" has been created successfully`
    });
  };

  const inviteTeamMember = async () => {
    if (!inviteEmail.trim() || !selectedTeam) return;
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      joinedAt: new Date(),
      lastActive: new Date()
    };
    
    setTeams(prev =>
      prev.map(team =>
        team.id === selectedTeam.id
          ? { ...team, members: [...team.members, newMember] }
          : team
      )
    );
    
    setSelectedTeam(prev => 
      prev ? { ...prev, members: [...prev.members, newMember] } : null
    );
    
    setInviteEmail('');
    
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${inviteEmail}`
    });
  };

  const removeTeamMember = (memberId: string) => {
    if (!selectedTeam) return;
    
    setTeams(prev =>
      prev.map(team =>
        team.id === selectedTeam.id
          ? { ...team, members: team.members.filter(m => m.id !== memberId) }
          : team
      )
    );
    
    setSelectedTeam(prev => 
      prev ? { ...prev, members: prev.members.filter(m => m.id !== memberId) } : null
    );
    
    toast({
      title: "Member Removed",
      description: "Team member has been removed"
    });
  };

  const updateMemberRole = (memberId: string, newRole: TeamMember['role']) => {
    if (!selectedTeam) return;
    
    setTeams(prev =>
      prev.map(team =>
        team.id === selectedTeam.id
          ? {
              ...team,
              members: team.members.map(m =>
                m.id === memberId ? { ...m, role: newRole } : m
              )
            }
          : team
      )
    );
    
    setSelectedTeam(prev => 
      prev ? {
        ...prev,
        members: prev.members.map(m =>
          m.id === memberId ? { ...m, role: newRole } : m
        )
      } : null
    );
  };

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'member': return 'outline';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  if (selectedTeam) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => setSelectedTeam(null)}
              className="mb-4"
            >
              ← Back to Teams
            </Button>
            <h1 className="text-3xl font-bold">{selectedTeam.name}</h1>
            <p className="text-muted-foreground">{selectedTeam.description}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge>{selectedTeam.members.length} members</Badge>
            <Badge variant="outline">{selectedTeam.projects} projects</Badge>
          </div>
        </div>

        {/* Invite New Member */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Invite Team Member</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={inviteTeamMember} disabled={!inviteEmail.trim()}>
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTeam.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {member.lastActive.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleColor(member.role)}>
                      {member.role}
                    </Badge>
                    
                    {member.role !== 'owner' && selectedTeam.owner === user?.id && (
                      <div className="flex items-center space-x-1">
                        <Select
                          value={member.role}
                          onValueChange={(value: any) => updateMemberRole(member.id, value)}
                        >
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTeamMember(member.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your collaboration teams and members</p>
        </div>
        
        <Button onClick={() => setShowCreateTeam(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <Input
              placeholder="Team description (optional)"
              value={newTeamDescription}
              onChange={(e) => setNewTeamDescription(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
                Cancel
              </Button>
              <Button onClick={createTeam} disabled={!newTeamName.trim()}>
                Create Team
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first team to start collaborating
            </p>
            <Button onClick={() => setShowCreateTeam(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
        ) : (
          teams.map((team) => (
            <Card key={team.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {team.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members:</span>
                    <span>{team.members.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Projects:</span>
                    <span>{team.projects}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{team.createdAt.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 4).map((member) => (
                      <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {team.members.length > 4 && (
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted border-2 border-background text-xs">
                        +{team.members.length - 4}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => setSelectedTeam(team)}
                  >
                    Manage Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamsManagement;
