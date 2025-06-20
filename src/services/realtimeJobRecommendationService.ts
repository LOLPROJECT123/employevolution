
import { supabase } from '@/integrations/supabase/client';
import { enhancedJobMatchingV2Service } from './enhancedJobMatchingV2Service';
import { mlJobRecommendationService } from './mlJobRecommendationService';
import { resumeFileService } from './resumeFileService';

export interface RealtimeJobNotification {
  jobId: string;
  userId: string;
  matchScore: number;
  notificationType: 'high_match' | 'skill_match' | 'company_match';
  jobData: any;
  createdAt: Date;
}

export class RealtimeJobRecommendationService {
  private static instance: RealtimeJobRecommendationService;
  private jobProcessingQueue: string[] = [];
  private isProcessing = false;

  static getInstance(): RealtimeJobRecommendationService {
    if (!RealtimeJobRecommendationService.instance) {
      RealtimeJobRecommendationService.instance = new RealtimeJobRecommendationService();
    }
    return RealtimeJobRecommendationService.instance;
  }

  async startRealtimeJobProcessing() {
    console.log('🚀 Starting realtime job processing service');

    // Subscribe to new jobs being added
    const channel = supabase
      .channel('job-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scraped_jobs'
        },
        (payload) => {
          console.log('📧 New job detected:', payload.new);
          this.queueJobForProcessing(payload.new.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scraped_jobs'
        },
        (payload) => {
          // Only process if job became active
          if (payload.new.is_active && !payload.old.is_active) {
            console.log('📧 Job became active:', payload.new);
            this.queueJobForProcessing(payload.new.id);
          }
        }
      )
      .subscribe();

    // Start background processing
    this.processJobQueue();

    return channel;
  }

  private queueJobForProcessing(jobId: string) {
    if (!this.jobProcessingQueue.includes(jobId)) {
      this.jobProcessingQueue.push(jobId);
      console.log(`📝 Queued job ${jobId} for processing. Queue length: ${this.jobProcessingQueue.length}`);
    }
  }

  private async processJobQueue() {
    if (this.isProcessing || this.jobProcessingQueue.length === 0) {
      setTimeout(() => this.processJobQueue(), 5000); // Check every 5 seconds
      return;
    }

    this.isProcessing = true;
    console.log('🔄 Processing job queue...');

    try {
      const batchSize = 5; // Process 5 jobs at a time
      const jobsToProcess = this.jobProcessingQueue.splice(0, batchSize);

      await Promise.all(
        jobsToProcess.map(jobId => this.processNewJobForAllUsers(jobId))
      );

      console.log(`✅ Processed ${jobsToProcess.length} jobs`);

    } catch (error) {
      console.error('❌ Error processing job queue:', error);
    } finally {
      this.isProcessing = false;
      // Continue processing
      setTimeout(() => this.processJobQueue(), 2000);
    }
  }

  private async processNewJobForAllUsers(jobId: string) {
    try {
      // Get the job details
      const { data: job } = await supabase
        .from('scraped_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (!job) {
        console.log(`❌ Job ${jobId} not found`);
        return;
      }

      // Get all active users with resumes
      const { data: usersWithResumes } = await supabase
        .from('user_resume_files')
        .select('user_id, parsed_data')
        .eq('is_current', true)
        .not('parsed_data', 'is', null);

      if (!usersWithResumes || usersWithResumes.length === 0) {
        console.log('No users with resumes found');
        return;
      }

      console.log(`🎯 Processing job ${job.title} for ${usersWithResumes.length} users`);

      // Process users in batches to avoid overwhelming the system
      const batchSize = 10;
      for (let i = 0; i < usersWithResumes.length; i += batchSize) {
        const batch = users

        WithResumes.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(userResume => 
            this.checkJobMatchForUser(job, userResume.user_id, userResume.parsed_data)
          )
        );

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

    } catch (error) {
      console.error(`Error processing job ${jobId}:`, error);
    }
  }

  private async checkJobMatchForUser(job: any, userId: string, resumeData: any) {
    try {
      // Calculate match score using our enhanced matching service
      const matchResults = await enhancedJobMatchingV2Service.getPersonalizedJobRecommendations(
        userId,
        resumeData,
        1 // Only get top match to check if this job is good
      );

      // Also check with ML service for additional insights
      const mlEnhanced = await mlJobRecommendationService.generateMLEnhancedRecommendations(
        userId,
        [{ job, overallScore: 0, matchingSkills: [], missingSkills: [] }],
        1
      );

      const match = matchResults[0];
      const mlMatch = mlEnhanced[0];

      if (!match) return;

      const finalScore = (mlMatch as any)?.mlEnhancedScore || match.overallScore;

      // Determine if we should notify the user
      let shouldNotify = false;
      let notificationType: 'high_match' | 'skill_match' | 'company_match' = 'high_match';

      if (finalScore >= 85) {
        shouldNotify = true;
        notificationType = 'high_match';
      } else if (finalScore >= 70 && match.matchingSkills.length >= 5) {
        shouldNotify = true;
        notificationType = 'skill_match';
      } else if (finalScore >= 60) {
        // Check if it's from a preferred company
        const userPreferences = await this.getUserPreferences(userId);
        if (userPreferences?.preferred_companies?.includes(job.company)) {
          shouldNotify = true;
          notificationType = 'company_match';
        }
      }

      if (shouldNotify) {
        await this.createJobRecommendationNotification({
          jobId: job.id,
          userId,
          matchScore: finalScore,
          notificationType,
          jobData: job,
          createdAt: new Date()
        });

        console.log(`🔔 Created notification for user ${userId} - Job: ${job.title} (${finalScore}% match)`);
      }

    } catch (error) {
      console.error(`Error checking job match for user ${userId}:`, error);
    }
  }

  private async createJobRecommendationNotification(notification: RealtimeJobNotification) {
    try {
      // Save the recommendation to the database
      await supabase
        .from('job_recommendations')
        .insert({
          user_id: notification.userId,
          job_data: notification.jobData,
          match_percentage: notification.matchScore,
          recommendation_reason: `${notification.matchScore}% match - ${notification.notificationType}`,
          created_at: notification.createdAt.toISOString()
        });

      // Check user's notification preferences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', notification.userId)
        .single();

      if (!preferences || !preferences.job_match_alerts) {
        return; // User doesn't want job match notifications
      }

      // Create a user notification
      const notificationTitle = this.getNotificationTitle(notification);
      const notificationMessage = this.getNotificationMessage(notification);

      await supabase
        .from('user_notifications')
        .insert({
          user_id: notification.userId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'job_match',
          data: {
            job_id: notification.jobId,
            match_score: notification.matchScore,
            job_title: notification.jobData.title,
            company: notification.jobData.company
          }
        });

      // If user has push notifications enabled, send push notification
      if (preferences.push_notifications) {
        await this.sendPushNotification(notification, notificationTitle, notificationMessage);
      }

    } catch (error) {
      console.error('Error creating job recommendation notification:', error);
    }
  }

  private getNotificationTitle(notification: RealtimeJobNotification): string {
    switch (notification.notificationType) {
      case 'high_match':
        return '🎯 Perfect Job Match Found!';
      case 'skill_match':
        return '⭐ Great Skill Match!';
      case 'company_match':
        return '🏢 Job at Preferred Company!';
      default:
        return '💼 New Job Recommendation';
    }
  }

  private getNotificationMessage(notification: RealtimeJobNotification): string {
    const { jobData, matchScore } = notification;
    
    switch (notification.notificationType) {
      case 'high_match':
        return `${jobData.title} at ${jobData.company} is a ${matchScore}% match for your profile. Apply now!`;
      case 'skill_match':
        return `${jobData.title} at ${jobData.company} matches many of your skills (${matchScore}% match).`;
      case 'company_match':
        return `New opening at ${jobData.company}: ${jobData.title} (${matchScore}% match).`;
      default:
        return `${jobData.title} at ${jobData.company} might interest you (${matchScore}% match).`;
    }
  }

  private async sendPushNotification(
    notification: RealtimeJobNotification,
    title: string,
    message: string
  ) {
    try {
      // Get user's push subscriptions
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', notification.userId)
        .eq('is_active', true);

      if (!subscriptions || subscriptions.length === 0) {
        return;
      }

      // Send push notification to all user's devices
      // This would integrate with a push notification service like Firebase or Web Push
      console.log(`📱 Would send push notification to user ${notification.userId}: ${title}`);
      
      // In a real implementation, you'd call your push notification service here
      // await this.pushNotificationService.send(subscriptions, { title, message, data: notification.jobData });

    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  private async getUserPreferences(userId: string) {
    const { data } = await supabase
      .from('user_job_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data;
  }

  async getRealtimeRecommendationsForUser(userId: string, limit: number = 10) {
    const { data } = await supabase
      .from('job_recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_viewed', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }

  async markRecommendationAsViewed(recommendationId: string) {
    await supabase
      .from('job_recommendations')
      .update({ is_viewed: true })
      .eq('id', recommendationId);
  }

  async subscribeToUserJobAlerts(userId: string, callback: (notification: any) => void) {
    const channel = supabase
      .channel(`user-job-alerts-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'job_recommendations',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔔 New job recommendation for user:', payload.new);
          callback(payload.new);
        }
      )
      .subscribe();

    return channel;
  }
}

export const realtimeJobRecommendationService = RealtimeJobRecommendationService.getInstance();
