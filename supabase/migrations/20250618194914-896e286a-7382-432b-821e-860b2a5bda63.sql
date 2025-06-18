
-- Create table for storing scraped jobs
CREATE TABLE IF NOT EXISTS public.scraped_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  remote BOOLEAN DEFAULT false,
  job_type TEXT, -- 'full-time', 'part-time', 'contract', 'internship'
  description TEXT,
  requirements TEXT[],
  skills TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  apply_url TEXT,
  source_platform TEXT, -- 'linkedin', 'indeed', 'glassdoor', etc.
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_active ON public.scraped_jobs (is_active, scraped_at);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_remote ON public.scraped_jobs (remote);
CREATE INDEX IF NOT EXISTS idx_scraped_jobs_type ON public.scraped_jobs (job_type);

-- Create table for user job preferences
CREATE TABLE IF NOT EXISTS public.user_job_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  preferred_roles TEXT[],
  preferred_locations TEXT[],
  remote_only BOOLEAN DEFAULT false,
  job_types TEXT[], -- ['full-time', 'internship', etc.]
  salary_min INTEGER,
  salary_max INTEGER,
  excluded_companies TEXT[],
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create table for job applications tracking
CREATE TABLE IF NOT EXISTS public.job_applications_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  job_id UUID REFERENCES public.scraped_jobs,
  external_job_id TEXT, -- for jobs from external platforms
  company_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'applied', -- 'applied', 'viewed', 'interview', 'rejected', 'offer'
  platform TEXT, -- 'linkedin', 'indeed', etc.
  application_url TEXT,
  resume_used TEXT, -- which resume version was used
  cover_letter_used TEXT,
  notes TEXT,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  interview_scheduled TIMESTAMP WITH TIME ZONE,
  salary_offered INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for Chrome extension usage logs
CREATE TABLE IF NOT EXISTS public.extension_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  platform TEXT NOT NULL, -- 'linkedin', 'indeed', etc.
  action TEXT NOT NULL, -- 'autofill', 'submit', 'error'
  job_url TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create RLS policies
ALTER TABLE public.scraped_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_job_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extension_usage_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for scraped jobs
CREATE POLICY "Anyone can view active jobs" ON public.scraped_jobs
  FOR SELECT USING (is_active = true);

-- User-specific policies for preferences
CREATE POLICY "Users can manage their job preferences" ON public.user_job_preferences
  FOR ALL USING (auth.uid() = user_id);

-- User-specific policies for application tracking
CREATE POLICY "Users can manage their application tracking" ON public.job_applications_tracking
  FOR ALL USING (auth.uid() = user_id);

-- User-specific policies for extension logs
CREATE POLICY "Users can view their extension logs" ON public.extension_usage_logs
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update job match scores
CREATE OR REPLACE FUNCTION calculate_job_match_score(
  job_id UUID,
  user_skills TEXT[],
  user_preferences JSONB
) RETURNS INTEGER AS $$
DECLARE
  job_record RECORD;
  skill_match_count INTEGER := 0;
  total_skills INTEGER := 0;
  location_match BOOLEAN := false;
  type_match BOOLEAN := false;
  final_score INTEGER := 0;
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM public.scraped_jobs WHERE id = job_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate skill match
  IF job_record.skills IS NOT NULL AND array_length(job_record.skills, 1) > 0 THEN
    total_skills := array_length(job_record.skills, 1);
    
    SELECT COUNT(*) INTO skill_match_count
    FROM unnest(job_record.skills) AS job_skill
    WHERE job_skill = ANY(user_skills);
    
    final_score := final_score + (skill_match_count * 100 / total_skills);
  END IF;
  
  -- Check location match
  IF user_preferences->>'remote_only' = 'true' AND job_record.remote = true THEN
    location_match := true;
    final_score := final_score + 20;
  END IF;
  
  -- Check job type match
  IF user_preferences->'job_types' ? job_record.job_type THEN
    type_match := true;
    final_score := final_score + 15;
  END IF;
  
  -- Cap at 100
  RETURN LEAST(final_score, 100);
END;
$$ LANGUAGE plpgsql;
