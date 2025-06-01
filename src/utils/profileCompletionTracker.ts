
import { profileCompletionService } from '@/services/profileCompletionService';
import { ErrorHandler } from './errorHandling';

export interface CompletionMilestone {
  percentage: number;
  title: string;
  description: string;
  unlocks: string[];
}

export interface FieldCompletionStatus {
  fieldName: string;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  points: number;
  description: string;
}

export interface ProfileQualityMetrics {
  completionScore: number;
  qualityScore: number;
  strengthAreas: string[];
  improvementAreas: string[];
  recommendations: string[];
}

export class ProfileCompletionTracker {
  private static readonly COMPLETION_MILESTONES: CompletionMilestone[] = [
    {
      percentage: 25,
      title: 'Getting Started',
      description: 'You\'ve added basic information',
      unlocks: ['Profile visibility', 'Basic job matching']
    },
    {
      percentage: 50,
      title: 'Half Way There',
      description: 'Your profile is taking shape',
      unlocks: ['Improved job recommendations', 'Resume optimization tips']
    },
    {
      percentage: 75,
      title: 'Almost Complete',
      description: 'You\'re doing great! Just a few more details',
      unlocks: ['Advanced matching', 'Priority job alerts']
    },
    {
      percentage: 90,
      title: 'Excellent Progress',
      description: 'Your profile is nearly perfect',
      unlocks: ['Premium features', 'Recruiter visibility boost']
    },
    {
      percentage: 100,
      title: 'Profile Complete',
      description: 'Congratulations! Your profile is fully optimized',
      unlocks: ['All features unlocked', 'Maximum visibility', 'Advanced analytics']
    }
  ];

  private static readonly FIELD_WEIGHTS = {
    // Personal Info (40 points total)
    name: { points: 10, priority: 'high' as const, description: 'Your full name' },
    email: { points: 10, priority: 'high' as const, description: 'Contact email address' },
    phone: { points: 10, priority: 'high' as const, description: 'Phone number for contact' },
    completeAddress: { points: 10, priority: 'high' as const, description: 'Complete address with county' },
    
    // Professional Info (30 points total)
    workExperience: { points: 20, priority: 'high' as const, description: 'Work experience entries' },
    skills: { points: 10, priority: 'high' as const, description: 'Professional skills' },
    
    // Education & Projects (20 points total)
    education: { points: 15, priority: 'medium' as const, description: 'Educational background' },
    projects: { points: 5, priority: 'medium' as const, description: 'Personal or professional projects' },
    
    // Additional Info (10 points total)
    socialLinks: { points: 5, priority: 'low' as const, description: 'LinkedIn, GitHub, or portfolio links' },
    languages: { points: 3, priority: 'low' as const, description: 'Languages you speak' },
    activities: { points: 2, priority: 'low' as const, description: 'Activities and leadership experience' }
  };

  static async updateCompletionTracking(userId: string, profileData: any): Promise<void> {
    try {
      const completionItems = await this.calculateDetailedCompletion(profileData);
      const completionPercentage = this.calculateOverallCompletion(completionItems);
      const missingFields = completionItems
        .filter(item => !item.isCompleted && item.priority === 'high')
        .map(item => item.fieldName);

      await profileCompletionService.updateProfileCompletion(userId, {
        completion_percentage: completionPercentage,
        missing_fields: missingFields
      });

      // Check for milestone achievements
      await this.checkMilestoneAchievements(userId, completionPercentage);
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Update Completion Tracking', userId }
      );
    }
  }

  static calculateDetailedCompletion(profileData: any): FieldCompletionStatus[] {
    const completionItems: FieldCompletionStatus[] = [];

    // Check personal info
    completionItems.push({
      fieldName: 'name',
      isCompleted: !!(profileData.personalInfo?.name?.trim()),
      ...this.FIELD_WEIGHTS.name
    });

    completionItems.push({
      fieldName: 'email',
      isCompleted: !!(profileData.personalInfo?.email?.trim()),
      ...this.FIELD_WEIGHTS.email
    });

    completionItems.push({
      fieldName: 'phone',
      isCompleted: !!(profileData.personalInfo?.phone?.trim()),
      ...this.FIELD_WEIGHTS.phone
    });

    // Check complete address
    const hasCompleteAddress = !!(
      profileData.personalInfo?.streetAddress?.trim() &&
      profileData.personalInfo?.city?.trim() &&
      profileData.personalInfo?.state?.trim() &&
      profileData.personalInfo?.county?.trim() &&
      profileData.personalInfo?.zipCode?.trim()
    );
    
    completionItems.push({
      fieldName: 'completeAddress',
      isCompleted: hasCompleteAddress,
      ...this.FIELD_WEIGHTS.completeAddress
    });

    // Check work experience
    completionItems.push({
      fieldName: 'workExperience',
      isCompleted: !!(profileData.workExperiences?.length > 0),
      ...this.FIELD_WEIGHTS.workExperience
    });

    // Check skills
    completionItems.push({
      fieldName: 'skills',
      isCompleted: !!(profileData.skills?.length >= 3),
      ...this.FIELD_WEIGHTS.skills
    });

    // Check education
    completionItems.push({
      fieldName: 'education',
      isCompleted: !!(profileData.education?.length > 0),
      ...this.FIELD_WEIGHTS.education
    });

    // Check projects
    completionItems.push({
      fieldName: 'projects',
      isCompleted: !!(profileData.projects?.length > 0),
      ...this.FIELD_WEIGHTS.projects
    });

    // Check social links
    const hasSocialLinks = !!(
      profileData.socialLinks?.linkedin ||
      profileData.socialLinks?.github ||
      profileData.socialLinks?.portfolio
    );
    
    completionItems.push({
      fieldName: 'socialLinks',
      isCompleted: hasSocialLinks,
      ...this.FIELD_WEIGHTS.socialLinks
    });

    // Check languages
    completionItems.push({
      fieldName: 'languages',
      isCompleted: !!(profileData.languages?.length > 0),
      ...this.FIELD_WEIGHTS.languages
    });

    // Check activities
    completionItems.push({
      fieldName: 'activities',
      isCompleted: !!(profileData.activities?.length > 0),
      ...this.FIELD_WEIGHTS.activities
    });

    return completionItems;
  }

  static calculateOverallCompletion(completionItems: FieldCompletionStatus[]): number {
    const totalPoints = Object.values(this.FIELD_WEIGHTS).reduce((sum, field) => sum + field.points, 0);
    const earnedPoints = completionItems
      .filter(item => item.isCompleted)
      .reduce((sum, item) => sum + item.points, 0);

    return Math.round((earnedPoints / totalPoints) * 100);
  }

  static calculateQualityMetrics(profileData: any): ProfileQualityMetrics {
    const completionItems = this.calculateDetailedCompletion(profileData);
    const completionScore = this.calculateOverallCompletion(completionItems);
    
    // Calculate quality score based on depth and completeness
    let qualityScore = completionScore;
    
    // Bonus points for quality indicators
    if (profileData.workExperiences?.length >= 3) qualityScore += 5;
    if (profileData.skills?.length >= 10) qualityScore += 5;
    if (profileData.projects?.length >= 2) qualityScore += 3;
    if (profileData.education?.some((edu: any) => edu.gpa)) qualityScore += 2;
    
    qualityScore = Math.min(qualityScore, 100);

    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];
    const recommendations: string[] = [];

    // Analyze strengths and areas for improvement
    if (profileData.workExperiences?.length >= 2) {
      strengthAreas.push('Strong work experience');
    } else {
      improvementAreas.push('Work experience');
      recommendations.push('Add more work experience details');
    }

    if (profileData.skills?.length >= 5) {
      strengthAreas.push('Good skill diversity');
    } else {
      improvementAreas.push('Skills section');
      recommendations.push('Add more relevant skills');
    }

    if (profileData.projects?.length > 0) {
      strengthAreas.push('Project portfolio');
    } else {
      recommendations.push('Consider adding personal or professional projects');
    }

    return {
      completionScore,
      qualityScore,
      strengthAreas,
      improvementAreas,
      recommendations
    };
  }

  private static async checkMilestoneAchievements(userId: string, completionPercentage: number): Promise<void> {
    const achievedMilestones = this.COMPLETION_MILESTONES.filter(
      milestone => completionPercentage >= milestone.percentage
    );

    if (achievedMilestones.length > 0) {
      const latestMilestone = achievedMilestones[achievedMilestones.length - 1];
      console.log(`🎉 Milestone achieved: ${latestMilestone.title} (${latestMilestone.percentage}%)`);
      
      // You could trigger notifications here
      // notificationService.createMilestoneNotification(userId, latestMilestone);
    }
  }

  static getNextMilestone(currentPercentage: number): CompletionMilestone | null {
    return this.COMPLETION_MILESTONES.find(
      milestone => milestone.percentage > currentPercentage
    ) || null;
  }

  static getAllMilestones(): CompletionMilestone[] {
    return this.COMPLETION_MILESTONES;
  }
}
