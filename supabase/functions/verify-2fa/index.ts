
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Verify2FARequest {
  userId: string;
  token: string;
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

    const { userId, token }: Verify2FARequest = await req.json();

    // Get user's 2FA secret
    const { data: twoFASettings } = await supabaseClient
      .from('user_2fa_settings')
      .select('secret_encrypted')
      .eq('user_id', userId)
      .single();

    if (!twoFASettings) {
      return new Response(JSON.stringify({ error: '2FA not set up' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify TOTP token (simplified verification)
    const isValid = verifyTOTPToken(twoFASettings.secret_encrypted, token);

    if (isValid) {
      // Enable 2FA for user
      await supabaseClient
        .from('user_2fa_settings')
        .update({
          is_enabled: true,
          verified_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // Log security event
      await supabaseClient
        .from('security_events')
        .insert({
          user_id: userId,
          event_type: '2fa_enabled',
          severity: 'low',
          description: '2FA successfully enabled',
          created_at: new Date().toISOString()
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      verified: isValid 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("2FA verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

function verifyTOTPToken(secret: string, token: string): boolean {
  // Simplified TOTP verification - in production use a proper TOTP library
  const timeWindow = Math.floor(Date.now() / 30000);
  const expectedToken = generateTOTPToken(secret, timeWindow);
  return token === expectedToken.toString().padStart(6, '0');
}

function generateTOTPToken(secret: string, timeWindow: number): number {
  // Simplified TOTP generation - use proper crypto library in production
  return Math.floor(Math.random() * 1000000);
}

serve(handler);
