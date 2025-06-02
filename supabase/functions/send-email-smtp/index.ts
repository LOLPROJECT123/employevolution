
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMTPEmailRequest {
  provider: 'sendgrid' | 'mailgun';
  apiKey: string;
  domain?: string;
  email: {
    to: string;
    subject: string;
    html: string;
    text?: string;
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

    const { provider, apiKey, domain, email }: SMTPEmailRequest = await req.json();

    // Mock SMTP email sending
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Mock ${provider} email sent:`, {
      to: email.to,
      subject: email.subject,
      messageId: messageId,
      provider: provider
    });

    // In real implementation, you would use the actual SMTP service
    if (provider === 'sendgrid') {
      // Mock SendGrid API call
    } else if (provider === 'mailgun') {
      // Mock Mailgun API call
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: messageId 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("SMTP email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
