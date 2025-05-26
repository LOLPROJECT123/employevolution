
import { useAuth } from '@/contexts/AuthContext';
import { supabaseApplicationService } from '@/services/supabaseApplicationService';
import { supabaseSavedJobsService } from '@/services/supabaseSavedJobsService';
import { supabaseNotificationService } from '@/services/supabaseNotificationService';
import { Job } from '@/types/job';
import { toast } from '@/hooks/use-toast';

export const useSupabaseAuth = () => {
  const { user, userProfile, ...authContext } = useAuth();

  const saveJob = async (job: Job) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save jobs.",
        variant: "destructive",
      });
      return false;
    }

    try {
      await supabaseSavedJobsService.saveJob(user.id, job);
      toast({
        title: "Job saved",
        description: `${job.title} at ${job.company} has been saved.`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Failed to save job",
        description: "Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  };

  const unsaveJob = async (jobId: string) => {
    if (!user) return false;

    try {
      await supabaseSavedJobsService.unsaveJob(user.id, jobId);
      toast({
        title: "Job removed",
        description: "Job has been removed from your saved jobs.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Failed to remove job",
        description: "Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  };

  const applyToJob = async (job: Job, resumeVersion?: string, coverLetter?: string, notes?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply to jobs.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Check if already applied
      const existingApplication = await supabaseApplicationService.getApplicationByJobId(user.id, job.id);
      if (existingApplication) {
        toast({
          title: "Already applied",
          description: "You have already applied to this job.",
          variant: "destructive",
        });
        return false;
      }

      await supabaseApplicationService.submitApplication(job, user.id, resumeVersion, coverLetter, notes);
      
      // Create notification
      await supabaseNotificationService.createNotification(
        user.id,
        "Application submitted",
        `Your application to ${job.title} at ${job.company} has been submitted successfully.`,
        "success"
      );

      toast({
        title: "Application submitted",
        description: `Applied to ${job.title} at ${job.company}`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Application failed",
        description: "Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    user,
    userProfile,
    saveJob,
    unsaveJob,
    applyToJob,
    ...authContext
  };
};
