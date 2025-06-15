
-- Create application_questions table for storing user answers to common job application questions
CREATE TABLE public.application_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_hash TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'custom',
  platforms TEXT[] DEFAULT '{}',
  frequency INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_standard BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_hash)
);

-- Create networking_contacts table for LinkedIn connections
CREATE TABLE public.networking_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  company TEXT NOT NULL,
  linkedin_url TEXT,
  email TEXT,
  connection_type TEXT NOT NULL DEFAULT 'contact',
  mutual_connections INTEGER DEFAULT 0,
  school_match TEXT,
  last_contacted TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for application_questions
ALTER TABLE public.application_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own application questions" 
  ON public.application_questions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own application questions" 
  ON public.application_questions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own application questions" 
  ON public.application_questions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own application questions" 
  ON public.application_questions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for networking_contacts
ALTER TABLE public.networking_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own networking contacts" 
  ON public.networking_contacts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own networking contacts" 
  ON public.networking_contacts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own networking contacts" 
  ON public.networking_contacts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own networking contacts" 
  ON public.networking_contacts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_application_questions_updated_at 
  BEFORE UPDATE ON public.application_questions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_networking_contacts_updated_at 
  BEFORE UPDATE ON public.networking_contacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
