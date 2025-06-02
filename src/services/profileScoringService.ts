
import { supabase } from '@/integrations/supabase/client';

export interface ProfileScore {
  overall_score: number;
  completeness_score: number;
  quality_score: number;
  optimization_score: number;
  breakdown: {
    personal_info: number;
    work_experience: number;
    education: number;
    skills: number;
    projects: number;
    achievements: number;
  };
  recommendations: string[];
  industry_benchmark: number;
}

export interface SkillGapAnalysis {
  user_skills: string[];
  industry_required_skills: string[];
  missing_critical_skills: string[];
  skill_match_percentage: number;
  recommended_courses: string[];
  skill_trends: SkillTrend[];
}

export interface SkillTrend {
  skill: string;
  demand_growth: number;
  salary_impact: number;
  adoption_rate: number;
}

export class ProfileScoringService {
  static async calculateProfileScore(userId: string): Promise<ProfileScore> {
    try {
      // Fetch all profile data
      const [profileData, workExperience, education, skills, projects, achievements] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('work_experiences').select('*').eq('user_id', userId),
        supabase.from('education').select('*').eq('user_id', userId),
        supabase.from('user_skills').select('*').eq('user_id', userId),
        supabase.from('projects').select('*').eq('user_id', userId),
        supabase.from('achievements').select('*').eq('user_id', userId)
      ]);

      const breakdown = {
        personal_info: this.scorePersonalInfo(profileData.data),
        work_experience: this.scoreWorkExperience(workExperience.data || []),
        education: this.scoreEducation(education.data || []),
        skills: this.scoreSkills(skills.data || []),
        projects: this.scoreProjects(projects.data || []),
        achievements: this.scoreAchievements(achievements.data || [])
      };

      const completeness_score = Object.values(breakdown).reduce((sum, score) => sum + score, 0) / 6;
      const quality_score = this.calculateQualityScore(profileData.data, workExperience.data || [], projects.data || []);
      const optimization_score = this.calculateOptimizationScore(profileData.data, skills.data || []);
      
      const overall_score = Math.round(
        (completeness_score * 0.4) + 
        (quality_score * 0.35) + 
        (optimization_score * 0.25)
      );

      const recommendations = this.generateRecommendations(breakdown, overall_score);
      const industry_benchmark = await this.getIndustryBenchmark(profileData.data?.job_status);

      // Save score to user_metrics
      await this.saveProfileScore(userId, overall_score, quality_score);

      return {
        overall_score,
        completeness_score: Math.round(completeness_score),
        quality_score: Math.round(quality_score),
        optimization_score: Math.round(optimization_score),
        breakdown,
        recommendations,
        industry_benchmark
      };
    } catch (error) {
      console.error('Error calculating profile score:', error);
      throw error;
    }
  }

  private static scorePersonalInfo(profile: any): number {
    if (!profile) return 0;
    
    let score = 0;
    if (profile.name) score += 20;
    if (profile.phone) score += 15;
    if (profile.location) score += 15;
    if (profile.linkedin_url) score += 20;
    if (profile.github_url) score += 15;
    if (profile.portfolio_url) score += 15;
    
    return Math.min(100, score);
  }

  private static scoreWorkExperience(experiences: any[]): number {
    if (experiences.length === 0) return 0;
    
    let score = 0;
    
    // Base score for having experience
    score += Math.min(40, experiences.length * 20);
    
    // Quality scoring
    experiences.forEach(exp => {
      if (exp.description && exp.description.length > 0) score += 10;
      if (exp.role && exp.company) score += 10;
      if (exp.start_date) score += 5;
    });
    
    return Math.min(100, score);
  }

  private static scoreEducation(education: any[]): number {
    if (education.length === 0) return 30; // Some base score as education isn't always required
    
    let score = 0;
    
    education.forEach(edu => {
      if (edu.school && edu.degree) score += 40;
      if (edu.field_of_study) score += 20;
      if (edu.gpa) score += 10;
      if (edu.start_date && edu.end_date) score += 10;
    });
    
    return Math.min(100, score);
  }

  private static scoreSkills(skills: any[]): number {
    if (skills.length === 0) return 0;
    
    let score = 0;
    
    // Base score for number of skills
    score += Math.min(50, skills.length * 5);
    
    // Bonus for skill categorization
    const categories = new Set(skills.map(s => s.category));
    score += categories.size * 10;
    
    // Bonus for having technical skills
    const hasTechnicalSkills = skills.some(s => s.category === 'technical');
    if (hasTechnicalSkills) score += 20;
    
    return Math.min(100, score);
  }

  private static scoreProjects(projects: any[]): number {
    if (projects.length === 0) return 0;
    
    let score = 0;
    
    // Base score for having projects
    score += Math.min(40, projects.length * 20);
    
    // Quality scoring
    projects.forEach(project => {
      if (project.description && project.description.length > 0) score += 15;
      if (project.technologies && project.technologies.length > 0) score += 10;
      if (project.url) score += 15;
    });
    
    return Math.min(100, score);
  }

  private static scoreAchievements(achievements: any[]): number {
    if (achievements.length === 0) return 40; // Base score as achievements are optional
    
    let score = 40;
    
    achievements.forEach(achievement => {
      if (achievement.is_verified) score += 20;
      else score += 10;
    });
    
    return Math.min(100, score);
  }

  private static calculateQualityScore(profile: any, experiences: any[], projects: any[]): number {
    let score = 0;
    
    // Content quality indicators
    const totalDescriptionLength = [
      ...(experiences.map(e => e.description?.join(' ') || '')),
      ...(projects.map(p => p.description?.join(' ') || ''))
    ].join(' ').length;
    
    if (totalDescriptionLength > 500) score += 30;
    else if (totalDescriptionLength > 200) score += 15;
    
    // Profile completeness quality
    if (profile?.linkedin_url && profile?.github_url) score += 25;
    
    // Recent activity (having recent projects/experience)
    const hasRecentActivity = [...experiences, ...projects].some(item => {
      const endDate = item.end_date || item.updated_at;
      if (!endDate) return false;
      const itemDate = new Date(endDate);
      const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
      return itemDate > twoYearsAgo;
    });
    
    if (hasRecentActivity) score += 25;
    
    // Consistency check (similar roles, progression)
    if (experiences.length > 1) {
      score += 20; // Bonus for career progression
    }
    
    return Math.min(100, score);
  }

  private static calculateOptimizationScore(profile: any, skills: any[]): number {
    let score = 0;
    
    // Keyword optimization
    const profileText = [
      profile?.name || '',
      skills.map(s => s.skill).join(' ')
    ].join(' ').toLowerCase();
    
    // Check for industry keywords
    const industryKeywords = ['software', 'developer', 'engineer', 'manager', 'analyst', 'designer'];
    const keywordMatches = industryKeywords.filter(keyword => profileText.includes(keyword));
    score += keywordMatches.length * 10;
    
    // Profile URL optimization
    if (profile?.linkedin_url) score += 15;
    if (profile?.github_url) score += 15;
    if (profile?.portfolio_url) score += 10;
    
    // Skills relevance (having in-demand skills)
    const inDemandSkills = ['react', 'python', 'javascript', 'aws', 'docker', 'kubernetes'];
    const relevantSkills = skills.filter(s => 
      inDemandSkills.some(demand => s.skill.toLowerCase().includes(demand))
    );
    score += relevantSkills.length * 8;
    
    return Math.min(100, score);
  }

  private static generateRecommendations(breakdown: any, overallScore: number): string[] {
    const recommendations: string[] = [];
    
    if (overallScore < 70) {
      recommendations.push('Your profile needs significant improvement to stand out to employers');
    }
    
    // Specific recommendations based on breakdown
    if (breakdown.personal_info < 80) {
      recommendations.push('Complete your contact information and add professional links');
    }
    
    if (breakdown.work_experience < 60) {
      recommendations.push('Add more detailed work experience with specific achievements');
    }
    
    if (breakdown.skills < 70) {
      recommendations.push('Expand your skills section and categorize them properly');
    }
    
    if (breakdown.projects < 50) {
      recommendations.push('Showcase your projects with descriptions and technology stacks');
    }
    
    if (breakdown.achievements < 60) {
      recommendations.push('Add certifications, awards, or other professional achievements');
    }
    
    // General recommendations
    if (overallScore >= 80) {
      recommendations.push('Excellent profile! Consider adding more recent projects to stay current');
    } else if (overallScore >= 60) {
      recommendations.push('Good profile! Focus on adding more detailed descriptions');
    }
    
    return recommendations.slice(0, 5);
  }

  private static async getIndustryBenchmark(jobStatus?: string): Promise<number> {
    // This would typically fetch from industry data
    // For now, return a mock benchmark based on job status
    switch (jobStatus) {
      case 'Actively looking': return 75;
      case 'Open to opportunities': return 70;
      case 'Not looking': return 65;
      default: return 70;
    }
  }

  private static async saveProfileScore(userId: string, overallScore: number, qualityScore: number): Promise<void> {
    try {
      await supabase
        .from('user_metrics')
        .upsert({
          user_id: userId,
          profile_completion_score: overallScore,
          profile_quality_score: qualityScore,
          last_activity_date: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving profile score:', error);
    }
  }

  static async analyzeSkillGap(userId: string, targetRole: string, industry?: string): Promise<SkillGapAnalysis> {
    try {
      // Get user's current skills
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('skill')
        .eq('user_id', userId);

      const currentSkills = userSkills?.map(s => s.skill) || [];

      // Mock industry required skills (in a real app, this would come from job market data)
      const industrySkills = this.getIndustryRequiredSkills(targetRole, industry);
      
      const skillTrends = this.getSkillTrends(targetRole);
      
      const missingSkills = industrySkills.filter(skill => 
        !currentSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );

      const skillMatchPercentage = Math.round(
        ((industrySkills.length - missingSkills.length) / industrySkills.length) * 100
      );

      return {
        user_skills: currentSkills,
        industry_required_skills: industrySkills,
        missing_critical_skills: missingSkills.slice(0, 5),
        skill_match_percentage: skillMatchPercentage,
        recommended_courses: this.getRecommendedCourses(missingSkills),
        skill_trends: skillTrends
      };
    } catch (error) {
      console.error('Error analyzing skill gap:', error);
      throw error;
    }
  }

  private static getIndustryRequiredSkills(role: string, industry?: string): string[] {
    const roleSkills: Record<string, string[]> = {
      'software engineer': ['JavaScript', 'Python', 'React', 'Node.js', 'Git', 'SQL', 'AWS'],
      'data scientist': ['Python', 'R', 'SQL', 'Machine Learning', 'TensorFlow', 'Pandas', 'Statistics'],
      'product manager': ['Product Strategy', 'User Research', 'Analytics', 'Agile', 'Roadmapping'],
      'designer': ['Figma', 'Adobe Creative Suite', 'User Experience', 'Prototyping', 'Design Systems'],
      'devops engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'Monitoring']
    };

    const normalizedRole = role.toLowerCase();
    return roleSkills[normalizedRole] || ['Communication', 'Problem Solving', 'Teamwork'];
  }

  private static getSkillTrends(role: string): SkillTrend[] {
    // Mock skill trends data
    return [
      { skill: 'React', demand_growth: 15, salary_impact: 12, adoption_rate: 78 },
      { skill: 'Python', demand_growth: 22, salary_impact: 18, adoption_rate: 85 },
      { skill: 'AWS', demand_growth: 28, salary_impact: 25, adoption_rate: 62 },
      { skill: 'TypeScript', demand_growth: 35, salary_impact: 15, adoption_rate: 55 },
      { skill: 'Docker', demand_growth: 18, salary_impact: 20, adoption_rate: 45 }
    ];
  }

  private static getRecommendedCourses(missingSkills: string[]): string[] {
    const courseMap: Record<string, string> = {
      'JavaScript': 'JavaScript Fundamentals on Coursera',
      'Python': 'Python for Everybody Specialization',
      'React': 'React Developer Bootcamp',
      'AWS': 'AWS Certified Solutions Architect',
      'Machine Learning': 'Andrew Ng Machine Learning Course',
      'Docker': 'Docker Mastery Course',
      'SQL': 'Complete SQL Bootcamp'
    };

    return missingSkills.map(skill => 
      courseMap[skill] || `${skill} fundamentals course`
    ).slice(0, 3);
  }
}
