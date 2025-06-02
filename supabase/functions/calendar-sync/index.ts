
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarSyncRequest {
  provider: 'google' | 'outlook';
  clientId: string;
  clientSecret: string;
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

    const { provider, clientId, clientSecret }: CalendarSyncRequest = await req.json();

    // Mock calendar sync implementation
    const events = [
      {
        id: 'cal_event_1',
        title: 'Interview with Tech Corp',
        description: 'Technical interview for Software Engineer position',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
        location: 'Virtual - Zoom',
        attendees: ['interviewer@techcorp.com']
      }
    ];

    // Store calendar integration (mock)
    console.log('Mock calendar integration stored:', {
      user_id: user.id,
      provider: provider,
      client_id: clientId,
      is_active: true,
      connected_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({ 
      success: true, 
      events: events,
      provider: provider
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Calendar sync error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
