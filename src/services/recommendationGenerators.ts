
import { Job } from '@/types/job';
import { User } from '@/types/auth';

export interface RecommendationCriteria {
  skills: string[];
  experienceLevel: string;
  location: string;
  salaryRange: [number, number];
  jobType: string[];
  industries: string[];
}

export interface JobRecommendation {
  job: Job;
  matchScore: number;
  reasons: string[];
  missingSkills: string[];
}

export interface MatchScoreBreakdown {
  skillsMatch: number;
  experienceMatch: number;
  locationMatch: number;
  salaryMatch: number;
  culturalFit: number;
  careerGrowth: number;
  workLifeBalance: number;
}

export class RecommendationGenerators {
  static generateJobRecommendations(
    jobs: Job[],
    criteria: RecommendationCriteria,
    userSkills: string[] = []
  ): JobRecommendation[] {
    return jobs.map(job => {
      let matchScore = 0;
      const reasons: string[] = [];
      const missingSkills: string[] = [];

      // Skills matching (40% weight)
      const jobSkills = job.skills || [];
      const matchingSkills = jobSkills.filter(skill => 
        userSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
      
      const skillMatchPercentage = jobSkills.length > 0 ? 
        (matchingSkills.length / jobSkills.length) * 100 : 0;
      matchScore += skillMatchPercentage * 0.4;

      if (matchingSkills.length > 0) {
        reasons.push(`${matchingSkills.length} matching skills: ${matchingSkills.slice(0, 3).join(', ')}`);
      }

      // Find missing skills
      const userSkillsLower = userSkills.map(s => s.toLowerCase());
      const missing = jobSkills.filter(skill => 
        !userSkillsLower.some(userSkill => 
          userSkill.includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill)
        )
      );
      missingSkills.push(...missing);

      // Experience level matching (25% weight)
      const userLevel = criteria.experienceLevel.toLowerCase();
      const jobLevel = job.level.toLowerCase();
      
      let experienceMatch = 0;
      if (userLevel === jobLevel) {
        experienceMatch = 100;
        reasons.push('Perfect experience level match');
      } else if (
        (userLevel === 'mid' && jobLevel === 'senior') ||
        (userLevel === 'entry' && jobLevel === 'mid') ||
        (userLevel === 'senior' && jobLevel === 'executive')
      ) {
        experienceMatch = 75;
        reasons.push('Good experience level progression');
      } else if (
        (userLevel === 'senior' && jobLevel === 'mid') ||
        (userLevel === 'mid' && jobLevel === 'entry')
      ) {
        experienceMatch = 50;
        reasons.push('Overqualified but relevant');
      }
      
      matchScore += experienceMatch * 0.25;

      // Location matching (15% weight)
      if (job.remote || job.workModel === 'remote') {
        matchScore += 100 * 0.15;
        reasons.push('Remote work available');
      } else if (job.location.toLowerCase().includes(criteria.location.toLowerCase())) {
        matchScore += 100 * 0.15;
        reasons.push('Location match');
      } else if (job.workModel === 'hybrid') {
        matchScore += 75 * 0.15;
        reasons.push('Hybrid work model');
      }

      // Salary matching (10% weight)
      const jobSalaryMin = job.salary?.min || 0;
      const jobSalaryMax = job.salary?.max || 0;
      const userSalaryMin = criteria.salaryRange[0];
      const userSalaryMax = criteria.salaryRange[1];

      if (jobSalaryMax >= userSalaryMin && jobSalaryMin <= userSalaryMax) {
        const overlap = Math.min(jobSalaryMax, userSalaryMax) - Math.max(jobSalaryMin, userSalaryMin);
        const userRange = userSalaryMax - userSalaryMin;
        const overlapPercentage = userRange > 0 ? (overlap / userRange) * 100 : 100;
        matchScore += overlapPercentage * 0.1;
        
        if (jobSalaryMin >= userSalaryMin) {
          reasons.push('Salary meets expectations');
        }
      }

      // Job type matching (10% weight)
      if (criteria.jobType.includes(job.type)) {
        matchScore += 100 * 0.1;
        reasons.push(`${job.type} position type match`);
      }

      return {
        job,
        matchScore: Math.min(100, Math.round(matchScore)),
        reasons: reasons.slice(0, 4), // Limit to top 4 reasons
        missingSkills: missingSkills.slice(0, 5) // Limit to top 5 missing skills
      };
    })
    .filter(rec => rec.matchScore > 30) // Only return recommendations with >30% match
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20); // Top 20 recommendations
  }

  static generateAdvancedReasoning(
    job: Job, 
    userProfile: User, 
    matchBreakdown: MatchScoreBreakdown
  ): string {
    const reasons = [];
    
    if (matchBreakdown.skillsMatch > 80) {
      reasons.push(`Excellent skills match (${Math.round(matchBreakdown.skillsMatch)}%)`);
    } else if (matchBreakdown.skillsMatch > 60) {
      reasons.push(`Good skills alignment (${Math.round(matchBreakdown.skillsMatch)}%)`);
    }
    
    if (matchBreakdown.experienceMatch > 80) {
      reasons.push('Experience level perfectly aligned');
    }
    
    if (matchBreakdown.locationMatch > 80) {
      reasons.push('Location preferences met');
    }
    
    if (matchBreakdown.salaryMatch > 80) {
      reasons.push('Salary expectations aligned');
    }
    
    return reasons.join('. ') || 'This position has potential based on your profile.';
  }

  static generatePersonalizedRecommendations(
    job: Job, 
    userProfile: User, 
    overallScore: number
  ): string[] {
    const recommendations = [];
    
    if (overallScore > 80) {
      recommendations.push('This is an excellent match - consider applying immediately');
      recommendations.push('Tailor your resume to highlight relevant experience');
    } else if (overallScore > 60) {
      recommendations.push('Good potential match - review requirements carefully');
      recommendations.push('Consider reaching out to current employees for insights');
    } else {
      recommendations.push('Moderate match - focus on skill development');
      recommendations.push('Use this as a learning opportunity');
    }
    
    return recommendations;
  }

  static generateResumeOptimizations(job: Job, userProfile: User): string[] {
    const optimizations = [];
    
    if (job.skills && job.skills.length > 0) {
      optimizations.push(`Highlight these key skills: ${job.skills.slice(0, 3).join(', ')}`);
    }
    
    optimizations.push('Use action verbs to describe your achievements');
    optimizations.push('Quantify your accomplishments with specific metrics');
    
    return optimizations;
  }

  static generateInterviewTips(job: Job, userProfile: User): string[] {
    const tips = [];
    
    tips.push(`Research ${job.company}'s recent developments and culture`);
    tips.push('Prepare specific examples using the STAR method');
    tips.push('Practice explaining your experience with relevant technologies');
    
    if (job.level === 'senior' || job.level === 'executive') {
      tips.push('Prepare to discuss leadership and strategic thinking');
    }
    
    return tips;
  }

  static generateWhyRecommended(job: Job, matchScore: any): string {
    if (matchScore.overallScore > 80) {
      return 'This position aligns excellently with your profile and career goals.';
    } else if (matchScore.overallScore > 60) {
      return 'This role offers good growth potential and matches several of your key qualifications.';
    } else {
      return 'This position could help you develop new skills and expand your experience.';
    }
  }

  static generateActionItems(job: Job, matchScore: any): string[] {
    const items = [];
    
    items.push('Review the full job description thoroughly');
    items.push('Update your resume to match key requirements');
    items.push('Research the company and hiring manager');
    
    if (matchScore.overallScore > 70) {
      items.push('Apply within the next 48 hours');
    } else {
      items.push('Consider applying after skill development');
    }
    
    return items;
  }

  static calculateApplicationDeadline(job: Job): string {
    // Calculate a reasonable deadline based on when the job was posted
    const postedDate = new Date(job.postedAt);
    const deadline = new Date(postedDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from posting
    return deadline.toISOString();
  }
}
