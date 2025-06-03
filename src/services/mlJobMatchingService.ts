
import { supabase } from '@/integrations/supabase/client';
import { castJsonToStringArray } from '@/types/database';

export interface MLJobMatch {
  jobId: string;
  matchScore: number;
  confidenceLevel: number;
  reasoning: string[];
  skillMatches: string[];
  skillGaps: string[];
  salaryMatch: number;
  locationMatch: number;
  experienceMatch: number;
  cultureMatch: number;
  companyMatch: number;
}

export interface UserProfile {
  skills: string[];
  experience: number;
  desiredSalary: number;
  preferredLocations: string[];
  industryPreferences: string[];
  rolePreferences: string[];
  companySize: string[];
  workModel: string;
}

export interface JobData {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  requiredSkills: string[];
  experienceLevel: string;
  jobType: string;
  industry: string;
  companySize?: string;
  remote: boolean;
  description: string;
}

export class MLJobMatchingService {
  private static weights = {
    skills: 0.35,
    experience: 0.20,
    salary: 0.15,
    location: 0.15,
    culture: 0.10,
    company: 0.05
  };

  static async analyzeJobMatch(jobData: JobData, userId: string): Promise<MLJobMatch> {
    const userProfile = await this.getUserProfile(userId);
    
    const skillsAnalysis = this.analyzeSkillsMatch(jobData.requiredSkills, userProfile.skills);
    const experienceAnalysis = this.analyzeExperienceMatch(jobData.experienceLevel, userProfile.experience);
    const salaryAnalysis = this.analyzeSalaryMatch(jobData.salary, userProfile.desiredSalary);
    const locationAnalysis = this.analyzeLocationMatch(jobData.location, jobData.remote, userProfile.preferredLocations, userProfile.workModel);
    const cultureAnalysis = this.analyzeCultureMatch(jobData, userProfile);
    const companyAnalysis = this.analyzeCompanyMatch(jobData, userProfile);

    const matchScore = this.calculateWeightedScore({
      skills: skillsAnalysis.score,
      experience: experienceAnalysis.score,
      salary: salaryAnalysis.score,
      location: locationAnalysis.score,
      culture: cultureAnalysis.score,
      company: companyAnalysis.score
    });

    const confidenceLevel = this.calculateConfidenceLevel(skillsAnalysis, experienceAnalysis, salaryAnalysis);

    const reasoning = [
      ...skillsAnalysis.reasoning,
      ...experienceAnalysis.reasoning,
      ...salaryAnalysis.reasoning,
      ...locationAnalysis.reasoning,
      ...cultureAnalysis.reasoning,
      ...companyAnalysis.reasoning
    ];

    return {
      jobId: jobData.id,
      matchScore: Math.round(matchScore),
      confidenceLevel: Math.round(confidenceLevel),
      reasoning,
      skillMatches: skillsAnalysis.matches,
      skillGaps: skillsAnalysis.gaps,
      salaryMatch: Math.round(salaryAnalysis.score),
      locationMatch: Math.round(locationAnalysis.score),
      experienceMatch: Math.round(experienceAnalysis.score),
      cultureMatch: Math.round(cultureAnalysis.score),
      companyMatch: Math.round(companyAnalysis.score)
    };
  }

  private static async getUserProfile(userId: string): Promise<UserProfile> {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: skills } = await supabase
      .from('user_skills')
      .select('skill')
      .eq('user_id', userId);

    const { data: preferences } = await supabase
      .from('job_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: experience } = await supabase
      .from('work_experiences')
      .select('*')
      .eq('user_id', userId)
      .order('end_date', { ascending: false });

    const totalExperience = this.calculateTotalExperience(experience || []);

    return {
      skills: skills?.map(s => s.skill) || [],
      experience: totalExperience,
      desiredSalary: this.parseSalary(preferences?.salary_expectation),
      preferredLocations: preferences?.preferred_locations || [],
      industryPreferences: preferences?.industries || [],
      rolePreferences: preferences?.desired_roles || [],
      companySize: preferences?.company_size || [],
      workModel: preferences?.work_model || 'hybrid'
    };
  }

  private static analyzeSkillsMatch(requiredSkills: string[], userSkills: string[]) {
    const matches: string[] = [];
    const gaps: string[] = [];
    
    const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
    
    for (const skill of requiredSkills) {
      const normalizedSkill = skill.toLowerCase();
      const isMatch = normalizedUserSkills.some(userSkill => 
        userSkill.includes(normalizedSkill) || 
        normalizedSkill.includes(userSkill) ||
        this.getSynonyms(normalizedSkill).some(synonym => userSkill.includes(synonym))
      );
      
      if (isMatch) {
        matches.push(skill);
      } else {
        gaps.push(skill);
      }
    }

    const score = requiredSkills.length > 0 ? (matches.length / requiredSkills.length) * 100 : 50;
    
    const reasoning: string[] = [];
    if (matches.length > 0) {
      reasoning.push(`Strong match: You have ${matches.length}/${requiredSkills.length} required skills`);
    }
    if (gaps.length > 0) {
      reasoning.push(`Skill gap: Missing ${gaps.length} required skills: ${gaps.slice(0, 3).join(', ')}`);
    }

    return { score, matches, gaps, reasoning };
  }

  private static analyzeExperienceMatch(jobExperienceLevel: string, userExperience: number) {
    const experienceMap: { [key: string]: number } = {
      'entry': 0,
      'junior': 1,
      'mid': 3,
      'senior': 5,
      'lead': 8,
      'executive': 12
    };

    const requiredExperience = experienceMap[jobExperienceLevel.toLowerCase()] || 3;
    const experienceDiff = Math.abs(userExperience - requiredExperience);
    
    let score = 100;
    if (experienceDiff > 2) {
      score = Math.max(0, 100 - (experienceDiff - 2) * 15);
    }

    const reasoning: string[] = [];
    if (userExperience >= requiredExperience) {
      reasoning.push(`Experience match: You have ${userExperience} years vs ${requiredExperience} required`);
    } else {
      reasoning.push(`Experience gap: You have ${userExperience} years but ${requiredExperience} required`);
    }

    return { score, reasoning };
  }

  private static analyzeSalaryMatch(jobSalary: string | undefined, desiredSalary: number) {
    if (!jobSalary || desiredSalary === 0) {
      return { score: 50, reasoning: ['Salary information not available'] };
    }

    const salaryRange = this.parseSalaryRange(jobSalary);
    if (!salaryRange) {
      return { score: 50, reasoning: ['Could not parse salary information'] };
    }

    const { min, max } = salaryRange;
    const midpoint = (min + max) / 2;
    
    let score = 100;
    if (desiredSalary > max) {
      score = Math.max(0, 100 - ((desiredSalary - max) / desiredSalary) * 100);
    } else if (desiredSalary < min) {
      score = Math.max(70, 100 - ((min - desiredSalary) / min) * 50);
    }

    const reasoning: string[] = [];
    if (desiredSalary >= min && desiredSalary <= max) {
      reasoning.push(`Excellent salary match: $${desiredSalary.toLocaleString()} fits within range`);
    } else if (desiredSalary > max) {
      reasoning.push(`Salary below expectations: Range $${min.toLocaleString()}-$${max.toLocaleString()}`);
    } else {
      reasoning.push(`Salary above expectations: Range $${min.toLocaleString()}-$${max.toLocaleString()}`);
    }

    return { score, reasoning };
  }

  private static analyzeLocationMatch(jobLocation: string, remote: boolean, preferredLocations: string[], workModel: string) {
    let score = 50;
    const reasoning: string[] = [];

    if (remote && (workModel === 'remote' || workModel === 'hybrid')) {
      score = 100;
      reasoning.push('Perfect match: Remote position aligns with your preferences');
    } else if (remote && workModel === 'onsite') {
      score = 30;
      reasoning.push('Partial match: Remote position but you prefer onsite work');
    } else {
      const locationMatch = preferredLocations.some(loc => 
        jobLocation.toLowerCase().includes(loc.toLowerCase()) ||
        loc.toLowerCase().includes(jobLocation.toLowerCase())
      );
      
      if (locationMatch) {
        score = workModel === 'onsite' ? 100 : 80;
        reasoning.push(`Good location match: ${jobLocation} is in your preferred areas`);
      } else {
        score = workModel === 'remote' ? 20 : 40;
        reasoning.push(`Location mismatch: ${jobLocation} not in preferred areas`);
      }
    }

    return { score, reasoning };
  }

  private static analyzeCultureMatch(jobData: JobData, userProfile: UserProfile) {
    let score = 50;
    const reasoning: string[] = [];

    // Industry preference match
    const industryMatch = userProfile.industryPreferences.some(pref => 
      jobData.industry.toLowerCase().includes(pref.toLowerCase())
    );
    
    if (industryMatch) {
      score += 20;
      reasoning.push(`Industry alignment: ${jobData.industry} matches your preferences`);
    }

    // Company size match
    if (jobData.companySize && userProfile.companySize.includes(jobData.companySize)) {
      score += 15;
      reasoning.push(`Company size match: ${jobData.companySize} company`);
    }

    // Role type match
    const roleMatch = userProfile.rolePreferences.some(role => 
      jobData.title.toLowerCase().includes(role.toLowerCase())
    );
    
    if (roleMatch) {
      score += 15;
      reasoning.push(`Role type alignment: ${jobData.title} matches your career goals`);
    }

    return { score: Math.min(100, score), reasoning };
  }

  private static analyzeCompanyMatch(jobData: JobData, userProfile: UserProfile) {
    // This would integrate with company data, for now basic scoring
    let score = 70;
    const reasoning: string[] = [];

    // Basic company reputation scoring (would integrate with actual data)
    const companySize = jobData.companySize?.toLowerCase();
    if (companySize === 'startup' && userProfile.companySize.includes('startup')) {
      score += 20;
      reasoning.push('Startup environment match');
    } else if (companySize === 'enterprise' && userProfile.companySize.includes('large')) {
      score += 15;
      reasoning.push('Enterprise environment match');
    }

    reasoning.push(`Company: ${jobData.company} - Standard evaluation applied`);

    return { score: Math.min(100, score), reasoning };
  }

  private static calculateWeightedScore(scores: { [key: string]: number }): number {
    return Object.entries(scores).reduce((total, [key, score]) => {
      return total + (score * this.weights[key as keyof typeof this.weights]);
    }, 0);
  }

  private static calculateConfidenceLevel(skillsAnalysis: any, experienceAnalysis: any, salaryAnalysis: any): number {
    let confidence = 70;
    
    if (skillsAnalysis.matches.length >= 3) confidence += 15;
    if (experienceAnalysis.score > 80) confidence += 10;
    if (salaryAnalysis.score > 70) confidence += 5;
    
    return Math.min(100, confidence);
  }

  private static getSynonyms(skill: string): string[] {
    const synonymMap: { [key: string]: string[] } = {
      'javascript': ['js', 'ecmascript', 'es6', 'es2015'],
      'typescript': ['ts'],
      'react': ['reactjs', 'react.js'],
      'python': ['py'],
      'machine learning': ['ml', 'artificial intelligence', 'ai'],
      'database': ['db', 'sql', 'nosql'],
      'frontend': ['front-end', 'client-side'],
      'backend': ['back-end', 'server-side']
    };
    
    return synonymMap[skill] || [];
  }

  private static calculateTotalExperience(workExperiences: any[]): number {
    return workExperiences.reduce((total, exp) => {
      const startDate = new Date(exp.start_date || Date.now());
      const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
      const months = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return total + Math.max(0, months);
    }, 0) / 12; // Convert to years
  }

  private static parseSalary(salaryString: string | undefined): number {
    if (!salaryString) return 0;
    
    const matches = salaryString.match(/[\d,]+/g);
    if (!matches) return 0;
    
    return parseInt(matches[0].replace(/,/g, ''));
  }

  private static parseSalaryRange(salary: string): { min: number; max: number } | null {
    const rangeMatch = salary.match(/\$?([\d,]+)\s*[-–—]\s*\$?([\d,]+)/);
    if (rangeMatch) {
      return {
        min: parseInt(rangeMatch[1].replace(/,/g, '')),
        max: parseInt(rangeMatch[2].replace(/,/g, ''))
      };
    }
    
    const singleMatch = salary.match(/\$?([\d,]+)/);
    if (singleMatch) {
      const amount = parseInt(singleMatch[1].replace(/,/g, ''));
      return { min: amount * 0.9, max: amount * 1.1 };
    }
    
    return null;
  }

  static async batchAnalyzeJobs(jobs: JobData[], userId: string): Promise<MLJobMatch[]> {
    const analyses = await Promise.all(
      jobs.map(job => this.analyzeJobMatch(job, userId))
    );
    
    return analyses.sort((a, b) => b.matchScore - a.matchScore);
  }

  static async getRecommendedJobs(userId: string, limit: number = 10): Promise<MLJobMatch[]> {
    // This would integrate with job search APIs
    const mockJobs: JobData[] = [
      {
        id: '1',
        title: 'Senior React Developer',
        company: 'TechFlow Inc.',
        location: 'San Francisco, CA',
        salary: '$130,000 - $160,000',
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
        experienceLevel: 'senior',
        jobType: 'full-time',
        industry: 'Technology',
        remote: true,
        description: 'Build scalable web applications...'
      },
      {
        id: '2',
        title: 'Full Stack Engineer',
        company: 'InnovateLab',
        location: 'Austin, TX',
        salary: '$110,000 - $140,000',
        requiredSkills: ['JavaScript', 'Python', 'AWS', 'Docker'],
        experienceLevel: 'mid',
        jobType: 'full-time',
        industry: 'Startups',
        remote: false,
        description: 'Work on cutting-edge products...'
      }
    ];

    return this.batchAnalyzeJobs(mockJobs, userId);
  }
}
