
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResumeOptimizationRequest {
  resumeContent: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeContent }: ResumeOptimizationRequest = await req.json();

    // Analyze resume content and generate suggestions
    const suggestions = analyzeResumeContent(resumeContent);

    return new Response(JSON.stringify({ 
      success: true, 
      suggestions 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Resume optimization error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

function analyzeResumeContent(resumeContent: any) {
  const suggestions = [];

  // Analyze summary section
  if (!resumeContent.summary || resumeContent.summary.length < 100) {
    suggestions.push({
      id: '1',
      section: 'summary',
      type: 'improvement',
      title: 'Enhance Professional Summary',
      description: 'Your summary should be 2-3 sentences highlighting your key achievements and skills',
      impact: 'high',
      confidence: 0.9,
      suggestedText: 'Consider adding specific metrics and quantifiable achievements to make your summary more compelling'
    });
  }

  // Analyze work experience
  if (resumeContent.workExperience && resumeContent.workExperience.length > 0) {
    resumeContent.workExperience.forEach((exp: any, index: number) => {
      if (!exp.description || !exp.description.some((desc: string) => /\d+/.test(desc))) {
        suggestions.push({
          id: `exp_${index}`,
          section: 'experience',
          type: 'improvement',
          title: 'Add Quantifiable Achievements',
          description: `Add specific numbers and metrics to ${exp.company} role`,
          impact: 'high',
          confidence: 0.85,
          originalText: exp.description?.[0] || '',
          suggestedText: 'Include percentages, dollar amounts, or other measurable results'
        });
      }
    });
  }

  // Analyze skills section
  if (!resumeContent.skills || resumeContent.skills.length < 5) {
    suggestions.push({
      id: 'skills_1',
      section: 'skills',
      type: 'addition',
      title: 'Expand Skills Section',
      description: 'Add more relevant technical and soft skills',
      impact: 'medium',
      confidence: 0.75
    });
  }

  return suggestions;
}

serve(handler);
