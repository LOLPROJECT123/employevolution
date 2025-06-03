
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

    let messageId = '';

    if (provider === 'sendgrid') {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: email.to }],
            subject: email.subject,
          }],
          from: { email: 'noreply@yourdomain.com' },
          content: [
            { type: 'text/html', value: email.html },
            { type: 'text/plain', value: email.text || email.html },
          ],
        }),
      });

      if (response.ok) {
        messageId = response.headers.get('x-message-id') || 'sendgrid-' + Date.now();
      } else {
        throw new Error('SendGrid API error: ' + response.statusText);
      }
    } else if (provider === 'mailgun') {
      const formData = new FormData();
      formData.append('from', `noreply@${domain}`);
      formData.append('to', email.to);
      formData.append('subject', email.subject);
      formData.append('html', email.html);
      if (email.text) formData.append('text', email.text);

      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${apiKey}`)}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        messageId = data.id;
      } else {
        throw new Error('Mailgun API error: ' + data.message);
      }
    }

    // Log email
    await supabaseClient
      .from('email_logs')
      .insert({
        user_id: user.id,
        recipient: email.to,
        subject: email.subject,
        provider: provider,
        message_id: messageId,
        sent_at: new Date().toISOString(),
        status: 'sent'
      });

    return new Response(JSON.stringify({ 
      success: true, 
      messageId 
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
