
/**
 * Automated job application service
 * Inspired by LinkedIn auto-apply bots
 */

import { Job } from "@/types/job";
import { UserProfile } from "@/utils/profileUtils";

export interface AutoApplyConfig {
  // Basic settings
  autoFillProfile: boolean;
  autoUploadResume: boolean;
  autoUploadCoverLetter: boolean;
  
  // Application questions settings
  skipCustomQuestions: boolean;
  useAIForCustomQuestions: boolean;
  
  // Follow-up settings
  trackApplicationStatus: boolean;
  sendFollowupMessage: boolean;
  followUpDays: number;
  
  // Filtering settings
  onlyApplyToMatchedJobs: boolean;
  minimumMatchPercentage: number;
  
  // Safety settings
  applyCooldownMinutes: number; // Wait time between applications
  maxApplicationsPerDay: number;
  maxApplicationsPerCompany: number;
  avoidDuplicateApplications: boolean;
  
  // Proxy and browser settings
  useProxy: boolean;
  useHeadlessBrowser: boolean;
}

export interface AutoApplierStats {
  successfulApplications: number;
  failedApplications: number;
  skippedApplications: number;
  totalProcessed: number;
  startTime?: Date;
  endTime?: Date;
  successRate?: number;
}

export interface ApplicationResult {
  success: boolean;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: string;
  error?: string;
  confirmationText?: string;
  resumeUsed?: string;
  coverLetterUsed?: string;
}

export interface AutoApplierProgress {
  currentJobIndex: number;
  totalJobs: number;
  status: 'idle' | 'running' | 'paused' | 'complete' | 'error';
  currentJob?: Job;
  processedJobs: string[];
  results: ApplicationResult[];
  stats: AutoApplierStats;
}

export class JobAutoApplier {
  private config: AutoApplyConfig;
  private profile: UserProfile;
  private jobs: Job[];
  private progress: AutoApplierProgress;
  private resumePath: string;
  private coverLetterPath?: string;
  
  constructor(
    jobs: Job[], 
    profile: UserProfile, 
    config?: Partial<AutoApplyConfig>,
    resumePath: string = '',
    coverLetterPath?: string
  ) {
    this.jobs = jobs;
    this.profile = profile;
    this.resumePath = resumePath;
    this.coverLetterPath = coverLetterPath;
    
    // Default configuration with safe values
    this.config = {
      autoFillProfile: true,
      autoUploadResume: true,
      autoUploadCoverLetter: false,
      skipCustomQuestions: false,
      useAIForCustomQuestions: false,
      trackApplicationStatus: true,
      sendFollowupMessage: false,
      followUpDays: 7,
      onlyApplyToMatchedJobs: true,
      minimumMatchPercentage: 70,
      applyCooldownMinutes: 5,
      maxApplicationsPerDay: 25,
      maxApplicationsPerCompany: 3,
      avoidDuplicateApplications: true,
      useProxy: false,
      useHeadlessBrowser: true,
      ...config
    };
    
    this.progress = {
      currentJobIndex: 0,
      totalJobs: jobs.length,
      status: 'idle',
      processedJobs: [],
      results: [],
      stats: {
        successfulApplications: 0,
        failedApplications: 0,
        skippedApplications: 0,
        totalProcessed: 0
      }
    };
  }
  
  /**
   * Start the auto application process
   */
  async start(): Promise<AutoApplierProgress> {
    if (this.progress.status === 'running') {
      throw new Error('Auto-applier is already running');
    }
    
    // Set start time
    this.progress.stats.startTime = new Date();
    this.progress.status = 'running';
    
    try {
      // Process each job
      for (let i = this.progress.currentJobIndex; i < this.jobs.length; i++) {
        // Check if process was paused or stopped
        if (this.progress.status !== 'running') {
          break;
        }
        
        // Update current job index
        this.progress.currentJobIndex = i;
        this.progress.currentJob = this.jobs[i];
        
        // Check if we should apply to this job
        if (this.shouldApplyToJob(this.jobs[i])) {
          try {
            // Apply to job
            const result = await this.applyToJob(this.jobs[i]);
            this.progress.results.push(result);
            
            // Update stats
            if (result.success) {
              this.progress.stats.successfulApplications++;
            } else {
              this.progress.stats.failedApplications++;
            }
            
            // Add to processed jobs
            this.progress.processedJobs.push(this.jobs[i].id);
            
            // Wait for cooldown (if not the last job)
            if (i < this.jobs.length - 1) {
              await this.cooldown();
            }
          } catch (error) {
            // Log error and continue with next job
            console.error(`Error applying to job ${this.jobs[i].id}:`, error);
            this.progress.results.push({
              success: false,
              jobId: this.jobs[i].id,
              jobTitle: this.jobs[i].title,
              company: this.jobs[i].company,
              appliedAt: new Date().toISOString(),
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            this.progress.stats.failedApplications++;
            this.progress.processedJobs.push(this.jobs[i].id);
            
            // Wait for cooldown (if not the last job)
            if (i < this.jobs.length - 1) {
              await this.cooldown();
            }
          }
        } else {
          // Skip this job
          this.progress.stats.skippedApplications++;
          this.progress.processedJobs.push(this.jobs[i].id);
        }
        
        // Update total processed
        this.progress.stats.totalProcessed++;
      }
      
      // Update status and end time
      this.progress.status = 'complete';
      this.progress.stats.endTime = new Date();
      
      // Calculate success rate
      this.progress.stats.successRate = 
        this.progress.stats.totalProcessed > 0
          ? this.progress.stats.successfulApplications / this.progress.stats.totalProcessed
          : 0;
          
      return this.progress;
    } catch (error) {
      // Set error status
      this.progress.status = 'error';
      console.error('Error in auto application process:', error);
      throw error;
    }
  }
  
  /**
   * Pause the auto application process
   */
  pause(): void {
    if (this.progress.status === 'running') {
      this.progress.status = 'paused';
    }
  }
  
  /**
   * Resume a paused auto application process
   */
  async resume(): Promise<AutoApplierProgress> {
    if (this.progress.status !== 'paused') {
      throw new Error('Auto-applier is not paused');
    }
    
    this.progress.status = 'running';
    return this.start();
  }
  
  /**
   * Stop the auto application process
   */
  stop(): void {
    this.progress.status = 'idle';
    this.progress.stats.endTime = new Date();
  }
  
  /**
   * Get current progress
   */
  getProgress(): AutoApplierProgress {
    return this.progress;
  }
  
  /**
   * Apply to a specific job
   * In a real implementation, this would use Puppeteer or a similar tool
   */
  private async applyToJob(job: Job): Promise<ApplicationResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, simulate success with 80% probability
    const isSuccess = Math.random() > 0.2;
    
    if (isSuccess) {
      return {
        success: true,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        appliedAt: new Date().toISOString(),
        confirmationText: "Your application has been submitted successfully.",
        resumeUsed: this.resumePath,
        coverLetterUsed: this.coverLetterPath
      };
    } else {
      // Random failure reasons for simulation
      const failureReasons = [
        "Could not upload resume",
        "Custom questions required manual input",
        "Application form could not be submitted",
        "Company website requires manual login",
        "Job listing has expired"
      ];
      
      return {
        success: false,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        appliedAt: new Date().toISOString(),
        error: failureReasons[Math.floor(Math.random() * failureReasons.length)]
      };
    }
  }
  
  /**
   * Check if we should apply to a job based on config
   */
  private shouldApplyToJob(job: Job): boolean {
    // Check if already processed
    if (this.progress.processedJobs.includes(job.id)) {
      return false;
    }
    
    // Check match percentage
    if (this.config.onlyApplyToMatchedJobs && 
        (job.matchPercentage === undefined || job.matchPercentage < this.config.minimumMatchPercentage)) {
      return false;
    }
    
    // Check company application limit
    const applicationsToCompany = this.progress.results.filter(r => 
      r.company.toLowerCase() === job.company.toLowerCase()
    ).length;
    
    if (applicationsToCompany >= this.config.maxApplicationsPerCompany) {
      return false;
    }
    
    // Check daily application limit
    const today = new Date().toISOString().split('T')[0];
    const todayApplications = this.progress.results.filter(r => 
      r.appliedAt.startsWith(today)
    ).length;
    
    if (todayApplications >= this.config.maxApplicationsPerDay) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Wait for cooldown between applications
   */
  private async cooldown(): Promise<void> {
    const cooldownMs = this.config.applyCooldownMinutes * 60 * 1000;
    
    // For demo purposes, use a shorter delay
    const demoDelay = Math.min(cooldownMs, 1000);
    
    await new Promise(resolve => setTimeout(resolve, demoDelay));
  }
}

/**
 * Hook for using the job auto applier
 */
export function useAutoApplier(
  jobs: Job[], 
  profile: UserProfile, 
  config?: Partial<AutoApplyConfig>,
  resumePath: string = '',
  coverLetterPath?: string
) {
  let autoApplier: JobAutoApplier | null = null;
  
  const createApplier = () => {
    autoApplier = new JobAutoApplier(jobs, profile, config, resumePath, coverLetterPath);
    return autoApplier;
  };
  
  const startApplying = async () => {
    if (!autoApplier) {
      autoApplier = createApplier();
    }
    
    return await autoApplier.start();
  };
  
  const pauseApplying = () => {
    autoApplier?.pause();
  };
  
  const resumeApplying = async () => {
    if (!autoApplier) {
      throw new Error('Auto-applier not initialized');
    }
    
    return await autoApplier.resume();
  };
  
  const stopApplying = () => {
    autoApplier?.stop();
  };
  
  const getProgress = () => {
    if (!autoApplier) {
      return null;
    }
    
    return autoApplier.getProgress();
  };
  
  return {
    createApplier,
    startApplying,
    pauseApplying,
    resumeApplying,
    stopApplying,
    getProgress
  };
}
