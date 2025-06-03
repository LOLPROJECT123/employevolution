
import { supabase } from '@/integrations/supabase/client';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  planType: 'starter' | 'professional' | 'enterprise';
  maxUsers: number;
  createdAt: string;
  settings: {
    ssoEnabled: boolean;
    auditLogging: boolean;
    customBranding: boolean;
    advancedAnalytics: boolean;
  };
}

export interface TeamWorkspace {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  members: string[];
  permissions: {
    canManageMembers: boolean;
    canViewAnalytics: boolean;
    canManageSettings: boolean;
  };
}

export class EnterpriseService {
  static async createOrganization(orgData: {
    name: string;
    domain: string;
    planType: Organization['planType'];
  }): Promise<{ success: boolean; organization?: Organization; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          ...orgData,
          maxUsers: orgData.planType === 'starter' ? 5 : orgData.planType === 'professional' ? 50 : 500,
          settings: {
            ssoEnabled: orgData.planType === 'enterprise',
            auditLogging: orgData.planType !== 'starter',
            customBranding: orgData.planType === 'enterprise',
            advancedAnalytics: orgData.planType !== 'starter'
          }
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, organization: data };
    } catch (error) {
      console.error('Organization creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create organization'
      };
    }
  }

  static async createTeamWorkspace(workspaceData: {
    organizationId: string;
    name: string;
    description: string;
  }): Promise<{ success: boolean; workspace?: TeamWorkspace; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('team_workspaces')
        .insert({
          ...workspaceData,
          members: [],
          permissions: {
            canManageMembers: false,
            canViewAnalytics: true,
            canManageSettings: false
          }
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, workspace: data };
    } catch (error) {
      console.error('Workspace creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create workspace'
      };
    }
  }

  static async bulkUserManagement(organizationId: string, operation: {
    type: 'invite' | 'remove' | 'update_role';
    users: Array<{
      email: string;
      role?: 'admin' | 'member' | 'viewer';
      workspaceIds?: string[];
    }>;
  }): Promise<{ success: boolean; results?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('bulk-user-management', {
        body: {
          organizationId,
          operation
        }
      });

      if (error) throw error;

      return { success: true, results: data.results };
    } catch (error) {
      console.error('Bulk user management failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk operation failed'
      };
    }
  }

  static async getOrganizationAnalytics(organizationId: string, timeRange: {
    startDate: string;
    endDate: string;
  }): Promise<{ success: boolean; analytics?: any; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('organization-analytics', {
        body: {
          organizationId,
          timeRange
        }
      });

      if (error) throw error;

      return { success: true, analytics: data };
    } catch (error) {
      console.error('Analytics retrieval failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics'
      };
    }
  }

  static async setupSSO(organizationId: string, ssoConfig: {
    provider: 'okta' | 'azure' | 'google';
    domain: string;
    clientId: string;
    clientSecret: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.functions.invoke('setup-sso', {
        body: {
          organizationId,
          ssoConfig
        }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('SSO setup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SSO setup failed'
      };
    }
  }
}
