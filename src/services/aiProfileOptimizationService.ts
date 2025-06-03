
import { supabase } from '@/integrations/supabase/client';
import { castJsonToStringArray } from '@/types/database';

export interface ProfileOptimizationSuggestion {
  id: string;
  category: 'skills' | 'experience' | 'education' | 'projects' | 'summary' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  impact: string;
  marketTrends: string[];
  completionTimeEstimate: string;
  resourceLinks: string[];
}

export interface ProfileAnalysis {
  overall_score: number;
  completion_percentage: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: ProfileOptimizationSuggestion[];
  market_insights: {
    trending_skills: string[];
    salary_potential: number;
    market_demand: string;
    competition_level: string;
  };
  career_trajectory: {
    current_level: string;
    next_steps: string[];
    timeline_estimate: string;
  };
}

export interface IndustryBenchmark {
  role: string;
  industry: string;
  average_skills_count: number;
  required_skills: string[];
  recommended_skills: string[];
  experience_years: number;
  education_level: string;
  typical_projects_count: number;
  portfolio_items_count: number;
}

export class AIProfileOptimizationService {
  /**
   * Gets a complete analysis of the user's profile with optimization suggestions
   */
  static async analyzeProfile(userId: string): Promise<ProfileAnalysis> {
    try {
      // Get the user's profile data
      const userProfile = await this.getUserProfileData(userId);
      
      // Get industry benchmarks for comparison
      const benchmarks = await this.getIndustryBenchmarks(userProfile.jobPreferences?.desired_roles || [], 
                                                        userProfile.jobPreferences?.industries || []);
      
      // Calculate profile completeness
      const completionScore = this.calculateProfileCompleteness(userProfile);
      
      // Generate profile optimization suggestions
      const suggestions = this.generateProfileSuggestions(userProfile, benchmarks);
      
      // Generate strengths and weaknesses
      const strengths = this.identifyProfileStrengths(userProfile, benchmarks);
      const weaknesses = this.identifyProfileWeaknesses(userProfile, benchmarks);
      
      // Generate market insights
      const marketInsights = await this.generateMarketInsights(userProfile);
      
      // Generate career trajectory insights
      const careerTrajectory = this.generateCareerTrajectory(userProfile, benchmarks);
      
      // Calculate overall score based on multiple factors
      const overallScore = this.calculateOverallScore(
        completionScore, 
        userProfile, 
        benchmarks,
        suggestions.length,
        strengths.length
      );
      
      return {
        overall_score: overallScore,
        completion_percentage: completionScore,
        strengths: strengths,
        weaknesses: weaknesses,
        suggestions: suggestions,
        market_insights: marketInsights,
        career_trajectory: careerTrajectory
      };
    } catch (error) {
      console.error('Error analyzing profile:', error);
      return this.getFallbackAnalysis();
    }
  }

  /**
   * Retrieves all user profile data from various tables
   */
  private static async getUserProfileData(userId: string): Promise<any> {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: skills } = await supabase
      .from('user_skills')
      .select('skill, category')
      .eq('user_id', userId);

    const { data: education } = await supabase
      .from('education')
      .select('*')
      .eq('user_id', userId);

    const { data: workExperience } = await supabase
      .from('work_experiences')
      .select('*')
      .eq('user_id', userId);

    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);

    const { data: languages } = await supabase
      .from('user_languages')
      .select('*')
      .eq('user_id', userId);

    const { data: jobPreferences } = await supabase
      .from('job_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: githubRepos } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_featured', true);

    return {
      profile,
      skills: skills || [],
      education: education || [],
      workExperience: workExperience || [],
      projects: projects || [],
      languages: languages || [],
      jobPreferences,
      githubRepos: githubRepos || []
    };
  }

  /**
   * Gets industry benchmarks to compare against user profile
   */
  private static async getIndustryBenchmarks(desiredRoles: string[], industries: string[]): Promise<IndustryBenchmark[]> {
    // For a real implementation, this would query benchmark data
    // For now, returning hard-coded benchmarks
    
    const benchmarks: IndustryBenchmark[] = [];
    
    // Software engineering benchmark
    if (this.arrayIncludes(desiredRoles, ['software engineer', 'developer', 'programmer', 'web developer'])) {
      benchmarks.push({
        role: 'Software Engineer',
        industry: 'Technology',
        average_skills_count: 12,
        required_skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
        recommended_skills: ['Docker', 'AWS', 'GraphQL', 'CI/CD', 'Testing'],
        experience_years: 3,
        education_level: "Bachelor's",
        typical_projects_count: 4,
        portfolio_items_count: 3
      });
    }

    // Product manager benchmark
    if (this.arrayIncludes(desiredRoles, ['product manager', 'product owner'])) {
      benchmarks.push({
        role: 'Product Manager',
        industry: 'Technology',
        average_skills_count: 9,
        required_skills: ['Agile', 'Roadmapping', 'User Stories', 'Product Strategy', 'Data Analysis'],
        recommended_skills: ['SQL', 'Wireframing', 'User Research', 'A/B Testing'],
        experience_years: 4,
        education_level: "Bachelor's",
        typical_projects_count: 3,
        portfolio_items_count: 2
      });
    }

    // Data science benchmark
    if (this.arrayIncludes(desiredRoles, ['data scientist', 'data analyst', 'machine learning'])) {
      benchmarks.push({
        role: 'Data Scientist',
        industry: 'Technology',
        average_skills_count: 10,
        required_skills: ['Python', 'SQL', 'Statistics', 'Machine Learning', 'Data Visualization'],
        recommended_skills: ['TensorFlow/PyTorch', 'Big Data', 'Cloud Computing', 'A/B Testing'],
        experience_years: 3,
        education_level: "Master's",
        typical_projects_count: 3,
        portfolio_items_count: 2
      });
    }

    // Default benchmark if no match
    if (benchmarks.length === 0) {
      benchmarks.push({
        role: 'Knowledge Worker',
        industry: 'General',
        average_skills_count: 8,
        required_skills: ['Communication', 'Problem Solving', 'Time Management', 'Microsoft Office'],
        recommended_skills: ['Project Management', 'Data Analysis', 'Presentation Skills'],
        experience_years: 2,
        education_level: "Bachelor's",
        typical_projects_count: 3,
        portfolio_items_count: 1
      });
    }

    return benchmarks;
  }

  /**
   * Calculates profile completeness as a percentage
   */
  private static calculateProfileCompleteness(userProfile: any): number {
    const sections: { [key: string]: { weight: number, exists: boolean, completeness?: number } } = {
      basicInfo: { 
        weight: 0.15, 
        exists: !!userProfile.profile,
        completeness: this.calculateBasicInfoCompleteness(userProfile.profile)
      },
      skills: { 
        weight: 0.20, 
        exists: userProfile.skills.length > 0,
        completeness: Math.min(1, userProfile.skills.length / 10) // Assume 10 skills is "complete"
      },
      workExperience: { 
        weight: 0.25, 
        exists: userProfile.workExperience.length > 0,
        completeness: Math.min(1, userProfile.workExperience.length / 3) // Assume 3 jobs is "complete"
      },
      education: { 
        weight: 0.15, 
        exists: userProfile.education.length > 0,
        completeness: userProfile.education.length > 0 ? 1 : 0
      },
      projects: { 
        weight: 0.15, 
        exists: userProfile.projects.length > 0,
        completeness: Math.min(1, userProfile.projects.length / 2) // Assume 2 projects is "complete"
      },
      languages: { 
        weight: 0.05, 
        exists: userProfile.languages.length > 0,
        completeness: userProfile.languages.length > 0 ? 1 : 0
      },
      jobPreferences: { 
        weight: 0.05, 
        exists: !!userProfile.jobPreferences,
        completeness: userProfile.jobPreferences ? 1 : 0
      }
    };

    let totalWeightedCompleteness = 0;
    let totalWeight = 0;

    Object.entries(sections).forEach(([sectionName, section]) => {
      if (section.exists) {
        totalWeightedCompleteness += (section.completeness || 1) * section.weight;
      }
      totalWeight += section.weight;
    });

    return Math.round((totalWeightedCompleteness / totalWeight) * 100);
  }

  private static calculateBasicInfoCompleteness(profileData: any): number {
    if (!profileData) return 0;

    const fields = ['name', 'location', 'phone', 'linkedin_url', 'portfolio_url', 'github_url'];
    const existingFields = fields.filter(field => !!profileData[field]);
    
    return existingFields.length / fields.length;
  }

  /**
   * Generates tailored profile suggestions based on user data and benchmarks
   */
  private static generateProfileSuggestions(userProfile: any, benchmarks: IndustryBenchmark[]): ProfileOptimizationSuggestion[] {
    const suggestions: ProfileOptimizationSuggestion[] = [];
    
    // Check for skills gaps
    this.generateSkillSuggestions(userProfile, benchmarks, suggestions);
    
    // Check for work experience improvements
    this.generateExperienceSuggestions(userProfile, suggestions);
    
    // Check for project improvements
    this.generateProjectSuggestions(userProfile, suggestions);
    
    // Check for education improvements
    this.generateEducationSuggestions(userProfile, suggestions);
    
    // Generate general profile improvements
    this.generateGeneralSuggestions(userProfile, suggestions);
    
    return suggestions;
  }

  private static generateSkillSuggestions(userProfile: any, benchmarks: IndustryBenchmark[], suggestions: ProfileOptimizationSuggestion[]): void {
    const userSkills = userProfile.skills.map((s: any) => s.skill.toLowerCase());
    
    // Find missing key skills based on benchmarks
    const missingSkills: string[] = [];
    benchmarks.forEach(benchmark => {
      benchmark.required_skills.forEach(skill => {
        if (!userSkills.some(userSkill => 
          userSkill.includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill)
        )) {
          missingSkills.push(skill);
        }
      });
    });

    // Add missing skills suggestion if relevant
    if (missingSkills.length > 0) {
      suggestions.push({
        id: crypto.randomUUID(),
        category: 'skills',
        priority: 'high',
        title: 'Add missing in-demand skills',
        description: `Your profile is missing ${missingSkills.length} key skills that employers are looking for in your desired roles.`,
        implementation: `Add these skills to your profile: ${missingSkills.slice(0, 3).join(', ')}${missingSkills.length > 3 ? ', and more' : ''}.`,
        impact: 'Adding these skills can increase your profile visibility by up to 30%.',
        marketTrends: [`${missingSkills[0]} was mentioned in 65% of job postings in your field.`],
        completionTimeEstimate: '5 minutes',
        resourceLinks: ['https://www.example.com/skills-guide']
      });
    }

    // Check for skill organization
    const hasCategories = userProfile.skills.some((s: any) => s.category);
    if (!hasCategories && userProfile.skills.length > 5) {
      suggestions.push({
        id: crypto.randomUUID(),
        category: 'skills',
        priority: 'medium',
        title: 'Organize your skills by category',
        description: 'Categorizing your skills makes them easier to scan and helps highlight your diverse abilities.',
        implementation: 'Group your skills into categories like "Programming Languages", "Frameworks", "Tools", etc.',
        impact: 'Improves readability and helps recruiters quickly identify your relevant skills.',
        marketTrends: ['Organized skill sections receive 22% more attention from recruiters.'],
        completionTimeEstimate: '10 minutes',
        resourceLinks: ['https://www.example.com/skill-organization']
      });
    }
  }

  private static generateExperienceSuggestions(userProfile: any, suggestions: ProfileOptimizationSuggestion[]): void {
    const experiences = userProfile.workExperience;

    // Check for quantified achievements
    let needsQuantifiedAchievements = false;
    if (experiences.length > 0) {
      experiences.forEach((exp: any) => {
        if (exp.description) {
          const description = Array.isArray(exp.description) 
            ? exp.description.join(' ') 
            : exp.description;
            
          if (!this.containsMetrics(description)) {
            needsQuantifiedAchievements = true;
          }
        }
      });
    }

    if (needsQuantifiedAchievements) {
      suggestions.push({
        id: crypto.randomUUID(),
        category: 'experience',
        priority: 'high',
        title: 'Add metrics to your work achievements',
        description: 'Adding specific numbers and metrics to your achievements makes them more impactful and credible.',
        implementation: 'Include metrics like percentages, dollar amounts, team sizes, and time periods in your bullet points.',
        impact: 'Experience descriptions with metrics receive 2x more attention from recruiters.',
        marketTrends: ['Quantified achievements are mentioned by 78% of hiring managers as critical for evaluation.'],
        completionTimeEstimate: '20 minutes',
        resourceLinks: ['https://www.example.com/achievement-metrics']
      });
    }
  }

  private static generateProjectSuggestions(userProfile: any, suggestions: ProfileOptimizationSuggestion[]): void {
    const projects = userProfile.projects;
    
    // Check if projects have URLs
    const projectsWithoutUrls = projects.filter((p: any) => !p.url).length;
    if (projectsWithoutUrls > 0 && projects.length > 0) {
      suggestions.push({
        id: crypto.randomUUID(),
        category: 'projects',
        priority: 'medium',
        title: 'Add links to your projects',
        description: `${projectsWithoutUrls} of your projects don't have links for employers to view your work.`,
        implementation: 'Add GitHub, portfolio, or live demo links to your projects.',
        impact: 'Projects with links get 4x more engagement from employers.',
        marketTrends: ['91% of technical recruiters check code samples before interviews.'],
        completionTimeEstimate: '15 minutes',
        resourceLinks: ['https://www.example.com/project-portfolio-guide']
      });
    }
  }

  private static generateEducationSuggestions(userProfile: any, suggestions: ProfileOptimizationSuggestion[]): void {
    // For now, no specific education suggestions
  }

  private static generateGeneralSuggestions(userProfile: any, suggestions: ProfileOptimizationSuggestion[]): void {
    // Check for LinkedIn URL
    if (!userProfile.profile?.linkedin_url) {
      suggestions.push({
        id: crypto.randomUUID(),
        category: 'general',
        priority: 'medium',
        title: 'Add your LinkedIn profile',
        description: 'Your LinkedIn profile is missing, which is a key networking and verification tool for employers.',
        implementation: 'Add your LinkedIn profile URL to your personal information section.',
        impact: 'Profiles with LinkedIn links are 71% more likely to be contacted by recruiters.',
        marketTrends: ['87% of recruiters use LinkedIn to verify candidate information.'],
        completionTimeEstimate: '2 minutes',
        resourceLinks: ['https://www.example.com/linkedin-profile']
      });
    }

    // Check for location information
    if (!userProfile.profile?.location) {
      suggestions.push({
        id: crypto.randomUUID(),
        category: 'general',
        priority: 'high',
        title: 'Add your location information',
        description: 'Your location is missing, which is essential for location-based job matching.',
        implementation: 'Add your city and state/country to your profile.',
        impact: 'Adding location increases matched job opportunities by up to 40%.',
        marketTrends: ['Location is the second most used filter in job searches.'],
        completionTimeEstimate: '1 minute',
        resourceLinks: ['https://www.example.com/profile-location']
      });
    }
  }

  /**
   * Identifies the strengths of the user's profile
   */
  private static identifyProfileStrengths(userProfile: any, benchmarks: IndustryBenchmark[]): string[] {
    const strengths: string[] = [];
    
    // Check for comprehensive skills
    if (userProfile.skills.length >= 10) {
      strengths.push('Comprehensive skill set with diverse technical abilities.');
    }
    
    // Check for recent work experience
    if (userProfile.workExperience.length > 0) {
      const mostRecent = userProfile.workExperience[0];
      if (!mostRecent.end_date || new Date(mostRecent.end_date) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)) {
        strengths.push('Current or recent relevant work experience.');
      }
    }
    
    // Check for education match with benchmark
    if (userProfile.education.length > 0) {
      const benchmark = benchmarks[0];
      if (benchmark && this.hasMatchingEducationLevel(userProfile.education, benchmark.education_level)) {
        strengths.push(`Education aligns with industry standards for ${benchmark.role} roles.`);
      }
    }
    
    // Check for project demonstration
    if (userProfile.projects.length >= 3) {
      strengths.push('Strong project portfolio demonstrating practical application of skills.');
    }
    
    // Check for GitHub integration
    if (userProfile.githubRepos && userProfile.githubRepos.length > 0) {
      strengths.push('GitHub portfolio integration showing real open-source contributions.');
    }
    
    return strengths;
  }

  /**
   * Identifies the weaknesses of the user's profile
   */
  private static identifyProfileWeaknesses(userProfile: any, benchmarks: IndustryBenchmark[]): string[] {
    const weaknesses: string[] = [];
    
    // Check for skills gaps
    if (userProfile.skills.length < 5) {
      weaknesses.push('Limited number of skills listed.');
    }
    
    // Check for work experience
    if (userProfile.workExperience.length === 0) {
      weaknesses.push('No work experience listed.');
    } else if (userProfile.workExperience.length < 2) {
      weaknesses.push('Limited work history with only one position.');
    }
    
    // Check for education
    if (userProfile.education.length === 0) {
      weaknesses.push('No formal education listed.');
    }
    
    // Check for projects
    if (userProfile.projects.length === 0) {
      weaknesses.push('No projects demonstrating practical skills.');
    }
    
    // Check for contact information
    if (!userProfile.profile || !userProfile.profile.phone) {
      weaknesses.push('Missing contact information.');
    }
    
    return weaknesses;
  }

  /**
   * Generates market insights based on user's profile
   */
  private static async generateMarketInsights(userProfile: any): Promise<any> {
    // In a real implementation, this would call a market data API
    // Here, we'll return mock insights based on profile data

    // Get trending skills based on user's field
    let trendingSkills: string[] = [];
    if (userProfile.skills.some((s: any) => s.skill.toLowerCase().includes('java'))) {
      trendingSkills = ['Spring Boot', 'Microservices', 'Kubernetes', 'AWS', 'React'];
    } else if (userProfile.skills.some((s: any) => s.skill.toLowerCase().includes('python'))) {
      trendingSkills = ['TensorFlow', 'PyTorch', 'FastAPI', 'Data Science', 'AWS'];
    } else {
      trendingSkills = ['React', 'TypeScript', 'Cloud Services', 'GraphQL', 'CI/CD'];
    }
    
    // Calculate salary potential based on skills and experience
    const experienceYears = this.calculateExperienceYears(userProfile.workExperience);
    let salaryPotential = 70000; // Base salary
    
    // Adjust for experience
    salaryPotential += experienceYears * 5000;
    
    // Adjust for in-demand skills
    const inDemandSkills = ['react', 'aws', 'python', 'devops', 'machine learning', 'typescript'];
    const userSkillsLower = userProfile.skills.map((s: any) => s.skill.toLowerCase());
    const matchingInDemandSkills = inDemandSkills.filter(skill => 
      userSkillsLower.some(userSkill => userSkill.includes(skill))
    );
    
    salaryPotential += matchingInDemandSkills.length * 3000;
    
    // Determine market demand
    let marketDemand = 'Moderate';
    if (matchingInDemandSkills.length >= 3) {
      marketDemand = 'High';
    } else if (matchingInDemandSkills.length <= 1) {
      marketDemand = 'Low';
    }
    
    // Determine competition level
    let competitionLevel = 'Moderate';
    if (experienceYears < 2) {
      competitionLevel = 'High';
    } else if (experienceYears > 5 && matchingInDemandSkills.length >= 3) {
      competitionLevel = 'Low';
    }
    
    return {
      trending_skills: trendingSkills,
      salary_potential: salaryPotential,
      market_demand: marketDemand,
      competition_level: competitionLevel
    };
  }

  /**
   * Generates career trajectory insights
   */
  private static generateCareerTrajectory(userProfile: any, benchmarks: IndustryBenchmark[]): any {
    const experienceYears = this.calculateExperienceYears(userProfile.workExperience);
    
    // Determine current level
    let currentLevel = 'Entry Level';
    if (experienceYears >= 8) {
      currentLevel = 'Senior Level';
    } else if (experienceYears >= 4) {
      currentLevel = 'Mid Level';
    } else if (experienceYears >= 2) {
      currentLevel = 'Junior Level';
    }
    
    // Determine next steps
    const nextSteps: string[] = [];
    
    if (currentLevel === 'Entry Level') {
      nextSteps.push('Build practical experience with entry-level positions.');
      nextSteps.push('Develop core technical skills through projects and certifications.');
      nextSteps.push('Grow your professional network through industry events and meetups.');
    } else if (currentLevel === 'Junior Level') {
      nextSteps.push('Seek opportunities to lead small projects or features.');
      nextSteps.push('Develop specialization in a particular technology or domain.');
      nextSteps.push('Pursue continuous learning through advanced courses or certifications.');
    } else if (currentLevel === 'Mid Level') {
      nextSteps.push('Take on leadership responsibilities like mentoring or team leadership.');
      nextSteps.push('Develop cross-functional collaboration skills.');
      nextSteps.push('Focus on high-visibility projects and business impact.');
    } else {
      nextSteps.push('Consider management track or technical specialist path.');
      nextSteps.push('Develop thought leadership through speaking or publishing.');
      nextSteps.push('Mentor others and contribute to strategic initiatives.');
    }
    
    // Determine timeline estimate
    let timelineEstimate = '';
    if (currentLevel === 'Entry Level') {
      timelineEstimate = '1-2 years to Junior Level';
    } else if (currentLevel === 'Junior Level') {
      timelineEstimate = '2-3 years to Mid Level';
    } else if (currentLevel === 'Mid Level') {
      timelineEstimate = '2-4 years to Senior Level';
    } else {
      timelineEstimate = '3-5 years to Principal/Lead Level';
    }
    
    return {
      current_level: currentLevel,
      next_steps: nextSteps,
      timeline_estimate: timelineEstimate
    };
  }

  /**
   * Calculates overall score based on multiple factors
   */
  private static calculateOverallScore(
    completionScore: number, 
    userProfile: any, 
    benchmarks: IndustryBenchmark[],
    suggestionsCount: number,
    strengthsCount: number
  ): number {
    let score = completionScore * 0.5; // 50% weight to completion score
    
    // Skills match with benchmark
    const userSkillsCount = userProfile.skills.length;
    const benchmarkSkillsCount = benchmarks[0]?.average_skills_count || 8;
    const skillsRatio = Math.min(userSkillsCount / benchmarkSkillsCount, 1.5);
    score += skillsRatio * 15; // 15 points max for skills
    
    // Experience match
    const experienceYears = this.calculateExperienceYears(userProfile.workExperience);
    const benchmarkExperience = benchmarks[0]?.experience_years || 2;
    const experienceRatio = Math.min(experienceYears / benchmarkExperience, 1.5);
    score += experienceRatio * 15; // 15 points max for experience
    
    // Projects
    const projectsCount = userProfile.projects.length;
    const benchmarkProjects = benchmarks[0]?.typical_projects_count || 3;
    const projectsRatio = Math.min(projectsCount / benchmarkProjects, 1.5);
    score += projectsRatio * 10; // 10 points max for projects
    
    // Education
    if (userProfile.education.length > 0) {
      score += 5;
    }
    
    // GitHub integration
    if (userProfile.githubRepos && userProfile.githubRepos.length > 0) {
      score += 5;
    }
    
    // Adjust for suggestions and strengths
    score -= suggestionsCount * 1; // Deduct 1 point per suggestion
    score += strengthsCount * 2; // Add 2 points per strength
    
    return Math.round(Math.max(0, Math.min(score, 100)));
  }

  /**
   * Calculate total years of experience from work experience entries
   */
  private static calculateExperienceYears(workExperience: any[]): number {
    if (!workExperience || workExperience.length === 0) {
      return 0;
    }
    
    return workExperience.reduce((total, exp) => {
      const startDate = exp.start_date ? new Date(exp.start_date) : new Date();
      const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
      
      // Calculate months and convert to years
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth());
      
      return total + (months / 12);
    }, 0);
  }

  /**
   * Check if text contains quantifiable metrics
   */
  private static containsMetrics(text: string): boolean {
    if (!text) return false;
    
    // Check for percentages
    const percentageRegex = /\d+(\.\d+)?%/;
    if (percentageRegex.test(text)) return true;
    
    // Check for dollar amounts
    const dollarRegex = /\$\s*\d+/;
    if (dollarRegex.test(text)) return true;
    
    // Check for numbers followed by x
    const multiplesRegex = /\d+(\.\d+)?x/;
    if (multiplesRegex.test(text)) return true;
    
    // Check for specific quantity patterns
    const quantityRegex = /\d+\+|\d+\s+(people|users|customers|clients|projects|products)/i;
    if (quantityRegex.test(text)) return true;
    
    return false;
  }

  /**
   * Check if user has education level matching benchmark
   */
  private static hasMatchingEducationLevel(education: any[], benchmarkLevel: string): boolean {
    const degreeMap: {[key: string]: number} = {
      'high school': 1,
      'associate': 2,
      'bachelor': 3,
      'master': 4,
      'doctorate': 5,
      'phd': 5
    };
    
    const benchmarkScore = benchmarkLevel.toLowerCase().includes('bachelor') ? 3 : 
                         benchmarkLevel.toLowerCase().includes('master') ? 4 : 2;
    
    return education.some(edu => {
      if (!edu.degree) return false;
      
      const degreeLower = edu.degree.toLowerCase();
      let score = 1; // Default to high school
      
      for (const [degree, value] of Object.entries(degreeMap)) {
        if (degreeLower.includes(degree)) {
          score = value;
          break;
        }
      }
      
      return score >= benchmarkScore;
    });
  }

  /**
   * Helper method to check if array includes any substring
   */
  private static arrayIncludes(array: string[], searchTerms: string[]): boolean {
    if (!array || array.length === 0) return false;
    
    return searchTerms.some(term => 
      array.some(item => 
        item.toLowerCase().includes(term.toLowerCase()) || 
        term.toLowerCase().includes(item.toLowerCase())
      )
    );
  }

  /**
   * Get fallback analysis for error cases
   */
  private static getFallbackAnalysis(): ProfileAnalysis {
    return {
      overall_score: 65,
      completion_percentage: 70,
      strengths: [
        'Good foundation of profile information',
        'Some relevant skills listed'
      ],
      weaknesses: [
        'Profile needs more comprehensive information',
        'Some sections may be incomplete'
      ],
      suggestions: [
        {
          id: crypto.randomUUID(),
          category: 'general',
          priority: 'medium',
          title: 'Complete your profile sections',
          description: 'Your profile has some incomplete sections that should be filled out.',
          implementation: 'Visit each section of your profile and add missing information.',
          impact: 'A complete profile significantly improves your visibility to employers.',
          marketTrends: ['Complete profiles get up to 40% more views.'],
          completionTimeEstimate: '20 minutes',
          resourceLinks: ['https://www.example.com/complete-profile']
        }
      ],
      market_insights: {
        trending_skills: ['JavaScript', 'React', 'AWS', 'Python', 'SQL'],
        salary_potential: 85000,
        market_demand: 'Moderate',
        competition_level: 'Moderate'
      },
      career_trajectory: {
        current_level: 'Junior-Mid Level',
        next_steps: [
          'Build more specialized experience in your field',
          'Develop leadership and mentoring skills',
          'Pursue relevant certifications or continued education'
        ],
        timeline_estimate: '2-3 years to next level'
      }
    };
  }

  /**
   * Apply a specific suggestion to the user's profile
   */
  static async applySuggestion(userId: string, suggestionId: string): Promise<boolean> {
    try {
      // In a real implementation, this would apply the suggestion to the profile
      // For now, just log and return success
      console.log(`Applying suggestion ${suggestionId} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error applying suggestion:', error);
      return false;
    }
  }
}
