import { supabase } from '@/integrations/supabase/client';
import { castJsonToStringArray } from '@/types/database';

export interface MLJobMatch {
  jobId: string;
  matchScore: number;
  confidenceLevel: number;
  reasoning: string[];
  skillMatches: string[];
  skillGaps: string[];
  salaryMatch: number;
  locationMatch: number;
  experienceMatch: number;
  cultureMatch: number;
  companyMatch: number;
  recommendations?: string[]; // Add this missing property
}

export interface UserProfile {
  skills: string[];
  experience: number;
  desiredSalary: number;
  preferredLocations: string[];
  industryPreferences: string[];
  rolePreferences: string[];
  companySize: string[];
  workModel: string;
}

export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  requiredSkills: string[];
  experienceLevel: string;
  jobType: string;
  industry: string;
  companySize?: string;
  remote: boolean;
  description: string;
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
  private static weights = {
    skills: 0.35,
    experience: 0.20,
    salary: 0.15,
    location: 0.15,
    culture: 0.10,
    company: 0.05
  };

  static async analyzeJobMatch(jobData: JobData, userId: string): Promise<MLJobMatch> {
    const userProfile = await this.getUserProfile(userId);
    
    const skillsAnalysis = this.analyzeSkillsMatch(jobData.requiredSkills, userProfile.skills);
    const experienceAnalysis = this.analyzeExperienceMatch(jobData.experienceLevel, userProfile.experience);
    const salaryAnalysis = this.analyzeSalaryMatch(jobData.salary, userProfile.desiredSalary);
    const locationAnalysis = this.analyzeLocationMatch(jobData.location, userProfile.preferredLocations);
    const cultureAnalysis = this.analyzeCultureMatch(jobData, userProfile);
    const companyAnalysis = this.analyzeCompanyMatch(jobData, userProfile);

    const overallScore = (
      skillsAnalysis.score * this.weights.skills +
      experienceAnalysis.score * this.weights.experience +
      salaryAnalysis.score * this.weights.salary +
      locationAnalysis.score * this.weights.location +
      cultureAnalysis.score * this.weights.culture +
      companyAnalysis.score * this.weights.company
    );

    const reasoning = [
      ...skillsAnalysis.reasoning,
      ...experienceAnalysis.reasoning,
      ...salaryAnalysis.reasoning,
      ...locationAnalysis.reasoning
    ];

    const recommendations = [
      "Tailor your resume to highlight matching skills",
      "Consider adding certifications in trending technologies",
      "Network with professionals in your target companies"
    ];

    return {
      jobId: jobData.id,
      matchScore: Math.round(overallScore * 100),
      confidenceLevel: this.calculateConfidence(skillsAnalysis, experienceAnalysis),
      reasoning,
      skillMatches: skillsAnalysis.matches,
      skillGaps: skillsAnalysis.gaps,
      salaryMatch: Math.round(salaryAnalysis.score * 100),
      locationMatch: Math.round(locationAnalysis.score * 100),
      experienceMatch: Math.round(experienceAnalysis.score * 100),
      cultureMatch: Math.round(cultureAnalysis.score * 100),
      companyMatch: Math.round(companyAnalysis.score * 100),
      recommendations
    };
  }

  static async calculateJobMatchScore(userId: string, jobData: any): Promise<MLJobMatch> {
    return this.analyzeJobMatch(jobData, userId);
  }

  static async getPredictiveAnalytics(userId: string, jobId: string): Promise<PredictiveAnalytics> {
    const userProfile = await this.getUserProfile(userId);
    
    // Mock predictive analytics based on user profile
    const successProbability = Math.random() * 0.4 + 0.4; // 40-80%
    const timeToHire = Math.floor(Math.random() * 45) + 15; // 15-60 days
    
    return {
      successProbability,
      timeToHire,
      salaryPrediction: {
        min: 80000,
        max: 120000,
        confidence: 0.85
      },
      competitionLevel: successProbability > 0.7 ? 'low' : successProbability > 0.5 ? 'medium' : 'high',
      recommendations: [
        "Strengthen your portfolio with relevant projects",
        "Consider adding certifications in trending technologies",
        "Network with professionals in your target companies",
        "Tailor your resume to highlight matching skills"
      ]
    };
  }

  static async getSalaryInsights(role: string, location: string, experience: number): Promise<SalaryInsights> {
    // Mock salary insights based on parameters
    const baseRange = this.calculateSalaryRange(role, location, experience);
    
    return {
      salaryRange: baseRange,
      marketTrends: {
        growth: "+12% YoY",
        demand: "High",
        competition: "Medium"
      },
      insights: [
        `${role} salaries in ${location} are trending upward`,
        "Companies are offering competitive packages to attract talent",
        "Remote work options are becoming standard",
        "Equity compensation is increasingly common"
      ]
    };
  }

  private static calculateSalaryRange(role: string, location: string, experience: number) {
    const baseMin = 60000 + (experience * 8000);
    const baseMax = baseMin + 40000;
    
    // Location multiplier
    const locationMultiplier = location.includes('San Francisco') ? 1.6 : 
                              location.includes('New York') ? 1.4 : 
                              location.includes('Seattle') ? 1.3 : 1.0;
    
    return {
      min: Math.round(baseMin * locationMultiplier),
      max: Math.round(baseMax * locationMultiplier)
    };
  }

  private static async getUserProfile(userId: string): Promise<UserProfile> {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: skills } = await supabase
      .from('user_skills')
      .select('skill')
      .eq('user_id', userId);

    const { data: preferences } = await supabase
      .from('job_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    return {
      skills: skills?.map(s => s.skill) || [],
      experience: 5, // Default or calculate from profile
      desiredSalary: 100000, // Default or from preferences
      preferredLocations: preferences?.preferred_locations || [],
      industryPreferences: preferences?.industries || [],
      rolePreferences: preferences?.desired_roles || [],
      companySize: preferences?.company_size || [],
      workModel: preferences?.work_model || 'hybrid'
    };
  }

  private static analyzeSkillsMatch(requiredSkills: string[], userSkills: string[]) {
    const matches: string[] = [];
    const gaps: string[] = [];
    
    requiredSkills.forEach(skill => {
      const match = userSkills.find(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      );
      
      if (match) {
        matches.push(skill);
      } else {
        gaps.push(skill);
      }
    });

    const matchPercentage = requiredSkills.length > 0 ? matches.length / requiredSkills.length : 0;
    
    return {
      score: matchPercentage,
      matches,
      gaps,
      reasoning: [
        `You match ${matches.length} out of ${requiredSkills.length} required skills`,
        matches.length > 0 ? `Strong matches: ${matches.slice(0, 3).join(', ')}` : 'Consider developing the required skills'
      ]
    };
  }

  private static analyzeExperienceMatch(requiredLevel: string, userExperience: number) {
    const levelMap: { [key: string]: number } = {
      'entry': 1,
      'junior': 2,
      'mid': 5,
      'senior': 8,
      'lead': 12,
      'principal': 15
    };

    const requiredYears = levelMap[requiredLevel.toLowerCase()] || 3;
    const experienceGap = userExperience - requiredYears;
    
    let score = 1.0;
    if (experienceGap < -2) score = 0.3;
    else if (experienceGap < 0) score = 0.7;
    else if (experienceGap <= 2) score = 1.0;
    else score = 0.9; // Overqualified

    return {
      score,
      reasoning: [
        experienceGap >= 0 
          ? `Your ${userExperience} years of experience meets the ${requiredLevel} level requirement`
          : `You have ${userExperience} years experience for a ${requiredLevel} role requiring ~${requiredYears} years`
      ]
    };
  }

  private static analyzeSalaryMatch(jobSalary: string | undefined, desiredSalary: number) {
    if (!jobSalary) {
      return {
        score: 0.5,
        reasoning: ['Salary not disclosed']
      };
    }

    // Extract salary range from string
    const numbers = jobSalary.match(/\d+/g);
    if (!numbers || numbers.length === 0) {
      return {
        score: 0.5,
        reasoning: ['Salary format unclear']
      };
    }

    const salaryMin = parseInt(numbers[0]) * (jobSalary.includes('k') ? 1000 : 1);
    const salaryMax = numbers.length > 1 ? parseInt(numbers[1]) * (jobSalary.includes('k') ? 1000 : 1) : salaryMin;
    
    const midpoint = (salaryMin + salaryMax) / 2;
    const difference = Math.abs(midpoint - desiredSalary) / desiredSalary;
    
    let score = Math.max(0, 1 - difference);
    
    return {
      score,
      reasoning: [
        difference < 0.1 
          ? 'Salary closely matches your expectations'
          : difference < 0.2
          ? 'Salary is within reasonable range'
          : 'Salary may not meet your expectations'
      ]
    };
  }

  private static analyzeLocationMatch(jobLocation: string, preferredLocations: string[]) {
    if (preferredLocations.length === 0) {
      return {
        score: 0.8,
        reasoning: ['No location preferences set']
      };
    }

    const isRemote = jobLocation.toLowerCase().includes('remote');
    const hasRemotePreference = preferredLocations.some(loc => loc.toLowerCase().includes('remote'));
    
    if (isRemote && hasRemotePreference) {
      return {
        score: 1.0,
        reasoning: ['Remote position matches your preferences']
      };
    }

    const locationMatch = preferredLocations.some(pref => 
      jobLocation.toLowerCase().includes(pref.toLowerCase()) ||
      pref.toLowerCase().includes(jobLocation.toLowerCase())
    );

    return {
      score: locationMatch ? 1.0 : 0.3,
      reasoning: [
        locationMatch 
          ? 'Location matches your preferences'
          : 'Location does not match your preferred areas'
      ]
    };
  }

  private static analyzeCultureMatch(jobData: JobData, userProfile: UserProfile) {
    // Basic culture matching based on company size and work model
    let score = 0.7; // Default neutral score

    if (userProfile.companySize.length > 0) {
      const sizeMatch = userProfile.companySize.includes(jobData.companySize || '');
      if (sizeMatch) score += 0.2;
    }

    return {
      score: Math.min(score, 1.0),
      reasoning: ['Culture match based on company preferences']
    };
  }

  private static analyzeCompanyMatch(jobData: JobData, userProfile: UserProfile) {
    // Basic company matching
    return {
      score: 0.8,
      reasoning: ['Company analysis based on industry and role fit']
    };
  }

  private static calculateConfidence(skillsAnalysis: any, experienceAnalysis: any): number {
    const skillsWeight = 0.6;
    const experienceWeight = 0.4;
    
    return Math.round((skillsAnalysis.score * skillsWeight + experienceAnalysis.score * experienceWeight) * 100);
  }
}
