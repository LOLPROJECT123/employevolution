
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PredictiveAnalyticsRequest {
  userId: string;
  analysisType?: 'job_match' | 'salary_prediction' | 'success_rate';
  jobData?: any;
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

    const { userId, analysisType, jobData }: PredictiveAnalyticsRequest = await req.json();

    // Get user profile and experience data
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: workExperiences } = await supabaseClient
      .from('work_experiences')
      .select('*')
      .eq('user_id', userId);

    const { data: skills } = await supabaseClient
      .from('user_skills')
      .select('*')
      .eq('user_id', userId);

    const { data: applications } = await supabaseClient
      .from('job_applications')
      .select('*')
      .eq('user_id', userId);

    // Calculate predictive insights
    const insights = calculatePredictiveInsights({
      profile,
      workExperiences: workExperiences || [],
      skills: skills || [],
      applications: applications || [],
      jobData,
      analysisType
    });

    // Store analytics result
    await supabaseClient
      .from('analytics_results')
      .insert({
        user_id: userId,
        analysis_type: analysisType || 'general',
        insights,
        created_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({ 
      success: true, 
      insights 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Predictive analytics error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

function calculatePredictiveInsights(data: any) {
  const { workExperiences, skills, applications, jobData, analysisType } = data;

  // Calculate experience score
  const experienceYears = workExperiences.length * 2; // Simplified calculation
  const skillsCount = skills.length;
  const applicationSuccessRate = applications.length > 0 
    ? applications.filter((app: any) => app.status === 'accepted').length / applications.length 
    : 0.5;

  let jobMatchProbability = 0.5;
  let salaryRange = { min: 50000, max: 80000 };
  let successFactors = [];
  let recommendations = [];

  if (analysisType === 'job_match' && jobData) {
    // Calculate job match probability
    const skillMatch = calculateSkillMatch(skills, jobData.required_skills || []);
    const experienceMatch = experienceYears >= (jobData.required_experience || 2) ? 1 : 0.7;
    
    jobMatchProbability = (skillMatch + experienceMatch + applicationSuccessRate) / 3;
    
    successFactors = [
      `${Math.round(skillMatch * 100)}% skill match`,
      `${experienceYears} years experience`,
      `${Math.round(applicationSuccessRate * 100)}% application success rate`
    ];

    if (jobMatchProbability < 0.7) {
      recommendations.push('Consider gaining additional skills in the required areas');
      recommendations.push('Update your resume to highlight relevant experience');
    }
  } else if (analysisType === 'salary_prediction') {
    // Predict salary range based on experience and skills
    const baseSalary = 40000 + (experienceYears * 5000) + (skillsCount * 2000);
    salaryRange = {
      min: Math.round(baseSalary * 0.8),
      max: Math.round(baseSalary * 1.3)
    };

    successFactors = [
      'Years of experience',
      'Number of technical skills',
      'Application success rate'
    ];

    recommendations = [
      'Consider negotiating based on your experience level',
      'Highlight your unique skills during interviews'
    ];
  }

  return {
    jobMatchProbability: Math.round(jobMatchProbability * 100) / 100,
    salaryRange,
    successFactors,
    recommendations,
    analysisDate: new Date().toISOString(),
    dataPoints: {
      experienceYears,
      skillsCount,
      applicationSuccessRate: Math.round(applicationSuccessRate * 100) / 100
    }
  };
}

function calculateSkillMatch(userSkills: any[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 1;
  
  const userSkillNames = userSkills.map(s => s.skill.toLowerCase());
  const matchingSkills = requiredSkills.filter(skill => 
    userSkillNames.includes(skill.toLowerCase())
  );
  
  return matchingSkills.length / requiredSkills.length;
}

serve(handler);
