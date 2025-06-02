
import { supabase } from '@/integrations/supabase/client';

export interface ValidationRule {
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  industry?: string;
  weight: number;
}

export interface ProfileScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  breakdown: {
    completeness: number;
    quality: number;
    relevance: number;
    optimization: number;
  };
  suggestions: string[];
  industryRelevance: number;
}

export class AdvancedProfileValidationService {
  private static validationRules: ValidationRule[] = [
    {
      field: 'personalInfo.name',
      rule: 'required',
      message: 'Full name is required for professional networking',
      severity: 'error',
      weight: 10
    },
    {
      field: 'personalInfo.email',
      rule: 'professional_email',
      message: 'Use a professional email address (avoid generic providers for senior roles)',
      severity: 'warning',
      weight: 5
    },
    {
      field: 'workExperiences',
      rule: 'min_length:1',
      message: 'At least one work experience is required',
      severity: 'error',
      weight: 15
    },
    {
      field: 'workExperiences[].description',
      rule: 'achievement_focused',
      message: 'Include quantified achievements and impact metrics',
      severity: 'warning',
      weight: 10
    },
    {
      field: 'skills',
      rule: 'industry_relevant',
      message: 'Include industry-relevant skills and technologies',
      severity: 'info',
      weight: 8
    },
    {
      field: 'education',
      rule: 'relevant_education',
      message: 'Educational background supports career goals',
      severity: 'info',
      weight: 7
    }
  ];

  private static industrySkillsMaps = {
    'Software Engineering': ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Git'],
    'Data Science': ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'Statistics'],
    'Product Management': ['Analytics', 'A/B Testing', 'Roadmapping', 'Stakeholder Management', 'Agile'],
    'Marketing': ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics', 'Social Media'],
    'Sales': ['CRM', 'Lead Generation', 'Negotiation', 'Account Management', 'Pipeline Management']
  };

  static async validateProfile(userId: string, profileData: any): Promise<ProfileScore> {
    try {
      console.log('Running advanced profile validation for user:', userId);

      const completenessScore = this.calculateCompletenessScore(profileData);
      const qualityScore = this.calculateQualityScore(profileData);
      const relevanceScore = await this.calculateRelevanceScore(profileData, userId);
      const optimizationScore = this.calculateOptimizationScore(profileData);

      const totalScore = completenessScore + qualityScore + relevanceScore + optimizationScore;
      const maxScore = 100;
      const percentage = Math.round((totalScore / maxScore) * 100);

      const suggestions = this.generateSuggestions(profileData);
      const industryRelevance = this.calculateIndustryRelevance(profileData);

      return {
        totalScore,
        maxScore,
        percentage,
        breakdown: {
          completeness: Math.round((completenessScore / 25) * 100),
          quality: Math.round((qualityScore / 25) * 100),
          relevance: Math.round((relevanceScore / 25) * 100),
          optimization: Math.round((optimizationScore / 25) * 100)
        },
        suggestions,
        industryRelevance
      };
    } catch (error) {
      console.error('Profile validation failed:', error);
      return {
        totalScore: 0,
        maxScore: 100,
        percentage: 0,
        breakdown: { completeness: 0, quality: 0, relevance: 0, optimization: 0 },
        suggestions: ['Unable to validate profile. Please try again.'],
        industryRelevance: 0
      };
    }
  }

  private static calculateCompletenessScore(profileData: any): number {
    const requiredFields = [
      'personalInfo.name',
      'personalInfo.email',
      'personalInfo.phone',
      'personalInfo.location',
      'workExperiences',
      'skills',
      'education'
    ];

    let score = 0;
    const maxScore = 25;
    const fieldWeight = maxScore / requiredFields.length;

    requiredFields.forEach(field => {
      const value = this.getNestedValue(profileData, field);
      if (value) {
        if (Array.isArray(value) && value.length > 0) {
          score += fieldWeight;
        } else if (typeof value === 'string' && value.trim().length > 0) {
          score += fieldWeight;
        } else if (typeof value === 'object' && Object.keys(value).length > 0) {
          score += fieldWeight;
        }
      }
    });

    return Math.min(score, maxScore);
  }

  private static calculateQualityScore(profileData: any): number {
    let score = 0;
    const maxScore = 25;

    // Check work experience quality
    if (profileData.workExperiences && profileData.workExperiences.length > 0) {
      const avgDescriptionLength = profileData.workExperiences.reduce((acc: number, exp: any) => {
        const descriptions = exp.description || [];
        return acc + descriptions.join(' ').length;
      }, 0) / profileData.workExperiences.length;

      if (avgDescriptionLength > 200) score += 8;
      else if (avgDescriptionLength > 100) score += 5;
      else if (avgDescriptionLength > 50) score += 3;
    }

    // Check skills diversity
    if (profileData.skills && profileData.skills.length >= 10) score += 7;
    else if (profileData.skills && profileData.skills.length >= 5) score += 5;
    else if (profileData.skills && profileData.skills.length >= 3) score += 3;

    // Check profile summary quality
    if (profileData.personalInfo?.summary) {
      const summaryLength = profileData.personalInfo.summary.length;
      if (summaryLength > 300) score += 5;
      else if (summaryLength > 150) score += 3;
      else if (summaryLength > 50) score += 2;
    }

    // Check education details
    if (profileData.education && profileData.education.length > 0) {
      const hasDetailedEducation = profileData.education.some((edu: any) => 
        edu.degree && edu.field_of_study && edu.school
      );
      if (hasDetailedEducation) score += 5;
    }

    return Math.min(score, maxScore);
  }

  private static async calculateRelevanceScore(profileData: any, userId: string): Promise<number> {
    let score = 0;
    const maxScore = 25;

    try {
      // Get user's job preferences or recent applications to determine target industry
      const { data: preferences } = await supabase
        .from('job_preferences')
        .select('preferred_roles, target_industries')
        .eq('user_id', userId)
        .single();

      if (preferences && preferences.target_industries) {
        const targetIndustry = preferences.target_industries[0];
        const relevantSkills = this.industrySkillsMaps[targetIndustry as keyof typeof this.industrySkillsMaps] || [];
        
        if (profileData.skills && relevantSkills.length > 0) {
          const userSkills = profileData.skills.map((s: any) => s.skill || s);
          const matchingSkills = userSkills.filter((skill: string) => 
            relevantSkills.some(relevantSkill => 
              skill.toLowerCase().includes(relevantSkill.toLowerCase())
            )
          );
          
          const relevanceRatio = matchingSkills.length / relevantSkills.length;
          score += Math.round(relevanceRatio * 15);
        }
      }

      // Check recent work experience relevance
      if (profileData.workExperiences && profileData.workExperiences.length > 0) {
        const recentExperience = profileData.workExperiences[0];
        if (recentExperience && recentExperience.end_date === 'Present') {
          score += 10;
        } else if (recentExperience) {
          const endDate = new Date(recentExperience.end_date);
          const monthsAgo = (Date.now() - endDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          if (monthsAgo <= 6) score += 8;
          else if (monthsAgo <= 12) score += 6;
          else if (monthsAgo <= 24) score += 4;
        }
      }
    } catch (error) {
      console.error('Error calculating relevance score:', error);
      score = 10; // Default score if we can't fetch preferences
    }

    return Math.min(score, maxScore);
  }

  private static calculateOptimizationScore(profileData: any): number {
    let score = 0;
    const maxScore = 25;

    // Check for ATS-friendly formatting
    if (profileData.personalInfo?.name && !profileData.personalInfo.name.includes('|')) {
      score += 3;
    }

    // Check for keyword optimization
    if (profileData.skills && profileData.skills.length >= 8) {
      score += 5;
    }

    // Check for quantified achievements
    if (profileData.workExperiences) {
      const hasQuantifiedAchievements = profileData.workExperiences.some((exp: any) => {
        const descriptions = exp.description || [];
        return descriptions.some((desc: string) => 
          /\d+%|\$\d+|[0-9]+x|increased|improved|reduced|generated/i.test(desc)
        );
      });
      if (hasQuantifiedAchievements) score += 8;
    }

    // Check for social links
    if (profileData.socialLinks?.linkedin) score += 3;
    if (profileData.socialLinks?.github) score += 3;
    if (profileData.socialLinks?.portfolio) score += 3;

    return Math.min(score, maxScore);
  }

  private static generateSuggestions(profileData: any): string[] {
    const suggestions: string[] = [];

    if (!profileData.personalInfo?.summary || profileData.personalInfo.summary.length < 100) {
      suggestions.push('Add a compelling professional summary (150-300 words)');
    }

    if (!profileData.skills || profileData.skills.length < 8) {
      suggestions.push('Add more relevant skills to improve discoverability');
    }

    if (profileData.workExperiences && profileData.workExperiences.length > 0) {
      const hasQuantifiedAchievements = profileData.workExperiences.some((exp: any) => {
        const descriptions = exp.description || [];
        return descriptions.some((desc: string) => /\d+%|\$\d+|[0-9]+x/.test(desc));
      });
      if (!hasQuantifiedAchievements) {
        suggestions.push('Include quantified achievements in your work experience');
      }
    }

    if (!profileData.socialLinks?.linkedin) {
      suggestions.push('Add your LinkedIn profile for professional networking');
    }

    if (!profileData.projects || profileData.projects.length === 0) {
      suggestions.push('Showcase relevant projects to demonstrate your skills');
    }

    return suggestions;
  }

  private static calculateIndustryRelevance(profileData: any): number {
    // Simple industry relevance calculation based on skills
    if (!profileData.skills || profileData.skills.length === 0) return 0;

    const userSkills = profileData.skills.map((s: any) => s.skill || s);
    let maxRelevance = 0;

    Object.entries(this.industrySkillsMaps).forEach(([industry, relevantSkills]) => {
      const matchingSkills = userSkills.filter((skill: string) => 
        relevantSkills.some(relevantSkill => 
          skill.toLowerCase().includes(relevantSkill.toLowerCase())
        )
      );
      const relevance = (matchingSkills.length / relevantSkills.length) * 100;
      maxRelevance = Math.max(maxRelevance, relevance);
    });

    return Math.round(maxRelevance);
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (key.includes('[') && key.includes(']')) {
        const arrayKey = key.split('[')[0];
        return current?.[arrayKey];
      }
      return current?.[key];
    }, obj);
  }
}
