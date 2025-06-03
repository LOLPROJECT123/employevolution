import { supabase } from '@/integrations/supabase/client';
import { castJsonToStringArray } from '@/types/database';

export interface CareerPath {
  id: string;
  from_role: string;
  to_role: string;
  industry?: string;
  transition_probability: number;
  required_skills: string[];
  recommended_skills: string[];
  average_timeline_months?: number;
  salary_change_percentage: number;
  created_at: string;
}

export interface CareerRecommendation {
  path: CareerPath;
  match_score: number;
  gap_analysis: {
    missing_skills: string[];
    matching_skills: string[];
    skill_gap_percentage: number;
  };
  timeline_estimate: number;
  next_steps: string[];
}

export class CareerPathService {
  static async getCareerPaths(fromRole: string, industry?: string): Promise<CareerPath[]> {
    let query = supabase
      .from('career_paths')
      .select('*')
      .ilike('from_role', `%${fromRole}%`)
      .order('transition_probability', { ascending: false });

    if (industry) {
      query = query.eq('industry', industry);
    }

    const { data, error } = await query.limit(10);

    if (error) {
      console.error('Error fetching career paths:', error);
      return [];
    }

    // Type-safe casting of JSON fields to string arrays
    return (data || []).map(path => ({
      ...path,
      required_skills: castJsonToStringArray(path.required_skills),
      recommended_skills: castJsonToStringArray(path.recommended_skills)
    }));
  }

  static async generateCareerRecommendations(
    currentRole: string,
    userSkills: string[],
    industry?: string,
    experienceYears?: number
  ): Promise<CareerRecommendation[]> {
    const paths = await this.getCareerPaths(currentRole, industry);
    const recommendations: CareerRecommendation[] = [];

    for (const path of paths) {
      const gapAnalysis = this.analyzeSkillGap(userSkills, path.required_skills);
      const matchScore = this.calculateMatchScore(path, gapAnalysis, experienceYears);
      const timelineEstimate = this.estimateTimeline(path, gapAnalysis, experienceYears);
      const nextSteps = this.generateNextSteps(path, gapAnalysis);

      recommendations.push({
        path,
        match_score: matchScore,
        gap_analysis: gapAnalysis,
        timeline_estimate: timelineEstimate,
        next_steps: nextSteps
      });
    }

    return recommendations.sort((a, b) => b.match_score - a.match_score);
  }

  private static analyzeSkillGap(userSkills: string[], requiredSkills: string[]) {
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());

    const matchingSkills = requiredSkillsLower.filter(skill => 
      userSkillsLower.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    const missingSkills = requiredSkillsLower.filter(skill => !matchingSkills.includes(skill));
    const skillGapPercentage = requiredSkills.length > 0 
      ? Math.round((missingSkills.length / requiredSkills.length) * 100)
      : 0;

    return {
      missing_skills: missingSkills,
      matching_skills: matchingSkills,
      skill_gap_percentage: skillGapPercentage
    };
  }

  private static calculateMatchScore(
    path: CareerPath,
    gapAnalysis: any,
    experienceYears?: number
  ): number {
    let score = 0;

    // Base score from transition probability
    score += path.transition_probability * 40;

    // Skill match score
    const skillMatchScore = Math.max(0, 100 - gapAnalysis.skill_gap_percentage);
    score += skillMatchScore * 0.4;

    // Experience factor
    if (experienceYears && path.average_timeline_months) {
      const experienceMonths = experienceYears * 12;
      const timelineFactor = Math.min(1, experienceMonths / path.average_timeline_months);
      score += timelineFactor * 20;
    }

    return Math.min(100, Math.round(score));
  }

  private static estimateTimeline(
    path: CareerPath,
    gapAnalysis: any,
    experienceYears?: number
  ): number {
    let baseTimeline = path.average_timeline_months || 12;

    // Adjust based on skill gap
    const skillGapMultiplier = 1 + (gapAnalysis.skill_gap_percentage / 100);
    baseTimeline *= skillGapMultiplier;

    // Adjust based on experience
    if (experienceYears) {
      if (experienceYears > 5) {
        baseTimeline *= 0.8; // Experienced professionals transition faster
      } else if (experienceYears < 2) {
        baseTimeline *= 1.3; // Junior professionals need more time
      }
    }

    return Math.round(baseTimeline);
  }

  private static generateNextSteps(path: CareerPath, gapAnalysis: any): string[] {
    const steps: string[] = [];

    // Skill development steps
    if (gapAnalysis.missing_skills.length > 0) {
      steps.push(`Develop skills in: ${gapAnalysis.missing_skills.slice(0, 3).join(', ')}`);
    }

    // Recommended additional skills
    if (path.recommended_skills.length > 0) {
      steps.push(`Consider learning: ${path.recommended_skills.slice(0, 2).join(', ')}`);
    }

    // Generic career advice
    steps.push('Build a portfolio showcasing relevant projects');
    steps.push('Network with professionals in the target role');
    steps.push('Seek mentorship from someone in the desired position');

    if (path.salary_change_percentage > 0) {
      steps.push('Prepare for salary negotiations');
    }

    return steps.slice(0, 5);
  }

  static async createCareerPath(pathData: Omit<CareerPath, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('career_paths')
      .insert(pathData);

    if (error) {
      console.error('Error creating career path:', error);
      throw error;
    }
  }

  static async getIndustryCareerPaths(industry: string): Promise<CareerPath[]> {
    const { data, error } = await supabase
      .from('career_paths')
      .select('*')
      .eq('industry', industry)
      .order('transition_probability', { ascending: false });

    if (error) {
      console.error('Error fetching industry career paths:', error);
      return [];
    }

    return (data || []).map(path => ({
      ...path,
      required_skills: castJsonToStringArray(path.required_skills),
      recommended_skills: castJsonToStringArray(path.recommended_skills)
    }));
  }

  static async getPopularTransitions(): Promise<{ from_role: string; to_role: string; count: number }[]> {
    // This would typically be a view or function in the database
    // For now, return mock data
    return [
      { from_role: 'Software Engineer', to_role: 'Senior Software Engineer', count: 156 },
      { from_role: 'Senior Software Engineer', to_role: 'Tech Lead', count: 89 },
      { from_role: 'Software Engineer', to_role: 'Product Manager', count: 67 },
      { from_role: 'Data Analyst', to_role: 'Data Scientist', count: 54 },
      { from_role: 'Junior Developer', to_role: 'Software Engineer', count: 234 }
    ];
  }
}
