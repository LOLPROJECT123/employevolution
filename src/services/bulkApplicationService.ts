
import { Job } from '@/types/job';
import { User } from '@/types/auth';
import { resumeService } from './resumeService';
import { enhancedApplicationService } from './enhancedApplicationService';

interface BulkApplicationConfig {
  selectedJobs: Job[];
  resumeVersion?: string;
  coverLetterTemplate?: string;
  customMessage?: string;
  delayBetweenApplications: number; // in milliseconds
  autoFormFillEnabled: boolean;
  skipJobsWithApplications: boolean;
}

interface ApplicationResult {
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  appliedAt?: string;
  error?: string;
}

interface BulkApplicationProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  skipped: number;
  currentJob?: string;
  isRunning: boolean;
}

class BulkApplicationService {
  private isRunning = false;
  private currentProgress: BulkApplicationProgress = {
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    isRunning: false
  };

  private progressCallbacks: ((progress: BulkApplicationProgress) => void)[] = [];

  onProgressUpdate(callback: (progress: BulkApplicationProgress) => void) {
    this.progressCallbacks.push(callback);
    return () => {
      this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyProgress() {
    this.progressCallbacks.forEach(callback => callback({ ...this.currentProgress }));
  }

  async submitBulkApplications(
    config: BulkApplicationConfig,
    user: User
  ): Promise<ApplicationResult[]> {
    if (this.isRunning) {
      throw new Error('Bulk application is already running');
    }

    this.isRunning = true;
    this.currentProgress = {
      total: config.selectedJobs.length,
      completed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      isRunning: true
    };

    const results: ApplicationResult[] = [];

    try {
      // Get user's resume and cover letter
      const resumeVersion = config.resumeVersion 
        ? resumeService.getResumeVersions(user.id).find(r => r.id === config.resumeVersion)
        : resumeService.getDefaultResume(user.id);

      const coverLetterTemplate = config.coverLetterTemplate
        ? resumeService.getCoverLetterTemplates(user.id).find(c => c.id === config.coverLetterTemplate)
        : resumeService.getDefaultCoverLetter(user.id);

      for (let i = 0; i < config.selectedJobs.length; i++) {
        const job = config.selectedJobs[i];
        this.currentProgress.currentJob = `${job.title} at ${job.company}`;
        this.notifyProgress();

        try {
          // Check if already applied
          const existingApplication = enhancedApplicationService.getApplicationByJobId(user.id, job.id);
          
          if (existingApplication && config.skipJobsWithApplications) {
            results.push({
              jobId: job.id,
              jobTitle: job.title,
              company: job.company,
              status: 'skipped',
              message: 'Already applied to this job'
            });
            this.currentProgress.skipped++;
          } else {
            // Simulate auto-form filling and application submission
            const applicationResult = await this.submitSingleApplication(
              job,
              user,
              resumeVersion,
              coverLetterTemplate,
              config
            );

            results.push(applicationResult);

            if (applicationResult.status === 'success') {
              this.currentProgress.successful++;
            } else {
              this.currentProgress.failed++;
            }
          }
        } catch (error) {
          console.error(`Failed to apply to ${job.title}:`, error);
          results.push({
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            status: 'failed',
            message: 'Application submission failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          this.currentProgress.failed++;
        }

        this.currentProgress.completed++;
        this.notifyProgress();

        // Add delay between applications to avoid rate limiting
        if (i < config.selectedJobs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, config.delayBetweenApplications));
        }
      }
    } finally {
      this.isRunning = false;
      this.currentProgress.isRunning = false;
      this.currentProgress.currentJob = undefined;
      this.notifyProgress();
    }

    return results;
  }

  private async submitSingleApplication(
    job: Job,
    user: User,
    resumeVersion: any,
    coverLetterTemplate: any,
    config: BulkApplicationConfig
  ): Promise<ApplicationResult> {
    try {
      // Simulate auto-form filling process
      await this.autoFillJobApplication(job, user, config);

      // Generate customized cover letter if template exists
      let coverLetterContent = '';
      if (coverLetterTemplate) {
        coverLetterContent = resumeService.generateCustomizedCoverLetter(
          coverLetterTemplate,
          job,
          user
        );
        
        if (config.customMessage) {
          coverLetterContent += '\n\n' + config.customMessage;
        }
      }

      // Submit the application through enhanced application service
      const application = await enhancedApplicationService.submitApplication(
        job,
        user.id,
        resumeVersion?.name,
        coverLetterContent,
        `Bulk application submitted via automated system. Resume: ${resumeVersion?.name || 'Default'}`
      );

      // Update resume usage count
      if (resumeVersion) {
        await resumeService.updateResumeUsage(user.id, resumeVersion.id);
      }

      return {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        status: 'success',
        message: 'Application submitted successfully',
        appliedAt: application.applied_at
      };
    } catch (error) {
      throw error;
    }
  }

  private async autoFillJobApplication(
    job: Job,
    user: User,
    config: BulkApplicationConfig
  ): Promise<void> {
    if (!config.autoFormFillEnabled) {
      return;
    }

    // Simulate auto-form filling with realistic delays
    console.log(`Auto-filling application form for ${job.title} at ${job.company}`);
    
    // Simulate filling basic information
    await this.simulateFormStep('Filling personal information...', 500);
    
    // Simulate uploading resume
    await this.simulateFormStep('Uploading resume...', 800);
    
    // Simulate filling job-specific questions
    if (job.description.toLowerCase().includes('experience')) {
      await this.simulateFormStep('Answering experience questions...', 600);
    }
    
    // Simulate filling salary expectations
    if (job.salary) {
      await this.simulateFormStep('Setting salary expectations...', 300);
    }
    
    // Simulate reviewing and submitting
    await this.simulateFormStep('Reviewing application...', 400);
  }

  private async simulateFormStep(step: string, delay: number): Promise<void> {
    console.log(step);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Validate jobs before bulk application
  validateJobsForBulkApplication(jobs: Job[]): { validJobs: Job[]; invalidJobs: { job: Job; reason: string }[] } {
    const validJobs: Job[] = [];
    const invalidJobs: { job: Job; reason: string }[] = [];

    for (const job of jobs) {
      if (!job.applyUrl) {
        invalidJobs.push({ job, reason: 'No application URL available' });
        continue;
      }

      if (!job.title || !job.company) {
        invalidJobs.push({ job, reason: 'Missing essential job information' });
        continue;
      }

      // Check if job is too old (more than 30 days)
      const postedDate = new Date(job.postedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (postedDate < thirtyDaysAgo) {
        invalidJobs.push({ job, reason: 'Job posting is too old' });
        continue;
      }

      validJobs.push(job);
    }

    return { validJobs, invalidJobs };
  }

  // Get application statistics
  getBulkApplicationStats(results: ApplicationResult[]) {
    const total = results.length;
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    
    const successRate = total > 0 ? (successful / total) * 100 : 0;
    
    return {
      total,
      successful,
      failed,
      skipped,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  // Stop current bulk application process
  stopBulkApplication() {
    this.isRunning = false;
    this.currentProgress.isRunning = false;
    this.notifyProgress();
  }

  // Get current progress
  getCurrentProgress(): BulkApplicationProgress {
    return { ...this.currentProgress };
  }

  isApplicationRunning(): boolean {
    return this.isRunning;
  }
}

export const bulkApplicationService = new BulkApplicationService();
