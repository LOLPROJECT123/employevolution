
import { Job } from '@/types/job';
import { User } from '@/types/auth';

interface AIJobMatchScore {
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

interface PersonalizedRecommendation {
  job: Job;
  matchScore: AIJobMatchScore;
  reasonWhy: string;
  actionItems: string[];
  deadline?: string;
}

interface UserPreferences {
  remote?: boolean;
  flexible_schedule?: boolean;
  company_sizes?: string[];
  industries?: string[];
  benefits?: string[];
  job_types?: string[];
}

class EnhancedAiMatchingService {
  async calculateAdvancedMatch(job: Job, userProfile: User): Promise<AIJobMatchScore> {
    // Enhanced AI matching with multiple criteria
    const skillsMatch = await this.calculateSkillsMatchAdvanced(job.skills, userProfile.profile?.skills || []);
    const experienceMatch = this.calculateExperienceMatchAdvanced(job.level, userProfile.profile?.experience || '');
    const locationMatch = this.calculateLocationMatchAdvanced(job, userProfile.profile?.location || '');
    const salaryMatch = this.calculateSalaryMatchAdvanced(job.salary, userProfile.profile?.salary_range || { min: 0, max: 0 });
    const culturalFit = await this.calculateCulturalFitAdvanced(job, userProfile);
    const careerGrowth = this.calculateCareerGrowthPotential(job, userProfile);
    const workLifeBalance = this.calculateWorkLifeBalance(job, userProfile);

    const overallScore = Math.round(
      (skillsMatch * 0.30) +
      (experienceMatch * 0.20) +
      (locationMatch * 0.10) +
      (salaryMatch * 0.15) +
      (culturalFit * 0.10) +
      (careerGrowth * 0.10) +
      (workLifeBalance * 0.05)
    );

    const reasoning = this.generateAdvancedReasoning(job, userProfile, {
      skillsMatch, experienceMatch, locationMatch, salaryMatch, 
      culturalFit, careerGrowth, workLifeBalance
    });

    const recommendations = this.generatePersonalizedRecommendations(job, userProfile, overallScore);
    const resumeOptimizations = this.generateResumeOptimizations(job, userProfile);
    const interviewTips = this.generateInterviewTips(job, userProfile);

    return {
      overallScore,
      skillsMatch,
      experienceMatch,
      locationMatch,
      salaryMatch,
      culturalFit,
      careerGrowth,
      workLifeBalance,
      reasoning,
      recommendations,
      resumeOptimizations,
      interviewTips
    };
  }

  private async calculateSkillsMatchAdvanced(jobSkills: string[], userSkills: string[]): Promise<number> {
    const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
    
    // Direct matches
    const directMatches = normalizedJobSkills.filter(skill => 
      normalizedUserSkills.includes(skill)
    );
    
    // Related skills using AI-like mapping
    const relatedMatches = this.findRelatedSkills(normalizedJobSkills, normalizedUserSkills);
    
    // Transferable skills
    const transferableMatches = this.findTransferableSkills(normalizedJobSkills, normalizedUserSkills);
    
    const totalRequired = normalizedJobSkills.length;
    const matchScore = totalRequired > 0 ? 
      ((directMatches.length * 1.0) + (relatedMatches * 0.7) + (transferableMatches * 0.4)) / totalRequired * 100 : 100;
    
    return Math.min(100, Math.round(matchScore));
  }

  private findRelatedSkills(jobSkills: string[], userSkills: string[]): number {
    const skillRelations: Record<string, string[]> = {
      'react': ['javascript', 'typescript', 'jsx', 'frontend', 'web development'],
      'node.js': ['javascript', 'typescript', 'backend', 'express', 'api development'],
      'python': ['django', 'flask', 'data science', 'machine learning', 'automation'],
      'java': ['spring', 'backend', 'enterprise', 'microservices'],
      'aws': ['cloud', 'devops', 'docker', 'kubernetes', 'infrastructure'],
      'docker': ['containerization', 'devops', 'kubernetes', 'microservices'],
      'sql': ['database', 'postgresql', 'mysql', 'data analysis', 'rdbms'],
      'machine learning': ['python', 'tensorflow', 'pytorch', 'data science', 'ai'],
      'typescript': ['javascript', 'frontend', 'backend', 'web development'],
      'kubernetes': ['docker', 'devops', 'cloud', 'orchestration', 'containers']
    };

    let relatedCount = 0;
    for (const jobSkill of jobSkills) {
      const related = skillRelations[jobSkill] || [];
      if (related.some(rel => userSkills.includes(rel))) {
        relatedCount++;
      }
    }
    
    return relatedCount;
  }

  private findTransferableSkills(jobSkills: string[], userSkills: string[]): number {
    const transferableSkills = [
      'problem solving', 'communication', 'teamwork', 'leadership',
      'project management', 'agile', 'scrum', 'git', 'testing'
    ];
    
    let transferableCount = 0;
    for (const jobSkill of jobSkills) {
      if (transferableSkills.includes(jobSkill) && userSkills.includes(jobSkill)) {
        transferableCount++;
      }
    }
    
    return transferableCount;
  }

  private calculateExperienceMatchAdvanced(jobLevel: string, userExperience: string): number {
    const experienceLevels = {
      'intern': { min: 0, max: 0.5, points: 0 },
      'entry': { min: 0, max: 2, points: 1 },
      'mid': { min: 2, max: 5, points: 3 },
      'senior': { min: 5, max: 8, points: 6 },
      'lead': { min: 7, max: 12, points: 8 },
      'manager': { min: 5, max: 10, points: 7 },
      'director': { min: 8, max: 15, points: 10 },
      'executive': { min: 10, max: 20, points: 12 }
    };

    const jobLevelData = experienceLevels[jobLevel as keyof typeof experienceLevels] || experienceLevels.mid;
    const userLevelData = experienceLevels[userExperience as keyof typeof experienceLevels] || experienceLevels.mid;

    const difference = Math.abs(jobLevelData.points - userLevelData.points);
    
    if (difference === 0) return 100;
    if (difference === 1) return 90;
    if (difference === 2) return 75;
    if (difference === 3) return 60;
    if (difference === 4) return 45;
    return 30;
  }

  private calculateLocationMatchAdvanced(job: Job, userLocation: string): number {
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

  private calculateSalaryMatchAdvanced(jobSalary: { min: number; max: number }, userRange: { min: number; max: number }): number {
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

  private async calculateCulturalFitAdvanced(job: Job, userProfile: User): Promise<number> {
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
    if (Array.isArray(industries) && industries.includes(job.category || '')) score += 10;
    
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

  private calculateCareerGrowthPotential(job: Job, userProfile: User): number {
    let score = 60; // Base score
    
    // Company size often correlates with growth opportunities
    if (job.companySize === 'large' || job.companySize === 'enterprise') score += 15;
    if (job.companySize === 'mid-size') score += 10;
    if (job.companySize === 'early') score += 20; // High growth potential
    
    // Job level advancement potential
    const currentLevel = userProfile.profile?.experience || 'mid';
    if (job.level === this.getNextCareerLevel(currentLevel)) score += 20;
    
    // Industry growth
    if (job.category === 'technology' || job.category === 'ai' || job.category === 'fintech') score += 10;
    
    return Math.min(100, score);
  }

  private calculateWorkLifeBalance(job: Job, userProfile: User): number {
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
    if (job.companySize === 'early' || job.companySize === 'seed') score -= 10; // Startups often have longer hours
    if (job.companySize === 'large' || job.companySize === 'enterprise') score += 10;
    
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

  private generateAdvancedReasoning(job: Job, userProfile: User, scores: any): string[] {
    const insights: string[] = [];
    
    if (scores.skillsMatch >= 80) {
      insights.push("🎯 Excellent skills alignment - you have most required technical capabilities");
    } else if (scores.skillsMatch >= 60) {
      insights.push("📚 Good skills foundation with learning opportunities for missing skills");
    } else {
      insights.push("🌱 Significant skill development required - consider if you're ready for this challenge");
    }
    
    if (scores.experienceMatch >= 90) {
      insights.push("💼 Perfect experience level match - you're ideally positioned for this role");
    } else if (scores.experienceMatch >= 70) {
      insights.push("📈 Good experience alignment with room for growth");
    }
    
    if (scores.careerGrowth >= 80) {
      insights.push("🚀 High career growth potential at this company");
    }
    
    if (scores.workLifeBalance >= 80) {
      insights.push("⚖️ Excellent work-life balance indicators");
    } else if (scores.workLifeBalance < 60) {
      insights.push("⚠️ Consider work-life balance implications");
    }
    
    if (job.remote && userProfile.profile?.preferences?.remote) {
      insights.push("🏠 Remote work preference perfectly aligned");
    }
    
    return insights;
  }

  private generatePersonalizedRecommendations(job: Job, userProfile: User, overallScore: number): string[] {
    const recommendations: string[] = [];
    
    if (overallScore >= 85) {
      recommendations.push("🎯 Highly recommended - apply immediately");
      recommendations.push("💡 Tailor your application to highlight matching skills");
      recommendations.push("📞 Consider reaching out to employees on LinkedIn");
    } else if (overallScore >= 70) {
      recommendations.push("✅ Good opportunity - worth a customized application");
      recommendations.push("📝 Focus cover letter on transferable skills");
      recommendations.push("🔍 Research the company culture thoroughly");
    } else if (overallScore >= 50) {
      recommendations.push("🤔 Consider for skill development - may require preparation");
      recommendations.push("📚 Identify 2-3 key skills to develop before applying");
      recommendations.push("💬 Network with current employees to learn more");
    } else {
      recommendations.push("⏸️ Not the best fit currently - consider similar roles that better match your profile");
      recommendations.push("🎯 Use this as a reference for skill development goals");
    }
    
    return recommendations;
  }

  private generateResumeOptimizations(job: Job, userProfile: User): string[] {
    const optimizations: string[] = [];
    
    const userSkills = userProfile.profile?.skills || [];
    const matchingSkills = job.skills.filter(skill => 
      userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    
    if (matchingSkills.length > 0) {
      optimizations.push(`🔧 Emphasize these matching skills: ${matchingSkills.slice(0, 3).join(', ')}`);
    }
    
    const missingSkills = job.skills.filter(skill => 
      !userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
    ).slice(0, 3);
    
    if (missingSkills.length > 0) {
      optimizations.push(`📈 Consider highlighting related experience for: ${missingSkills.join(', ')}`);
    }
    
    optimizations.push("🎯 Include quantifiable achievements relevant to this role");
    optimizations.push("📊 Add metrics that demonstrate impact in similar positions");
    
    if (job.level === 'senior' || job.level === 'lead') {
      optimizations.push("👥 Highlight leadership and mentoring experience");
    }
    
    return optimizations;
  }

  private generateInterviewTips(job: Job, userProfile: User): string[] {
    const tips: string[] = [];
    
    tips.push(`🏢 Research ${job.company}'s recent news, products, and company culture`);
    tips.push("💡 Prepare STAR method examples for behavioral questions");
    
    if (job.level.includes('senior') || job.level.includes('lead')) {
      tips.push("👥 Prepare examples of leadership and team collaboration");
      tips.push("🎯 Be ready to discuss system design and architecture decisions");
    }
    
    if (job.skills.includes('Python') || job.skills.includes('JavaScript')) {
      tips.push("💻 Review coding fundamentals and be ready for technical questions");
      tips.push("🔍 Practice problem-solving with real-world scenarios");
    }
    
    tips.push("❓ Prepare thoughtful questions about team structure and growth opportunities");
    tips.push("🎨 Be ready to discuss how you'd approach challenges specific to this role");
    
    return tips;
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
        const reasonWhy = this.generateWhyRecommended(job, matchScore);
        const actionItems = this.generateActionItems(job, matchScore);
        const deadline = this.calculateApplicationDeadline(job);
        
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

  private generateWhyRecommended(job: Job, matchScore: AIJobMatchScore): string {
    if (matchScore.overallScore >= 85) {
      return `Excellent match! Your skills align perfectly with their requirements, and the role offers great growth potential at ${job.company}.`;
    } else if (matchScore.overallScore >= 70) {
      return `Strong opportunity! You have most required skills and this could be a great next step in your career.`;
    } else {
      return `Growth opportunity! While some skills need development, this role could help you advance your career.`;
    }
  }

  private generateActionItems(job: Job, matchScore: AIJobMatchScore): string[] {
    const actions: string[] = [];
    
    if (matchScore.overallScore >= 80) {
      actions.push("Apply within 48 hours - you're a strong candidate");
      actions.push("Customize your resume for this specific role");
    } else {
      actions.push("Spend 2-3 days researching the company and role");
      actions.push("Identify and practice discussing transferable skills");
    }
    
    if (matchScore.skillsMatch < 70) {
      actions.push("Review job requirements and prepare to address skill gaps");
    }
    
    actions.push("Connect with current employees on LinkedIn");
    actions.push("Prepare for potential technical interview questions");
    
    return actions;
  }

  private calculateApplicationDeadline(job: Job): string | undefined {
    const postedDate = new Date(job.postedAt);
    const now = new Date();
    const daysSincePosted = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSincePosted > 30) {
      return "Apply soon - posting is over 30 days old";
    } else if (daysSincePosted > 14) {
      return "Apply within 1 week - posting is getting older";
    } else {
      return "Apply within 2 weeks - recent posting";
    }
  }
}

export const enhancedAiMatchingService = new EnhancedAiMatchingService();
