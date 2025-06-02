
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobMatchingRequest {
  resumeContent: any;
  jobDescription: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeContent, jobDescription }: JobMatchingRequest = await req.json();

    const analysis = analyzeJobMatch(resumeContent, jobDescription);

    return new Response(JSON.stringify({ 
      success: true, 
      analysis 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Job matching error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

function analyzeJobMatch(resumeContent: any, jobDescription: string) {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractResumeKeywords(resumeContent);
  
  const matchedKeywords = jobKeywords.filter(keyword => 
    resumeKeywords.some(resumeKeyword => 
      resumeKeyword.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  const missingKeywords = jobKeywords.filter(keyword => 
    !matchedKeywords.some(matched => matched.toLowerCase() === keyword.toLowerCase())
  );

  const matchScore = matchedKeywords.length / jobKeywords.length * 100;

  return {
    matchScore: Math.round(matchScore),
    strengths: generateStrengths(matchedKeywords, resumeContent),
    weaknesses: generateWeaknesses(missingKeywords),
    suggestions: generateSuggestions(missingKeywords, resumeContent),
    keywords: {
      matched: matchedKeywords,
      missing: missingKeywords
    }
  };
}

function extractKeywords(jobDescription: string): string[] {
  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 
    'Kubernetes', 'GraphQL', 'TypeScript', 'MongoDB', 'PostgreSQL',
    'Leadership', 'Team Management', 'Agile', 'Scrum'
  ];
  
  return commonSkills.filter(skill => 
    jobDescription.toLowerCase().includes(skill.toLowerCase())
  );
}

function extractResumeKeywords(resumeContent: any): string[] {
  const keywords = [];
  
  if (resumeContent.skills) {
    keywords.push(...resumeContent.skills);
  }
  
  if (resumeContent.workExperience) {
    resumeContent.workExperience.forEach((exp: any) => {
      if (exp.description) {
        keywords.push(...exp.description.join(' ').match(/\b[A-Z][a-z]+\b/g) || []);
      }
    });
  }
  
  return keywords;
}

function generateStrengths(matchedKeywords: string[], resumeContent: any): string[] {
  const strengths = [];
  
  if (matchedKeywords.length > 5) {
    strengths.push('Strong technical skills alignment');
  }
  
  if (resumeContent.workExperience && resumeContent.workExperience.length >= 3) {
    strengths.push('Extensive work experience');
  }
  
  if (resumeContent.education) {
    strengths.push('Educational background meets requirements');
  }
  
  return strengths;
}

function generateWeaknesses(missingKeywords: string[]): string[] {
  const weaknesses = [];
  
  if (missingKeywords.includes('AWS') || missingKeywords.includes('Docker')) {
    weaknesses.push('Limited cloud platform experience');
  }
  
  if (missingKeywords.includes('Leadership') || missingKeywords.includes('Team Management')) {
    weaknesses.push('Limited leadership experience mentioned');
  }
  
  if (missingKeywords.length > 3) {
    weaknesses.push('Several key skills not highlighted');
  }
  
  return weaknesses;
}

function generateSuggestions(missingKeywords: string[], resumeContent: any) {
  return [
    {
      id: 'suggestion_1',
      section: 'skills',
      type: 'addition',
      title: 'Add Missing Keywords',
      description: `Consider highlighting experience with: ${missingKeywords.slice(0, 3).join(', ')}`,
      impact: 'high',
      confidence: 0.8
    },
    {
      id: 'suggestion_2',
      section: 'experience',
      type: 'improvement',
      title: 'Align Experience Descriptions',
      description: 'Tailor your work descriptions to match the job requirements',
      impact: 'high',
      confidence: 0.9
    }
  ];
}

serve(handler);
