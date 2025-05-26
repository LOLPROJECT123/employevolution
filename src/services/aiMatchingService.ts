import { Job } from '@/types/job';

interface UserProfile {
  skills: string[];
  experienceLevel: string;
  preferredLocation: string;
  salaryExpectation: number;
}

class AIMatchingService {
  calculateJobMatch(job: Job, userProfile: UserProfile): Job {
    let overallMatch = 0;
    const reasons: string[] = [];
    const suggestions: string[] = [];

    const skillsMatch = this.calculateSkillsMatch(userProfile.skills, job.skills || []);
    const experienceMatch = this.calculateExperienceMatch(userProfile.experienceLevel, job.level);
    const locationMatch = this.calculateLocationMatch(userProfile.preferredLocation, job.location);
    const salaryMatch = this.calculateSalaryMatch(userProfile.salaryExpectation, job.salary?.min || 0, job.salary?.max || 0);

    overallMatch = Math.round((skillsMatch * 0.4) + (experienceMatch * 0.3) + (locationMatch * 0.15) + (salaryMatch * 0.15));

    if (overallMatch < 50) {
      reasons.push("The job does not closely align with your profile.");
      suggestions.push("Consider broadening your search criteria or updating your profile.");
    }

    return {
      ...job,
      matchPercentage: overallMatch,
      aiMatchData: {
        overall: overallMatch,
        skillsMatch: skillsMatch,
        salaryMatch: salaryMatch,
        locationMatch: locationMatch,
        experienceMatch: experienceMatch,
        reasons: reasons,
        suggestions: suggestions
      }
    };
  }

  private calculateSkillsMatch(userSkills: string[], jobSkills: string[]): number {
    if (!userSkills || userSkills.length === 0 || !jobSkills || jobSkills.length === 0) {
      return 20;
    }

    const matchedSkills = userSkills.filter(skill =>
      jobSkills.some(jobSkill => skill.toLowerCase() === jobSkill.toLowerCase())
    );

    const matchPercentage = (matchedSkills.length / userSkills.length) * 100;
    return Math.min(matchPercentage, 100);
  }

  private calculateLocationMatch(userLocation: string, jobLocation: string): number {
    if (!userLocation || !jobLocation) {
      return 20;
    }

    const userLocationLower = userLocation.toLowerCase();
    const jobLocationLower = jobLocation.toLowerCase();

    if (userLocationLower === jobLocationLower) {
      return 100;
    } else if (jobLocationLower.includes(userLocationLower) || userLocationLower.includes(jobLocationLower)) {
      return 75;
    } else if (jobLocationLower.includes('remote') || userLocationLower.includes('remote')) {
      return 80;
    } else {
      return 30;
    }
  }

  private calculateSalaryMatch(userSalary: number, jobSalaryMin: number, jobSalaryMax: number): number {
    if (!userSalary || !jobSalaryMin || !jobSalaryMax) {
      return 20;
    }

    if (userSalary >= jobSalaryMin && userSalary <= jobSalaryMax) {
      return 100;
    } else if (userSalary < jobSalaryMin) {
      const percentageBelow = ((jobSalaryMin - userSalary) / userSalary) * 100;
      if (percentageBelow <= 10) return 70;
      if (percentageBelow <= 20) return 50;
      return 30;
    } else {
      return 40;
    }
  }

  private calculateExperienceMatch(userLevel: string, jobLevel: string): number {
    const levelHierarchy = {
      'intern': 0,
      'entry': 1,
      'mid': 2,
      'senior': 3,
      'lead': 3.5,
      'executive': 4
    };

    const userLevelNum = levelHierarchy[userLevel as keyof typeof levelHierarchy] || 1;
    const jobLevelNum = levelHierarchy[jobLevel as keyof typeof levelHierarchy] || 1;

    const difference = Math.abs(userLevelNum - jobLevelNum);
    
    if (difference === 0) return 100;
    if (difference <= 0.5) return 90;
    if (difference <= 1) return 75;
    if (difference <= 1.5) return 60;
    if (difference <= 2) return 40;
    return 20;
  }
}

export const aiMatchingService = new AIMatchingService();
