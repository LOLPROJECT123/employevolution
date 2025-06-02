
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  userId?: string;
  type: 'job_match' | 'interview_reminder' | 'application_update' | 'system' | 'marketing';
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: any;
  channels: ('in_app' | 'email' | 'push')[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor?: string;
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

    const notificationRequest: NotificationRequest = await req.json();
    const targetUserId = notificationRequest.userId || user.id;

    // Get user notification preferences
    const { data: preferences } = await supabaseClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    // Check if user wants this type of notification
    if (!shouldSendNotification(notificationRequest, preferences)) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Notification blocked by user preferences',
        sent: false
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const results = {
      inApp: false,
      email: false,
      push: false
    };

    // Send in-app notification
    if (notificationRequest.channels.includes('in_app')) {
      results.inApp = await sendInAppNotification(supabaseClient, targetUserId, notificationRequest);
    }

    // Send email notification
    if (notificationRequest.channels.includes('email') && preferences?.email_notifications) {
      results.email = await sendEmailNotification(supabaseClient, targetUserId, notificationRequest);
    }

    // Send push notification
    if (notificationRequest.channels.includes('push') && preferences?.push_notifications) {
      results.push = await sendPushNotification(supabaseClient, targetUserId, notificationRequest);
    }

    // Log the notification dispatch
    await supabaseClient.from('api_usage_logs').insert({
      user_id: user.id,
      endpoint: '/notification-dispatcher',
      method: 'POST',
      status_code: 200,
      response_time_ms: Date.now() % 1000,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    });

    console.log('Notification dispatched:', {
      targetUserId,
      type: notificationRequest.type,
      channels: notificationRequest.channels,
      results
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Notification dispatched successfully',
      results,
      notificationType: notificationRequest.type
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Notification dispatch error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

function shouldSendNotification(request: NotificationRequest, preferences: any): boolean {
  if (!preferences) return true; // Default to sending if no preferences set

  switch (request.type) {
    case 'job_match':
      return preferences.job_match_alerts;
    case 'interview_reminder':
      return preferences.interview_reminders;
    case 'application_update':
      return preferences.application_updates;
    default:
      return true;
  }
}

async function sendInAppNotification(supabaseClient: any, userId: string, request: NotificationRequest): Promise<boolean> {
  try {
    const { error } = await supabaseClient.from('notifications').insert({
      user_id: userId,
      type: request.type,
      title: request.title,
      message: request.message,
      action_url: request.actionUrl,
      is_read: false
    });

    return !error;
  } catch (error) {
    console.error('In-app notification error:', error);
    return false;
  }
}

async function sendEmailNotification(supabaseClient: any, userId: string, request: NotificationRequest): Promise<boolean> {
  try {
    // Get user email
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profile) return false;

    // Mock email sending - in real implementation, would integrate with email service
    const emailData = {
      to: profile.email || 'user@example.com',
      subject: request.title,
      body: generateEmailBody(request),
      priority: request.priority
    };

    // Log email in email_logs table
    await supabaseClient.from('email_logs').insert({
      user_id: userId,
      recipient_email: emailData.to,
      sender_email: 'notifications@careercatalyst.com',
      subject: emailData.subject,
      status: 'sent',
      sent_at: new Date().toISOString(),
      email_provider: 'notification_service'
    });

    console.log('Mock email notification sent:', emailData);
    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
}

async function sendPushNotification(supabaseClient: any, userId: string, request: NotificationRequest): Promise<boolean> {
  try {
    // Get user's push subscription
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('push_subscription')
      .eq('user_id', userId)
      .single();

    if (!profile?.push_subscription) return false;

    // Mock push notification - in real implementation, would use web push protocol
    const pushPayload = {
      title: request.title,
      body: request.message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: request.actionUrl,
        type: request.type,
        metadata: request.metadata
      }
    };

    console.log('Mock push notification sent:', pushPayload);
    return true;
  } catch (error) {
    console.error('Push notification error:', error);
    return false;
  }
}

function generateEmailBody(request: NotificationRequest): string {
  const baseTemplate = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333;">CareerCatalyst</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #333;">${request.title}</h2>
          <p style="color: #666; line-height: 1.6;">${request.message}</p>
          ${request.actionUrl ? `
            <div style="text-align: center; margin-top: 30px;">
              <a href="${request.actionUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Details
              </a>
            </div>
          ` : ''}
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>You're receiving this because you have notifications enabled in CareerCatalyst.</p>
          <p><a href="https://app.careercatalyst.com/settings">Update your notification preferences</a></p>
        </div>
      </body>
    </html>
  `;

  return baseTemplate;
}

serve(handler);
