
import { CompleteProfileDataService, CompleteProfileData, ProfileCompletionMetrics } from './completeProfileDataService';
import { supabase } from '@/integrations/supabase/client';

export interface ValidationRule {
  field: string;
  required: boolean;
  minLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  errorMessage: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
  fieldValidations: Record<string, FieldValidation>;
}

export interface ValidationError {
  field: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  severity: 'error' | 'warning' | 'suggestion';
}

export interface FieldValidation {
  isValid: boolean;
  score: number;
  message?: string;
  suggestions?: string[];
}

export class EnhancedValidationService {
  private static validationRules: ValidationRule[] = [
    // Personal Info Rules
    {
      field: 'personalInfo.name',
      required: true,
      minLength: 2,
      errorMessage: 'Full name is required and must be at least 2 characters',
      priority: 'high'
    },
    {
      field: 'personalInfo.email',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Valid email address is required',
      priority: 'high'
    },
    {
      field: 'personalInfo.phone',
      required: true,
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
      errorMessage: 'Valid phone number is required',
      priority: 'high'
    },
    {
      field: 'personalInfo.location',
      required: true,
      minLength: 2,
      errorMessage: 'Location is required for job matching',
      priority: 'medium'
    },
    {
      field: 'personalInfo.linkedin_url',
      required: false,
      pattern: /^https:\/\/(www\.)?linkedin\.com\/.*$/,
      errorMessage: 'LinkedIn URL must be a valid LinkedIn profile link',
      priority: 'medium'
    },

    // Work Experience Rules
    {
      field: 'workExperiences',
      required: true,
      customValidator: (experiences: any[]) => experiences && experiences.length > 0,
      errorMessage: 'At least one work experience is required',
      priority: 'high'
    },

    // Education Rules
    {
      field: 'education',
      required: true,
      customValidator: (education: any[]) => education && education.length > 0,
      errorMessage: 'Educational background is required',
      priority: 'medium'
    },

    // Skills Rules
    {
      field: 'skills',
      required: true,
      customValidator: (skills: any[]) => skills && skills.length >= 3,
      errorMessage: 'At least 3 skills are required for effective job matching',
      priority: 'high'
    }
  ];

  // Validate complete profile with comprehensive checks
  static async validateCompleteProfile(userId: string): Promise<ValidationResult> {
    try {
      console.log('Starting comprehensive profile validation for user:', userId);

      const profileData = await CompleteProfileDataService.loadCompleteProfile(userId);
      
      if (!profileData) {
        return this.getEmptyValidationResult('Unable to load profile data');
      }

      const errors: ValidationError[] = [];
      const warnings: ValidationError[] = [];
      const suggestions: ValidationError[] = [];
      const fieldValidations: Record<string, FieldValidation> = {};

      // Run validation rules
      for (const rule of this.validationRules) {
        const validation = this.validateField(profileData, rule);
        fieldValidations[rule.field] = validation;

        if (!validation.isValid) {
          const error: ValidationError = {
            field: rule.field,
            message: rule.errorMessage,
            priority: rule.priority,
            severity: rule.required ? 'error' : 'warning'
          };

          if (rule.required) {
            errors.push(error);
          } else {
            warnings.push(error);
          }
        }
      }

      // Generate suggestions for improvement
      const profileSuggestions = await this.generateProfileSuggestions(profileData);
      suggestions.push(...profileSuggestions);

      // Calculate overall validation score
      const score = this.calculateValidationScore(fieldValidations, profileData);

      const result: ValidationResult = {
        isValid: errors.length === 0,
        score,
        errors,
        warnings,
        suggestions,
        fieldValidations
      };

      // Save validation results to database
      await this.saveValidationResults(userId, result);

      console.log('Profile validation completed. Score:', score);
      return result;

    } catch (error) {
      console.error('Error during profile validation:', error);
      return this.getEmptyValidationResult('Validation failed due to system error');
    }
  }

  // Validate individual field against rule
  private static validateField(profileData: CompleteProfileData, rule: ValidationRule): FieldValidation {
    const fieldPath = rule.field.split('.');
    let value = profileData as any;

    // Navigate to the field value
    for (const path of fieldPath) {
      value = value?.[path];
    }

    let isValid = true;
    let score = 100;
    const suggestions: string[] = [];

    // Check if required field is present
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return {
        isValid: false,
        score: 0,
        message: rule.errorMessage,
        suggestions: [`Add ${rule.field.split('.').pop()}`]
      };
    }

    // Skip validation if field is not required and empty
    if (!rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return {
        isValid: true,
        score: 0,
        suggestions: [`Consider adding ${rule.field.split('.').pop()} for better profile completeness`]
      };
    }

    // Check minimum length
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      isValid = false;
      score = Math.max(0, (value.length / rule.minLength) * 100);
      suggestions.push(`Should be at least ${rule.minLength} characters`);
    }

    // Check pattern
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      isValid = false;
      score = 0;
      suggestions.push(`Format is invalid`);
    }

    // Check custom validator
    if (rule.customValidator && !rule.customValidator(value)) {
      isValid = false;
      score = 0;
    }

    return {
      isValid,
      score: Math.round(score),
      message: isValid ? undefined : rule.errorMessage,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  // Generate profile improvement suggestions
  private static async generateProfileSuggestions(profileData: CompleteProfileData): Promise<ValidationError[]> {
    const suggestions: ValidationError[] = [];

    // Check for advanced profile features
    if (!profileData.personalInfo.github_url && this.hasITSkills(profileData.skills)) {
      suggestions.push({
        field: 'personalInfo.github_url',
        message: 'Add GitHub profile to showcase your coding projects',
        priority: 'medium',
        severity: 'suggestion'
      });
    }

    if (!profileData.personalInfo.portfolio_url) {
      suggestions.push({
        field: 'personalInfo.portfolio_url',
        message: 'Portfolio website can significantly improve your profile visibility',
        priority: 'low',
        severity: 'suggestion'
      });
    }

    // Check work experience quality
    const recentExperience = profileData.workExperiences[0];
    if (recentExperience && (!recentExperience.description || recentExperience.description.length < 3)) {
      suggestions.push({
        field: 'workExperiences',
        message: 'Add detailed descriptions with quantifiable achievements to your work experience',
        priority: 'medium',
        severity: 'suggestion'
      });
    }

    // Check skills diversity
    if (profileData.skills.length < 8) {
      suggestions.push({
        field: 'skills',
        message: 'Consider adding more skills to improve job matching accuracy',
        priority: 'low',
        severity: 'suggestion'
      });
    }

    // Check for projects
    if (profileData.projects.length === 0) {
      suggestions.push({
        field: 'projects',
        message: 'Adding projects can showcase your practical experience',
        priority: 'medium',
        severity: 'suggestion'
      });
    }

    // Check for leadership/activities
    if (profileData.activities.length === 0) {
      suggestions.push({
        field: 'activities',
        message: 'Leadership activities can demonstrate soft skills and initiative',
        priority: 'low',
        severity: 'suggestion'
      });
    }

    // Check for multiple languages
    if (profileData.languages.length < 2) {
      suggestions.push({
        field: 'languages',
        message: 'Multiple languages can be valuable in today\'s global job market',
        priority: 'low',
        severity: 'suggestion'
      });
    }

    return suggestions;
  }

  // Check if user has IT/programming skills
  private static hasITSkills(skills: any[]): boolean {
    const itKeywords = ['programming', 'development', 'software', 'coding', 'javascript', 'python', 'java', 'react', 'angular', 'vue', 'node', 'sql', 'database'];
    
    return skills.some(skill => 
      itKeywords.some(keyword => 
        skill.skill.toLowerCase().includes(keyword)
      )
    );
  }

  // Calculate overall validation score
  private static calculateValidationScore(fieldValidations: Record<string, FieldValidation>, profileData: CompleteProfileData): number {
    const weights = {
      'personalInfo.name': 15,
      'personalInfo.email': 10,
      'personalInfo.phone': 10,
      'personalInfo.location': 10,
      'personalInfo.linkedin_url': 8,
      'workExperiences': 20,
      'education': 12,
      'skills': 15
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [field, validation] of Object.entries(fieldValidations)) {
      const weight = weights[field as keyof typeof weights] || 5;
      totalScore += validation.score * weight;
      totalWeight += weight;
    }

    // Add bonus points for additional features
    if (profileData.projects.length > 0) totalScore += 300; // 5 * 60 (equivalent weight)
    if (profileData.activities.length > 0) totalScore += 180; // 3 * 60
    if (profileData.languages.length > 1) totalScore += 120; // 2 * 60

    totalWeight += 10; // Additional weight for bonus features

    return Math.min(100, Math.round(totalScore / totalWeight));
  }

  // Save validation results to database
  private static async saveValidationResults(userId: string, result: ValidationResult): Promise<void> {
    try {
      // Update user metrics with validation score
      await supabase.from('user_metrics').upsert({
        user_id: userId,
        profile_quality_score: result.score,
        last_activity_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Update profile completion tracking
      await supabase.from('profile_completion_tracking').upsert({
        user_id: userId,
        completion_percentage: result.score,
        missing_fields: result.errors.map(e => e.field),
        last_updated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error saving validation results:', error);
    }
  }

  // Get empty validation result for error cases
  private static getEmptyValidationResult(errorMessage: string): ValidationResult {
    return {
      isValid: false,
      score: 0,
      errors: [{
        field: 'system',
        message: errorMessage,
        priority: 'high',
        severity: 'error'
      }],
      warnings: [],
      suggestions: [],
      fieldValidations: {}
    };
  }

  // Quick validation check for specific sections
  static async validateSection(userId: string, section: keyof CompleteProfileData): Promise<FieldValidation> {
    try {
      const profileData = await CompleteProfileDataService.loadCompleteProfile(userId);
      
      if (!profileData) {
        return {
          isValid: false,
          score: 0,
          message: 'Unable to load profile data'
        };
      }

      const sectionData = profileData[section];
      const relevantRules = this.validationRules.filter(rule => rule.field.startsWith(section));

      let isValid = true;
      let totalScore = 0;
      const messages: string[] = [];

      for (const rule of relevantRules) {
        const validation = this.validateField(profileData, rule);
        if (!validation.isValid) {
          isValid = false;
          messages.push(validation.message || rule.errorMessage);
        }
        totalScore += validation.score;
      }

      const averageScore = relevantRules.length > 0 ? totalScore / relevantRules.length : 0;

      return {
        isValid,
        score: Math.round(averageScore),
        message: messages.length > 0 ? messages.join('; ') : undefined
      };

    } catch (error) {
      console.error('Error validating section:', error);
      return {
        isValid: false,
        score: 0,
        message: 'Section validation failed'
      };
    }
  }

  // Get validation summary for dashboard
  static async getValidationSummary(userId: string): Promise<{
    overallScore: number;
    completionPercentage: number;
    priorityIssues: string[];
    recommendations: string[];
  }> {
    try {
      const validation = await this.validateCompleteProfile(userId);
      const metrics = await CompleteProfileDataService.calculateProfileMetrics(userId);

      return {
        overallScore: validation.score,
        completionPercentage: metrics.overallCompletion,
        priorityIssues: validation.errors
          .filter(e => e.priority === 'high')
          .map(e => e.message)
          .slice(0, 3),
        recommendations: metrics.recommendations.slice(0, 3)
      };

    } catch (error) {
      console.error('Error getting validation summary:', error);
      return {
        overallScore: 0,
        completionPercentage: 0,
        priorityIssues: [],
        recommendations: []
      };
    }
  }
}
