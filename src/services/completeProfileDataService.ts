
import { supabase } from '@/integrations/supabase/client';
import { ProfileDataSync } from '@/utils/profileDataSync';

export interface CompleteProfileData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    other_url?: string;
    job_status?: string;
    primary_language?: string;
  };
  workExperiences: Array<{
    company: string;
    role: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    description?: string[];
  }>;
  education: Array<{
    school: string;
    degree?: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
    gpa?: string;
  }>;
  skills: Array<{
    skill: string;
    category?: string;
  }>;
  projects: Array<{
    name: string;
    description?: string[];
    technologies?: string[];
    url?: string;
    start_date?: string;
    end_date?: string;
  }>;
  activities: Array<{
    organization: string;
    role?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  }>;
  languages: Array<{
    language: string;
    proficiency?: string;
  }>;
}

export interface ProfileCompletionMetrics {
  overallCompletion: number;
  qualityScore: number;
  strengthScore: number;
  sectionScores: {
    personalInfo: number;
    workExperience: number;
    education: number;
    skills: number;
    projects: number;
    activities: number;
    languages: number;
  };
  missingFields: string[];
  recommendations: string[];
  nextSteps: string[];
}

export class CompleteProfileDataService {
  // Load complete profile data from all tables
  static async loadCompleteProfile(userId: string): Promise<CompleteProfileData | null> {
    try {
      console.log('Loading complete profile for user:', userId);

      const [
        userProfile,
        workExperiences,
        education,
        skills,
        projects,
        activities,
        languages
      ] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('work_experiences').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
        supabase.from('education').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
        supabase.from('user_skills').select('*').eq('user_id', userId),
        supabase.from('projects').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
        supabase.from('activities_leadership').select('*').eq('user_id', userId).order('start_date', { ascending: false }),
        supabase.from('user_languages').select('*').eq('user_id', userId)
      ]);

      // Check for errors
      const errors = [userProfile.error, workExperiences.error, education.error, skills.error, projects.error, activities.error, languages.error].filter(Boolean);
      if (errors.length > 0) {
        console.error('Errors loading profile data:', errors);
        return null;
      }

      const completeProfile: CompleteProfileData = {
        personalInfo: {
          name: userProfile.data?.name || '',
          email: userProfile.data?.user_id || '', // Using user_id as email reference
          phone: userProfile.data?.phone || '',
          location: userProfile.data?.location || '',
          linkedin_url: userProfile.data?.linkedin_url || '',
          github_url: userProfile.data?.github_url || '',
          portfolio_url: userProfile.data?.portfolio_url || '',
          other_url: userProfile.data?.other_url || '',
          job_status: userProfile.data?.job_status || 'Actively looking',
          primary_language: userProfile.data?.primary_language || 'English'
        },
        workExperiences: workExperiences.data || [],
        education: education.data || [],
        skills: skills.data || [],
        projects: projects.data || [],
        activities: activities.data || [],
        languages: languages.data || []
      };

      console.log('Complete profile loaded successfully');
      return completeProfile;

    } catch (error) {
      console.error('Error loading complete profile:', error);
      return null;
    }
  }

  // Save complete profile data to all tables
  static async saveCompleteProfile(userId: string, profileData: CompleteProfileData): Promise<boolean> {
    try {
      console.log('Saving complete profile for user:', userId);

      // Start a transaction-like approach by saving to each table
      const results = await Promise.allSettled([
        // Save user profile
        supabase.from('user_profiles').upsert({
          user_id: userId,
          ...profileData.personalInfo,
          updated_at: new Date().toISOString()
        }),

        // Save work experiences (delete existing and insert new)
        this.replaceWorkExperiences(userId, profileData.workExperiences),
        
        // Save education
        this.replaceEducation(userId, profileData.education),
        
        // Save skills
        this.replaceSkills(userId, profileData.skills),
        
        // Save projects
        this.replaceProjects(userId, profileData.projects),
        
        // Save activities
        this.replaceActivities(userId, profileData.activities),
        
        // Save languages
        this.replaceLanguages(userId, profileData.languages)
      ]);

      // Check if any operations failed
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('Some profile save operations failed:', failures);
        return false;
      }

      // Update user metrics after successful save
      await this.updateUserMetrics(userId, profileData);

      console.log('Complete profile saved successfully');
      return true;

    } catch (error) {
      console.error('Error saving complete profile:', error);
      return false;
    }
  }

  // Helper methods to replace table data
  private static async replaceWorkExperiences(userId: string, data: any[]) {
    await supabase.from('work_experiences').delete().eq('user_id', userId);
    if (data && data.length > 0) {
      const dataWithUserId = data.map(item => ({
        ...item,
        user_id: userId,
        updated_at: new Date().toISOString()
      }));
      return supabase.from('work_experiences').insert(dataWithUserId);
    }
    return { data: null, error: null };
  }

  private static async replaceEducation(userId: string, data: any[]) {
    await supabase.from('education').delete().eq('user_id', userId);
    if (data && data.length > 0) {
      const dataWithUserId = data.map(item => ({
        ...item,
        user_id: userId,
        updated_at: new Date().toISOString()
      }));
      return supabase.from('education').insert(dataWithUserId);
    }
    return { data: null, error: null };
  }

  private static async replaceSkills(userId: string, data: any[]) {
    await supabase.from('user_skills').delete().eq('user_id', userId);
    if (data && data.length > 0) {
      const dataWithUserId = data.map(item => ({
        ...item,
        user_id: userId,
        created_at: new Date().toISOString()
      }));
      return supabase.from('user_skills').insert(dataWithUserId);
    }
    return { data: null, error: null };
  }

  private static async replaceProjects(userId: string, data: any[]) {
    await supabase.from('projects').delete().eq('user_id', userId);
    if (data && data.length > 0) {
      const dataWithUserId = data.map(item => ({
        ...item,
        user_id: userId,
        updated_at: new Date().toISOString()
      }));
      return supabase.from('projects').insert(dataWithUserId);
    }
    return { data: null, error: null };
  }

  private static async replaceActivities(userId: string, data: any[]) {
    await supabase.from('activities_leadership').delete().eq('user_id', userId);
    if (data && data.length > 0) {
      const dataWithUserId = data.map(item => ({
        ...item,
        user_id: userId,
        updated_at: new Date().toISOString()
      }));
      return supabase.from('activities_leadership').insert(dataWithUserId);
    }
    return { data: null, error: null };
  }

  private static async replaceLanguages(userId: string, data: any[]) {
    await supabase.from('user_languages').delete().eq('user_id', userId);
    if (data && data.length > 0) {
      const dataWithUserId = data.map(item => ({
        ...item,
        user_id: userId,
        created_at: new Date().toISOString()
      }));
      return supabase.from('user_languages').insert(dataWithUserId);
    }
    return { data: null, error: null };
  }

  // Calculate comprehensive profile completion metrics
  static async calculateProfileMetrics(userId: string): Promise<ProfileCompletionMetrics> {
    try {
      const profileData = await this.loadCompleteProfile(userId);
      
      if (!profileData) {
        return this.getEmptyMetrics();
      }

      // Calculate section scores
      const sectionScores = {
        personalInfo: this.calculatePersonalInfoScore(profileData.personalInfo),
        workExperience: this.calculateWorkExperienceScore(profileData.workExperiences),
        education: this.calculateEducationScore(profileData.education),
        skills: this.calculateSkillsScore(profileData.skills),
        projects: this.calculateProjectsScore(profileData.projects),
        activities: this.calculateActivitiesScore(profileData.activities),
        languages: this.calculateLanguagesScore(profileData.languages)
      };

      // Calculate overall metrics
      const overallCompletion = Math.round(
        Object.values(sectionScores).reduce((sum, score) => sum + score, 0) / 7
      );

      const qualityScore = this.calculateQualityScore(profileData);
      const strengthScore = this.calculateStrengthScore(profileData, sectionScores);

      // Generate recommendations and missing fields
      const missingFields = this.identifyMissingFields(profileData);
      const recommendations = this.generateRecommendations(profileData, sectionScores);
      const nextSteps = this.generateNextSteps(profileData, sectionScores);

      const metrics: ProfileCompletionMetrics = {
        overallCompletion,
        qualityScore,
        strengthScore,
        sectionScores,
        missingFields,
        recommendations,
        nextSteps
      };

      // Save metrics to database
      await this.saveMetricsToDatabase(userId, metrics);

      return metrics;

    } catch (error) {
      console.error('Error calculating profile metrics:', error);
      return this.getEmptyMetrics();
    }
  }

  // Personal info scoring (0-100)
  private static calculatePersonalInfoScore(personalInfo: any): number {
    let score = 0;
    const fields = [
      { field: 'name', weight: 25 },
      { field: 'phone', weight: 20 },
      { field: 'location', weight: 15 },
      { field: 'linkedin_url', weight: 15 },
      { field: 'github_url', weight: 10 },
      { field: 'portfolio_url', weight: 10 },
      { field: 'job_status', weight: 5 }
    ];

    fields.forEach(({ field, weight }) => {
      if (personalInfo[field] && personalInfo[field].trim()) {
        score += weight;
      }
    });

    return Math.min(score, 100);
  }

  // Work experience scoring
  private static calculateWorkExperienceScore(experiences: any[]): number {
    if (!experiences || experiences.length === 0) return 0;

    let score = 0;
    
    // Base points for having experiences
    if (experiences.length >= 1) score += 40;
    if (experiences.length >= 2) score += 20;
    if (experiences.length >= 3) score += 10;

    // Quality points for detailed experiences
    experiences.slice(0, 3).forEach(exp => {
      if (exp.company && exp.role) score += 5;
      if (exp.description && exp.description.length > 0) score += 5;
      if (exp.start_date) score += 3;
      if (exp.location) score += 2;
    });

    return Math.min(score, 100);
  }

  // Education scoring
  private static calculateEducationScore(education: any[]): number {
    if (!education || education.length === 0) return 0;

    let score = 60; // Base score for having education

    education.slice(0, 2).forEach(edu => {
      if (edu.degree) score += 10;
      if (edu.field_of_study) score += 10;
      if (edu.gpa) score += 5;
      if (edu.start_date && edu.end_date) score += 5;
    });

    return Math.min(score, 100);
  }

  // Skills scoring
  private static calculateSkillsScore(skills: any[]): number {
    if (!skills || skills.length === 0) return 0;

    let score = 0;
    if (skills.length >= 3) score += 50;
    if (skills.length >= 5) score += 20;
    if (skills.length >= 8) score += 15;
    if (skills.length >= 12) score += 15;

    return Math.min(score, 100);
  }

  // Projects scoring
  private static calculateProjectsScore(projects: any[]): number {
    if (!projects || projects.length === 0) return 0;

    let score = 0;
    if (projects.length >= 1) score += 40;
    if (projects.length >= 2) score += 20;
    if (projects.length >= 3) score += 10;

    projects.slice(0, 3).forEach(project => {
      if (project.description && project.description.length > 0) score += 5;
      if (project.technologies && project.technologies.length > 0) score += 5;
      if (project.url) score += 5;
    });

    return Math.min(score, 100);
  }

  // Activities scoring
  private static calculateActivitiesScore(activities: any[]): number {
    if (!activities || activities.length === 0) return 0;

    let score = 50; // Base score for having activities

    activities.slice(0, 3).forEach(activity => {
      if (activity.role) score += 10;
      if (activity.description) score += 10;
      if (activity.start_date) score += 5;
    });

    return Math.min(score, 100);
  }

  // Languages scoring
  private static calculateLanguagesScore(languages: any[]): number {
    if (!languages || languages.length === 0) return 0;

    let score = 0;
    if (languages.length >= 1) score += 50;
    if (languages.length >= 2) score += 30;
    if (languages.length >= 3) score += 20;

    return Math.min(score, 100);
  }

  // Calculate quality score based on data richness
  private static calculateQualityScore(profileData: CompleteProfileData): number {
    let qualityPoints = 0;
    let totalPossible = 0;

    // Check work experience quality
    profileData.workExperiences.forEach(exp => {
      totalPossible += 4;
      if (exp.description && Array.isArray(exp.description) && exp.description.length >= 3) qualityPoints += 1;
      if (exp.start_date && exp.end_date) qualityPoints += 1;
      if (exp.location) qualityPoints += 1;
      if (exp.company && exp.role) qualityPoints += 1;
    });

    // Check education quality
    profileData.education.forEach(edu => {
      totalPossible += 3;
      if (edu.degree && edu.field_of_study) qualityPoints += 1;
      if (edu.start_date && edu.end_date) qualityPoints += 1;
      if (edu.gpa) qualityPoints += 1;
    });

    // Check projects quality
    profileData.projects.forEach(project => {
      totalPossible += 3;
      if (project.description && Array.isArray(project.description) && project.description.length > 0) qualityPoints += 1;
      if (project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0) qualityPoints += 1;
      if (project.url) qualityPoints += 1;
    });

    return totalPossible > 0 ? Math.round((qualityPoints / totalPossible) * 100) : 0;
  }

  // Calculate strength score based on competitive advantages
  private static calculateStrengthScore(profileData: CompleteProfileData, sectionScores: any): number {
    let strengthPoints = 0;

    // Professional presence
    if (profileData.personalInfo.linkedin_url) strengthPoints += 15;
    if (profileData.personalInfo.github_url) strengthPoints += 15;
    if (profileData.personalInfo.portfolio_url) strengthPoints += 15;

    // Experience depth
    if (profileData.workExperiences.length >= 3) strengthPoints += 15;
    
    // Skills breadth
    if (profileData.skills.length >= 8) strengthPoints += 10;
    
    // Project portfolio
    if (profileData.projects.length >= 2) strengthPoints += 10;
    
    // Leadership/Activities
    if (profileData.activities.length >= 1) strengthPoints += 10;
    
    // Multilingual
    if (profileData.languages.length >= 2) strengthPoints += 10;

    return Math.min(strengthPoints, 100);
  }

  // Identify missing critical fields
  private static identifyMissingFields(profileData: CompleteProfileData): string[] {
    const missing: string[] = [];

    if (!profileData.personalInfo.name) missing.push('Full Name');
    if (!profileData.personalInfo.phone) missing.push('Phone Number');
    if (!profileData.personalInfo.location) missing.push('Location');
    if (!profileData.personalInfo.linkedin_url) missing.push('LinkedIn Profile');
    
    if (profileData.workExperiences.length === 0) missing.push('Work Experience');
    if (profileData.education.length === 0) missing.push('Education');
    if (profileData.skills.length < 3) missing.push('Professional Skills (minimum 3)');
    
    if (profileData.projects.length === 0) missing.push('Projects or Portfolio');

    return missing;
  }

  // Generate personalized recommendations
  private static generateRecommendations(profileData: CompleteProfileData, sectionScores: any): string[] {
    const recommendations: string[] = [];

    if (sectionScores.personalInfo < 80) {
      recommendations.push('Complete your contact information and add professional links');
    }
    
    if (sectionScores.workExperience < 70) {
      recommendations.push('Add more detailed work experiences with specific achievements');
    }
    
    if (sectionScores.skills < 70) {
      recommendations.push('Expand your skills list to include both technical and soft skills');
    }
    
    if (sectionScores.projects < 50) {
      recommendations.push('Showcase your work with project examples and links');
    }

    if (!profileData.personalInfo.github_url && profileData.skills.some(s => 
      s.skill.toLowerCase().includes('programming') || 
      s.skill.toLowerCase().includes('development')
    )) {
      recommendations.push('Add your GitHub profile to showcase your coding projects');
    }

    return recommendations;
  }

  // Generate next steps for improvement
  private static generateNextSteps(profileData: CompleteProfileData, sectionScores: any): string[] {
    const nextSteps: string[] = [];

    // Prioritize based on scores
    const sortedSections = Object.entries(sectionScores)
      .sort(([,a], [,b]) => (a as number) - (b as number))
      .slice(0, 3);

    sortedSections.forEach(([section, score]) => {
      if ((score as number) < 70) {
        switch (section) {
          case 'personalInfo':
            nextSteps.push('Update your contact information and professional links');
            break;
          case 'workExperience':
            nextSteps.push('Add detailed work experiences with quantifiable achievements');
            break;
          case 'skills':
            nextSteps.push('Add relevant technical and soft skills for your target roles');
            break;
          case 'projects':
            nextSteps.push('Upload project examples with descriptions and links');
            break;
          case 'education':
            nextSteps.push('Add your educational background and certifications');
            break;
        }
      }
    });

    return nextSteps.slice(0, 3); // Top 3 priorities
  }

  // Save metrics to user_metrics table
  private static async saveMetricsToDatabase(userId: string, metrics: ProfileCompletionMetrics): Promise<void> {
    try {
      await supabase.from('user_metrics').upsert({
        user_id: userId,
        profile_completion_score: metrics.overallCompletion,
        profile_quality_score: metrics.qualityScore,
        engagement_score: metrics.strengthScore,
        last_activity_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving metrics to database:', error);
    }
  }

  // Update user metrics after profile changes
  private static async updateUserMetrics(userId: string, profileData: CompleteProfileData): Promise<void> {
    try {
      const metrics = await this.calculateProfileMetrics(userId);
      
      // Also update profile completion in user_profiles table
      await supabase.from('user_profiles').update({
        profile_completion: metrics.overallCompletion,
        updated_at: new Date().toISOString()
      }).eq('user_id', userId);

    } catch (error) {
      console.error('Error updating user metrics:', error);
    }
  }

  // Get empty metrics object
  private static getEmptyMetrics(): ProfileCompletionMetrics {
    return {
      overallCompletion: 0,
      qualityScore: 0,
      strengthScore: 0,
      sectionScores: {
        personalInfo: 0,
        workExperience: 0,
        education: 0,
        skills: 0,
        projects: 0,
        activities: 0,
        languages: 0
      },
      missingFields: [],
      recommendations: [],
      nextSteps: []
    };
  }

  // Get user metrics from database
  static async getUserMetrics(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user metrics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserMetrics:', error);
      return null;
    }
  }
}
