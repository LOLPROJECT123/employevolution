
export interface User {
  id: string;
  email: string;
  name: string;
  profile: UserProfile;
  created_at: string;
}

export interface UserProfile {
  skills: string[];
  experience: 'intern' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  location: string;
  salary_range: {
    min: number;
    max: number;
  };
  preferences: {
    remote: boolean;
    job_types: string[];
    industries: string[];
  };
  resume_url?: string;
  avatar_url?: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  job_id: string;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
  resume_version?: string;
  cover_letter?: string;
  notes?: string;
  follow_up_date?: string;
}

export type ApplicationStatus = 
  | 'applied' 
  | 'phone_screen' 
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer_received'
  | 'offer_accepted'
  | 'rejected'
  | 'withdrawn';

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  saved_at: string;
  notes?: string;
}

export interface JobAlert {
  id: string;
  user_id: string;
  name: string;
  criteria: {
    keywords: string[];
    location?: string;
    salary_min?: number;
    remote?: boolean;
    job_types?: string[];
    companies?: string[];
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  is_active: boolean;
  created_at: string;
  last_triggered?: string;
}
