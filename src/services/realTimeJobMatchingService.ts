
import { supabase } from '@/integrations/supabase/client';
import { DatabaseJob, castJobData } from '@/types/database';

export interface MLJobMatch {
  job: DatabaseJob;
  matchScore: number;
  confidenceLevel: number;
  matchingFactors: string[];
  skillGaps: string[];
  salaryCompatibility: number;
  locationCompatibility: number;
  experienceAlignment: number;
  industryMatch: number;
  careerGrowthPotential: number;
  applicationSuccessPrediction: number;
}

export interface UserProfile {
  skills: string[];
  experience: string;
  location: string;
  salaryRange: { min: number; max: number };
  industries: string[];
  careerGoals: string[];
  workPreferences: string[];
}

export class RealTimeJobMatchingService {
  private static readonly INDUSTRY_WEIGHTS = {
    'technology': { skills: 0.4, experience: 0.3, salary: 0.2, location: 0.1 },
    'finance': { skills: 0.3, experience: 0.4, salary: 0.2, location: 0.1 },
    'healthcare': { skills: 0.35, experience: 0.35, salary: 0.15, location: 0.15 },
    'education': { skills: 0.3, experience: 0.3, salary: 0.1, location: 0.3 },
    'default': { skills: 0.35, experience: 0.25, salary: 0.2, location: 0.2 }
  };

  static async performMLJobMatching(
    userProfile: UserProfile,
    availableJobs: DatabaseJob[],
    industryContext?: string
  ): Promise<MLJobMatch[]> {
    const weights = this.INDUSTRY_WEIGHTS[industryContext as keyof typeof this.INDUSTRY_WEIGHTS] || 
                   this.INDUSTRY_WEIGHTS.default;

    const matches: MLJobMatch[] = [];

    for (const job of availableJobs) {
      const skillMatch = this.calculateSkillMatch(userProfile.skills, job.requirements);
      const experienceMatch = this.calculateExperienceMatch(userProfile.experience, job);
      const salaryMatch = this.calculateSalaryCompatibility(userProfile.salaryRange, job.salary);
      const locationMatch = this.calculateLocationCompatibility(userProfile.location, job.location, job.remote);
      const industryMatch = this.calculateIndustryMatch(userProfile.industries, job);
      
      const overallScore = (
        skillMatch.score * weights.skills +
        experienceMatch * weights.experience +
        salaryMatch * weights.salary +
        locationMatch * weights.location
      );

      const careerGrowthPotential = this.predictCareerGrowth(userProfile, job);
      const applicationSuccessPrediction = this.predictApplicationSuccess(
        overallScore, userProfile, job
      );

      matches.push({
        job,
        matchScore: Math.round(overallScore * 100),
        confidenceLevel: this.calculateConfidenceLevel(overallScore, skillMatch.confidence),
        matchingFactors: skillMatch.matchingSkills,
        skillGaps: skillMatch.missingSkills,
        salaryCompatibility: Math.round(salaryMatch * 100),
        locationCompatibility: Math.round(locationMatch * 100),
        experienceAlignment: Math.round(experienceMatch * 100),
        industryMatch: Math.round(industryMatch * 100),
        careerGrowthPotential: Math.round(careerGrowthPotential * 100),
        applicationSuccessPrediction: Math.round(applicationSuccessPrediction * 100)
      });
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private static calculateSkillMatch(userSkills: string[], jobRequirements: string[]) {
    const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase());
    const normalizedJobSkills = jobRequirements.map(skill => skill.toLowerCase());
    
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];
    
    for (const jobSkill of normalizedJobSkills) {
      const isMatch = normalizedUserSkills.some(userSkill => 
        userSkill.includes(jobSkill) || jobSkill.includes(userSkill) ||
        this.areRelatedSkills(userSkill, jobSkill)
      );
      
      if (isMatch) {
        matchingSkills.push(jobSkill);
      } else {
        missingSkills.push(jobSkill);
      }
    }
    
    const score = normalizedJobSkills.length > 0 ? matchingSkills.length / normalizedJobSkills.length : 0;
    const confidence = Math.min(1, normalizedUserSkills.length / 10); // Higher confidence with more skills
    
    return { score, confidence, matchingSkills, missingSkills };
  }

  private static areRelatedSkills(skill1: string, skill2: string): boolean {
    const skillRelations: Record<string, string[]> = {
      'javascript': ['react', 'node.js', 'typescript', 'vue', 'angular'],
      'python': ['django', 'flask', 'pandas', 'tensorflow', 'data science'],
      'java': ['spring', 'android', 'kotlin', 'maven', 'gradle'],
      'react': ['javascript', 'typescript', 'jsx', 'frontend'],
      'aws': ['cloud', 'ec2', 's3', 'lambda', 'devops'],
      'sql': ['database', 'mysql', 'postgresql', 'data analysis']
    };

    for (const [baseSkill, related] of Object.entries(skillRelations)) {
      if (skill1.includes(baseSkill) && related.some(r => skill2.includes(r))) return true;
      if (skill2.includes(baseSkill) && related.some(r => skill1.includes(r))) return true;
    }
    
    return false;
  }

  private static calculateExperienceMatch(userExperience: string, job: DatabaseJob): number {
    const experienceLevels = ['entry', 'junior', 'mid', 'senior', 'lead', 'principal'];
    const userLevel = experienceLevels.findIndex(level => 
      userExperience.toLowerCase().includes(level)
    );
    
    const jobDescription = (job.description + ' ' + job.title).toLowerCase();
    const jobLevel = experienceLevels.findIndex(level => 
      jobDescription.includes(level)
    );
    
    if (userLevel === -1 || jobLevel === -1) return 0.5;
    
    const levelDiff = Math.abs(userLevel - jobLevel);
    return Math.max(0, 1 - (levelDiff * 0.2));
  }

  private static calculateSalaryCompatibility(userRange: { min: number; max: number }, jobSalary?: string): number {
    if (!jobSalary) return 0.5;
    
    const salaryNumbers = jobSalary.match(/\d+/g);
    if (!salaryNumbers || salaryNumbers.length < 2) return 0.5;
    
    const jobMin = parseInt(salaryNumbers[0]) * (jobSalary.includes('k') ? 1000 : 1);
    const jobMax = parseInt(salaryNumbers[1]) * (jobSalary.includes('k') ? 1000 : 1);
    
    const overlapMin = Math.max(userRange.min, jobMin);
    const overlapMax = Math.min(userRange.max, jobMax);
    
    if (overlapMin <= overlapMax) {
      const overlapSize = overlapMax - overlapMin;
      const userRangeSize = userRange.max - userRange.min;
      return overlapSize / userRangeSize;
    }
    
    return 0.3; // Some compatibility even without overlap
  }

  private static calculateLocationCompatibility(userLocation: string, jobLocation: string, isRemote: boolean): number {
    if (isRemote) return 1.0;
    
    const userLoc = userLocation.toLowerCase();
    const jobLoc = jobLocation.toLowerCase();
    
    if (userLoc === jobLoc) return 1.0;
    
    // Check for same city, state, or region
    const userParts = userLoc.split(',').map(p => p.trim());
    const jobParts = jobLoc.split(',').map(p => p.trim());
    
    for (const userPart of userParts) {
      for (const jobPart of jobParts) {
        if (userPart === jobPart) return 0.8;
      }
    }
    
    return 0.3; // Different locations
  }

  private static calculateIndustryMatch(userIndustries: string[], job: DatabaseJob): number {
    const jobText = (job.title + ' ' + job.company + ' ' + job.description).toLowerCase();
    
    for (const industry of userIndustries) {
      if (jobText.includes(industry.toLowerCase())) {
        return 1.0;
      }
    }
    
    return 0.5; // Neutral if no clear industry match
  }

  private static predictCareerGrowth(userProfile: UserProfile, job: DatabaseJob): number {
    const jobText = (job.title + ' ' + job.description).toLowerCase();
    const growthKeywords = ['senior', 'lead', 'manager', 'principal', 'director', 'growth', 'advancement'];
    
    const hasGrowthKeywords = growthKeywords.some(keyword => jobText.includes(keyword));
    const isStepUp = job.title.toLowerCase().includes('senior') && 
                    !userProfile.experience.toLowerCase().includes('senior');
    
    let score = 0.5; // Base score
    if (hasGrowthKeywords) score += 0.3;
    if (isStepUp) score += 0.2;
    
    return Math.min(1.0, score);
  }

  private static predictApplicationSuccess(
    matchScore: number, 
    userProfile: UserProfile, 
    job: DatabaseJob
  ): number {
    let baseSuccess = matchScore;
    
    // Adjust based on competition level (simplified)
    const competitiveKeywords = ['google', 'apple', 'microsoft', 'senior', 'lead'];
    const isHighlyCompetitive = competitiveKeywords.some(keyword => 
      (job.company + job.title).toLowerCase().includes(keyword)
    );
    
    if (isHighlyCompetitive) {
      baseSuccess *= 0.7; // Reduce success rate for competitive positions
    }
    
    // Boost for perfect skill matches
    if (matchScore > 0.9) {
      baseSuccess *= 1.2;
    }
    
    return Math.min(1.0, baseSuccess);
  }

  private static calculateConfidenceLevel(matchScore: number, skillConfidence: number): number {
    return Math.round((matchScore * 0.7 + skillConfidence * 0.3) * 100);
  }

  static async getRealtimeJobRecommendations(userId: string, limit: number = 10): Promise<MLJobMatch[]> {
    try {
      // Get user profile data
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('skill')
        .eq('user_id', userId);

      const { data: preferencesData } = await supabase
        .from('job_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Mock job data (in real implementation, this would come from job APIs)
      const mockJobs: DatabaseJob[] = [
        {
          id: '1',
          title: 'Senior React Developer',
          company: 'TechFlow Inc.',
          location: 'San Francisco, CA',
          salary: '$130,000 - $160,000',
          posted: '2 hours ago',
          type: 'Full-time',
          remote: true,
          description: 'We are looking for a Senior React Developer to join our growing team...',
          requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience'],
          benefits: ['Health Insurance', 'Remote Work', '401k Matching']
        },
        // Add more mock jobs...
      ];

      const userProfile: UserProfile = {
        skills: skillsData?.map(s => s.skill) || [],
        experience: profileData?.job_status || 'mid',
        location: profileData?.location || '',
        salaryRange: { min: 80000, max: 150000 },
        industries: preferencesData?.industries || [],
        careerGoals: [],
        workPreferences: []
      };

      return this.performMLJobMatching(userProfile, mockJobs);
    } catch (error) {
      console.error('Error getting realtime job recommendations:', error);
      return [];
    }
  }
}
