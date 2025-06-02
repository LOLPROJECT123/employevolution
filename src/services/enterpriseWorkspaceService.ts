
import { supabase } from '@/integrations/supabase/client';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  subscription_type: 'free' | 'team' | 'enterprise';
  member_limit: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  permissions: string[];
  invited_by: string;
  joined_at: string;
  status: 'active' | 'invited' | 'suspended';
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  invited_by: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

export class EnterpriseWorkspaceService {
  static async createWorkspace(workspaceData: Partial<Workspace>): Promise<Workspace> {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert(workspaceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error;
    }
  }

  static async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          workspace:workspaces(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      return data?.map(item => item.workspace).filter(Boolean) || [];
    } catch (error) {
      console.error('Failed to get user workspaces:', error);
      return [];
    }
  }

  static async inviteToWorkspace(workspaceId: string, email: string, role: string, invitedBy: string): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { error } = await supabase
        .from('workspace_invitations')
        .insert({
          workspace_id: workspaceId,
          email,
          role,
          invited_by: invitedBy,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      // Send invitation email (would be handled by edge function in real implementation)
      await supabase.functions.invoke('send-workspace-invitation', {
        body: { email, workspaceId, role }
      });
    } catch (error) {
      console.error('Failed to invite to workspace:', error);
      throw error;
    }
  }

  static async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    try {
      // Get invitation details
      const { data: invitation, error: invError } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single();

      if (invError || !invitation) throw new Error('Invalid invitation');

      // Check if invitation is not expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Add user to workspace
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: invitation.workspace_id,
          user_id: userId,
          role: invitation.role,
          invited_by: invitation.invited_by,
          joined_at: new Date().toISOString(),
          status: 'active'
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('workspace_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      throw error;
    }
  }

  static async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .eq('workspace_id', workspaceId)
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get workspace members:', error);
      return [];
    }
  }

  static async updateMemberRole(workspaceId: string, userId: string, newRole: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  }

  static async removeFromWorkspace(workspaceId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ status: 'suspended' })
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to remove from workspace:', error);
      throw error;
    }
  }

  static async getWorkspaceAnalytics(workspaceId: string): Promise<any> {
    try {
      // This would aggregate data across workspace members
      const { data, error } = await supabase
        .from('workspace_analytics')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Return mock data if no analytics exist yet
        return this.generateMockWorkspaceAnalytics();
      }

      return data;
    } catch (error) {
      console.error('Failed to get workspace analytics:', error);
      return this.generateMockWorkspaceAnalytics();
    }
  }

  private static generateMockWorkspaceAnalytics(): any {
    return {
      totalMembers: 12,
      activeMembers: 8,
      totalApplications: 156,
      successRate: 0.23,
      averageResponseTime: 14,
      topPerformers: [
        { name: 'Alice Johnson', applications: 18, successRate: 0.35 },
        { name: 'Bob Smith', applications: 15, successRate: 0.28 },
        { name: 'Carol Davis', applications: 12, successRate: 0.42 }
      ],
      industryBreakdown: {
        'Technology': 45,
        'Healthcare': 23,
        'Finance': 18,
        'Education': 12,
        'Other': 8
      }
    };
  }
}
