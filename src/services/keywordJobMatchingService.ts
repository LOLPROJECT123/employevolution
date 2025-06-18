
import { supabase } from '@/integrations/supabase/client';
import { ParsedResume } from '@/types/resume';

export interface KeywordMatchResult {
  jobId: string;
  title: string;
  company: string;
  matchScore: number;
  matchingKeywords: string[];
  matchingSkills: string[];
  totalKeywords: number;
  jobUrl: string;
  description: string;
  location?: string;
  remote: boolean;
  salary_min?: number;
  salary_max?: number;
}

export interface JobMatchFilters {
  remote?: boolean;
  location?: string;
  salaryMin?: number;
  jobTypes?: string[];
  limit?: number;
}

export class KeywordJobMatchingService {
  async findMatchingJobs(
    resumeData: ParsedResume, 
    filters: JobMatchFilters = {}
  ): Promise<KeywordMatchResult[]> {
    try {
      // Get user skills and experience keywords
      const userKeywords = this.extractKeywordsFromResume(resumeData);
      
      // Fetch active jobs from database
      const jobs = await this.fetchActiveJobs(filters);
      
      // Calculate match scores for each job
      const matchResults = jobs.map(job => this.calculateJobMatch(job, userKeywords));
      
      // Sort by match score (highest first) and return top matches
      return matchResults
        .filter(match => match.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, filters.limit || 20);
        
    } catch (error) {
      console.error('Error finding matching jobs:', error);
      return [];
    }
  }

  private extractKeywordsFromResume(resumeData: ParsedResume): string[] {
    const keywords: string[] = [];
    
    // Add skills
    if (resumeData.skills) {
      keywords.push(...resumeData.skills.map(skill => skill.toLowerCase()));
    }
    
    // Add job titles from work experience
    if (resumeData.workExperiences) {
      resumeData.workExperiences.forEach(exp => {
        keywords.push(exp.role.toLowerCase());
        if (exp.description) {
          const descText = Array.isArray(exp.description) 
            ? exp.description.join(' ') 
            : exp.description;
          keywords.push(...this.extractTechnicalTerms(descText));
        }
      });
    }
    
    // Add education fields
    if (resumeData.education) {
      resumeData.education.forEach(edu => {
        if (edu.degree) keywords.push(edu.degree.toLowerCase());
        if (edu.fieldOfStudy) keywords.push(edu.fieldOfStudy.toLowerCase());
      });
    }
    
    // Add project technologies
    if (resumeData.projects) {
      resumeData.projects.forEach(project => {
        if (project.technologies) {
          keywords.push(...project.technologies.map(tech => tech.toLowerCase()));
        }
      });
    }
    
    // Remove duplicates and filter out common words
    return [...new Set(keywords)].filter(keyword => 
      keyword.length > 2 && !this.isCommonWord(keyword)
    );
  }

  private extractTechnicalTerms(text: string): string[] {
    const technicalTerms = [
      'javascript', 'typescript', 'react', 'angular', 'vue', 'node.js', 'python', 'java',
      'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'sql', 'mongodb', 'postgresql',
      'mysql', 'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
      'agile', 'scrum', 'devops', 'ci/cd', 'rest', 'graphql', 'microservices', 'api',
      'machine learning', 'artificial intelligence', 'data science', 'analytics'
    ];
    
    return technicalTerms.filter(term => 
      text.toLowerCase().includes(term)
    );
  }

  private isCommonWord(word: string): boolean {
    const commonWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'work', 'job', 'role', 'position', 'company', 'team', 'project', 'experience'
    ];
    return commonWords.includes(word);
  }

  private async fetchActiveJobs(filters: JobMatchFilters) {
    let query = supabase
      .from('scraped_jobs')
      .select('*')
      .eq('is_active', true);

    if (filters.remote) {
      query = query.eq('remote', true);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.salaryMin) {
      query = query.gte('salary_min', filters.salaryMin);
    }

    if (filters.jobTypes && filters.jobTypes.length > 0) {
      query = query.in('job_type', filters.jobTypes);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }

    return data || [];
  }

  private calculateJobMatch(job: any, userKeywords: string[]): KeywordMatchResult {
    const jobText = `${job.title} ${job.description} ${(job.requirements || []).join(' ')}`.toLowerCase();
    const jobSkills = (job.skills || []).map((skill: string) => skill.toLowerCase());
    
    // Find matching keywords in job description
    const matchingKeywords = userKeywords.filter(keyword => 
      jobText.includes(keyword)
    );
    
    // Find matching skills
    const matchingSkills = userKeywords.filter(keyword => 
      jobSkills.some(skill => skill.includes(keyword) || keyword.includes(skill))
    );
    
    // Calculate match score
    const keywordScore = (matchingKeywords.length / Math.max(userKeywords.length, 1)) * 60;
    const skillScore = (matchingSkills.length / Math.max(jobSkills.length, 1)) * 40;
    const matchScore = Math.round(keywordScore + skillScore);
    
    return {
      jobId: job.id,
      title: job.title,
      company: job.company,
      matchScore,
      matchingKeywords: [...new Set(matchingKeywords)],
      matchingSkills: [...new Set(matchingSkills)],
      totalKeywords: userKeywords.length,
      jobUrl: job.apply_url || '#',
      description: job.description || '',
      location: job.location,
      remote: job.remote,
      salary_min: job.salary_min,
      salary_max: job.salary_max
    };
  }
}

export const keywordJobMatchingService = new KeywordJobMatchingService();
