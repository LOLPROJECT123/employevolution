
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, jobCriteria } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch user's job preferences
    const { data: preferences } = await supabaseClient
      .from('job_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Fetch user's push subscriptions
    const { data: subscriptions } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    // Mock job matching logic (in real implementation, this would use ML algorithms)
    const matchingJobs = await findMatchingJobs(preferences, jobCriteria)

    // Send push notifications for highly matching jobs
    for (const job of matchingJobs) {
      if (job.matchScore > 80) {
        await sendPushNotifications(subscriptions, job)
        
        // Save job recommendation
        await supabaseClient
          .from('job_recommendations')
          .insert({
            user_id: userId,
            job_data: job,
            match_percentage: job.matchScore,
            recommendation_reason: `High match for your ${preferences?.desired_roles?.[0] || 'desired role'} preferences`
          })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        jobsFound: matchingJobs.length,
        notificationsSent: matchingJobs.filter(j => j.matchScore > 80).length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in real-time job notifications:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function findMatchingJobs(preferences: any, criteria: any) {
  // Mock job data with matching logic
  const mockJobs = [
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'TechFlow Inc.',
      location: 'San Francisco, CA',
      salary: '$130,000 - $160,000',
      remote: true,
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: 'Senior'
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'InnovateLab',
      location: 'Austin, TX',
      salary: '$110,000 - $140,000',
      remote: false,
      skills: ['JavaScript', 'Python', 'AWS'],
      experience: 'Mid-Level'
    }
  ]

  // Calculate match scores
  return mockJobs.map(job => ({
    ...job,
    matchScore: calculateMatchScore(job, preferences)
  })).filter(job => job.matchScore > 60)
}

function calculateMatchScore(job: any, preferences: any): number {
  let score = 0
  
  // Location match
  if (preferences?.preferred_locations?.includes(job.location) || job.remote) {
    score += 25
  }
  
  // Role match
  if (preferences?.desired_roles?.some((role: string) => 
    job.title.toLowerCase().includes(role.toLowerCase())
  )) {
    score += 30
  }
  
  // Skills match
  const userSkills = preferences?.skills || []
  const jobSkills = job.skills || []
  const skillMatches = jobSkills.filter((skill: string) => 
    userSkills.some((userSkill: string) => 
      userSkill.toLowerCase().includes(skill.toLowerCase())
    )
  )
  score += (skillMatches.length / jobSkills.length) * 30
  
  // Experience level match
  if (preferences?.experience_level === job.experience) {
    score += 15
  }
  
  return Math.min(100, score)
}

async function sendPushNotifications(subscriptions: any[], job: any) {
  const vapidKeys = {
    publicKey: Deno.env.get('VAPID_PUBLIC_KEY'),
    privateKey: Deno.env.get('VAPID_PRIVATE_KEY')
  }

  if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
    console.warn('VAPID keys not configured')
    return
  }

  const payload = JSON.stringify({
    title: 'New Job Match!',
    body: `${job.title} at ${job.company} (${job.matchScore}% match)`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      jobId: job.id,
      url: `/jobs/${job.id}`
    }
  })

  for (const subscription of subscriptions || []) {
    try {
      // In a real implementation, you would use a proper Web Push library
      // For now, this is a placeholder
      console.log(`Would send push notification to ${subscription.endpoint}`)
      console.log(`Payload: ${payload}`)
    } catch (error) {
      console.error('Failed to send push notification:', error)
    }
  }
}
