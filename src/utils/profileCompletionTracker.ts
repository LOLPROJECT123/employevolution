
interface CompletionItem {
  field: string;
  description: string;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  points: number;
}

interface QualityMetrics {
  completionScore: number;
  qualityScore: number;
  strengthAreas: string[];
  improvementAreas: string[];
  recommendations: string[];
}

interface Milestone {
  title: string;
  description: string;
  requiredScore: number;
  benefits: string[];
}

export class ProfileCompletionTracker {
  static calculateDetailedCompletion(profileData: any): CompletionItem[] {
    const items: CompletionItem[] = [
      {
        field: 'personalInfo.name',
        description: 'Full name',
        isCompleted: Boolean(profileData.personalInfo?.name?.trim()),
        priority: 'high',
        points: 10
      },
      {
        field: 'personalInfo.email',
        description: 'Email address',
        isCompleted: Boolean(profileData.personalInfo?.email?.trim()),
        priority: 'high',
        points: 10
      },
      {
        field: 'personalInfo.phone',
        description: 'Phone number',
        isCompleted: Boolean(profileData.personalInfo?.phone?.trim()),
        priority: 'high',
        points: 10
      },
      {
        field: 'personalInfo.address',
        description: 'Complete address',
        isCompleted: Boolean(
          profileData.personalInfo?.streetAddress?.trim() &&
          profileData.personalInfo?.city?.trim() &&
          profileData.personalInfo?.state?.trim() &&
          profileData.personalInfo?.zipCode?.trim()
        ),
        priority: 'high',
        points: 15
      },
      {
        field: 'workExperiences',
        description: 'Work experience',
        isCompleted: Boolean(profileData.workExperiences?.length > 0),
        priority: 'high',
        points: 20
      },
      {
        field: 'education',
        description: 'Education background',
        isCompleted: Boolean(profileData.education?.length > 0),
        priority: 'high',
        points: 15
      },
      {
        field: 'skills',
        description: 'Skills and competencies',
        isCompleted: Boolean(profileData.skills?.length >= 3),
        priority: 'high',
        points: 10
      },
      {
        field: 'projects',
        description: 'Projects or portfolio',
        isCompleted: Boolean(profileData.projects?.length > 0),
        priority: 'medium',
        points: 10
      },
      {
        field: 'socialLinks',
        description: 'Professional social links',
        isCompleted: Boolean(
          profileData.socialLinks?.linkedin?.trim() ||
          profileData.socialLinks?.github?.trim()
        ),
        priority: 'medium',
        points: 5
      },
      {
        field: 'languages',
        description: 'Language proficiencies',
        isCompleted: Boolean(profileData.languages?.length > 0),
        priority: 'low',
        points: 5
      }
    ];

    return items;
  }

  static calculateQualityMetrics(profileData: any): QualityMetrics {
    const completionItems = this.calculateDetailedCompletion(profileData);
    const completedItems = completionItems.filter(item => item.isCompleted);
    const totalPoints = completionItems.reduce((sum, item) => sum + item.points, 0);
    const earnedPoints = completedItems.reduce((sum, item) => sum + item.points, 0);

    const completionScore = Math.round((earnedPoints / totalPoints) * 100);
    
    // Quality score considers depth of information
    const qualityFactors = [
      profileData.workExperiences?.some((exp: any) => exp.description?.length > 0) ? 10 : 0,
      profileData.skills?.length >= 5 ? 10 : 0,
      profileData.projects?.some((proj: any) => proj.description?.length > 0) ? 10 : 0,
      profileData.socialLinks?.linkedin?.trim() ? 5 : 0,
      profileData.socialLinks?.github?.trim() ? 5 : 0
    ];
    
    const qualityScore = Math.min(100, completionScore + qualityFactors.reduce((a, b) => a + b, 0));

    const strengthAreas: string[] = [];
    const improvementAreas: string[] = [];
    const recommendations: string[] = [];

    // Analyze strengths and improvements
    if (profileData.workExperiences?.length > 0) {
      strengthAreas.push('Work Experience');
    } else {
      improvementAreas.push('Work Experience');
      recommendations.push('Add your work experience to showcase your professional background');
    }

    if (profileData.skills?.length >= 3) {
      strengthAreas.push('Skills');
    } else {
      improvementAreas.push('Skills');
      recommendations.push('Add more skills to improve your profile visibility');
    }

    if (profileData.education?.length > 0) {
      strengthAreas.push('Education');
    } else {
      improvementAreas.push('Education');
      recommendations.push('Add your educational background');
    }

    return {
      completionScore,
      qualityScore,
      strengthAreas,
      improvementAreas,
      recommendations
    };
  }

  static getNextMilestone(currentScore: number): Milestone | null {
    const milestones: Milestone[] = [
      {
        title: 'Profile Foundation',
        description: 'Basic profile information completed',
        requiredScore: 50,
        benefits: ['Profile appears in basic searches', 'Can apply to jobs']
      },
      {
        title: 'Professional Profile',
        description: 'Complete professional information',
        requiredScore: 75,
        benefits: ['Higher search ranking', 'Recruiter visibility', 'Job recommendations']
      },
      {
        title: 'Expert Profile',
        description: 'Comprehensive profile with all details',
        requiredScore: 90,
        benefits: ['Top search results', 'Premium features', 'Advanced matching']
      }
    ];

    return milestones.find(milestone => currentScore < milestone.requiredScore) || null;
  }

  static async updateCompletionTracking(userId: string, profileData: any): Promise<void> {
    const metrics = this.calculateQualityMetrics(profileData);
    const completionItems = this.calculateDetailedCompletion(profileData);
    const missingFields = completionItems
      .filter(item => !item.isCompleted && item.priority === 'high')
      .map(item => item.field);

    console.log('Profile completion updated:', {
      userId,
      completionScore: metrics.completionScore,
      missingFields
    });

    // In a real implementation, this would update the database
    // await supabase.from('profile_completion_tracking').upsert({
    //   user_id: userId,
    //   completion_percentage: metrics.completionScore,
    //   missing_fields: missingFields
    // });
  }
}
