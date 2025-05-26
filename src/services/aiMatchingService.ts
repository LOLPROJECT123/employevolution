
import { Job } from '@/types/job';

interface UserProfile {
  skills: string[];
  experience: number;
  education: string[];
  preferences: {
    salaryRange: { min: number; max: number };
    locations: string[];
    remotePreference: 'onsite' | 'remote' | 'hybrid' | 'any';
    jobTypes: string[];
    industries: string[];
  };
  workHistory: Array<{
    title: string;
    company: string;
    duration: number;
    skills: string[];
  }>;
}

interface MatchScore {
  overall: number;
  breakdown: {
    skills: number;
    experience: number;
    salary: number;
    location: number;
    jobType: number;
    industry: number;
  };
  reasons: string[];
  suggestions: string[];
}

interface SalaryPrediction {
  predictedSalary: {
    min: number;
    max: number;
    median: number;
  };
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  marketData: {
    percentile25: number;
    percentile50: number;
    percentile75: number;
    percentile90: number;
  };
  recommendations: string[];
}

interface MarketTrend {
  skill: string;
  demandGrowth: number;
  salaryGrowth: number;
  jobCount: number;
  marketHeat: 'cold' | 'warm' | 'hot' | 'extremely-hot';
}

class AIMatchingService {
  private skillWeights = new Map<string, number>();
  private industryTrends = new Map<string, number>();
  private locationMultipliers = new Map<string, number>();

  constructor() {
    this.initializeMLModels();
  }

  private initializeMLModels(): void {
    // Initialize skill importance weights
    const skills = {
      'JavaScript': 0.9, 'Python': 0.95, 'React': 0.85, 'Node.js': 0.8,
      'AWS': 0.9, 'Docker': 0.75, 'Kubernetes': 0.8, 'TypeScript': 0.85,
      'Machine Learning': 0.9, 'Data Science': 0.9, 'AI': 0.95,
      'Product Management': 0.8, 'UX Design': 0.75, 'UI Design': 0.7
    };

    Object.entries(skills).forEach(([skill, weight]) => {
      this.skillWeights.set(skill, weight);
    });

    // Initialize industry growth trends
    const industries = {
      'technology': 0.15, 'finance': 0.08, 'healthcare': 0.12,
      'e-commerce': 0.18, 'ai': 0.25, 'cybersecurity': 0.22,
      'renewable-energy': 0.20, 'gaming': 0.16
    };

    Object.entries(industries).forEach(([industry, growth]) => {
      this.industryTrends.set(industry, growth);
    });

    // Initialize location salary multipliers
    const locations = {
      'San Francisco': 1.4, 'New York': 1.3, 'Seattle': 1.2,
      'Austin': 1.1, 'Boston': 1.2, 'Los Angeles': 1.15,
      'Chicago': 1.05, 'Remote': 1.0, 'Denver': 1.0
    };

    Object.entries(locations).forEach(([location, multiplier]) => {
      this.locationMultipliers.set(location, multiplier);
    });
  }

  calculateJobMatch(job: Job, userProfile: UserProfile): MatchScore {
    const skillMatch = this.calculateSkillMatch(job.skills || [], userProfile.skills);
    const experienceMatch = this.calculateExperienceMatch(job, userProfile);
    const salaryMatch = this.calculateSalaryMatch(job, userProfile);
    const locationMatch = this.calculateLocationMatch(job, userProfile);
    const jobTypeMatch = this.calculateJobTypeMatch(job, userProfile);
    const industryMatch = this.calculateIndustryMatch(job, userProfile);

    const weights = {
      skills: 0.35,
      experience: 0.20,
      salary: 0.15,
      location: 0.15,
      jobType: 0.10,
      industry: 0.05
    };

    const overall = Math.round(
      skillMatch * weights.skills +
      experienceMatch * weights.experience +
      salaryMatch * weights.salary +
      locationMatch * weights.location +
      jobTypeMatch * weights.jobType +
      industryMatch * weights.industry
    );

    const breakdown = {
      skills: Math.round(skillMatch),
      experience: Math.round(experienceMatch),
      salary: Math.round(salaryMatch),
      location: Math.round(locationMatch),
      jobType: Math.round(jobTypeMatch),
      industry: Math.round(industryMatch)
    };

    const reasons = this.generateMatchReasons(breakdown, job, userProfile);
    const suggestions = this.generateImprovementSuggestions(breakdown, job, userProfile);

    return {
      overall,
      breakdown,
      reasons,
      suggestions
    };
  }

  private calculateSkillMatch(jobSkills: string[], userSkills: string[]): number {
    if (jobSkills.length === 0) return 80; // Default score if no skills specified

    const matchedSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    let totalWeight = 0;
    let matchedWeight = 0;

    jobSkills.forEach(skill => {
      const weight = this.skillWeights.get(skill) || 0.5;
      totalWeight += weight;
      
      if (matchedSkills.includes(skill)) {
        matchedWeight += weight;
      }
    });

    return totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
  }

  private calculateExperienceMatch(job: Job, userProfile: UserProfile): number {
    const requiredExperience = this.extractRequiredExperience(job);
    const userExperience = userProfile.experience;

    if (requiredExperience === 0) return 90; // Default if no experience requirement

    if (userExperience >= requiredExperience) {
      // Bonus for having more experience, but diminishing returns
      const bonus = Math.min((userExperience - requiredExperience) * 5, 20);
      return Math.min(100, 90 + bonus);
    } else {
      // Penalty for having less experience
      const penalty = (requiredExperience - userExperience) * 15;
      return Math.max(0, 90 - penalty);
    }
  }

  private extractRequiredExperience(job: Job): number {
    const description = (job.description + ' ' + (job.requirements?.join(' ') || '')).toLowerCase();
    
    // Look for experience patterns
    const patterns = [
      /(\d+)\+?\s*years?\s*of?\s*experience/i,
      /(\d+)\+?\s*year?\s*experience/i,
      /minimum\s*(\d+)\s*years?/i,
      /at\s*least\s*(\d+)\s*years?/i
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    // Default based on level
    switch (job.level) {
      case 'entry': return 0;
      case 'mid': return 3;
      case 'senior': return 6;
      case 'lead': return 8;
      default: return 2;
    }
  }

  private calculateSalaryMatch(job: Job, userProfile: UserProfile): number {
    if (!job.salary || !userProfile.preferences.salaryRange) return 75;

    const jobMin = job.salary.min;
    const jobMax = job.salary.max;
    const userMin = userProfile.preferences.salaryRange.min;
    const userMax = userProfile.preferences.salaryRange.max;

    // Calculate overlap
    const overlapStart = Math.max(jobMin, userMin);
    const overlapEnd = Math.min(jobMax, userMax);

    if (overlapEnd <= overlapStart) {
      // No overlap
      if (jobMax < userMin) {
        // Job pays too little
        const gap = (userMin - jobMax) / userMin;
        return Math.max(0, 50 - gap * 100);
      } else {
        // Job pays more than expected (good problem to have)
        return 95;
      }
    } else {
      // There is overlap
      const overlapSize = overlapEnd - overlapStart;
      const userRangeSize = userMax - userMin;
      const overlapRatio = overlapSize / userRangeSize;
      return Math.min(100, 80 + overlapRatio * 20);
    }
  }

  private calculateLocationMatch(job: Job, userProfile: UserProfile): number {
    const jobLocation = job.location.toLowerCase();
    const userLocations = userProfile.preferences.locations.map(loc => loc.toLowerCase());
    const remotePreference = userProfile.preferences.remotePreference;

    // Check for remote work
    if (job.remote || jobLocation.includes('remote')) {
      if (remotePreference === 'remote' || remotePreference === 'any') {
        return 100;
      } else if (remotePreference === 'hybrid') {
        return 80;
      } else {
        return 60;
      }
    }

    // Check for location match
    const locationMatch = userLocations.some(userLoc => 
      jobLocation.includes(userLoc) || userLoc.includes(jobLocation.split(',')[0])
    );

    if (locationMatch) {
      if (remotePreference === 'onsite' || remotePreference === 'any') {
        return 100;
      } else {
        return 70; // User prefers remote but job is onsite in preferred location
      }
    }

    // No location match
    if (remotePreference === 'any') {
      return 60; // Willing to relocate
    } else {
      return 30; // Not a good location match
    }
  }

  private calculateJobTypeMatch(job: Job, userProfile: UserProfile): number {
    const jobType = job.type;
    const preferredTypes = userProfile.preferences.jobTypes;

    if (preferredTypes.includes(jobType)) {
      return 100;
    } else if (preferredTypes.includes('any')) {
      return 85;
    } else {
      return 40;
    }
  }

  private calculateIndustryMatch(job: Job, userProfile: UserProfile): number {
    // This would typically extract industry from job data
    // For now, we'll use a simplified approach
    const preferredIndustries = userProfile.preferences.industries;
    
    if (preferredIndustries.includes('any') || preferredIndustries.length === 0) {
      return 85;
    }

    // Simplified industry matching based on company or job title
    const jobText = (job.company + ' ' + job.title).toLowerCase();
    const industryMatch = preferredIndustries.some(industry => 
      jobText.includes(industry.toLowerCase())
    );

    return industryMatch ? 100 : 60;
  }

  private generateMatchReasons(breakdown: any, job: Job, userProfile: UserProfile): string[] {
    const reasons: string[] = [];

    if (breakdown.skills >= 80) {
      reasons.push('Strong skills alignment with job requirements');
    } else if (breakdown.skills >= 60) {
      reasons.push('Good skills match with some gaps to address');
    }

    if (breakdown.experience >= 80) {
      reasons.push('Experience level matches job requirements well');
    }

    if (breakdown.salary >= 80) {
      reasons.push('Salary range aligns with your expectations');
    }

    if (breakdown.location >= 80) {
      reasons.push('Location preferences match job offering');
    }

    if (job.remote && userProfile.preferences.remotePreference !== 'onsite') {
      reasons.push('Remote work option available');
    }

    return reasons;
  }

  private generateImprovementSuggestions(breakdown: any, job: Job, userProfile: UserProfile): string[] {
    const suggestions: string[] = [];

    if (breakdown.skills < 70) {
      const missingSkills = (job.skills || []).filter(skill => 
        !userProfile.skills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      
      if (missingSkills.length > 0) {
        suggestions.push(`Consider learning: ${missingSkills.slice(0, 3).join(', ')}`);
      }
    }

    if (breakdown.experience < 70) {
      suggestions.push('Highlight relevant project experience and transferable skills');
    }

    if (breakdown.salary < 60) {
      suggestions.push('Consider if salary expectations align with market rates for this role');
    }

    return suggestions;
  }

  predictSalary(jobTitle: string, location: string, skills: string[], experience: number): SalaryPrediction {
    // Base salary calculation
    const baseSalary = this.getBaseSalaryForTitle(jobTitle);
    
    // Location multiplier
    const locationMultiplier = this.locationMultipliers.get(location) || 1.0;
    
    // Experience multiplier
    const experienceMultiplier = 1 + (experience * 0.05); // 5% per year
    
    // Skills premium
    const skillsPremium = this.calculateSkillsPremium(skills);
    
    // Calculate final salary
    const adjustedSalary = baseSalary * locationMultiplier * experienceMultiplier * (1 + skillsPremium);
    
    const min = Math.round(adjustedSalary * 0.85);
    const max = Math.round(adjustedSalary * 1.25);
    const median = Math.round(adjustedSalary);

    // Calculate confidence based on data availability
    const confidence = this.calculatePredictionConfidence(jobTitle, location, skills);

    // Generate impact factors
    const factors = this.generateSalaryFactors(locationMultiplier, experienceMultiplier, skillsPremium);

    // Generate market percentiles
    const marketData = {
      percentile25: Math.round(median * 0.8),
      percentile50: median,
      percentile75: Math.round(median * 1.2),
      percentile90: Math.round(median * 1.4)
    };

    // Generate recommendations
    const recommendations = this.generateSalaryRecommendations(jobTitle, skills, experience);

    return {
      predictedSalary: { min, max, median },
      confidence,
      factors,
      marketData,
      recommendations
    };
  }

  private getBaseSalaryForTitle(jobTitle: string): number {
    const titleMap = new Map([
      ['software engineer', 120000],
      ['senior software engineer', 150000],
      ['staff software engineer', 180000],
      ['principal software engineer', 220000],
      ['data scientist', 130000],
      ['senior data scientist', 160000],
      ['product manager', 140000],
      ['senior product manager', 170000],
      ['ux designer', 110000],
      ['senior ux designer', 135000],
      ['devops engineer', 125000],
      ['senior devops engineer', 155000]
    ]);

    const normalizedTitle = jobTitle.toLowerCase();
    
    for (const [title, salary] of titleMap) {
      if (normalizedTitle.includes(title)) {
        return salary;
      }
    }

    return 115000; // Default base salary
  }

  private calculateSkillsPremium(skills: string[]): number {
    let premium = 0;
    
    skills.forEach(skill => {
      const skillWeight = this.skillWeights.get(skill) || 0.5;
      premium += skillWeight * 0.05; // 5% premium per skill point
    });

    return Math.min(premium, 0.3); // Cap at 30% premium
  }

  private calculatePredictionConfidence(jobTitle: string, location: string, skills: string[]): number {
    let confidence = 70; // Base confidence

    // Boost confidence for common titles
    const commonTitles = ['software engineer', 'data scientist', 'product manager'];
    if (commonTitles.some(title => jobTitle.toLowerCase().includes(title))) {
      confidence += 15;
    }

    // Boost confidence for major markets
    const majorMarkets = ['San Francisco', 'New York', 'Seattle'];
    if (majorMarkets.some(market => location.includes(market))) {
      confidence += 10;
    }

    // Boost confidence for in-demand skills
    const inDemandSkills = ['Python', 'JavaScript', 'React', 'AWS', 'Machine Learning'];
    const matchedSkills = skills.filter(skill => inDemandSkills.includes(skill));
    confidence += matchedSkills.length * 2;

    return Math.min(confidence, 95);
  }

  private generateSalaryFactors(locationMultiplier: number, experienceMultiplier: number, skillsPremium: number): Array<{
    factor: string;
    impact: number;
    description: string;
  }> {
    return [
      {
        factor: 'Location',
        impact: Math.round((locationMultiplier - 1) * 100),
        description: locationMultiplier > 1 ? 'High-cost area increases salary' : 'Lower-cost area decreases salary'
      },
      {
        factor: 'Experience',
        impact: Math.round((experienceMultiplier - 1) * 100),
        description: 'Years of experience impact on compensation'
      },
      {
        factor: 'Skills',
        impact: Math.round(skillsPremium * 100),
        description: 'Premium for in-demand technical skills'
      }
    ];
  }

  private generateSalaryRecommendations(jobTitle: string, skills: string[], experience: number): string[] {
    const recommendations: string[] = [];

    // High-value skills to learn
    const highValueSkills = ['Python', 'AWS', 'Kubernetes', 'Machine Learning', 'AI'];
    const missingHighValueSkills = highValueSkills.filter(skill => !skills.includes(skill));
    
    if (missingHighValueSkills.length > 0) {
      recommendations.push(`Consider learning ${missingHighValueSkills[0]} to increase market value`);
    }

    // Experience recommendations
    if (experience < 3) {
      recommendations.push('Focus on gaining experience with challenging projects');
    } else if (experience >= 5) {
      recommendations.push('Consider leadership or architecture roles for higher compensation');
    }

    // Market timing
    recommendations.push('Current market conditions favor job seekers in tech');

    return recommendations;
  }

  getMarketTrends(): MarketTrend[] {
    const trends: MarketTrend[] = [
      {
        skill: 'AI/Machine Learning',
        demandGrowth: 45.2,
        salaryGrowth: 23.1,
        jobCount: 8500,
        marketHeat: 'extremely-hot'
      },
      {
        skill: 'Kubernetes',
        demandGrowth: 38.7,
        salaryGrowth: 19.5,
        jobCount: 5200,
        marketHeat: 'extremely-hot'
      },
      {
        skill: 'React',
        demandGrowth: 25.3,
        salaryGrowth: 12.8,
        jobCount: 12000,
        marketHeat: 'hot'
      },
      {
        skill: 'Python',
        demandGrowth: 22.1,
        salaryGrowth: 15.2,
        jobCount: 15000,
        marketHeat: 'hot'
      },
      {
        skill: 'AWS',
        demandGrowth: 28.9,
        salaryGrowth: 16.7,
        jobCount: 9800,
        marketHeat: 'hot'
      },
      {
        skill: 'TypeScript',
        demandGrowth: 35.4,
        salaryGrowth: 18.3,
        jobCount: 7500,
        marketHeat: 'extremely-hot'
      }
    ];

    return trends.sort((a, b) => b.demandGrowth - a.demandGrowth);
  }

  generateCareerRoadmap(userProfile: UserProfile, targetRole: string): {
    currentLevel: string;
    targetLevel: string;
    steps: Array<{
      step: number;
      title: string;
      description: string;
      skills: string[];
      timeframe: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    estimatedTimeframe: string;
  } {
    const currentLevel = this.assessCurrentLevel(userProfile);
    const steps = this.generateRoadmapSteps(userProfile, targetRole);
    
    return {
      currentLevel,
      targetLevel: targetRole,
      steps,
      estimatedTimeframe: this.calculateTotalTimeframe(steps)
    };
  }

  private assessCurrentLevel(userProfile: UserProfile): string {
    const experience = userProfile.experience;
    const skillCount = userProfile.skills.length;
    
    if (experience >= 8 || skillCount >= 15) return 'Senior';
    if (experience >= 4 || skillCount >= 10) return 'Mid-level';
    if (experience >= 1 || skillCount >= 5) return 'Junior';
    return 'Entry-level';
  }

  private generateRoadmapSteps(userProfile: UserProfile, targetRole: string): any[] {
    // This would be much more sophisticated in a real implementation
    const steps = [
      {
        step: 1,
        title: 'Strengthen Core Skills',
        description: 'Focus on mastering fundamental technologies',
        skills: ['JavaScript', 'Python', 'Git'],
        timeframe: '2-3 months',
        priority: 'high' as const
      },
      {
        step: 2,
        title: 'Learn Modern Frameworks',
        description: 'Gain expertise in current industry-standard frameworks',
        skills: ['React', 'Node.js', 'Express'],
        timeframe: '3-4 months',
        priority: 'high' as const
      },
      {
        step: 3,
        title: 'Cloud and DevOps',
        description: 'Understand cloud platforms and deployment',
        skills: ['AWS', 'Docker', 'CI/CD'],
        timeframe: '2-3 months',
        priority: 'medium' as const
      }
    ];

    return steps;
  }

  private calculateTotalTimeframe(steps: any[]): string {
    // Simple calculation - in reality this would be more complex
    const totalMonths = steps.reduce((sum, step) => {
      const months = parseInt(step.timeframe.split('-')[1]);
      return sum + months;
    }, 0);

    return `${Math.floor(totalMonths / 12)} years ${totalMonths % 12} months`;
  }
}

export const aiMatchingService = new AIMatchingService();
