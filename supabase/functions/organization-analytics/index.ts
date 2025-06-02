
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrganizationAnalyticsRequest {
  organizationId: string;
  timeRange: {
    startDate: string;
    endDate: string;
  };
  metrics?: string[];
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

    const { organizationId, timeRange, metrics }: OrganizationAnalyticsRequest = await req.json();

    // Verify user has access to organization analytics
    const { data: orgMember } = await supabaseClient
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!orgMember) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get organization members
    const { data: members } = await supabaseClient
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', organizationId);

    const memberIds = members?.map(m => m.user_id) || [];

    // Calculate analytics
    const analytics = await calculateOrganizationAnalytics(
      supabaseClient,
      organizationId,
      memberIds,
      timeRange
    );

    return new Response(JSON.stringify({ 
      success: true, 
      analytics 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Organization analytics error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

async function calculateOrganizationAnalytics(
  supabaseClient: any,
  organizationId: string,
  memberIds: string[],
  timeRange: { startDate: string; endDate: string }
) {
  const { startDate, endDate } = timeRange;

  // User activity metrics
  const { data: applications } = await supabaseClient
    .from('job_applications')
    .select('*')
    .in('user_id', memberIds)
    .gte('applied_at', startDate)
    .lte('applied_at', endDate);

  const { data: profiles } = await supabaseClient
    .from('user_profiles')
    .select('profile_completion')
    .in('user_id', memberIds);

  // Team collaboration metrics
  const { data: communications } = await supabaseClient
    .from('communications')
    .select('*')
    .in('user_id', memberIds)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Calculate key metrics
  const totalApplications = applications?.length || 0;
  const averageProfileCompletion = profiles?.length > 0 
    ? profiles.reduce((sum, p) => sum + (p.profile_completion || 0), 0) / profiles.length
    : 0;

  const applicationsByStatus = applications?.reduce((acc: any, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const teamProductivity = {
    totalUsers: memberIds.length,
    activeUsers: new Set(applications?.map(a => a.user_id)).size,
    communicationsCount: communications?.length || 0,
    averageApplicationsPerUser: memberIds.length > 0 ? totalApplications / memberIds.length : 0
  };

  const performanceMetrics = {
    applicationSuccessRate: totalApplications > 0 
      ? ((applicationsByStatus.accepted || 0) / totalApplications) * 100 
      : 0,
    interviewRate: totalApplications > 0 
      ? ((applicationsByStatus.interview_scheduled || 0) / totalApplications) * 100 
      : 0,
    averageResponseTime: calculateAverageResponseTime(applications || [])
  };

  return {
    timeRange,
    organizationId,
    summary: {
      totalApplications,
      averageProfileCompletion: Math.round(averageProfileCompletion),
      activeUsers: teamProductivity.activeUsers,
      totalUsers: teamProductivity.totalUsers
    },
    teamProductivity,
    performanceMetrics,
    applicationsByStatus,
    trends: generateTrendData(applications || [], timeRange),
    generatedAt: new Date().toISOString()
  };
}

function calculateAverageResponseTime(applications: any[]): number {
  const responseTimes = applications
    .filter(app => app.status !== 'applied')
    .map(app => {
      const applied = new Date(app.applied_at).getTime();
      const updated = new Date(app.updated_at).getTime();
      return (updated - applied) / (1000 * 60 * 60 * 24); // Days
    });

  return responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0;
}

function generateTrendData(applications: any[], timeRange: any) {
  const dailyApplications: { [key: string]: number } = {};
  
  applications.forEach(app => {
    const date = new Date(app.applied_at).toISOString().split('T')[0];
    dailyApplications[date] = (dailyApplications[date] || 0) + 1;
  });

  return Object.entries(dailyApplications).map(([date, count]) => ({
    date,
    applications: count
  }));
}

serve(handler);
