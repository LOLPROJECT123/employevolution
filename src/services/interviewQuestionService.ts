
import { supabase } from '@/integrations/supabase/client';
import { castJsonToStringArray } from '@/types/database';

export interface InterviewQuestion {
  id: string;
  job_title: string;
  company_type?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  question_category: string;
  question: string;
  sample_answer?: string;
  tags: string[];
  usage_count: number;
  created_at: string;
}

export interface QuestionGenerationRequest {
  jobTitle: string;
  companyType?: string;
  experienceLevel: string;
  skills: string[];
  industry?: string;
}

export class InterviewQuestionService {
  static async generateQuestions(request: QuestionGenerationRequest): Promise<InterviewQuestion[]> {
    // Mock AI-generated questions based on job requirements
    const questionTemplates = this.getQuestionTemplates(request);
    
    const questions: InterviewQuestion[] = [];
    
    for (const template of questionTemplates) {
      const question: InterviewQuestion = {
        id: crypto.randomUUID(),
        job_title: request.jobTitle,
        company_type: request.companyType,
        difficulty_level: this.getDifficultyForExperience(request.experienceLevel),
        question_category: template.category,
        question: template.question,
        sample_answer: template.sampleAnswer,
        tags: template.tags,
        usage_count: 0,
        created_at: new Date().toISOString()
      };
      
      questions.push(question);
    }
    
    // Save to database
    await this.saveQuestions(questions);
    
    return questions;
  }

  private static getQuestionTemplates(request: QuestionGenerationRequest) {
    const templates = [
      {
        category: 'Technical',
        question: `Describe your experience with ${request.skills[0] || 'relevant technologies'} and how you've applied it in previous projects.`,
        sampleAnswer: `I have extensive experience with ${request.skills[0] || 'the technology'}, having used it in multiple projects over the past few years...`,
        tags: ['technical', request.skills[0] || 'general'].filter(Boolean)
      },
      {
        category: 'Behavioral',
        question: 'Tell me about a challenging project you worked on and how you overcame obstacles.',
        sampleAnswer: 'In my previous role, I encountered a challenging project where we had tight deadlines and technical constraints...',
        tags: ['behavioral', 'problem-solving', 'teamwork']
      },
      {
        category: 'Industry-Specific',
        question: `What trends do you see in the ${request.industry || 'technology'} industry and how do they impact your work?`,
        sampleAnswer: `I believe the ${request.industry || 'technology'} industry is moving towards greater automation and AI integration...`,
        tags: ['industry-knowledge', request.industry || 'general'].filter(Boolean)
      },
      {
        category: 'Company Culture',
        question: 'How do you handle working in a fast-paced environment with changing priorities?',
        sampleAnswer: 'I thrive in dynamic environments by staying organized, communicating proactively, and maintaining flexibility...',
        tags: ['culture-fit', 'adaptability', 'communication']
      },
      {
        category: 'Leadership',
        question: 'Describe a situation where you had to lead a team or mentor junior colleagues.',
        sampleAnswer: 'In my role as a senior developer, I was asked to mentor two junior developers who were new to the team...',
        tags: ['leadership', 'mentoring', 'team-management']
      }
    ];

    // Add skill-specific questions
    request.skills.forEach(skill => {
      templates.push({
        category: 'Technical',
        question: `Walk me through a complex problem you solved using ${skill}.`,
        sampleAnswer: `I once faced a performance issue in our application that required deep knowledge of ${skill}...`,
        tags: ['technical', skill, 'problem-solving']
      });
    });

    return templates;
  }

  private static getDifficultyForExperience(experienceLevel: string): 'easy' | 'medium' | 'hard' {
    switch (experienceLevel.toLowerCase()) {
      case 'entry':
      case 'junior':
        return 'easy';
      case 'senior':
      case 'lead':
      case 'principal':
        return 'hard';
      default:
        return 'medium';
    }
  }

  static async saveQuestions(questions: InterviewQuestion[]): Promise<void> {
    const { error } = await supabase
      .from('interview_questions')
      .insert(questions.map(q => ({
        job_title: q.job_title,
        company_type: q.company_type,
        difficulty_level: q.difficulty_level,
        question_category: q.question_category,
        question: q.question,
        sample_answer: q.sample_answer,
        tags: q.tags,
        usage_count: q.usage_count
      })));

    if (error) {
      console.error('Error saving interview questions:', error);
      throw error;
    }
  }

  static async getQuestionsByJobTitle(jobTitle: string): Promise<InterviewQuestion[]> {
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .ilike('job_title', `%${jobTitle}%`)
      .order('usage_count', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching interview questions:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      job_title: item.job_title,
      company_type: item.company_type,
      difficulty_level: item.difficulty_level as 'easy' | 'medium' | 'hard',
      question_category: item.question_category,
      question: item.question,
      sample_answer: item.sample_answer,
      tags: castJsonToStringArray(item.tags),
      usage_count: item.usage_count,
      created_at: item.created_at
    }));
  }

  static async getQuestionsByCategory(category: string): Promise<InterviewQuestion[]> {
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('question_category', category)
      .order('usage_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching questions by category:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      job_title: item.job_title,
      company_type: item.company_type,
      difficulty_level: item.difficulty_level as 'easy' | 'medium' | 'hard',
      question_category: item.question_category,
      question: item.question,
      sample_answer: item.sample_answer,
      tags: castJsonToStringArray(item.tags),
      usage_count: item.usage_count,
      created_at: item.created_at
    }));
  }

  static async incrementQuestionUsage(questionId: string): Promise<void> {
    // Note: This would require creating the increment_question_usage function in Supabase
    // For now, we'll use a direct update
    const { error } = await supabase
      .from('interview_questions')
      .update({ usage_count: supabase.rpc('usage_count + 1') })
      .eq('id', questionId);

    if (error) {
      console.error('Error incrementing question usage:', error);
    }
  }

  static async searchQuestions(query: string): Promise<InterviewQuestion[]> {
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .or(`question.ilike.%${query}%,tags.cs.{${query}}`)
      .order('usage_count', { ascending: false })
      .limit(15);

    if (error) {
      console.error('Error searching interview questions:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      job_title: item.job_title,
      company_type: item.company_type,
      difficulty_level: item.difficulty_level as 'easy' | 'medium' | 'hard',
      question_category: item.question_category,
      question: item.question,
      sample_answer: item.sample_answer,
      tags: castJsonToStringArray(item.tags),
      usage_count: item.usage_count,
      created_at: item.created_at
    }));
  }
}
