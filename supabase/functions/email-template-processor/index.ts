
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailProcessingRequest {
  templateId?: string;
  templateType: 'follow_up' | 'thank_you' | 'networking' | 'application' | 'custom';
  recipientEmail: string;
  variables: Record<string, any>;
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

    const { templateId, templateType, recipientEmail, variables, scheduledFor }: EmailProcessingRequest = await req.json();

    let template;
    
    if (templateId) {
      // Get specific template
      const { data } = await supabaseClient
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .eq('user_id', user.id)
        .single();
      template = data;
    } else {
      // Get default template for type
      const { data } = await supabaseClient
        .from('email_templates')
        .select('*')
        .eq('category', templateType)
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();
      template = data;
    }

    if (!template) {
      // Use built-in template
      template = getBuiltInTemplate(templateType);
    }

    // Process template variables
    const processedSubject = processTemplate(template.subject, variables);
    const processedBody = processTemplate(template.body, variables);

    // Create email log entry
    const { data: emailLog, error: logError } = await supabaseClient
      .from('email_logs')
      .insert({
        user_id: user.id,
        recipient_email: recipientEmail,
        sender_email: user.email,
        subject: processedSubject,
        template_id: templateId,
        status: scheduledFor ? 'scheduled' : 'pending',
        email_provider: 'sendgrid'
      })
      .select()
      .single();

    if (logError) {
      console.error('Email log error:', logError);
    }

    // If scheduled, store for later processing
    if (scheduledFor) {
      console.log(`Email scheduled for ${scheduledFor}:`, {
        emailLogId: emailLog?.id,
        recipient: recipientEmail,
        subject: processedSubject
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email scheduled successfully',
        emailId: emailLog?.id,
        scheduledFor
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Process immediate email (mock sending)
    const emailResult = await sendEmail({
      to: recipientEmail,
      from: user.email || 'noreply@careercatalyst.com',
      subject: processedSubject,
      body: processedBody,
      templateType
    });

    // Update email log
    if (emailLog) {
      await supabaseClient
        .from('email_logs')
        .update({
          status: emailResult.success ? 'sent' : 'failed',
          sent_at: emailResult.success ? new Date().toISOString() : undefined,
          error_message: emailResult.error
        })
        .eq('id', emailLog.id);
    }

    // Update template usage count
    if (templateId) {
      await supabaseClient
        .from('email_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', templateId);
    }

    console.log('Email processed:', {
      recipient: recipientEmail,
      subject: processedSubject,
      success: emailResult.success
    });

    return new Response(JSON.stringify({ 
      success: emailResult.success, 
      message: emailResult.success ? 'Email sent successfully' : 'Email sending failed',
      emailId: emailLog?.id,
      error: emailResult.error
    }), {
      status: emailResult.success ? 200 : 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Email processing error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

function processTemplate(template: string, variables: Record<string, any>): string {
  let processed = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    processed = processed.replace(regex, String(value));
  }
  
  return processed;
}

function getBuiltInTemplate(type: string) {
  const templates = {
    follow_up: {
      subject: 'Following up on my application - {{position}}',
      body: `Dear {{recruiterName}},

I hope this email finds you well. I wanted to follow up on my application for the {{position}} position at {{company}}.

I'm very excited about the opportunity to contribute to your team and would love to discuss how my experience in {{skills}} can benefit {{company}}.

Please let me know if you need any additional information from my end.

Best regards,
{{name}}`
    },
    thank_you: {
      subject: 'Thank you for your time - {{position}}',
      body: `Dear {{interviewer}},

Thank you for taking the time to speak with me about the {{position}} role at {{company}}. I enjoyed our conversation about {{topicDiscussed}}.

I'm very excited about the opportunity and believe my experience with {{relevantExperience}} would be a great fit for your team.

Please don't hesitate to reach out if you need any additional information.

Best regards,
{{name}}`
    },
    networking: {
      subject: 'Connection request from {{name}}',
      body: `Hi {{contactName}},

I hope you're doing well. I came across your profile and was impressed by your work at {{company}}.

I'm currently {{currentRole}} and am interested in learning more about {{industry}} opportunities.

Would you be open to a brief conversation? I'd love to hear about your experience and share what I'm working on.

Best regards,
{{name}}`
    },
    application: {
      subject: 'Application for {{position}} - {{name}}',
      body: `Dear Hiring Manager,

I am writing to express my interest in the {{position}} position at {{company}}.

With {{yearsExperience}} years of experience in {{field}}, I am confident that my skills in {{keySkills}} make me a strong candidate for this role.

I have attached my resume and look forward to hearing from you.

Best regards,
{{name}}`
    }
  };
  
  return templates[type as keyof typeof templates] || templates.follow_up;
}

async function sendEmail(emailData: {
  to: string;
  from: string;
  subject: string;
  body: string;
  templateType: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Mock email sending - in real implementation, would use SendGrid, Mailgun, etc.
    console.log('Mock email sent:', {
      to: emailData.to,
      from: emailData.from,
      subject: emailData.subject,
      templateType: emailData.templateType
    });

    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    return {
      success,
      error: success ? undefined : 'Mock email sending failure'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

serve(handler);
