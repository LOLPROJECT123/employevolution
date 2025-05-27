
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobSearchParams {
  query: string;
  location?: string;
  page?: number;
  limit?: number;
  remote?: boolean;
  salary_min?: number;
  salary_max?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchParams, source } = await req.json()
    
    const adzunaAppId = Deno.env.get('ADZUNA_APP_ID')
    const adzunaAppKey = Deno.env.get('ADZUNA_APP_KEY')
    const serpApiKey = Deno.env.get('SERPAPI_KEY')
    const theMuseApiKey = Deno.env.get('THEMUSE_API_KEY')

    let jobs = []

    if (source === 'adzuna' && adzunaAppId && adzunaAppKey) {
      jobs = await searchAdzunaJobs(searchParams, adzunaAppId, adzunaAppKey)
    } else if (source === 'google' && serpApiKey) {
      jobs = await searchGoogleJobs(searchParams, serpApiKey)
    } else if (source === 'themuse' && theMuseApiKey) {
      jobs = await searchTheMuseJobs(searchParams)
    } else {
      // Return mock data if API keys are missing
      jobs = generateMockJobs(searchParams)
    }

    return new Response(
      JSON.stringify({ jobs, total: jobs.length }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Job search error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function searchAdzunaJobs(params: JobSearchParams, appId: string, appKey: string) {
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/us/search/${params.page || 1}`)
  url.searchParams.append('app_id', appId)
  url.searchParams.append('app_key', appKey)
  
  if (params.query) url.searchParams.append('what', params.query)
  if (params.location) url.searchParams.append('where', params.location)
  if (params.limit) url.searchParams.append('results_per_page', params.limit.toString())
  if (params.salary_min) url.searchParams.append('salary_min', params.salary_min.toString())
  if (params.salary_max) url.searchParams.append('salary_max', params.salary_max.toString())

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`)
  }

  const data = await response.json()
  
  return (data.results || []).map((job: any) => ({
    id: job.id?.toString() || `adzuna-${Date.now()}-${Math.random()}`,
    title: job.title || 'Unknown Position',
    company: job.company?.display_name || 'Unknown Company',
    location: job.location?.display_name || 'Remote',
    description: job.description || 'No description available',
    requirements: extractRequirements(job.description || ''),
    salary: {
      min: job.salary_min || 0,
      max: job.salary_max || 0,
      currency: 'USD'
    },
    type: 'full-time',
    level: inferLevel(job.title || ''),
    postedAt: job.created || new Date().toISOString(),
    skills: extractSkills(job.description || ''),
    remote: isRemote(job.location?.display_name || ''),
    applyUrl: job.redirect_url,
    source: 'Adzuna',
    matchPercentage: Math.floor(Math.random() * 40) + 60,
    companyType: 'private',
    companySize: 'mid-size',
    workModel: isRemote(job.location?.display_name || '') ? 'remote' : 'onsite'
  }))
}

async function searchGoogleJobs(params: JobSearchParams, apiKey: string) {
  const url = new URL('https://serpapi.com/search')
  url.searchParams.append('engine', 'google_jobs')
  url.searchParams.append('api_key', apiKey)
  url.searchParams.append('q', params.query || 'software engineer')
  if (params.location) url.searchParams.append('location', params.location)
  if (params.remote) url.searchParams.append('chips', 'employment_type:FULLTIME,date_posted:month')

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    throw new Error(`Google Jobs API error: ${response.status}`)
  }

  const data = await response.json()
  
  return (data.jobs_results || []).map((job: any) => ({
    id: `google-${job.job_id || Date.now()}-${Math.random()}`,
    title: job.title || 'Unknown Position',
    company: job.company_name || 'Unknown Company',
    location: job.location || 'Remote',
    description: job.description || 'No description available',
    requirements: extractRequirements(job.description || ''),
    salary: parseSalary(job.salary),
    type: parseJobType(job.schedule_type),
    level: inferLevel(job.title || ''),
    postedAt: job.detected_extensions?.posted_at || new Date().toISOString(),
    skills: extractSkills(job.description || ''),
    remote: isRemote(job.location || ''),
    applyUrl: job.apply_link,
    source: 'Google Jobs',
    matchPercentage: Math.floor(Math.random() * 40) + 60,
    companyType: 'private',
    companySize: 'mid-size',
    workModel: isRemote(job.location || '') ? 'remote' : 'onsite'
  }))
}

async function searchTheMuseJobs(params: JobSearchParams) {
  const url = new URL('https://www.themuse.com/api/public/jobs')
  if (params.query) url.searchParams.append('category', params.query)
  if (params.location) url.searchParams.append('location', params.location)
  url.searchParams.append('page', (params.page || 1).toString())

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    throw new Error(`The Muse API error: ${response.status}`)
  }

  const data = await response.json()
  
  return (data.results || []).map((job: any) => ({
    id: `themuse-${job.id || Date.now()}-${Math.random()}`,
    title: job.name || 'Unknown Position',
    company: job.company?.name || 'Unknown Company',
    location: job.locations?.[0]?.name || 'Remote',
    description: job.contents || 'No description available',
    requirements: extractRequirements(job.contents || ''),
    salary: { min: 0, max: 0, currency: 'USD' },
    type: 'full-time',
    level: inferLevel(job.name || ''),
    postedAt: job.publication_date || new Date().toISOString(),
    skills: extractSkills(job.contents || ''),
    remote: job.locations?.some((loc: any) => loc.name.toLowerCase().includes('remote')),
    applyUrl: job.refs?.landing_page,
    source: 'The Muse',
    matchPercentage: Math.floor(Math.random() * 40) + 60,
    companyType: 'private',
    companySize: 'mid-size',
    workModel: job.locations?.some((loc: any) => loc.name.toLowerCase().includes('remote')) ? 'remote' : 'onsite'
  }))
}

function extractRequirements(description: string): string[] {
  const requirements = []
  const lowerDesc = description.toLowerCase()
  
  if (lowerDesc.includes('bachelor') || lowerDesc.includes('degree')) {
    requirements.push("Bachelor's degree required")
  }
  if (lowerDesc.includes('experience')) {
    const match = description.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i)
    if (match) {
      requirements.push(`${match[1]}+ years of experience required`)
    } else {
      requirements.push("Previous experience required")
    }
  }
  
  return requirements
}

function extractSkills(description: string): string[] {
  const skillKeywords = [
    'javascript', 'typescript', 'python', 'java', 'react', 'node.js', 
    'aws', 'docker', 'kubernetes', 'sql', 'postgresql', 'mongodb',
    'vue', 'angular', 'express', 'django', 'flask', 'spring'
  ]
  
  const foundSkills = skillKeywords.filter(skill => 
    description.toLowerCase().includes(skill)
  )
  
  return foundSkills.map(skill => 
    skill.charAt(0).toUpperCase() + skill.slice(1)
  ).slice(0, 8)
}

function inferLevel(title: string): string {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes('senior') || lowerTitle.includes('sr.')) return 'senior'
  if (lowerTitle.includes('junior') || lowerTitle.includes('jr.')) return 'entry'
  if (lowerTitle.includes('lead') || lowerTitle.includes('principal')) return 'lead'
  if (lowerTitle.includes('manager') || lowerTitle.includes('head')) return 'manager'
  if (lowerTitle.includes('director') || lowerTitle.includes('vp')) return 'director'
  if (lowerTitle.includes('intern')) return 'intern'
  return 'mid'
}

function isRemote(location: string): boolean {
  const lowerLocation = location.toLowerCase()
  return lowerLocation.includes('remote') || 
         lowerLocation.includes('anywhere') || 
         lowerLocation.includes('work from home')
}

function parseSalary(salaryText: string | undefined): { min: number; max: number; currency: string } {
  if (!salaryText) return { min: 0, max: 0, currency: 'USD' }
  
  const numbers = salaryText.match(/\$?([\d,]+)/g)
  if (numbers && numbers.length >= 2) {
    const min = parseInt(numbers[0].replace(/[,$]/g, ''))
    const max = parseInt(numbers[1].replace(/[,$]/g, ''))
    return { min, max, currency: 'USD' }
  } else if (numbers && numbers.length === 1) {
    const salary = parseInt(numbers[0].replace(/[,$]/g, ''))
    return { min: salary * 0.9, max: salary * 1.1, currency: 'USD' }
  }
  
  return { min: 0, max: 0, currency: 'USD' }
}

function parseJobType(scheduleType: string | undefined): string {
  if (!scheduleType) return 'full-time'
  
  const lower = scheduleType.toLowerCase()
  if (lower.includes('part')) return 'part-time'
  if (lower.includes('contract')) return 'contract'
  if (lower.includes('intern')) return 'internship'
  if (lower.includes('temp')) return 'temporary'
  
  return 'full-time'
}

function generateMockJobs(params: JobSearchParams) {
  return Array.from({ length: params.limit || 10 }, (_, i) => ({
    id: `mock-${Date.now()}-${i}`,
    title: `Software Engineer ${i + 1}`,
    company: `Tech Company ${i + 1}`,
    location: params.location || 'San Francisco, CA',
    description: 'Exciting opportunity to work with cutting-edge technology.',
    requirements: ["Bachelor's degree in Computer Science", "3+ years experience"],
    salary: { min: 80000 + (i * 5000), max: 120000 + (i * 5000), currency: 'USD' },
    type: 'full-time',
    level: 'mid',
    postedAt: new Date().toISOString(),
    skills: ['JavaScript', 'React', 'TypeScript'],
    remote: Math.random() > 0.5,
    applyUrl: `https://example.com/apply/${i}`,
    source: 'Mock API',
    matchPercentage: Math.floor(Math.random() * 40) + 60,
    companyType: 'private',
    companySize: 'mid-size',
    workModel: 'remote'
  }))
}
