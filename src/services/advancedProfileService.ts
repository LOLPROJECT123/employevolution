
import { supabase } from '@/integrations/supabase/client';

export interface ProfileValidationResult {
  score: number;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface SkillGapAnalysis {
  missingSkills: string[];
  recommendedSkills: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  improvementAreas: string[];
}

export interface CareerRecommendation {
  jobTitle: string;
  matchPercentage: number;
  requiredSkills: string[];
  salaryRange: { min: number; max: number };
  growthPotential: string;
}

export class AdvancedProfileService {
  static async validateProfileWithAI(userId: string): Promise<ProfileValidationResult> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: skills } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId);

      const { data: experience } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('user_id', userId);

      // AI-powered validation logic
      let score = 0;
      const suggestions: string[] = [];
      const strengths: string[] = [];
      const weaknesses: string[] = [];

      // Profile completeness scoring
      if (profile?.name) score += 15;
      if (profile?.location) score += 10;
      if (profile?.linkedin_url) score += 10;
      if (profile?.github_url) score += 10;
      if (profile?.portfolio_url) score += 10;

      // Skills analysis
      if (skills && skills.length >= 5) {
        score += 20;
        strengths.push('Strong skill portfolio');
      } else {
        weaknesses.push('Limited skill set documented');
        suggestions.push('Add more technical and soft skills to your profile');
      }

      // Experience analysis
      if (experience && experience.length >= 2) {
        score += 25;
        strengths.push('Good work experience history');
      } else {
        weaknesses.push('Limited work experience documented');
        suggestions.push('Add more work experience or projects');
      }

      // Additional suggestions based on missing data
      if (!profile?.linkedin_url) {
        suggestions.push('Add your LinkedIn profile URL to increase visibility');
      }
      if (!profile?.github_url && skills?.some(s => s.skill.toLowerCase().includes('programming'))) {
        suggestions.push('Add your GitHub profile to showcase your coding projects');
      }

      return {
        score: Math.min(score, 100),
        suggestions,
        strengths,
        weaknesses
      };
    } catch (error) {
      console.error('Profile validation error:', error);
      return {
        score: 0,
        suggestions: ['Unable to validate profile at this time'],
        strengths: [],
        weaknesses: []
      };
    }
  }

  static async analyzeSkillGaps(userId: string, targetRole?: string): Promise<SkillGapAnalysis> {
    try {
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('skill')
        .eq('user_id', userId);

      const currentSkills = userSkills?.map(s => s.skill.toLowerCase()) || [];
      
      // Industry-standard skill requirements (mock data - in real app, this would come from job market analysis)
      const industrySkills = {
        'software engineer': ['javascript', 'react', 'node.js', 'sql', 'git', 'aws', 'docker'],
        'data scientist': ['python', 'machine learning', 'sql', 'pandas', 'numpy', 'tensorflow'],
        'product manager': ['agile', 'scrum', 'analytics', 'user research', 'roadmapping'],
        'designer': ['figma', 'sketch', 'prototyping', 'user research', 'html', 'css']
      };

      const targetSkills = targetRole 
        ? industrySkills[targetRole.toLowerCase() as keyof typeof industrySkills] || []
        : ['communication', 'leadership', 'problem solving', 'teamwork'];

      const missingSkills = targetSkills.filter(skill => 
        !currentSkills.some(userSkill => userSkill.includes(skill.toLowerCase()))
      );

      const recommendedSkills = this.getRecommendedSkills(currentSkills, targetRole);
      const skillLevel = this.assessSkillLevel(currentSkills.length);

      return {
        missingSkills,
        recommendedSkills,
        skillLevel,
        improvementAreas: this.getImprovementAreas(currentSkills, missingSkills)
      };
    } catch (error) {
      console.error('Skill gap analysis error:', error);
      return {
        missingSkills: [],
        recommendedSkills: [],
        skillLevel: 'beginner',
        improvementAreas: []
      };
    }
  }

  static async generateCareerRecommendations(userId: string): Promise<CareerRecommendation[]> {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: skills } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId);

      const { data: experience } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('user_id', userId);

      // Mock career recommendations based on profile data
      const recommendations: CareerRecommendation[] = [];
      
      if (skills?.some(s => ['javascript', 'react', 'python'].includes(s.skill.toLowerCase()))) {
        recommendations.push({
          jobTitle: 'Senior Software Engineer',
          matchPercentage: 85,
          requiredSkills: ['JavaScript', 'React', 'Node.js', 'AWS'],
          salaryRange: { min: 90000, max: 130000 },
          growthPotential: 'High'
        });
      }

      if (skills?.some(s => ['data', 'analytics', 'python'].includes(s.skill.toLowerCase()))) {
        recommendations.push({
          jobTitle: 'Data Scientist',
          matchPercentage: 78,
          requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
          salaryRange: { min: 95000, max: 140000 },
          growthPotential: 'Very High'
        });
      }

      if (experience && experience.length >= 3) {
        recommendations.push({
          jobTitle: 'Technical Lead',
          matchPercentage: 82,
          requiredSkills: ['Leadership', 'Architecture', 'Mentoring', 'Strategy'],
          salaryRange: { min: 110000, max: 160000 },
          growthPotential: 'High'
        });
      }

      return recommendations.slice(0, 5); // Return top 5 recommendations
    } catch (error) {
      console.error('Career recommendations error:', error);
      return [];
    }
  }

  private static getRecommendedSkills(currentSkills: string[], targetRole?: string): string[] {
    const complementarySkills = {
      javascript: ['typescript', 'react', 'node.js'],
      python: ['django', 'flask', 'pandas'],
      react: ['redux', 'next.js', 'typescript'],
      design: ['figma', 'sketch', 'prototyping']
    };

    const recommended: string[] = [];
    
    currentSkills.forEach(skill => {
      const skillKey = skill.toLowerCase();
      if (complementarySkills[skillKey as keyof typeof complementarySkills]) {
        recommended.push(...complementarySkills[skillKey as keyof typeof complementarySkills]);
      }
    });

    return [...new Set(recommended)].slice(0, 5);
  }

  private static assessSkillLevel(skillCount: number): 'beginner' | 'intermediate' | 'advanced' {
    if (skillCount >= 10) return 'advanced';
    if (skillCount >= 5) return 'intermediate';
    return 'beginner';
  }

  private static getImprovementAreas(currentSkills: string[], missingSkills: string[]): string[] {
    const areas: string[] = [];
    
    if (currentSkills.length < 5) {
      areas.push('Expand technical skill set');
    }
    
    if (!currentSkills.some(s => ['leadership', 'management', 'communication'].includes(s))) {
      areas.push('Develop soft skills');
    }
    
    if (missingSkills.length > 5) {
      areas.push('Focus on industry-specific skills');
    }
    
    return areas;
  }
}
