
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuestionScanRequest {
  url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url }: QuestionScanRequest = await req.json();

    console.log(`Scanning questions from: ${url}`);

    // In a real implementation, this would scrape the page and extract questions
    // For now, we'll return mock questions based on common application patterns
    const questions = generateCommonApplicationQuestions();

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Question scanning error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateCommonApplicationQuestions() {
  return [
    {
      question: "First Name",
      questionHash: "first_name_hash",
      category: "personal",
      isStandard: true,
      platforms: ["indeed", "linkedin", "glassdoor"],
      frequency: 100
    },
    {
      question: "Last Name",
      questionHash: "last_name_hash",
      category: "personal",
      isStandard: true,
      platforms: ["indeed", "linkedin", "glassdoor"],
      frequency: 100
    },
    {
      question: "Email Address",
      questionHash: "email_hash",
      category: "personal",
      isStandard: true,
      platforms: ["indeed", "linkedin", "glassdoor"],
      frequency: 100
    },
    {
      question: "Phone Number",
      questionHash: "phone_hash",
      category: "personal",
      isStandard: true,
      platforms: ["indeed", "linkedin", "glassdoor"],
      frequency: 95
    },
    {
      question: "Are you authorized to work in the United States?",
      questionHash: "work_auth_us_hash",
      category: "legal",
      isStandard: true,
      platforms: ["indeed", "linkedin", "glassdoor", "lever", "greenhouse"],
      frequency: 85
    },
    {
      question: "How many years of experience do you have with JavaScript?",
      questionHash: "javascript_exp_hash",
      category: "technical",
      isStandard: false,
      platforms: ["lever", "greenhouse", "ashby"],
      frequency: 60
    },
    {
      question: "Why are you interested in this role?",
      questionHash: "interest_role_hash",
      category: "behavioral",
      isStandard: false,
      platforms: ["lever", "greenhouse", "workday"],
      frequency: 40
    }
  ];
}
