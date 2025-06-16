
import { Job } from '@/types/job';
import { User } from '@/types/auth';
import { AIJobMatchScore, PersonalizedRecommendation } from '@/types/aiMatching';
import { skillsMatchingService } from './skillsMatchingService';
import { jobMatchingCalculators } from './jobMatchingCalculators';
import { RecommendationGenerators } from './recommendationGenerators';

class EnhancedAiMatchingService {
  async calculateAdvancedMatch(job: Job, userProfile: User): Promise<AIJobMatchScore> {
    // Enhanced AI matching with multiple criteria
    const skillsMatch = await skillsMatchingService.calculateSkillsMatchAdvanced(job.skills, userProfile.profile?.skills || []);
    const experienceMatch = jobMatchingCalculators.calculateExperienceMatchAdvanced(job.level, userProfile.profile?.experience || '');
    const locationMatch = jobMatchingCalculators.calculateLocationMatchAdvanced(job, userProfile.profile?.location || '');
    const salaryMatch = jobMatchingCalculators.calculateSalaryMatchAdvanced(job.salary, userProfile.profile?.salary_range || { min: 0, max: 0 });
    const culturalFit = await jobMatchingCalculators.calculateCulturalFitAdvanced(job, userProfile);
    const careerGrowth = jobMatchingCalculators.calculateCareerGrowthPotential(job, userProfile);
    const workLifeBalance = jobMatchingCalculators.calculateWorkLifeBalance(job, userProfile);

    const overallScore = Math.round(
      (skillsMatch * 0.30) +
      (experienceMatch * 0.20) +
      (locationMatch * 0.10) +
      (salaryMatch * 0.15) +
      (culturalFit * 0.10) +
      (careerGrowth * 0.10) +
      (workLifeBalance * 0.05)
    );

    const reasoning = RecommendationGenerators.generateAdvancedReasoning(job, userProfile, {
      skillsMatch, experienceMatch, locationMatch, salaryMatch, 
      culturalFit, careerGrowth, workLifeBalance
    });

    const recommendations = RecommendationGenerators.generatePersonalizedRecommendations(job, userProfile, overallScore);
    const resumeOptimizations = RecommendationGenerators.generateResumeOptimizations(job, userProfile);
    const interviewTips = RecommendationGenerators.generateInterviewTips(job, userProfile);

    return {
      overallScore,
      skillsMatch,
      experienceMatch,
      locationMatch,
      salaryMatch,
      culturalFit,
      careerGrowth,
      workLifeBalance,
      reasoning: [reasoning], // Convert string to string array
      recommendations,
      resumeOptimizations,
      interviewTips
    };
  }

  async getPersonalizedJobRecommendations(
    allJobs: Job[],
    userProfile: User,
    limit: number = 10
  ): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    
    for (const job of allJobs.slice(0, Math.min(50, allJobs.length))) {
      const matchScore = await this.calculateAdvancedMatch(job, userProfile);
      
      if (matchScore.overallScore >= 50) {
        const reasonWhy = RecommendationGenerators.generateWhyRecommended(job, matchScore);
        const actionItems = RecommendationGenerators.generateActionItems(job, matchScore);
        const deadline = RecommendationGenerators.calculateApplicationDeadline(job);
        
        recommendations.push({
          job,
          matchScore,
          reasonWhy,
          actionItems,
          deadline
        });
      }
    }
    
    return recommendations
      .sort((a, b) => b.matchScore.overallScore - a.matchScore.overallScore)
      .slice(0, limit);
  }
}

export const enhancedAiMatchingService = new EnhancedAiMatchingService();
