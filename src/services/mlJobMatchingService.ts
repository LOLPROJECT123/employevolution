
import { supabase } from '@/integrations/supabase/client';

export interface JobMatchResult {
  matchScore: number;
  skillsMatch: number;
  experienceMatch: number;
  locationMatch: number;
  culturalFit: number;
  salaryMatch: number;
  reasoning: string[];
  recommendations: string[];
}

export interface PredictiveAnalytics {
  successProbability: number;
  timeToHire: number;
  salaryPrediction: {
    min: number;
    max: number;
    confidence: number;
  };
  competitionLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface SalaryInsights {
  salaryRange: {
    min: number;
    max: number;
  };
  marketTrends: {
    growth: string;
    demand: string;
    competition: string;
  };
  insights: string[];
}

export class MLJobMatchingService {
  static async calculateJobMatchScore(userId: string, jobData: any): Promise<JobMatchResult> {
    try {
      // Get user profile and preferences
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: skills } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', userId);

      const { data: preferences } = await supabase
        .from('job_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Calculate match scores
      const skillsMatch = this.calculateSkillsMatch(jobData.requirements || [], skills?.map(s => s.skill) || []);
      const experienceMatch = this.calculateExperienceMatch(jobData.level || 'mid', profile?.job_status || 'mid');
      const locationMatch = this.calculateLocationMatch(jobData.location || '', profile?.location || '');
      const culturalFit = this.calculateCulturalFit(jobData, preferences);
      const salaryMatch = this.calculateSalaryMatch(jobData.salary || '', preferences?.salary_expectation || '');

      const matchScore = Math.round(
        (skillsMatch * 0.35) +
        (experienceMatch * 0.25) +
        (locationMatch * 0.15) +
        (culturalFit * 0.15) +
        (salaryMatch * 0.10)
      );

      const reasoning = this.generateReasoning({
        skillsMatch,
        experienceMatch,
        locationMatch,
        culturalFit,
        salaryMatch
      });

      const recommendations = this.generateRecommendations(matchScore, {
        skillsMatch,
        experienceMatch,
        locationMatch,
        culturalFit,
        salaryMatch
      });

      return {
        matchScore,
        skillsMatch,
        experienceMatch,
        locationMatch,
        culturalFit,
        salaryMatch,
        reasoning,
        recommendations
      };
    } catch (error) {
      console.error('Error calculating job match score:', error);
      return {
        matchScore: 0,
        skillsMatch: 0,
        experienceMatch: 0,
        locationMatch: 0,
        culturalFit: 0,
        salaryMatch: 0,
        reasoning: ['Unable to calculate match score'],
        recommendations: ['Please complete your profile for better matching']
      };
    }
  }

  static async getPredictiveAnalytics(userId: string, jobId: string): Promise<PredictiveAnalytics> {
    try {
      // Get user's application history and success rate
      const { data: applications } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId);

      const totalApplications = applications?.length || 0;
      const successfulApplications = applications?.filter(app => 
        ['interview_scheduled', 'offer_received'].includes(app.status)
      ).length || 0;

      const baseSuccessRate = totalApplications > 0 ? successfulApplications / totalApplications : 0.5;
      
      // Mock predictive analytics based on user data
      const successProbability = Math.max(0.1, Math.min(0.95, baseSuccessRate + (Math.random() * 0.3 - 0.15)));
      
      const timeToHire = Math.round(15 + (Math.random() * 20)); // 15-35 days
      
      const salaryPrediction = {
        min: 80000 + Math.round(Math.random() * 20000),
        max: 120000 + Math.round(Math.random() * 30000),
        confidence: 0.7 + (Math.random() * 0.25)
      };

      const competitionLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
      const competitionLevel = competitionLevels[Math.floor(Math.random() * 3)];

      const recommendations = [
        'Tailor your resume to highlight relevant experience',
        'Research the company culture and values',
        'Prepare for technical questions in your domain',
        'Network with current employees if possible',
        'Follow up professionally after applying'
      ];

      return {
        successProbability,
        timeToHire,
        salaryPrediction,
        competitionLevel,
        recommendations
      };
    } catch (error) {
      console.error('Error getting predictive analytics:', error);
      return {
        successProbability: 0.5,
        timeToHire: 21,
        salaryPrediction: { min: 80000, max: 120000, confidence: 0.7 },
        competitionLevel: 'medium',
        recommendations: ['Complete your profile for better predictions']
      };
    }
  }

  static async getSalaryInsights(role: string, location: string, experience: number): Promise<SalaryInsights> {
    try {
      // Mock salary insights based on role, location, and experience
      const baseAdjustment = experience * 5000;
      const locationMultiplier = location.includes('San Francisco') ? 1.4 : 
                                location.includes('New York') ? 1.3 :
                                location.includes('Seattle') ? 1.2 : 1.0;

      const baseSalary = role.toLowerCase().includes('senior') ? 120000 : 
                        role.toLowerCase().includes('lead') ? 140000 :
                        role.toLowerCase().includes('manager') ? 130000 : 90000;

      const adjustedSalary = (baseSalary + baseAdjustment) * locationMultiplier;

      const salaryRange = {
        min: Math.round(adjustedSalary * 0.8),
        max: Math.round(adjustedSalary * 1.3)
      };

      const marketTrends = {
        growth: '+8.5%',
        demand: 'High',
        competition: 'Medium'
      };

      const insights = [
        `${role} roles in ${location} are seeing strong demand`,
        `With ${experience} years of experience, you're positioned competitively`,
        'Consider highlighting full-stack capabilities for better offers',
        'Remote work options can expand your salary potential',
        'Certifications in cloud technologies can boost earning potential'
      ];

      return {
        salaryRange,
        marketTrends,
        insights
      };
    } catch (error) {
      console.error('Error getting salary insights:', error);
      return {
        salaryRange: { min: 80000, max: 120000 },
        marketTrends: { growth: '+5%', demand: 'Medium', competition: 'Medium' },
        insights: ['Unable to load salary insights at this time']
      };
    }
  }

  private static calculateSkillsMatch(jobSkills: string[], userSkills: string[]): number {
    if (!jobSkills.length) return 100;
    
    const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
    
    const matchingSkills = normalizedJobSkills.filter(skill => 
      normalizedUserSkills.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );
    
    return Math.round((matchingSkills.length / normalizedJobSkills.length) * 100);
  }

  private static calculateExperienceMatch(jobLevel: string, userLevel: string): number {
    const levels = { intern: 0, entry: 1, mid: 2, senior: 3, lead: 4, manager: 4 };
    const jobLevelNum = levels[jobLevel as keyof typeof levels] || 2;
    const userLevelNum = levels[userLevel as keyof typeof levels] || 2;
    
    const difference = Math.abs(jobLevelNum - userLevelNum);
    return Math.max(0, 100 - (difference * 25));
  }

  private static calculateLocationMatch(jobLocation: string, userLocation: string): number {
    if (!jobLocation || !userLocation) return 50;
    
    const jobLoc = jobLocation.toLowerCase();
    const userLoc = userLocation.toLowerCase();
    
    if (jobLoc.includes('remote') || userLoc.includes('remote')) return 100;
    if (jobLoc === userLoc) return 100;
    
    // Check for same state/region
    const jobParts = jobLoc.split(',');
    const userParts = userLoc.split(',');
    
    if (jobParts.length > 1 && userParts.length > 1) {
      const sameState = jobParts[jobParts.length - 1].trim() === userParts[userParts.length - 1].trim();
      if (sameState) return 70;
    }
    
    return 30;
  }

  private static calculateCulturalFit(jobData: any, preferences: any): number {
    let score = 70; // Base score
    
    if (preferences?.work_model === 'remote' && jobData.remote) score += 20;
    if (preferences?.company_size && jobData.company_size) {
      if (preferences.company_size.includes(jobData.company_size)) score += 10;
    }
    
    return Math.min(100, score);
  }

  private static calculateSalaryMatch(jobSalary: string, userExpectation: string): number {
    if (!jobSalary || !userExpectation) return 70;
    
    // Extract numbers from salary strings
    const jobNumbers = jobSalary.match(/\d+/g);
    const userNumbers = userExpectation.match(/\d+/g);
    
    if (!jobNumbers || !userNumbers) return 70;
    
    const jobMax = Math.max(...jobNumbers.map(Number));
    const userMin = Math.min(...userNumbers.map(Number));
    
    if (jobMax >= userMin) return 90;
    
    const gap = (userMin - jobMax) / userMin;
    return Math.max(30, Math.round((1 - gap) * 90));
  }

  private static generateReasoning(scores: any): string[] {
    const reasoning: string[] = [];
    
    if (scores.skillsMatch >= 80) {
      reasoning.push('Strong skills alignment with job requirements');
    } else if (scores.skillsMatch >= 60) {
      reasoning.push('Good skills match with some gaps to address');
    } else {
      reasoning.push('Skills gap present - consider this for growth opportunities');
    }
    
    if (scores.experienceMatch >= 85) {
      reasoning.push('Experience level perfectly matches the role');
    } else if (scores.experienceMatch >= 60) {
      reasoning.push('Experience level is suitable with room to grow');
    }
    
    if (scores.locationMatch >= 80) {
      reasoning.push('Location preferences well aligned');
    }
    
    return reasoning;
  }

  private static generateRecommendations(matchScore: number, scores: any): string[] {
    const recommendations: string[] = [];
    
    if (matchScore >= 85) {
      recommendations.push('Excellent match - apply immediately');
      recommendations.push('Prepare thoroughly for the interview process');
    } else if (matchScore >= 70) {
      recommendations.push('Good opportunity - tailor your application');
      recommendations.push('Highlight your strongest matching skills');
    } else if (matchScore >= 50) {
      recommendations.push('Consider for growth - may require skill development');
      recommendations.push('Research the company and role requirements');
    } else {
      recommendations.push('Focus on roles that better match your current profile');
    }
    
    if (scores.skillsMatch < 70) {
      recommendations.push('Consider developing missing technical skills');
    }
    
    return recommendations;
  }
}
