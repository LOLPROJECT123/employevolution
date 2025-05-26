
import { Job } from '@/types/job';
import { User } from '@/types/auth';

export interface AIJobMatchScore {
  overallScore: number;
  skillsMatch: number;
  experienceMatch: number;
  locationMatch: number;
  salaryMatch: number;
  culturalFit: number;
  careerGrowth: number;
  workLifeBalance: number;
  reasoning: string[];
  recommendations: string[];
  resumeOptimizations: string[];
  interviewTips: string[];
}

export interface PersonalizedRecommendation {
  job: Job;
  matchScore: AIJobMatchScore;
  reasonWhy: string;
  actionItems: string[];
  deadline?: string;
}

export interface UserPreferences {
  remote?: boolean;
  flexible_schedule?: boolean;
  company_sizes?: string[];
  industries?: string[];
  benefits?: string[];
  job_types?: string[];
}
