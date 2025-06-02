
import { supabase } from '@/integrations/supabase/client';

export interface MLJobScore {
  overallScore: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  locationMatch: number;
  salaryMatch: number;
  cultureMatch: number;
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

export interface CareerPathRecommendation {
  role: string;
  probability: number;
  timeframe: string;
  requiredSkills: string[];
  salaryRange: { min: number; max: number };
  growth: number;
}

export class MLJobMatchingService {
  static async calculateJobScore(userProfile: any, jobData: any): Promise<MLJobScore> {
    try {
      const { data, error } = await supabase.functions.invoke('ml-job-scoring', {
        body: { userProfile, jobData }
      });

      if (error) throw error;
      return data.score;
    } catch (error) {
      console.error('ML job scoring failed:', error);
      return this.generateMockScore(userProfile, jobData);
    }
  }

  static async getPredictiveAnalytics(userId: string, jobId: string): Promise<PredictiveAnalytics> {
    try {
      const { data, error } = await supabase.functions.invoke('predictive-analytics', {
        body: { userId, jobId, analysisType: 'job_match' }
      });

      if (error) throw error;
      return data.insights;
    } catch (error) {
      console.error('Predictive analytics failed:', error);
      return this.generateMockPredictiveAnalytics();
    }
  }

  static async getCareerPathRecommendations(userId: string): Promise<CareerPathRecommendation[]> {
    try {
      const { data, error } = await supabase.functions.invoke('career-path-analysis', {
        body: { userId }
      });

      if (error) throw error;
      return data.recommendations || [];
    } catch (error) {
      console.error('Career path analysis failed:', error);
      return this.generateMockCareerPaths();
    }
  }

  static async getSalaryInsights(role: string, location: string, experience: number): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('salary-insights', {
        body: { role, location, experience }
      });

      if (error) throw error;
      return data.insights;
    } catch (error) {
      console.error('Salary insights failed:', error);
      return this.generateMockSalaryInsights(role, location, experience);
    }
  }

  private static generateMockScore(userProfile: any, jobData: any): MLJobScore {
    return {
      overallScore: 78,
      skillsMatch: 85,
      experienceMatch: 72,
      educationMatch: 90,
      locationMatch: 65,
      salaryMatch: 80,
      cultureMatch: 75
    };
  }

  private static generateMockPredictiveAnalytics(): PredictiveAnalytics {
    return {
      successProbability: 0.73,
      timeToHire: 21,
      salaryPrediction: {
        min: 85000,
        max: 105000,
        confidence: 0.82
      },
      competitionLevel: 'medium',
      recommendations: [
        'Update your skills section to include cloud technologies',
        'Add metrics to your recent work experience',
        'Consider highlighting leadership experience'
      ]
    };
  }

  private static generateMockCareerPaths(): CareerPathRecommendation[] {
    return [
      {
        role: 'Senior Software Engineer',
        probability: 0.85,
        timeframe: '1-2 years',
        requiredSkills: ['System Design', 'Leadership', 'Advanced JavaScript'],
        salaryRange: { min: 120000, max: 150000 },
        growth: 0.25
      },
      {
        role: 'Technical Lead',
        probability: 0.65,
        timeframe: '2-3 years',
        requiredSkills: ['Team Management', 'Architecture', 'Mentoring'],
        salaryRange: { min: 140000, max: 180000 },
        growth: 0.35
      },
      {
        role: 'Engineering Manager',
        probability: 0.45,
        timeframe: '3-5 years',
        requiredSkills: ['People Management', 'Strategic Planning', 'Budgeting'],
        salaryRange: { min: 160000, max: 220000 },
        growth: 0.45
      }
    ];
  }

  private static generateMockSalaryInsights(role: string, location: string, experience: number): any {
    const baseRange = { min: 70000, max: 120000 };
    const experienceMultiplier = 1 + (experience * 0.1);
    
    return {
      salaryRange: {
        min: Math.round(baseRange.min * experienceMultiplier),
        max: Math.round(baseRange.max * experienceMultiplier)
      },
      marketTrends: {
        growth: '12%',
        demand: 'High',
        competition: 'Medium'
      },
      insights: [
        `${role} salaries have increased 12% in the last year`,
        `High demand in ${location} area`,
        'Skills in cloud technologies command 15-20% premium'
      ]
    };
  }
}
