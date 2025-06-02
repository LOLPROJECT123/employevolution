
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkUserManagementRequest {
  organizationId: string;
  operation: {
    type: 'invite' | 'remove' | 'update_role';
    users: Array<{
      email: string;
      role?: 'admin' | 'member' | 'viewer';
      workspaceIds?: string[];
    }>;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { organizationId, operation }: BulkUserManagementRequest = await req.json();

    // Verify user has admin access to organization
    const { data: orgMember } = await supabaseClient
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!orgMember || orgMember.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const results = [];

    for (const userData of operation.users) {
      try {
        let result = { email: userData.email, success: false, message: '' };

        if (operation.type === 'invite') {
          // Send invitation email
          await supabaseClient
            .from('organization_invitations')
            .insert({
              organization_id: organizationId,
              email: userData.email,
              role: userData.role || 'member',
              invited_by: user.id,
              workspace_ids: userData.workspaceIds || [],
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            });

          result.success = true;
          result.message = 'Invitation sent';

        } else if (operation.type === 'remove') {
          // Find user by email
          const { data: userToRemove } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', userData.email)
            .single();

          if (userToRemove) {
            await supabaseClient
              .from('organization_members')
              .delete()
              .eq('organization_id', organizationId)
              .eq('user_id', userToRemove.id);

            result.success = true;
            result.message = 'User removed';
          } else {
            result.message = 'User not found';
          }

        } else if (operation.type === 'update_role') {
          const { data: userToUpdate } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', userData.email)
            .single();

          if (userToUpdate) {
            await supabaseClient
              .from('organization_members')
              .update({ role: userData.role })
              .eq('organization_id', organizationId)
              .eq('user_id', userToUpdate.id);

            result.success = true;
            result.message = 'Role updated';
          } else {
            result.message = 'User not found';
          }
        }

        results.push(result);

      } catch (error) {
        results.push({
          email: userData.email,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log bulk operation
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: `bulk_user_${operation.type}`,
        table_name: 'organization_members',
        new_values: { operation, results },
        created_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({ 
      success: true, 
      results 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Bulk user management error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
