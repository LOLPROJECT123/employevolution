
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  content: string;
  templateId?: string;
  variables?: Record<string, any>;
  from?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, content, templateId, variables, from }: EmailRequest = await req.json();

    // Default sender
    const sender = from || "EmployEvolution <noreply@employevolution.com>";

    let emailContent = content;

    // Apply template if specified
    if (templateId) {
      emailContent = await applyTemplate(templateId, variables || {}, content);
    }

    // Send email
    const emailResponse = await resend.emails.send({
      from: sender,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      id: emailResponse.data?.id,
      message: "Email sent successfully"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email-enhanced function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function applyTemplate(templateId: string, variables: Record<string, any>, content: string): Promise<string> {
  const templates: Record<string, string> = {
    'job_application': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Job Application Confirmation</h2>
        <p>Dear {{name}},</p>
        <p>Thank you for applying to the <strong>{{jobTitle}}</strong> position at <strong>{{company}}</strong>.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${content}
        </div>
        <p>We will review your application and get back to you soon.</p>
        <p>Best regards,<br>The EmployEvolution Team</p>
      </div>
    `,
    'interview_reminder': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Interview Reminder</h2>
        <p>Dear {{name}},</p>
        <p>This is a reminder about your upcoming interview for the <strong>{{jobTitle}}</strong> position.</p>
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> {{date}}</p>
          <p><strong>Time:</strong> {{time}}</p>
          <p><strong>Location:</strong> {{location}}</p>
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${content}
        </div>
        <p>Good luck with your interview!</p>
        <p>Best regards,<br>The EmployEvolution Team</p>
      </div>
    `,
    'security_alert': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">Security Alert</h2>
        <p>Dear User,</p>
        <p>We detected unusual activity on your EmployEvolution account.</p>
        <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d32f2f;">
          ${content}
        </div>
        <p>If this was not you, please change your password immediately and contact support.</p>
        <p>Stay secure,<br>The EmployEvolution Security Team</p>
      </div>
    `
  };

  let template = templates[templateId] || content;

  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, String(value));
  });

  return template;
}

serve(handler);
