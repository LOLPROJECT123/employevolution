import { supabase } from '@/integrations/supabase/client';
import { ParsedResume } from '@/types/resume';
import { Job } from '@/types/job';

export interface EnhancedJobMatch {
  job: Job;
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  locationScore: number;
  salaryScore: number;
  semanticScore: number;
  cultureFitScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  experienceGap: number;
  recommendations: string[];
  whyRecommended: string;
  actionItems: string[];
}

export interface UserJobPreferences {
  preferred_roles: string[];
  preferred_locations: string[];
  remote_only: boolean;
  job_types: string[];
  salary_min?: number;
  salary_max?: number;
  excluded_companies: string[];
  keywords: string[];
  experience_level?: string;
  industries?: string[];
}

export interface UserInteraction {
  job_id: string;
  interaction_type: 'view' | 'save' | 'apply' | 'ignore' | 'interested';
  timestamp: Date;
  context?: any;
}

export class EnhancedJobMatchingV2Service {
  private skillWeights = {
    technical: 1.0,
    soft: 0.7,
    domain: 0.9,
    certification: 1.2
  };

  async getPersonalizedJobRecommendations(
    userId: string,
    resumeData: ParsedResume,
    limit: number = 20
  ): Promise<EnhancedJobMatch[]> {
    try {
      console.log('🔍 Starting personalized job recommendations for user:', userId);

      // Get user preferences and interaction history
      const [userPreferences, interactionHistory, userProfile] = await Promise.all([
        this.getUserPreferences(userId),
        this.getUserInteractions(userId),
        this.getUserProfile(userId)
      ]);

      // Get active jobs with intelligent filtering
      const jobs = await this.getFilteredJobs(userPreferences, resumeData);
      console.log(`📊 Found ${jobs.length} filtered jobs`);

      // Calculate enhanced match scores
      const jobMatches: EnhancedJobMatch[] = [];
      
      for (const job of jobs) {
        const match = await this.calculateEnhancedJobMatch(
          job,
          resumeData,
          userPreferences,
          interactionHistory,
          userProfile
        );

        if (match.overallScore > 40) { // Only include meaningful matches
          jobMatches.push(match);
        }
      }

      // Sort by overall score and apply ML ranking adjustments
      const rankedMatches = this.applyMLRanking(jobMatches, interactionHistory);
      
      // Track recommendation generation for analytics
      await this.trackRecommendationGeneration(userId, rankedMatches.length);

      return rankedMatches.slice(0, limit);

    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      throw error;
    }
  }

  private async calculateEnhancedJobMatch(
    job: any,
    resume: ParsedResume,
    preferences: UserJobPreferences | null,
    interactions: UserInteraction[],
    userProfile: any
  ): Promise<EnhancedJobMatch> {
    // Skills matching with semantic analysis
    const skillsAnalysis = this.calculateAdvancedSkillsMatch(
      resume.skills || [],
      job.skills || [],
      job.requirements || []
    );

    // Experience level matching
    const experienceAnalysis = this.calculateExperienceMatch(
      resume.workExperiences || [],
      job,
      preferences?.experience_level || 'mid'
    );

    // Education matching
    const educationScore = this.calculateEducationMatch(
      resume.education || [],
      job.requirements || []
    );

    // Location and remote work preferences
    const locationScore = this.calculateLocationMatch(
      job,
      preferences,
      resume.personalInfo?.location
    );

    // Salary expectations alignment
    const salaryScore = this.calculateSalaryMatch(
      job.salary_min,
      job.salary_max,
      preferences?.salary_min,
      preferences?.salary_max
    );

    // Semantic similarity using job description analysis
    const semanticScore = await this.calculateSemanticSimilarity(
      resume,
      job.description || ''
    );

    // Company culture fit (basic implementation)
    const cultureFitScore = this.calculateCultureFit(job, resume, interactions);

    // Calculate weighted overall score
    const overallScore = Math.round(
      skillsAnalysis.score * 0.35 +
      experienceAnalysis.score * 0.20 +
      educationScore * 0.10 +
      locationScore * 0.10 +
      salaryScore * 0.10 +
      semanticScore * 0.10 +
      cultureFitScore * 0.05
    );

    // Generate personalized recommendations
    const recommendations = this.generatePersonalizedRecommendations(
      overallScore,
      skillsAnalysis,
      experienceAnalysis
    );

    const whyRecommended = this.generateWhyRecommended(overallScore, skillsAnalysis);
    const actionItems = this.generateActionItems(job, skillsAnalysis, experienceAnalysis);

    return {
      job: this.formatJobForMatch(job),
      overallScore: Math.min(overallScore, 100),
      skillsScore: Math.round(skillsAnalysis.score),
      experienceScore: Math.round(experienceAnalysis.score),
      educationScore: Math.round(educationScore),
      locationScore: Math.round(locationScore),
      salaryScore: Math.round(salaryScore),
      semanticScore: Math.round(semanticScore),
      cultureFitScore: Math.round(cultureFitScore),
      matchingSkills: skillsAnalysis.matching,
      missingSkills: skillsAnalysis.missing,
      experienceGap: experienceAnalysis.yearGap,
      recommendations,
      whyRecommended,
      actionItems
    };
  }

  private calculateAdvancedSkillsMatch(
    resumeSkills: string[],
    jobSkills: string[],
    jobRequirements: string[]
  ) {
    const normalizedResumeSkills = resumeSkills.map(s => s.toLowerCase().trim());
    const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
    
    // Extract skills from requirements as well
    const requirementSkills = this.extractSkillsFromRequirements(jobRequirements);
    const allJobSkills = [...normalizedJobSkills, ...requirementSkills];
    
    const matching: string[] = [];
    const missing: string[] = [];
    let weightedScore = 0;
    let totalWeight = 0;

    for (const jobSkill of allJobSkills) {
      const skillWeight = this.getSkillWeight(jobSkill);
      totalWeight += skillWeight;

      const isMatched = normalizedResumeSkills.some(resumeSkill => 
        this.skillsSimilar(resumeSkill, jobSkill)
      );

      if (isMatched) {
        matching.push(jobSkill);
        weightedScore += skillWeight;
      } else {
        missing.push(jobSkill);
      }
    }

    const score = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;

    return { score, matching, missing };
  }

  private calculateExperienceMatch(
    workExperiences: any[],
    job: any,
    userExperienceLevel: string
  ) {
    const totalYearsExperience = this.calculateTotalExperience(workExperiences);
    const requiredExperience = this.extractExperienceRequirement(job);
    
    let score = 50; // Base score
    let yearGap = 0;

    if (requiredExperience > 0) {
      if (totalYearsExperience >= requiredExperience) {
        score = Math.min(100, 70 + (totalYearsExperience - requiredExperience) * 5);
      } else {
        yearGap = requiredExperience - totalYearsExperience;
        score = Math.max(20, 70 - yearGap * 10);
      }
    }

    // Adjust based on experience level matching
    const jobLevel = this.extractJobLevel(job);
    if (this.experienceLevelsMatch(userExperienceLevel, jobLevel)) {
      score += 10;
    }

    return { score: Math.min(score, 100), yearGap };
  }

  private calculateEducationMatch(education: any[], requirements: string[]): number {
    if (education.length === 0) return 50; // Neutral if no education data

    const hasRelevantDegree = education.some(edu => 
      requirements.some(req => 
        req.toLowerCase().includes(edu.degree?.toLowerCase() || '') ||
        req.toLowerCase().includes(edu.fieldOfStudy?.toLowerCase() || '')
      )
    );

    return hasRelevantDegree ? 90 : 60;
  }

  private calculateLocationMatch(
    job: any,
    preferences: UserJobPreferences | null,
    userLocation?: string
  ): number {
    if (job.remote) return 100;
    
    if (preferences?.remote_only) {
      return job.remote ? 100 : 20;
    }

    if (preferences?.preferred_locations?.length) {
      const locationMatch = preferences.preferred_locations.some(loc =>
        job.location?.toLowerCase().includes(loc.toLowerCase())
      );
      return locationMatch ? 90 : 40;
    }

    if (userLocation && job.location) {
      return job.location.toLowerCase().includes(userLocation.toLowerCase()) ? 80 : 50;
    }

    return 50; // Neutral if no location preferences
  }

  private calculateSalaryMatch(
    jobSalaryMin?: number,
    jobSalaryMax?: number,
    userSalaryMin?: number,
    userSalaryMax?: number
  ): number {
    if (!jobSalaryMin && !jobSalaryMax) return 50; // Neutral if no salary info
    if (!userSalaryMin && !userSalaryMax) return 50; // Neutral if no user preferences

    const jobMin = jobSalaryMin || 0;
    const jobMax = jobSalaryMax || jobMin;
    const userMin = userSalaryMin || 0;
    const userMax = userSalaryMax || userMin;

    // Check for overlap
    if (jobMax >= userMin && jobMin <= userMax) {
      const overlapSize = Math.min(jobMax, userMax) - Math.max(jobMin, userMin);
      const userRange = Math.max(userMax - userMin, 1);
      return Math.min(100, 60 + (overlapSize / userRange) * 40);
    }

    return 30; // No overlap
  }

  private async calculateSemanticSimilarity(
    resume: ParsedResume,
    jobDescription: string
  ): Promise<number> {
    // Simple keyword-based semantic similarity
    // In a real implementation, you'd use embeddings and cosine similarity
    const resumeText = this.extractResumeText(resume).toLowerCase();
    const jobText = jobDescription.toLowerCase();

    const resumeWords = new Set(resumeText.split(/\s+/));
    const jobWords = new Set(jobText.split(/\s+/));

    const intersection = new Set([...resumeWords].filter(word => jobWords.has(word)));
    const union = new Set([...resumeWords, ...jobWords]);

    const jaccardSimilarity = intersection.size / union.size;
    return Math.round(jaccardSimilarity * 100);
  }

  private calculateCultureFit(
    job: any,
    resume: ParsedResume,
    interactions: UserInteraction[]
  ): number {
    // Basic culture fit calculation
    // This would be enhanced with company culture data and user preferences
    let score = 50;

    // Check if user has shown interest in similar companies
    const similarCompanyInteractions = interactions.filter(interaction =>
      interaction.interaction_type === 'apply' || interaction.interaction_type === 'save'
    );

    if (similarCompanyInteractions.length > 0) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private applyMLRanking(
    matches: EnhancedJobMatch[],
    interactions: UserInteraction[]
  ): EnhancedJobMatch[] {
    // Sort by overall score first
    matches.sort((a, b) => b.overallScore - a.overallScore);

    // Apply interaction-based adjustments
    return matches.map(match => {
      const relevantInteractions = interactions.filter(interaction =>
        interaction.job_id === match.job.id
      );

      let adjustmentFactor = 1;
      
      if (relevantInteractions.some(i => i.interaction_type === 'ignore')) {
        adjustmentFactor = 0.5; // Reduce score for ignored jobs
      } else if (relevantInteractions.some(i => i.interaction_type === 'interested')) {
        adjustmentFactor = 1.2; // Boost score for interested jobs
      }

      return {
        ...match,
        overallScore: Math.round(match.overallScore * adjustmentFactor)
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }

  // Helper methods
  private extractSkillsFromRequirements(requirements: string[]): string[] {
    const techSkills = [
      'javascript', 'typescript', 'react', 'angular', 'vue', 'node.js', 'python',
      'java', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'sql',
      'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'gcp',
      'docker', 'kubernetes', 'jenkins', 'git', 'agile', 'scrum'
    ];

    const foundSkills: string[] = [];
    const requirementText = requirements.join(' ').toLowerCase();

    techSkills.forEach(skill => {
      if (requirementText.includes(skill)) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  private getSkillWeight(skill: string): number {
    // Categorize and weight skills
    const technicalSkills = ['javascript', 'python', 'java', 'react', 'angular', 'aws'];
    const certificationSkills = ['aws certified', 'cisco', 'microsoft certified'];
    
    if (certificationSkills.some(cert => skill.includes(cert))) {
      return this.skillWeights.certification;
    } else if (technicalSkills.includes(skill)) {
      return this.skillWeights.technical;
    } else {
      return this.skillWeights.soft;
    }
  }

  private skillsSimilar(skill1: string, skill2: string): boolean {
    if (skill1 === skill2) return true;
    if (skill1.includes(skill2) || skill2.includes(skill1)) return true;

    // Handle common abbreviations
    const abbreviations: Record<string, string[]> = {
      'js': ['javascript'],
      'ts': ['typescript'],
      'react': ['reactjs', 'react.js'],
      'node': ['nodejs', 'node.js'],
    };

    for (const [abbr, full] of Object.entries(abbreviations)) {
      if ((skill1 === abbr && full.includes(skill2)) || 
          (skill2 === abbr && full.includes(skill1))) {
        return true;
      }
    }

    return false;
  }

  private calculateTotalExperience(workExperiences: any[]): number {
    // Calculate total years of experience
    let totalYears = 0;
    
    workExperiences.forEach(exp => {
      const startYear = this.parseYear(exp.startDate);
      const endYear = exp.endDate ? this.parseYear(exp.endDate) : new Date().getFullYear();
      
      if (startYear && endYear) {
        totalYears += endYear - startYear;
      }
    });

    return totalYears;
  }

  private extractExperienceRequirement(job: any): number {
    const description = `${job.title} ${job.description} ${(job.requirements || []).join(' ')}`;
    const experienceMatch = description.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
    return experienceMatch ? parseInt(experienceMatch[1]) : 0;
  }

  private extractJobLevel(job: any): string {
    const title = job.title.toLowerCase();
    if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
      return 'senior';
    } else if (title.includes('junior') || title.includes('entry') || title.includes('intern')) {
      return 'entry';
    }
    return 'mid';
  }

  private experienceLevelsMatch(userLevel: string, jobLevel: string): boolean {
    const levelMap: Record<string, number> = {
      'entry': 1,
      'mid': 2,
      'senior': 3,
      'executive': 4
    };

    const userLevelNum = levelMap[userLevel] || 2;
    const jobLevelNum = levelMap[jobLevel] || 2;

    return Math.abs(userLevelNum - jobLevelNum) <= 1;
  }

  private parseYear(dateString: string): number | null {
    if (!dateString) return null;
    const year = parseInt(dateString);
    return isNaN(year) ? new Date(dateString).getFullYear() : year;
  }

  private extractResumeText(resume: ParsedResume): string {
    const parts: string[] = [];
    
    if (resume.personalInfo?.name) parts.push(resume.personalInfo.name);
    if (resume.skills) parts.push(...resume.skills);
    
    resume.workExperiences?.forEach(exp => {
      parts.push(exp.role, exp.company);
      if (exp.description) {
        const desc = Array.isArray(exp.description) ? exp.description.join(' ') : exp.description;
        parts.push(desc);
      }
    });

    resume.education?.forEach(edu => {
      parts.push(edu.school, edu.degree || '', edu.fieldOfStudy || '');
    });

    return parts.filter(Boolean).join(' ');
  }

  private generatePersonalizedRecommendations(
    overallScore: number,
    skillsAnalysis: any,
    experienceAnalysis: any
  ): string[] {
    const recommendations: string[] = [];

    if (overallScore > 80) {
      recommendations.push('This is an excellent match - apply immediately!');
      recommendations.push('Tailor your resume to highlight matching skills');
    } else if (overallScore > 60) {
      recommendations.push('Good potential match - review requirements carefully');
      recommendations.push('Consider reaching out to employees on LinkedIn');
    } else {
      recommendations.push('Moderate match - focus on developing missing skills');
      if (skillsAnalysis.missing.length > 0) {
        recommendations.push(`Consider learning: ${skillsAnalysis.missing.slice(0, 3).join(', ')}`);
      }
    }

    if (experienceAnalysis.yearGap > 0) {
      recommendations.push(`Highlight transferable skills to bridge ${experienceAnalysis.yearGap} year experience gap`);
    }

    return recommendations;
  }

  private generateWhyRecommended(overallScore: number, skillsAnalysis: any): string {
    if (overallScore > 80) {
      return `Excellent match with ${skillsAnalysis.matching.length} matching skills and strong alignment with your background.`;
    } else if (overallScore > 60) {
      return `Good match based on your skill set and experience level. This role could be a great next step.`;
    } else {
      return `Potential growth opportunity that could help you develop new skills and advance your career.`;
    }
  }

  private generateActionItems(job: any, skillsAnalysis: any, experienceAnalysis: any): string[] {
    const items: string[] = [];
    
    items.push('Review the complete job description thoroughly');
    items.push(`Research ${job.company} and their culture`);
    
    if (skillsAnalysis.matching.length > 5) {
      items.push('Apply within 48 hours - strong skill match');
    } else {
      items.push('Update resume to highlight relevant experience');
    }

    if (skillsAnalysis.missing.length > 0) {
      items.push(`Consider skill development in: ${skillsAnalysis.missing.slice(0, 2).join(', ')}`);
    }

    return items;
  }

  private formatJobForMatch(job: any): Job {
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      requirements: job.requirements || [],
      skills: job.skills || [],
      salary: {
        min: job.salary_min,
        max: job.salary_max,
        currency: 'USD'
      },
      type: job.job_type,
      remote: job.remote,
      postedAt: job.scraped_at,
      applyUrl: job.apply_url,
      level: this.extractJobLevel(job) as 'entry' | 'mid' | 'senior' | 'intern' | 'executive',
      workModel: job.remote ? 'remote' : 'onsite' as 'remote' | 'onsite' | 'hybrid'
    };
  }

  // Database helper methods
  private async getUserPreferences(userId: string): Promise<UserJobPreferences | null> {
    const { data } = await supabase
      .from('user_job_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!data) return null;

    return {
      preferred_roles: data.preferred_roles || [],
      preferred_locations: data.preferred_locations || [],
      remote_only: data.remote_only || false,
      job_types: data.job_types || [],
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      excluded_companies: data.excluded_companies || [],
      keywords: data.keywords || [],
      experience_level: 'mid', // Default value
      industries: [] // Default value
    };
  }

  private async getUserInteractions(userId: string): Promise<UserInteraction[]> {
    // This would come from a user interactions tracking table
    // For now, return empty array
    return [];
  }

  private async getUserProfile(userId: string) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data;
  }

  private async getFilteredJobs(preferences: UserJobPreferences | null, resumeData: ParsedResume) {
    let query = supabase
      .from('scraped_jobs')
      .select('*')
      .eq('is_active', true);

    if (preferences?.remote_only) {
      query = query.eq('remote', true);
    }

    if (preferences?.job_types && preferences.job_types.length > 0) {
      query = query.in('job_type', preferences.job_types);
    }

    if (preferences?.salary_min) {
      query = query.gte('salary_min', preferences.salary_min);
    }

    if (preferences?.excluded_companies && preferences.excluded_companies.length > 0) {
      query = query.not('company', 'in', `(${preferences.excluded_companies.join(',')})`);
    }

    const { data } = await query.order('scraped_at', { ascending: false }).limit(100);
    return data || [];
  }

  private async trackRecommendationGeneration(userId: string, recommendationCount: number) {
    // Track analytics for recommendation quality
    await supabase
      .from('api_usage_logs')
      .insert({
        user_id: userId,
        endpoint: 'job-recommendations',
        method: 'GET',
        status_code: 200,
        response_size_bytes: recommendationCount * 1000 // Estimated
      });
  }

  async trackUserInteraction(userId: string, interaction: UserInteraction) {
    // This would save to a user_interactions table
    console.log('Tracking interaction:', interaction);
    // Implementation would depend on having a user_interactions table
  }

  async getJobRecommendationFeed(userId: string, page: number = 1, limit: number = 10) {
    // Get user's current resume
    const { data: resumeFile } = await supabase
      .from('user_resume_files')
      .select('parsed_data')
      .eq('user_id', userId)
      .eq('is_current', true)
      .single();

    if (!resumeFile?.parsed_data) {
      throw new Error('No resume found for user');
    }

    const resumeData = resumeFile.parsed_data as ParsedResume;

    const recommendations = await this.getPersonalizedJobRecommendations(
      userId,
      resumeData,
      limit
    );

    return {
      recommendations,
      page,
      hasMore: recommendations.length === limit,
      totalCount: recommendations.length
    };
  }
}

export const enhancedJobMatchingV2Service = new EnhancedJobMatchingV2Service();
