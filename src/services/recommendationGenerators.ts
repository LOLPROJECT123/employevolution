
import { Job } from '@/types/job';

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
}
