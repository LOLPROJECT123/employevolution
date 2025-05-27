
import { Job } from '@/types/job';
import { User } from '@/types/auth';
import { UserPreferences } from '@/types/aiMatching';

export class JobMatchingCalculators {
  private experienceLevels = {
    'intern': { min: 0, max: 0.5, points: 0 },
    'entry': { min: 0, max: 2, points: 1 },
    'mid': { min: 2, max: 5, points: 3 },
    'senior': { min: 5, max: 8, points: 6 },
    'lead': { min: 7, max: 12, points: 8 },
    'manager': { min: 5, max: 10, points: 7 },
    'director': { min: 8, max: 15, points: 10 },
    'executive': { min: 10, max: 20, points: 12 }
  };

  calculateExperienceMatchAdvanced(jobLevel: string, userExperience: string): number {
    const jobLevelData = this.experienceLevels[jobLevel as keyof typeof this.experienceLevels] || this.experienceLevels.mid;
    const userLevelData = this.experienceLevels[userExperience as keyof typeof this.experienceLevels] || this.experienceLevels.mid;

    const difference = Math.abs(jobLevelData.points - userLevelData.points);
    
    if (difference === 0) return 100;
    if (difference === 1) return 90;
    if (difference === 2) return 75;
    if (difference === 3) return 60;
    if (difference === 4) return 45;
    return 30;
  }

  calculateLocationMatchAdvanced(job: Job, userLocation: string): number {
    if (job.remote) return 100;
    
    const jobLocation = job.location.toLowerCase();
    const userLoc = userLocation.toLowerCase();
    
    if (jobLocation === userLoc) return 100;
    if (jobLocation.includes(userLoc) || userLoc.includes(jobLocation)) return 95;
    
    // Check for same city/state
    const jobParts = jobLocation.split(',').map(p => p.trim());
    const userParts = userLoc.split(',').map(p => p.trim());
    
    if (jobParts.length > 0 && userParts.length > 0) {
      if (jobParts[0] === userParts[0]) return 85; // Same city
      if (jobParts.length > 1 && userParts.length > 1 && jobParts[1] === userParts[1]) return 70; // Same state
    }
    
    return 40; // Different location, no remote
  }

  calculateSalaryMatchAdvanced(jobSalary: { min: number; max: number }, userRange: { min: number; max: number }): number {
    if (userRange.min === 0 && userRange.max === 0) return 75; // No preference set
    
    const jobMid = (jobSalary.min + jobSalary.max) / 2;
    const userMid = (userRange.min + userRange.max) / 2;
    
    if (jobMid >= userRange.min && jobMid <= userRange.max) return 100;
    
    const difference = Math.abs(jobMid - userMid) / userMid;
    
    if (difference <= 0.1) return 90;
    if (difference <= 0.2) return 75;
    if (difference <= 0.3) return 60;
    if (difference <= 0.5) return 40;
    
    return 20;
  }

  async calculateCulturalFitAdvanced(job: Job, userProfile: User): Promise<number> {
    let score = 70; // Base score
    
    const preferences = (userProfile.profile?.preferences || {}) as UserPreferences;
    
    // Work model preference - safely access properties
    if (job.workModel === 'remote' && preferences.remote === true) score += 15;
    if (job.workModel === 'hybrid' && (preferences.remote === true || preferences.flexible_schedule === true)) score += 10;
    
    // Company size preference - safely access array
    const companySizes = preferences.company_sizes || [];
    if (Array.isArray(companySizes) && companySizes.includes(job.companySize || '')) score += 10;
    
    // Industry preference - safely access array
    const industries = preferences.industries || [];
    if (Array.isArray(industries) && job.category && industries.includes(job.category)) score += 10;
    
    // Benefits alignment - safely access arrays
    if (job.benefits && Array.isArray(job.benefits)) {
      const userBenefitPrefs = preferences.benefits || [];
      if (Array.isArray(userBenefitPrefs)) {
        const matchingBenefits = job.benefits.filter(benefit => 
          userBenefitPrefs.some(pref => benefit.toLowerCase().includes(pref.toLowerCase()))
        );
        score += Math.min(15, matchingBenefits.length * 3);
      }
    }
    
    return Math.min(100, score);
  }

  calculateCareerGrowthPotential(job: Job, userProfile: User): number {
    let score = 60; // Base score
    
    // Company size often correlates with growth opportunities
    if (job.companySize === 'enterprise') score += 15;
    if (job.companySize === 'mid-size') score += 10;
    if (job.companySize === 'startup') score += 20; // High growth potential
    
    // Job level advancement potential
    const currentLevel = userProfile.profile?.experience || 'mid';
    if (job.level === this.getNextCareerLevel(currentLevel)) score += 20;
    
    // Industry growth
    if (job.category === 'technology' || job.category === 'ai' || job.category === 'fintech') score += 10;
    
    return Math.min(100, score);
  }

  calculateWorkLifeBalance(job: Job, userProfile: User): number {
    let score = 70; // Base score
    
    if (job.remote) score += 20;
    if (job.workModel === 'hybrid') score += 15;
    
    if (job.benefits && Array.isArray(job.benefits)) {
      const workLifeBenefits = ['flexible pto', 'work life balance', 'flexible hours', 'mental health'];
      const hasWorkLifeBenefits = job.benefits.some(benefit =>
        workLifeBenefits.some(wlb => benefit.toLowerCase().includes(wlb))
      );
      if (hasWorkLifeBenefits) score += 15;
    }
    
    // Startup vs established company considerations
    if (job.companySize === 'startup') score -= 10; // Startups often have longer hours
    if (job.companySize === 'enterprise') score += 10;
    
    return Math.min(100, score);
  }

  private getNextCareerLevel(currentLevel: string): string {
    const progression: Record<string, string> = {
      'intern': 'entry',
      'entry': 'mid',
      'mid': 'senior',
      'senior': 'lead',
      'lead': 'manager',
      'manager': 'director'
    };
    
    return progression[currentLevel] || currentLevel;
  }
}

export const jobMatchingCalculators = new JobMatchingCalculators();
