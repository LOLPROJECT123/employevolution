
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
  accessToken?: string;
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

    const { provider, clientId, clientSecret, accessToken }: CalendarSyncRequest = await req.json();

    let events = [];
    
    if (provider === 'google' && accessToken) {
      const eventsResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      const eventsData = await eventsResponse.json();
      events = eventsData.items || [];
    } else if (provider === 'outlook' && accessToken) {
      const eventsResponse = await fetch(
        'https://graph.microsoft.com/v1.0/me/events',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      const eventsData = await eventsResponse.json();
      events = eventsData.value || [];
    }

    // Store events in database
    for (const event of events) {
      await supabaseClient
        .from('calendar_events')
        .upsert({
          user_id: user.id,
          external_event_id: event.id,
          title: event.summary || event.subject,
          description: event.description || event.body?.content,
          start_time: event.start?.dateTime || event.start?.date,
          end_time: event.end?.dateTime || event.end?.date,
          location: event.location?.displayName || event.location,
          provider: provider,
          synced_at: new Date().toISOString()
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      events: events.length 
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
