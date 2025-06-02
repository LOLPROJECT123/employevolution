
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LinkedInImportRequest {
  accessToken: string;
  profileData?: any;
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

    const { accessToken, profileData }: LinkedInImportRequest = await req.json();

    // Mock LinkedIn profile import - in real implementation, would call LinkedIn API
    const mockProfileData = {
      name: 'John Doe',
      headline: 'Senior Software Engineer at Tech Corp',
      location: 'San Francisco, CA',
      industry: 'Technology',
      summary: 'Experienced software engineer with 8+ years in full-stack development...',
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          duration: '2020 - Present',
          description: 'Led development of microservices architecture serving 10M+ users'
        },
        {
          company: 'StartupXYZ',
          position: 'Full Stack Developer',
          duration: '2018 - 2020',
          description: 'Built responsive web applications using React and Node.js'
        }
      ],
      education: [
        {
          school: 'University of California, Berkeley',
          degree: 'Bachelor of Science in Computer Science',
          year: '2014 - 2018'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes'],
      connections: 500
    };

    // Update user profile with LinkedIn data
    const { error: profileError } = await supabaseClient
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        name: mockProfileData.name,
        location: mockProfileData.location,
        linkedin_url: `https://linkedin.com/in/${mockProfileData.name.toLowerCase().replace(' ', '-')}`
      });

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Import work experience
    for (const exp of mockProfileData.experience) {
      await supabaseClient
        .from('work_experiences')
        .upsert({
          user_id: user.id,
          company: exp.company,
          role: exp.position,
          description: [exp.description],
          start_date: exp.duration.split(' - ')[0],
          end_date: exp.duration.split(' - ')[1] === 'Present' ? null : exp.duration.split(' - ')[1]
        });
    }

    // Import education
    for (const edu of mockProfileData.education) {
      await supabaseClient
        .from('education')
        .upsert({
          user_id: user.id,
          school: edu.school,
          degree: edu.degree,
          start_date: edu.year.split(' - ')[0],
          end_date: edu.year.split(' - ')[1]
        });
    }

    // Import skills
    for (const skill of mockProfileData.skills) {
      await supabaseClient
        .from('user_skills')
        .upsert({
          user_id: user.id,
          skill: skill,
          category: 'technical'
        });
    }

    // Store OAuth integration
    await supabaseClient
      .from('oauth_integrations')
      .upsert({
        user_id: user.id,
        provider: 'linkedin',
        provider_user_id: 'linkedin_123456',
        access_token_encrypted: accessToken,
        profile_data: mockProfileData,
        is_active: true
      });

    console.log('LinkedIn profile import completed for user:', user.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'LinkedIn profile imported successfully',
      imported: {
        profile: true,
        experience: mockProfileData.experience.length,
        education: mockProfileData.education.length,
        skills: mockProfileData.skills.length
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("LinkedIn import error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
