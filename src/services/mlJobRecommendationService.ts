
import { supabase } from '@/integrations/supabase/client';
import { enhancedJobMatchingV2Service } from './enhancedJobMatchingV2Service';

export interface UserBehaviorPattern {
  userId: string;
  preferredSkills: string[];
  preferredCompanies: string[];
  preferredJobTypes: string[];
  salaryRange: [number, number];
  applicationSuccessRate: number;
  interviewRate: number;
  averageTimeToApply: number; // hours
}

export interface CollaborativeFilteringResult {
  similarUsers: string[];
  recommendedJobs: string[];
  confidence: number;
}

export class MLJobRecommendationService {
  async generateMLEnhancedRecommendations(
    userId: string,
    baseRecommendations: any[],
    limit: number = 20
  ) {
    try {
      // Get user behavior patterns
      const userPattern = await this.getUserBehaviorPattern(userId);
      
      // Apply collaborative filtering
      const collaborativeResults = await this.applyCollaborativeFiltering(userId, userPattern);
      
      // Enhance recommendations with ML insights
      const enhancedRecommendations = await this.enhanceWithMLInsights(
        baseRecommendations,
        userPattern,
        collaborativeResults
      );

      // Apply dynamic ranking based on user behavior
      const rankedRecommendations = this.applyDynamicRanking(
        enhancedRecommendations,
        userPattern
      );

      return rankedRecommendations.slice(0, limit);

    } catch (error) {
      console.error('Error in ML-enhanced recommendations:', error);
      return baseRecommendations; // Fallback to base recommendations
    }
  }

  private async getUserBehaviorPattern(userId: string): Promise<UserBehaviorPattern> {
    // Get user's application history
    const { data: applications } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false })
      .limit(50);

    // Get user's saved jobs
    const { data: savedJobs } = await supabase
      .from('saved_jobs')
      .select('job_data')
      .eq('user_id', userId)
      .limit(50);

    // Analyze patterns
    const appliedJobData = applications?.map(app => app) || [];
    const savedJobData = savedJobs?.map(saved => saved.job_data) || [];

    // Extract preferences from user behavior
    const preferredSkills = this.extractPreferredSkills(appliedJobData, savedJobData);
    const preferredCompanies = this.extractPreferredCompanies(appliedJobData, savedJobData);
    const preferredJobTypes = this.extractPreferredJobTypes(appliedJobData, savedJobData);
    const salaryRange = this.extractSalaryPreferences(appliedJobData, savedJobData);

    // Calculate success metrics
    const applicationSuccessRate = this.calculateApplicationSuccessRate(appliedJobData);
    const interviewRate = this.calculateInterviewRate(appliedJobData);
    const averageTimeToApply = this.calculateAverageTimeToApply(appliedJobData, savedJobData);

    return {
      userId,
      preferredSkills,
      preferredCompanies,
      preferredJobTypes,
      salaryRange,
      applicationSuccessRate,
      interviewRate,
      averageTimeToApply
    };
  }

  private async applyCollaborativeFiltering(
    userId: string,
    userPattern: UserBehaviorPattern
  ): Promise<CollaborativeFilteringResult> {
    // Find similar users based on behavior patterns
    // This is a simplified implementation - in production you'd use more sophisticated algorithms

    const { data: allUsers } = await supabase
      .from('user_profiles')
      .select('user_id')
      .neq('user_id', userId)
      .limit(100);

    const similarUsers: string[] = [];
    
    if (allUsers) {
      // For each user, calculate similarity score
      for (const user of allUsers.slice(0, 10)) { // Limit for performance
        const otherUserPattern = await this.getUserBehaviorPattern(user.user_id);
        const similarityScore = this.calculateUserSimilarity(userPattern, otherUserPattern);
        
        if (similarityScore > 0.6) { // Threshold for similarity
          similarUsers.push(user.user_id);
        }
      }
    }

    // Get job recommendations from similar users
    const recommendedJobs = await this.getJobsFromSimilarUsers(similarUsers);

    return {
      similarUsers,
      recommendedJobs,
      confidence: similarUsers.length > 3 ? 0.8 : 0.5
    };
  }

  private calculateUserSimilarity(user1: UserBehaviorPattern, user2: UserBehaviorPattern): number {
    let similarity = 0;
    let factors = 0;

    // Skills similarity
    const skillsIntersection = user1.preferredSkills.filter(skill => 
      user2.preferredSkills.includes(skill)
    );
    const skillsUnion = new Set([...user1.preferredSkills, ...user2.preferredSkills]);
    const skillsSimilarity = skillsUnion.size > 0 ? skillsIntersection.length / skillsUnion.size : 0;
    similarity += skillsSimilarity * 0.4;
    factors += 0.4;

    // Job type similarity
    const jobTypesIntersection = user1.preferredJobTypes.filter(type => 
      user2.preferredJobTypes.includes(type)
    );
    const jobTypesSimilarity = jobTypesIntersection.length / Math.max(user1.preferredJobTypes.length, user2.preferredJobTypes.length, 1);
    similarity += jobTypesSimilarity * 0.3;
    factors += 0.3;

    // Salary range similarity
    const salaryOverlap = Math.max(0, Math.min(user1.salaryRange[1], user2.salaryRange[1]) - Math.max(user1.salaryRange[0], user2.salaryRange[0]));
    const salaryUnion = Math.max(user1.salaryRange[1], user2.salaryRange[1]) - Math.min(user1.salaryRange[0], user2.salaryRange[0]);
    const salarySimilarity = salaryUnion > 0 ? salaryOverlap / salaryUnion : 0;
    similarity += salarySimilarity * 0.3;
    factors += 0.3;

    return factors > 0 ? similarity / factors : 0;
  }

  private async getJobsFromSimilarUsers(similarUserIds: string[]): Promise<string[]> {
    const recommendedJobIds: string[] = [];

    for (const userId of similarUserIds.slice(0, 5)) { // Limit for performance
      const { data: userApplications } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('user_id', userId)
        .in('status', ['interview', 'offer', 'accepted']) // Only successful applications
        .limit(10);

      if (userApplications) {
        recommendedJobIds.push(...userApplications.map(app => app.job_id));
      }
    }

    return [...new Set(recommendedJobIds)]; // Remove duplicates
  }

  private async enhanceWithMLInsights(
    baseRecommendations: any[],
    userPattern: UserBehaviorPattern,
    collaborativeResults: CollaborativeFilteringResult
  ) {
    return baseRecommendations.map(recommendation => {
      let mlScore = recommendation.overallScore;

      // Boost score if job matches user's preferred skills
      const skillMatches = recommendation.matchingSkills.filter((skill: string) =>
        userPattern.preferredSkills.includes(skill.toLowerCase())
      );
      if (skillMatches.length > 0) {
        mlScore += skillMatches.length * 5;
      }

      // Boost score if similar users applied to this job
      if (collaborativeResults.recommendedJobs.includes(recommendation.job.id)) {
        mlScore += 15 * collaborativeResults.confidence;
      }

      // Adjust based on user's application success rate
      if (userPattern.applicationSuccessRate > 0.3) {
        // User has good success rate, can recommend slightly harder jobs
        mlScore += 5;
      } else {
        // User has low success rate, recommend easier matches
        if (recommendation.overallScore < 70) {
          mlScore -= 10;
        }
      }

      return {
        ...recommendation,
        mlEnhancedScore: Math.round(Math.min(mlScore, 100)),
        mlInsights: {
          skillPreferenceMatch: skillMatches.length,
          collaborativeBoost: collaborativeResults.recommendedJobs.includes(recommendation.job.id),
          confidenceLevel: collaborativeResults.confidence
        }
      };
    });
  }

  private applyDynamicRanking(recommendations: any[], userPattern: UserBehaviorPattern) {
    return recommendations.sort((a, b) => {
      // Primary sort by ML-enhanced score
      if (b.mlEnhancedScore !== a.mlEnhancedScore) {
        return b.mlEnhancedScore - a.mlEnhancedScore;
      }

      // Secondary sort by user preference alignment
      const aPreferenceScore = this.calculatePreferenceAlignment(a, userPattern);
      const bPreferenceScore = this.calculatePreferenceAlignment(b, userPattern);
      
      return bPreferenceScore - aPreferenceScore;
    });
  }

  private calculatePreferenceAlignment(recommendation: any, userPattern: UserBehaviorPattern): number {
    let score = 0;

    // Company preference
    if (userPattern.preferredCompanies.includes(recommendation.job.company)) {
      score += 20;
    }

    // Job type preference
    if (userPattern.preferredJobTypes.includes(recommendation.job.type)) {
      score += 15;
    }

    // Salary alignment
    const jobSalaryMin = recommendation.job.salary?.min || 0;
    const jobSalaryMax = recommendation.job.salary?.max || jobSalaryMin;
    
    if (jobSalaryMin >= userPattern.salaryRange[0] && jobSalaryMax <= userPattern.salaryRange[1]) {
      score += 10;
    }

    return score;
  }

  // Helper methods for extracting user preferences
  private extractPreferredSkills(appliedJobs: any[], savedJobs: any[]): string[] {
    const skillCounts: Record<string, number> = {};
    
    [...appliedJobs, ...savedJobs].forEach(jobData => {
      const job = jobData.job_data || jobData;
      if (job.skills) {
        job.skills.forEach((skill: string) => {
          const normalizedSkill = skill.toLowerCase();
          skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
        });
      }
    });

    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill]) => skill);
  }

  private extractPreferredCompanies(appliedJobs: any[], savedJobs: any[]): string[] {
    const companyCounts: Record<string, number> = {};
    
    [...appliedJobs, ...savedJobs].forEach(jobData => {
      const job = jobData.job_data || jobData;
      if (job.company) {
        companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
      }
    });

    return Object.entries(companyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([company]) => company);
  }

  private extractPreferredJobTypes(appliedJobs: any[], savedJobs: any[]): string[] {
    const typeCounts: Record<string, number> = {};
    
    [...appliedJobs, ...savedJobs].forEach(jobData => {
      const job = jobData.job_data || jobData;
      if (job.job_type || job.type) {
        const type = job.job_type || job.type;
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    });

    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([type]) => type);
  }

  private extractSalaryPreferences(appliedJobs: any[], savedJobs: any[]): [number, number] {
    const salaries: number[] = [];
    
    [...appliedJobs, ...savedJobs].forEach(jobData => {
      const job = jobData.job_data || jobData;
      if (job.salary_min) salaries.push(job.salary_min);
      if (job.salary_max) salaries.push(job.salary_max);
    });

    if (salaries.length === 0) return [50000, 150000]; // Default range

    salaries.sort((a, b) => a - b);
    const q1 = salaries[Math.floor(salaries.length * 0.25)];
    const q3 = salaries[Math.floor(salaries.length * 0.75)];

    return [q1, q3];
  }

  private calculateApplicationSuccessRate(appliedJobs: any[]): number {
    if (appliedJobs.length === 0) return 0;
    
    const successfulApplications = appliedJobs.filter(job => 
      ['interview', 'offer', 'accepted'].includes(job.status)
    ).length;

    return successfulApplications / appliedJobs.length;
  }

  private calculateInterviewRate(appliedJobs: any[]): number {
    if (appliedJobs.length === 0) return 0;
    
    const interviewApplications = appliedJobs.filter(job => 
      ['interview', 'offer', 'accepted'].includes(job.status)
    ).length;

    return interviewApplications / appliedJobs.length;
  }

  private calculateAverageTimeToApply(appliedJobs: any[], savedJobs: any[]): number {
    // This would require tracking when jobs were first seen vs when applied
    // For now, return a default value
    return 24; // 24 hours average
  }

  async updateUserPreferencesFromBehavior(userId: string) {
    const userPattern = await this.getUserBehaviorPattern(userId);
    
    // Update user_job_preferences table with learned preferences
    await supabase
      .from('user_job_preferences')
      .upsert({
        user_id: userId,
        preferred_roles: userPattern.preferredJobTypes,
        keywords: userPattern.preferredSkills,
        salary_min: userPattern.salaryRange[0],
        salary_max: userPattern.salaryRange[1],
        updated_at: new Date().toISOString()
      });

    console.log('Updated user preferences based on behavior patterns');
  }
}

export const mlJobRecommendationService = new MLJobRecommendationService();
