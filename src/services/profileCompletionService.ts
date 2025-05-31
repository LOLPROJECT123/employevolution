
import { supabase } from '@/integrations/supabase/client';

export interface ProfileCompletionData {
  id?: string;
  user_id: string;
  completion_percentage: number;
  missing_fields: string[];
  last_updated?: string;
}

export interface ProfileCompletionItem {
  field: string;
  label: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

class ProfileCompletionService {
  async getProfileCompletion(userId: string): Promise<ProfileCompletionData | null> {
    const { data, error } = await supabase
      .from('profile_completion_tracking')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile completion:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      missing_fields: Array.isArray(data.missing_fields) 
        ? data.missing_fields as string[]
        : []
    };
  }

  async updateProfileCompletion(userId: string, completionData: Partial<ProfileCompletionData>): Promise<boolean> {
    const { error } = await supabase
      .from('profile_completion_tracking')
      .upsert({
        user_id: userId,
        ...completionData,
        last_updated: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating profile completion:', error);
      return false;
    }

    return true;
  }

  async calculateProfileCompletion(userId: string): Promise<ProfileCompletionItem[]> {
    // Fetch user data from various tables
    const [profile, workExp, education, skills, languages] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('work_experiences').select('*').eq('user_id', userId),
      supabase.from('education').select('*').eq('user_id', userId),
      supabase.from('user_skills').select('*').eq('user_id', userId),
      supabase.from('user_languages').select('*').eq('user_id', userId)
    ]);

    const completionItems: ProfileCompletionItem[] = [
      {
        field: 'basic_info',
        label: 'Basic Information',
        completed: !!(profile.data?.name && profile.data?.phone && profile.data?.location),
        priority: 'high',
        description: 'Add your name, phone number, and location'
      },
      {
        field: 'work_experience',
        label: 'Work Experience',
        completed: (workExp.data?.length || 0) > 0,
        priority: 'high',
        description: 'Add at least one work experience'
      },
      {
        field: 'education',
        label: 'Education',
        completed: (education.data?.length || 0) > 0,
        priority: 'medium',
        description: 'Add your educational background'
      },
      {
        field: 'skills',
        label: 'Skills',
        completed: (skills.data?.length || 0) >= 3,
        priority: 'high',
        description: 'Add at least 3 skills'
      },
      {
        field: 'languages',
        label: 'Languages',
        completed: (languages.data?.length || 0) > 0,
        priority: 'medium',
        description: 'Add languages you speak'
      },
      {
        field: 'social_links',
        label: 'Social Links',
        completed: !!(profile.data?.linkedin_url || profile.data?.github_url),
        priority: 'low',
        description: 'Add LinkedIn or GitHub profile'
      }
    ];

    const completedCount = completionItems.filter(item => item.completed).length;
    const completionPercentage = Math.round((completedCount / completionItems.length) * 100);
    const missingFields = completionItems.filter(item => !item.completed).map(item => item.field);

    // Update completion tracking
    await this.updateProfileCompletion(userId, {
      completion_percentage: completionPercentage,
      missing_fields: missingFields
    });

    return completionItems;
  }
}

export const profileCompletionService = new ProfileCompletionService();
