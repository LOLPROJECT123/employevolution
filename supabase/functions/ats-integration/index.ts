
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ATSIntegrationRequest {
  provider: 'greenhouse' | 'lever' | 'workday';
  apiKey: string;
  baseUrl: string;
  action?: 'connect' | 'sync_jobs' | 'sync_applications';
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

    const { provider, apiKey, baseUrl, action }: ATSIntegrationRequest = await req.json();

    let result = {};

    if (provider === 'greenhouse') {
      // Test connection first
      const testResponse = await fetch(`${baseUrl}/v1/departments`, {
        headers: {
          'Authorization': `Basic ${btoa(apiKey + ':')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!testResponse.ok) {
        throw new Error('Greenhouse API connection failed');
      }

      if (action === 'sync_jobs') {
        const jobsResponse = await fetch(`${baseUrl}/v1/jobs`, {
          headers: {
            'Authorization': `Basic ${btoa(apiKey + ':')}`,
            'Content-Type': 'application/json',
          },
        });

        const jobsData = await jobsResponse.json();
        result = { jobs: jobsData.length };

        // Store jobs in database
        for (const job of jobsData) {
          await supabaseClient
            .from('ats_jobs')
            .upsert({
              user_id: user.id,
              ats_provider: provider,
              external_job_id: job.id.toString(),
              title: job.name,
              department: job.departments?.[0]?.name,
              location: job.offices?.[0]?.name,
              status: job.status,
              created_at: job.created_at,
              updated_at: job.updated_at,
              synced_at: new Date().toISOString()
            });
        }
      }
    } else if (provider === 'lever') {
      const testResponse = await fetch(`${baseUrl}/v1/opportunities`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!testResponse.ok) {
        throw new Error('Lever API connection failed');
      }

      result = { connected: true };
    }

    // Store ATS integration
    await supabaseClient
      .from('ats_integrations')
      .upsert({
        user_id: user.id,
        ats_provider: provider,
        api_key_encrypted: apiKey, // Should encrypt in production
        base_url: baseUrl,
        is_active: true,
        connected_at: new Date().toISOString(),
        last_sync: new Date().toISOString()
      });

    return new Response(JSON.stringify({ 
      success: true, 
      ...result 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("ATS integration error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
