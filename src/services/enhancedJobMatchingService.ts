
import { supabase } from '@/integrations/supabase/client';

export interface JobMatchResult {
  job: any;
  matchScore: number;
  matchReasons: string[];
  skillMatches: string[];
  missingSkills: string[];
}

export interface UserJobPreferences {
  preferred_roles: string[];
  preferred_locations: string[];
  remote_only: boolean;
  job_types: string[];
  salary_min?: number;
  salary_max?: number;
  excluded_companies: string[];
  keywords: string[];
}

class EnhancedJobMatchingService {
  async getJobRecommendations(
    userId: string,
    limit: number = 20
  ): Promise<JobMatchResult[]> {
    // Get user profile and preferences
    const [userProfile, userPreferences, userSkills] = await Promise.all([
      this.getUserProfile(userId),
      this.getUserPreferences(userId),
      this.getUserSkills(userId)
    ]);

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Get active jobs
    const jobs = await this.getActiveJobs(userPreferences);

    // Calculate match scores for each job
    const jobMatches: JobMatchResult[] = [];

    for (const job of jobs) {
      const matchResult = await this.calculateJobMatch(
        job,
        userProfile,
        userPreferences,
        userSkills
      );

      if (matchResult.matchScore > 30) { // Only include jobs with >30% match
        jobMatches.push(matchResult);
      }
    }

    // Sort by match score and return top results
    return jobMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  private async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  private async getUserPreferences(userId: string): Promise<UserJobPreferences | null> {
    const { data, error } = await supabase
      .from('user_job_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }

    return data;
  }

  private async getUserSkills(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_skills')
      .select('skill')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user skills:', error);
      return [];
    }

    return data?.map(item => item.skill) || [];
  }

  private async getActiveJobs(preferences: UserJobPreferences | null) {
    let query = supabase
      .from('scraped_jobs')
      .select('*')
      .eq('is_active', true);

    if (preferences) {
      if (preferences.remote_only) {
        query = query.eq('remote', true);
      }

      if (preferences.job_types.length > 0) {
        query = query.in('job_type', preferences.job_types);
      }

      if (preferences.salary_min) {
        query = query.gte('salary_min', preferences.salary_min);
      }

      if (preferences.excluded_companies.length > 0) {
        query = query.not('company', 'in', `(${preferences.excluded_companies.join(',')})`);
      }
    }

    const { data, error } = await query.order('scraped_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }

    return data || [];
  }

  private async calculateJobMatch(
    job: any,
    userProfile: any,
    userPreferences: UserJobPreferences | null,
    userSkills: string[]
  ): Promise<JobMatchResult> {
    let matchScore = 0;
    const matchReasons: string[] = [];
    const skillMatches: string[] = [];
    const missingSkills: string[] = [];

    // Skills matching (40% of total score)
    if (job.skills && job.skills.length > 0 && userSkills.length > 0) {
      const jobSkills = job.skills.map((skill: string) => skill.toLowerCase());
      const userSkillsLower = userSkills.map(skill => skill.toLowerCase());

      for (const jobSkill of jobSkills) {
        const matchingUserSkill = userSkillsLower.find(userSkill => 
          userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
        );

        if (matchingUserSkill) {
          skillMatches.push(jobSkill);
        } else {
          missingSkills.push(jobSkill);
        }
      }

      const skillMatchPercentage = (skillMatches.length / jobSkills.length) * 100;
      matchScore += (skillMatchPercentage * 0.4);

      if (skillMatches.length > 0) {
        matchReasons.push(`${skillMatches.length} matching skills: ${skillMatches.slice(0, 3).join(', ')}`);
      }
    }

    // Job type preference (20% of total score)
    if (userPreferences?.job_types.includes(job.job_type)) {
      matchScore += 20;
      matchReasons.push(`Preferred job type: ${job.job_type}`);
    }

    // Location/Remote preference (20% of total score)
    if (userPreferences?.remote_only && job.remote) {
      matchScore += 20;
      matchReasons.push('Remote position matches preference');
    } else if (!userPreferences?.remote_only && userPreferences?.preferred_locations.some(
      (location: string) => job.location?.toLowerCase().includes(location.toLowerCase())
    )) {
      matchScore += 15;
      matchReasons.push(`Location matches preference: ${job.location}`);
    }

    // Salary matching (10% of total score)
    if (userPreferences?.salary_min && job.salary_min && job.salary_min >= userPreferences.salary_min) {
      matchScore += 10;
      matchReasons.push('Salary meets minimum requirement');
    }

    // Title/Role matching (10% of total score)
    if (userPreferences?.preferred_roles.some(
      (role: string) => job.title.toLowerCase().includes(role.toLowerCase())
    )) {
      matchScore += 10;
      matchReasons.push('Job title matches preferred role');
    }

    // Keyword matching in description
    if (userPreferences?.keywords.length > 0) {
      const keywordMatches = userPreferences.keywords.filter((keyword: string) =>
        job.description.toLowerCase().includes(keyword.toLowerCase())
      );

      if (keywordMatches.length > 0) {
        matchScore += Math.min(keywordMatches.length * 2, 10);
        matchReasons.push(`Keywords found: ${keywordMatches.slice(0, 3).join(', ')}`);
      }
    }

    return {
      job,
      matchScore: Math.min(Math.round(matchScore), 100),
      matchReasons,
      skillMatches,
      missingSkills
    };
  }

  async saveUserPreferences(userId: string, preferences: Partial<UserJobPreferences>): Promise<void> {
    const { error } = await supabase
      .from('user_job_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  async saveJobRecommendation(userId: string, jobId: string, matchScore: number, matchingSkills: string[], missingSkills: string[]): Promise<void> {
    const { error } = await supabase
      .from('job_recommendations')
      .insert({
        user_id: userId,
        job_data: { job_id: jobId },
        match_percentage: matchScore,
        matching_skills: matchingSkills,
        missing_skills: missingSkills,
        recommendation_reason: `${matchScore}% match based on skills and preferences`
      });

    if (error) {
      console.error('Error saving job recommendation:', error);
    }
  }
}

export const enhancedJobMatchingService = new EnhancedJobMatchingService();
