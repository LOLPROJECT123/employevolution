
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobBoardSearchRequest {
  keywords: string;
  location: string;
  sources: ('indeed' | 'linkedin' | 'monster')[];
  page?: number;
  limit?: number;
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

    const { keywords, location, sources, page = 1, limit = 20 }: JobBoardSearchRequest = await req.json();

    const allJobs = [];

    // Search each source
    for (const source of sources) {
      try {
        let jobs = [];

        if (source === 'indeed') {
          // Use Indeed API (requires partnership)
          // For demo, return mock data
          jobs = Array.from({ length: 5 }, (_, i) => ({
            id: `indeed_${Date.now()}_${i}`,
            title: `${keywords} Position ${i + 1}`,
            company: `Indeed Company ${i + 1}`,
            location: location,
            description: `Great opportunity for ${keywords} in ${location}`,
            salary: `$${60000 + (i * 10000)} - $${80000 + (i * 10000)}`,
            posted_date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
            apply_url: `https://indeed.com/apply/mock-${i}`,
            source: 'indeed'
          }));
        } else if (source === 'linkedin') {
          // Use LinkedIn Job Search API
          jobs = Array.from({ length: 5 }, (_, i) => ({
            id: `linkedin_${Date.now()}_${i}`,
            title: `${keywords} Role ${i + 1}`,
            company: `LinkedIn Corp ${i + 1}`,
            location: location,
            description: `Exciting ${keywords} opportunity at LinkedIn Corp`,
            salary: `$${70000 + (i * 15000)} - $${90000 + (i * 15000)}`,
            posted_date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
            apply_url: `https://linkedin.com/jobs/apply/mock-${i}`,
            source: 'linkedin'
          }));
        } else if (source === 'monster') {
          jobs = Array.from({ length: 5 }, (_, i) => ({
            id: `monster_${Date.now()}_${i}`,
            title: `${keywords} Expert ${i + 1}`,
            company: `Monster Inc ${i + 1}`,
            location: location,
            description: `Monster opportunity for ${keywords} professionals`,
            salary: `$${65000 + (i * 12000)} - $${85000 + (i * 12000)}`,
            posted_date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
            apply_url: `https://monster.com/apply/mock-${i}`,
            source: 'monster'
          }));
        }

        allJobs.push(...jobs);
      } catch (error) {
        console.error(`Error searching ${source}:`, error);
      }
    }

    // Store search results
    await supabaseClient
      .from('job_search_results')
      .insert({
        user_id: user.id,
        keywords,
        location,
        sources,
        results_count: allJobs.length,
        search_date: new Date().toISOString()
      });

    return new Response(JSON.stringify({ 
      success: true, 
      jobs: allJobs,
      total: allJobs.length,
      page,
      sources_searched: sources
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Job board search error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
