
import { supabase } from '@/integrations/supabase/client';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  completionScore: number;
}

export interface ProfileValidationRules {
  requiredFields: string[];
  minimumWorkExperience: number;
  minimumEducation: boolean;
  skillsRequired: number;
  contactInfoRequired: boolean;
}

export class AdvancedProfileValidationService {
  private static defaultRules: ProfileValidationRules = {
    requiredFields: ['name', 'email', 'phone', 'location'],
    minimumWorkExperience: 1,
    minimumEducation: true,
    skillsRequired: 3,
    contactInfoRequired: true
  };

  static async validateProfile(userId: string, customRules?: Partial<ProfileValidationRules>): Promise<ValidationResult> {
    const rules = { ...this.defaultRules, ...customRules };
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let completionScore = 0;

    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Failed to fetch user profile:', profileError);
        return {
          isValid: false,
          errors: ['Failed to fetch profile data'],
          warnings: [],
          suggestions: [],
          completionScore: 0
        };
      }

      // Check required fields
      const requiredFieldChecks = {
        name: profile?.name,
        email: profile?.user_id, // We have user_id which means email exists
        phone: profile?.phone,
        location: profile?.location
      };

      rules.requiredFields.forEach(field => {
        if (!requiredFieldChecks[field as keyof typeof requiredFieldChecks]) {
          errors.push(`${field} is required`);
        } else {
          completionScore += 20;
        }
      });

      // Check work experience
      const { data: workExperience } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('user_id', userId);

      if (!workExperience || workExperience.length < rules.minimumWorkExperience) {
        errors.push(`Minimum ${rules.minimumWorkExperience} work experience entries required`);
      } else {
        completionScore += 25;
      }

      // Check education
      const { data: education } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', userId);

      if (rules.minimumEducation && (!education || education.length === 0)) {
        errors.push('At least one education entry is required');
      } else if (education && education.length > 0) {
        completionScore += 20;
      }

      // Check skills
      const { data: skills } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId);

      if (!skills || skills.length < rules.skillsRequired) {
        warnings.push(`Consider adding more skills (minimum ${rules.skillsRequired} recommended)`);
      } else {
        completionScore += 15;
      }

      // Check job preferences
      const { data: jobPreferences } = await supabase
        .from('job_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!jobPreferences) {
        suggestions.push('Set up job preferences to get better recommendations');
      } else {
        completionScore += 10;

        // Check if job preferences are detailed enough
        if (!jobPreferences.desired_roles || jobPreferences.desired_roles.length === 0) {
          suggestions.push('Add desired roles to your job preferences');
        }
        
        if (!jobPreferences.preferred_locations || jobPreferences.preferred_locations.length === 0) {
          suggestions.push('Add preferred locations to your job preferences');
        }
      }

      // Additional suggestions
      if (profile?.linkedin_url) {
        completionScore += 5;
      } else {
        suggestions.push('Add your LinkedIn profile URL');
      }

      if (profile?.github_url) {
        completionScore += 5;
      } else {
        suggestions.push('Add your GitHub profile URL for technical roles');
      }

      // Cap completion score at 100
      completionScore = Math.min(completionScore, 100);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions,
        completionScore
      };

    } catch (error) {
      console.error('Profile validation failed:', error);
      return {
        isValid: false,
        errors: ['Profile validation failed due to system error'],
        warnings: [],
        suggestions: [],
        completionScore: 0
      };
    }
  }

  static async getValidationRules(): Promise<ProfileValidationRules> {
    return this.defaultRules;
  }

  static async updateValidationRules(rules: Partial<ProfileValidationRules>): Promise<void> {
    // In a real implementation, you might store custom validation rules per user or organization
    Object.assign(this.defaultRules, rules);
  }

  static async generateImprovementPlan(userId: string): Promise<{
    priority: 'high' | 'medium' | 'low';
    tasks: Array<{
      task: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      estimatedTime: string;
    }>;
  }> {
    try {
      const validation = await this.validateProfile(userId);
      const tasks = [];

      // High priority tasks from errors
      validation.errors.forEach(error => {
        tasks.push({
          task: error,
          description: `Fix: ${error}`,
          priority: 'high' as const,
          estimatedTime: '5-10 minutes'
        });
      });

      // Medium priority tasks from warnings
      validation.warnings.forEach(warning => {
        tasks.push({
          task: warning,
          description: `Address: ${warning}`,
          priority: 'medium' as const,
          estimatedTime: '10-15 minutes'
        });
      });

      // Low priority tasks from suggestions
      validation.suggestions.forEach(suggestion => {
        tasks.push({
          task: suggestion,
          description: `Consider: ${suggestion}`,
          priority: 'low' as const,
          estimatedTime: '5 minutes'
        });
      });

      const overallPriority = validation.errors.length > 0 ? 'high' :
                            validation.warnings.length > 0 ? 'medium' : 'low';

      return {
        priority: overallPriority,
        tasks: tasks.slice(0, 10) // Limit to top 10 tasks
      };

    } catch (error) {
      console.error('Failed to generate improvement plan:', error);
      return {
        priority: 'low',
        tasks: []
      };
    }
  }
}
