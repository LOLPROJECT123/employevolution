
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ATSSyncRequest {
  atsSystem: 'greenhouse' | 'lever' | 'workday' | 'bamboohr';
  apiKey: string;
  companyId?: string;
  syncTypes: ('applications' | 'interviews' | 'offers')[];
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

    const { atsSystem, apiKey, companyId, syncTypes }: ATSSyncRequest = await req.json();

    // Mock ATS data sync - in real implementation, would integrate with actual ATS APIs
    const mockSyncResults = {
      applications: syncTypes.includes('applications') ? await syncApplications(supabaseClient, user.id, atsSystem) : null,
      interviews: syncTypes.includes('interviews') ? await syncInterviews(supabaseClient, user.id, atsSystem) : null,
      offers: syncTypes.includes('offers') ? await syncOffers(supabaseClient, user.id, atsSystem) : null
    };

    // Update ATS integration record
    await supabaseClient
      .from('ats_integrations')
      .upsert({
        user_id: user.id,
        ats_system: atsSystem,
        company_name: companyId || 'Unknown Company',
        integration_status: 'connected',
        last_sync_at: new Date().toISOString(),
        sync_data_types: syncTypes,
        credentials_encrypted: apiKey
      });

    const totalSynced = Object.values(mockSyncResults)
      .filter(result => result !== null)
      .reduce((sum, result: any) => sum + (result?.count || 0), 0);

    console.log(`ATS sync completed for ${atsSystem}:`, mockSyncResults);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Synced ${totalSynced} records from ${atsSystem}`,
      results: mockSyncResults,
      atsSystem,
      lastSyncAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("ATS sync error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

async function syncApplications(supabaseClient: any, userId: string, atsSystem: string) {
  const mockApplications = [
    {
      job_id: `${atsSystem}_job_1`,
      user_id: userId,
      status: 'under_review',
      applied_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: `Application synced from ${atsSystem}`,
      application_url: `https://${atsSystem}.com/applications/123`
    },
    {
      job_id: `${atsSystem}_job_2`,
      user_id: userId,
      status: 'interview_scheduled',
      applied_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      notes: `Application synced from ${atsSystem}`,
      application_url: `https://${atsSystem}.com/applications/456`
    }
  ];

  for (const app of mockApplications) {
    await supabaseClient.from('job_applications').upsert(app);
  }

  return { count: mockApplications.length, type: 'applications' };
}

async function syncInterviews(supabaseClient: any, userId: string, atsSystem: string) {
  const mockInterviews = [
    {
      user_id: userId,
      company_name: 'Tech Corp',
      position_title: 'Senior Software Engineer',
      interview_type: 'technical',
      scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      interviewer_name: 'Jane Smith',
      interviewer_email: 'jane.smith@techcorp.com',
      status: 'scheduled',
      notes: `Interview synced from ${atsSystem}`
    }
  ];

  for (const interview of mockInterviews) {
    await supabaseClient.from('interviews').upsert(interview);
  }

  return { count: mockInterviews.length, type: 'interviews' };
}

async function syncOffers(supabaseClient: any, userId: string, atsSystem: string) {
  // Mock offer data - would sync actual offers from ATS
  const mockOffers = [
    {
      user_id: userId,
      company_name: 'Tech Corp',
      position_title: 'Senior Software Engineer',
      salary_offered: 120000,
      offer_date: new Date().toISOString(),
      status: 'pending',
      notes: `Offer synced from ${atsSystem}`
    }
  ];

  // For now, store in job_applications with offer status
  for (const offer of mockOffers) {
    await supabaseClient.from('job_applications').upsert({
      job_id: `${atsSystem}_offer_${Date.now()}`,
      user_id: userId,
      status: 'offer_received',
      salary_offered: offer.salary_offered,
      notes: offer.notes,
      applied_at: offer.offer_date
    });
  }

  return { count: mockOffers.length, type: 'offers' };
}

serve(handler);
