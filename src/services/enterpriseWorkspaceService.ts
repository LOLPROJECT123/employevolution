
import { supabase } from '@/integrations/supabase/client';

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  subscription_type: 'free' | 'pro' | 'enterprise';
  member_limit: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  joined_at: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invited_by: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
}

class EnterpriseWorkspaceService {
  // Mock data for demonstration - in production these would be real database calls
  private mockWorkspaces: Workspace[] = [
    {
      id: '1',
      name: 'Tech Startup Workspace',
      owner_id: 'user1',
      subscription_type: 'enterprise',
      member_limit: 100,
      features: ['collaboration', 'analytics', 'automation'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private mockMembers: WorkspaceMember[] = [
    {
      id: '1',
      workspace_id: '1',
      user_id: 'user1',
      role: 'owner',
      permissions: ['all'],
      joined_at: new Date().toISOString()
    }
  ];

  async createWorkspace(workspaceData: Partial<Workspace>): Promise<Workspace> {
    // Mock implementation - would be real database operation
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name: workspaceData.name || 'New Workspace',
      owner_id: workspaceData.owner_id || '',
      subscription_type: workspaceData.subscription_type || 'free',
      member_limit: workspaceData.member_limit || 10,
      features: workspaceData.features || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockWorkspaces.push(newWorkspace);
    console.log('Created workspace:', newWorkspace);
    return newWorkspace;
  }

  async getWorkspacesByUser(userId: string): Promise<Workspace[]> {
    // Mock implementation - would query database
    console.log('Fetching workspaces for user:', userId);
    return this.mockWorkspaces.filter(w => w.owner_id === userId);
  }

  async addMemberToWorkspace(workspaceId: string, userId: string, role: WorkspaceMember['role']): Promise<void> {
    const newMember: WorkspaceMember = {
      id: Date.now().toString(),
      workspace_id: workspaceId,
      user_id: userId,
      role,
      permissions: role === 'owner' ? ['all'] : ['read', 'write'],
      joined_at: new Date().toISOString()
    };

    this.mockMembers.push(newMember);
    console.log('Added member to workspace:', newMember);
  }

  async inviteUserToWorkspace(
    workspaceId: string, 
    email: string, 
    role: WorkspaceInvitation['role'], 
    invitedBy: string
  ): Promise<WorkspaceInvitation> {
    const invitation: WorkspaceInvitation = {
      id: Date.now().toString(),
      workspace_id: workspaceId,
      email,
      role,
      invited_by: invitedBy,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log('Created workspace invitation:', invitation);
    return invitation;
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.mockMembers.filter(m => m.workspace_id === workspaceId);
  }

  async updateMemberRole(memberId: string, newRole: WorkspaceMember['role']): Promise<void> {
    const memberIndex = this.mockMembers.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      this.mockMembers[memberIndex].role = newRole;
      this.mockMembers[memberIndex].permissions = newRole === 'owner' ? ['all'] : ['read', 'write'];
      console.log('Updated member role:', this.mockMembers[memberIndex]);
    }
  }

  async removeMemberFromWorkspace(memberId: string): Promise<void> {
    const memberIndex = this.mockMembers.findIndex(m => m.id === memberId);
    if (memberIndex !== -1) {
      this.mockMembers.splice(memberIndex, 1);
      console.log('Removed member from workspace');
    }
  }

  async getWorkspaceAnalytics(workspaceId: string) {
    // Mock analytics data
    return {
      totalMembers: this.mockMembers.filter(m => m.workspace_id === workspaceId).length,
      activeProjects: Math.floor(Math.random() * 20) + 5,
      documentsShared: Math.floor(Math.random() * 100) + 50,
      collaborationHours: Math.floor(Math.random() * 500) + 200,
      weeklyActivity: [
        { day: 'Mon', activity: Math.floor(Math.random() * 50) + 10 },
        { day: 'Tue', activity: Math.floor(Math.random() * 50) + 10 },
        { day: 'Wed', activity: Math.floor(Math.random() * 50) + 10 },
        { day: 'Thu', activity: Math.floor(Math.random() * 50) + 10 },
        { day: 'Fri', activity: Math.floor(Math.random() * 50) + 10 },
        { day: 'Sat', activity: Math.floor(Math.random() * 30) + 5 },
        { day: 'Sun', activity: Math.floor(Math.random() * 30) + 5 }
      ]
    };
  }

  async bulkInviteUsers(workspaceId: string, invitations: Array<{email: string, role: WorkspaceInvitation['role']}>, invitedBy: string): Promise<WorkspaceInvitation[]> {
    const results = [];
    
    for (const invitation of invitations) {
      const newInvitation = await this.inviteUserToWorkspace(
        workspaceId, 
        invitation.email, 
        invitation.role, 
        invitedBy
      );
      results.push(newInvitation);
    }
    
    return results;
  }

  async getWorkspaceSettings(workspaceId: string) {
    // Mock workspace settings
    return {
      id: workspaceId,
      notifications: {
        email: true,
        inApp: true,
        slack: false
      },
      security: {
        twoFactorRequired: false,
        ipWhitelist: [],
        sessionTimeout: 480 // minutes
      },
      integrations: {
        slack: { enabled: false, webhook: null },
        teams: { enabled: false, webhook: null },
        jira: { enabled: false, apiKey: null }
      }
    };
  }

  async updateWorkspaceSettings(workspaceId: string, settings: any) {
    console.log('Updated workspace settings:', { workspaceId, settings });
    return settings;
  }
}

export const enterpriseWorkspaceService = new EnterpriseWorkspaceService();
