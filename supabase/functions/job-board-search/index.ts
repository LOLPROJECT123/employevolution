
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobSearchRequest {
  keywords: string;
  location: string;
  sources: ('indeed' | 'linkedin' | 'monster')[];
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

    const { keywords, location, sources }: JobSearchRequest = await req.json();

    // Mock job search results
    const mockJobs = [
      {
        id: 'job_board_1',
        title: `${keywords} Engineer`,
        company: 'TechCorp Inc.',
        location: location,
        description: `Looking for a skilled ${keywords} professional...`,
        salary: '$80,000 - $120,000',
        source: sources[0] || 'indeed',
        url: 'https://example.com/job/1',
        posted_date: new Date().toISOString()
      },
      {
        id: 'job_board_2',
        title: `Senior ${keywords} Developer`,
        company: 'Innovation Labs',
        location: location,
        description: `Join our team as a ${keywords} expert...`,
        salary: '$100,000 - $150,000',
        source: sources[1] || 'linkedin',
        url: 'https://example.com/job/2',
        posted_date: new Date().toISOString()
      }
    ];

    console.log('Job board search performed:', {
      keywords,
      location,
      sources,
      results: mockJobs.length
    });

    return new Response(JSON.stringify({ 
      success: true, 
      jobs: mockJobs,
      total: mockJobs.length
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
