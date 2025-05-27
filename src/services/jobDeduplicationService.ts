
import { Job } from '@/types/job';

interface JobSignature {
  titleNormalized: string;
  companyNormalized: string;
  locationNormalized: string;
  salaryRange: string;
}

class JobDeduplicationService {
  private seenJobs = new Map<string, Job>();
  private jobSignatures = new Map<string, string>();

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private generateSignature(job: Job): JobSignature {
    return {
      titleNormalized: this.normalizeText(job.title),
      companyNormalized: this.normalizeText(job.company),
      locationNormalized: this.normalizeText(job.location),
      salaryRange: `${job.salary.min}-${job.salary.max}`
    };
  }

  private createJobHash(signature: JobSignature): string {
    return `${signature.titleNormalized}|${signature.companyNormalized}|${signature.locationNormalized}`;
  }

  private isSimilarJob(job1: JobSignature, job2: JobSignature): boolean {
    // Check for exact title and company match
    if (job1.titleNormalized === job2.titleNormalized && 
        job1.companyNormalized === job2.companyNormalized) {
      return true;
    }

    // Check for very similar titles at same company
    const titleSimilarity = this.calculateStringSimilarity(job1.titleNormalized, job2.titleNormalized);
    if (titleSimilarity > 0.85 && job1.companyNormalized === job2.companyNormalized) {
      return true;
    }

    return false;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  deduplicateJobs(jobs: Job[]): Job[] {
    const uniqueJobs: Job[] = [];
    const processedHashes = new Set<string>();

    for (const job of jobs) {
      const signature = this.generateSignature(job);
      const hash = this.createJobHash(signature);

      // Check if we've seen this exact hash
      if (processedHashes.has(hash)) {
        continue;
      }

      // Check for similar jobs
      let isDuplicate = false;
      for (const [existingHash, existingJob] of this.seenJobs) {
        const existingSignature = this.generateSignature(existingJob);
        if (this.isSimilarJob(signature, existingSignature)) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        uniqueJobs.push(job);
        this.seenJobs.set(hash, job);
        processedHashes.add(hash);
      }
    }

    console.log(`Deduplicated ${jobs.length} jobs to ${uniqueJobs.length} unique jobs`);
    return uniqueJobs;
  }

  clearCache(): void {
    this.seenJobs.clear();
    this.jobSignatures.clear();
  }

  getCacheStats(): { totalJobs: number; uniqueHashes: number } {
    return {
      totalJobs: this.seenJobs.size,
      uniqueHashes: this.jobSignatures.size
    };
  }
}

export const jobDeduplicationService = new JobDeduplicationService();
