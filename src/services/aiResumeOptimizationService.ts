
import { supabase } from '@/integrations/supabase/client';

export interface ResumeOptimizationSuggestion {
  id: string;
  section: string;
  type: 'improvement' | 'addition' | 'removal' | 'rewrite';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  originalText?: string;
  suggestedText?: string;
  confidence: number;
}

export interface JobMatchAnalysis {
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: ResumeOptimizationSuggestion[];
  keywords: {
    matched: string[];
    missing: string[];
  };
}

export class AIResumeOptimizationService {
  static async analyzeResume(resumeContent: any): Promise<ResumeOptimizationSuggestion[]> {
    try {
      // Call edge function for AI analysis
      const { data, error } = await supabase.functions.invoke('ai-resume-optimization', {
        body: { resumeContent }
      });

      if (error) throw error;
      return data.suggestions || [];
    } catch (error) {
      console.error('Resume analysis failed:', error);
      return this.generateMockSuggestions(resumeContent);
    }
  }

  static async optimizeForJob(resumeContent: any, jobDescription: string): Promise<JobMatchAnalysis> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-job-matching', {
        body: { resumeContent, jobDescription }
      });

      if (error) throw error;
      return data.analysis;
    } catch (error) {
      console.error('Job matching analysis failed:', error);
      return this.generateMockJobMatch(resumeContent, jobDescription);
    }
  }

  static async generateCoverLetterSuggestions(jobDescription: string, resumeContent: any): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-cover-letter', {
        body: { jobDescription, resumeContent }
      });

      if (error) throw error;
      return data.suggestions || [];
    } catch (error) {
      console.error('Cover letter generation failed:', error);
      return this.generateMockCoverLetterSuggestions();
    }
  }

  private static generateMockSuggestions(resumeContent: any): ResumeOptimizationSuggestion[] {
    return [
      {
        id: '1',
        section: 'summary',
        type: 'improvement',
        title: 'Strengthen Professional Summary',
        description: 'Add specific metrics and achievements to make your summary more impactful',
        impact: 'high',
        confidence: 0.85,
        suggestedText: 'Results-driven software engineer with 5+ years of experience building scalable web applications, increasing system performance by 40% and reducing deployment time by 60%'
      },
      {
        id: '2',
        section: 'experience',
        type: 'addition',
        title: 'Add Quantified Achievements',
        description: 'Include specific numbers and metrics in your work experience',
        impact: 'high',
        confidence: 0.90
      },
      {
        id: '3',
        section: 'skills',
        type: 'improvement',
        title: 'Organize Skills by Category',
        description: 'Group your skills into technical, leadership, and soft skills categories',
        impact: 'medium',
        confidence: 0.75
      }
    ];
  }

  private static generateMockJobMatch(resumeContent: any, jobDescription: string): JobMatchAnalysis {
    return {
      matchScore: 78,
      strengths: [
        'Strong technical skills match',
        'Relevant work experience',
        'Education requirements met'
      ],
      weaknesses: [
        'Missing cloud platform experience',
        'No mention of specific frameworks',
        'Limited leadership experience'
      ],
      suggestions: this.generateMockSuggestions(resumeContent),
      keywords: {
        matched: ['JavaScript', 'React', 'Node.js', 'SQL'],
        missing: ['AWS', 'Docker', 'Kubernetes', 'GraphQL']
      }
    };
  }

  private static generateMockCoverLetterSuggestions(): string[] {
    return [
      'Highlight your specific experience with the technologies mentioned in the job posting',
      'Mention the company\'s recent achievements or news to show your interest',
      'Connect your past accomplishments to the role requirements',
      'Include a brief story that demonstrates your problem-solving skills'
    ];
  }
}
