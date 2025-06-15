
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contact, template, userProfile, jobDetails, emailType } = await req.json();

    const prompt = generateEmailPrompt(contact, template, userProfile, jobDetails, emailType);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at writing professional networking emails that get responses. Write concise, personalized, and engaging emails.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    const generatedEmail = data.choices[0].message.content;

    return new Response(JSON.stringify({ generatedEmail }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating email:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEmailPrompt(contact: any, template: any, userProfile: any, jobDetails: any, emailType: string) {
  let prompt = `Generate a professional ${emailType} email with the following details:\n\n`;
  
  prompt += `Recipient: ${contact.name}, ${contact.title} at ${contact.company}\n`;
  prompt += `Sender: ${userProfile.name}\n`;
  
  if (contact.schoolMatch) {
    prompt += `Connection: Both attended ${contact.schoolMatch}\n`;
  }
  
  if (jobDetails) {
    prompt += `Job being discussed: ${jobDetails.title} at ${jobDetails.company}\n`;
  }
  
  prompt += `Email type: ${emailType}\n\n`;
  
  switch (emailType) {
    case 'referral':
      prompt += `Write a polite email asking for a referral. Keep it brief, explain the shared connection, and mention specific qualifications.`;
      break;
    case 'coffee_chat':
      prompt += `Write an email requesting a brief 15-minute coffee chat or phone call to learn about the company culture and role. Be respectful of their time.`;
      break;
    case 'networking':
      prompt += `Write a general networking email to build a professional connection. Mention shared background if applicable.`;
      break;
    case 'follow_up':
      prompt += `Write a follow-up email after previous communication. Be polite and provide updates on application status.`;
      break;
  }
  
  prompt += `\n\nThe email should be:\n- Professional but friendly\n- Concise (under 150 words)\n- Personalized\n- Include a clear call to action\n- Have an appropriate subject line`;
  
  return prompt;
}
