import { Job } from '@/types/job';
import { User } from '@/types/auth';

interface MatchingCriteria {
  skills: string[];
  experience: string;
  location: string;
  salaryRange: { min: number; max: number };
  preferences: {
    remote: boolean;
    jobTypes: string[];
    industries: string[];
  };
}

interface AIMatchScore {
  overallScore: number;
  skillsMatch: number;
  experienceMatch: number;
  locationMatch: number;
  salaryMatch: number;
  culturalFit: number;
  reasoning: string[];
  recommendations: string[];
}

class AIMatchingService {
  // Simulate AI matching algorithm
  async calculateMatchScore(job: Job, userProfile: User): Promise<AIMatchScore> {
    const criteria: MatchingCriteria = {
      skills: userProfile.profile.skills,
      experience: userProfile.profile.experience,
      location: userProfile.profile.location,
      salaryRange: userProfile.profile.salary_range,
      preferences: {
        remote: userProfile.profile.preferences.remote,
        jobTypes: userProfile.profile.preferences.job_types,
        industries: userProfile.profile.preferences.industries
      }
    };

    // Skills matching with AI-like analysis
    const skillsMatch = this.calculateSkillsMatch(job.skills, criteria.skills);
    
    // Experience level matching
    const experienceMatch = this.calculateExperienceMatch(job.level, criteria.experience);
    
    // Location/remote preference matching
    const locationMatch = this.calculateLocationMatch(job, criteria);
    
    // Salary matching
    const salaryMatch = this.calculateSalaryMatch(job.salary, criteria.salaryRange);
    
    // Cultural fit based on company type and job description
    const culturalFit = this.calculateCulturalFit(job, criteria);

    // Overall weighted score
    const overallScore = Math.round(
      (skillsMatch * 0.35) +
      (experienceMatch * 0.25) +
      (locationMatch * 0.15) +
      (salaryMatch * 0.15) +
      (culturalFit * 0.10)
    );

    const reasoning = this.generateReasoningInsights(job, criteria, {
      skillsMatch,
      experienceMatch,
      locationMatch,
      salaryMatch,
      culturalFit
    });

    const recommendations = this.generateRecommendations(job, criteria, overallScore);

    return {
      overallScore,
      skillsMatch,
      experienceMatch,
      locationMatch,
      salaryMatch,
      culturalFit,
      reasoning,
      recommendations
    };
  }

  private calculateSkillsMatch(jobSkills: string[], userSkills: string[]): number {
    if (!jobSkills.length) return 100;
    
    const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
    
    const matchingSkills = normalizedJobSkills.filter(skill => 
      normalizedUserSkills.includes(skill)
    );
    
    const baseMatch = (matchingSkills.length / normalizedJobSkills.length) * 100;
    
    // AI enhancement: consider related skills and transferable skills
    const relatedSkillsBonus = this.calculateRelatedSkillsBonus(
      normalizedJobSkills,
      normalizedUserSkills
    );
    
    return Math.min(100, Math.round(baseMatch + relatedSkillsBonus));
  }

  private calculateRelatedSkillsBonus(jobSkills: string[], userSkills: string[]): number {
    // Simple related skills mapping (in real AI, this would be more sophisticated)
    const relatedSkillsMap: Record<string, string[]> = {
      'react': ['javascript', 'typescript', 'jsx', 'frontend'],
      'node.js': ['javascript', 'backend', 'express', 'api'],
      'python': ['django', 'flask', 'data science', 'machine learning'],
      'java': ['spring', 'backend', 'enterprise'],
      'aws': ['cloud', 'devops', 'docker', 'kubernetes'],
      'sql': ['database', 'postgresql', 'mysql', 'data analysis']
    };

    let bonus = 0;
    for (const jobSkill of jobSkills) {
      const relatedSkills = relatedSkillsMap[jobSkill] || [];
      const hasRelated = relatedSkills.some(related => 
        userSkills.includes(related)
      );
      if (hasRelated) bonus += 5;
    }

    return Math.min(20, bonus); // Cap bonus at 20%
  }

  private calculateExperienceMatch(jobLevel: string, userExperience: string): number {
    const experienceLevels = {
      'intern': 0,
      'entry': 1,
      'mid': 2,
      'senior': 3,
      'lead': 4,
      'executive': 5,
      'manager': 3,
      'director': 4
    };

    const jobLevelNum = experienceLevels[jobLevel as keyof typeof experienceLevels] || 2;
    const userLevelNum = experienceLevels[userExperience as keyof typeof experienceLevels] || 2;

    const difference = Math.abs(jobLevelNum - userLevelNum);
    
    if (difference === 0) return 100;
    if (difference === 1) return 85;
    if (difference === 2) return 60;
    return 30;
  }

  private calculateLocationMatch(job: Job, criteria: MatchingCriteria): number {
    if (job.remote || criteria.preferences.remote) return 100;
    
    const jobLocation = job.location.toLowerCase();
    const userLocation = criteria.location.toLowerCase();
    
    if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
      return 100;
    }
    
    // Check for same state/region (simplified)
    const jobParts = jobLocation.split(',');
    const userParts = userLocation.split(',');
    
    if (jobParts.length > 1 && userParts.length > 1) {
      const sameState = jobParts[jobParts.length - 1].trim() === userParts[userParts.length - 1].trim();
      if (sameState) return 70;
    }
    
    return 40;
  }

  private calculateSalaryMatch(jobSalary: { min: number; max: number }, userRange: { min: number; max: number }): number {
    // Check if there's overlap between ranges
    const overlapMin = Math.max(jobSalary.min, userRange.min);
    const overlapMax = Math.min(jobSalary.max, userRange.max);
    
    if (overlapMin <= overlapMax) {
      const overlapSize = overlapMax - overlapMin;
      const userRangeSize = userRange.max - userRange.min;
      const overlapPercentage = overlapSize / userRangeSize;
      return Math.round(overlapPercentage * 100);
    }
    
    // No overlap - check how close they are
    if (jobSalary.max < userRange.min) {
      const gap = userRange.min - jobSalary.max;
      const gapPercentage = gap / userRange.min;
      return Math.max(0, Math.round((1 - gapPercentage) * 50));
    }
    
    return 30; // Job pays more than expected
  }

  private calculateCulturalFit(job: Job, criteria: MatchingCriteria): number {
    let score = 70; // Base cultural fit score
    
    // Job type preference
    if (criteria.preferences.jobTypes.includes(job.type)) {
      score += 20;
    }
    
    // Company type consideration - Fixed the type comparison
    if (job.companyType) {
      // Check if it's a tech company for startup preference
      if (criteria.preferences.industries.includes('technology')) {
        score += 10;
      }
    }
    
    // Benefits alignment (simplified)
    if (job.benefits && job.benefits.includes('remote work') && criteria.preferences.remote) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  private generateReasoningInsights(
    job: Job,
    criteria: MatchingCriteria,
    scores: {
      skillsMatch: number;
      experienceMatch: number;
      locationMatch: number;
      salaryMatch: number;
      culturalFit: number;
    }
  ): string[] {
    const insights: string[] = [];
    
    if (scores.skillsMatch >= 80) {
      insights.push("Strong skills alignment - you have most required technical skills");
    } else if (scores.skillsMatch >= 60) {
      insights.push("Good skills match with some gaps that could be filled through learning");
    } else {
      insights.push("Skills gap present - consider this role for growth opportunities");
    }
    
    if (scores.experienceMatch >= 85) {
      insights.push("Perfect experience level match for this role");
    } else if (scores.experienceMatch >= 60) {
      insights.push("Experience level is close - shows good career progression opportunity");
    }
    
    if (job.remote && criteria.preferences.remote) {
      insights.push("Remote work preference perfectly aligned");
    }
    
    if (scores.salaryMatch >= 80) {
      insights.push("Salary range meets your expectations");
    } else if (scores.salaryMatch < 50) {
      insights.push("Salary may be below your target range");
    }
    
    return insights;
  }

  private generateRecommendations(job: Job, criteria: MatchingCriteria, overallScore: number): string[] {
    const recommendations: string[] = [];
    
    if (overallScore >= 85) {
      recommendations.push("Highly recommended - this role aligns well with your profile");
      recommendations.push("Consider applying immediately as this is a strong match");
    } else if (overallScore >= 70) {
      recommendations.push("Good opportunity - worth applying with tailored application");
      recommendations.push("Highlight your relevant skills in cover letter");
    } else if (overallScore >= 50) {
      recommendations.push("Consider for growth - may require skill development");
      recommendations.push("Research company culture and growth opportunities");
    } else {
      recommendations.push("May not be the best fit - consider similar roles that better match your profile");
    }
    
    // Specific skill recommendations
    const userSkills = criteria.skills.map(s => s.toLowerCase());
    const missingSkills = job.skills.filter(skill => 
      !userSkills.includes(skill.toLowerCase())
    ).slice(0, 3);
    
    if (missingSkills.length > 0) {
      recommendations.push(`Consider learning: ${missingSkills.join(', ')} to strengthen your application`);
    }
    
    return recommendations;
  }

  // Bulk matching for multiple jobs
  async matchJobsBatch(jobs: Job[], userProfile: User): Promise<Map<string, AIMatchScore>> {
    const results = new Map<string, AIMatchScore>();
    
    for (const job of jobs) {
      const score = await this.calculateMatchScore(job, userProfile);
      results.set(job.id, score);
    }
    
    return results;
  }

  // Get personalized job recommendations
  async getPersonalizedRecommendations(
    allJobs: Job[],
    userProfile: User,
    limit: number = 10
  ): Promise<{ job: Job; matchScore: AIMatchScore }[]> {
    const matchResults: { job: Job; matchScore: AIMatchScore }[] = [];
    
    for (const job of allJobs) {
      const matchScore = await this.calculateMatchScore(job, userProfile);
      matchResults.push({ job, matchScore });
    }
    
    // Sort by overall score and return top matches
    return matchResults
      .sort((a, b) => b.matchScore.overallScore - a.matchScore.overallScore)
      .slice(0, limit);
  }
}

export const aiMatchingService = new AIMatchingService();
