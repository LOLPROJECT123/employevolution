
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ApplicationQuestion {
  id: string;
  question: string;
  answer: string;
  category: 'skills' | 'technical' | 'experience' | 'custom' | 'behavioral' | 'personal' | 'legal';
  platforms: string[];
  frequency: number;
  lastUsed: string;
  isStandard: boolean;
  questionHash: string;
}

export class ApplicationQuestionService {
  private static instance: ApplicationQuestionService;
  private cache = new Map<string, ApplicationQuestion[]>();

  static getInstance(): ApplicationQuestionService {
    if (!ApplicationQuestionService.instance) {
      ApplicationQuestionService.instance = new ApplicationQuestionService();
    }
    return ApplicationQuestionService.instance;
  }

  async getUserQuestions(userId: string): Promise<ApplicationQuestion[]> {
    if (this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }

    try {
      const { data, error } = await supabase
        .from('application_questions')
        .select('*')
        .eq('user_id', userId)
        .order('frequency', { ascending: false });

      if (error) throw error;

      const questions: ApplicationQuestion[] = data?.map(item => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        category: item.category as ApplicationQuestion['category'],
        platforms: item.platforms || [],
        frequency: item.frequency || 1,
        lastUsed: item.last_used || new Date().toISOString(),
        isStandard: item.is_standard || false,
        questionHash: item.question_hash
      })) || [];

      this.cache.set(userId, questions);
      return questions;
    } catch (error) {
      console.error('Error fetching user questions:', error);
      toast({
        title: "Error",
        description: "Failed to load application questions",
        variant: "destructive",
      });
      return [];
    }
  }

  async saveQuestion(userId: string, question: ApplicationQuestion): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('application_questions')
        .upsert({
          user_id: userId,
          question: question.question,
          answer: question.answer,
          category: question.category,
          platforms: question.platforms,
          frequency: question.frequency,
          last_used: new Date().toISOString(),
          is_standard: question.isStandard,
          question_hash: question.questionHash
        });

      if (error) throw error;

      // Update cache
      const cached = this.cache.get(userId) || [];
      const existingIndex = cached.findIndex(q => q.id === question.id);
      if (existingIndex >= 0) {
        cached[existingIndex] = question;
      } else {
        cached.push(question);
      }
      this.cache.set(userId, cached);

      return true;
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: "Error",
        description: "Failed to save application question",
        variant: "destructive",
      });
      return false;
    }
  }

  async deleteQuestion(userId: string, questionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('application_questions')
        .delete()
        .eq('id', questionId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update cache
      const cached = this.cache.get(userId) || [];
      this.cache.set(userId, cached.filter(q => q.id !== questionId));

      return true;
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete application question",
        variant: "destructive",
      });
      return false;
    }
  }

  generateQuestionHash(question: string): string {
    return btoa(question.toLowerCase().replace(/[^a-z0-9]/g, '')).slice(0, 20);
  }

  getStandardQuestions(): ApplicationQuestion[] {
    return [
      {
        id: 'std-1',
        question: 'Why do you want to work for this company?',
        answer: '',
        category: 'behavioral',
        platforms: ['linkedin', 'indeed', 'glassdoor'],
        frequency: 1,
        lastUsed: new Date().toISOString(),
        isStandard: true,
        questionHash: this.generateQuestionHash('Why do you want to work for this company?')
      },
      {
        id: 'std-2',
        question: 'What are your salary expectations?',
        answer: '',
        category: 'personal',
        platforms: ['linkedin', 'indeed'],
        frequency: 1,
        lastUsed: new Date().toISOString(),
        isStandard: true,
        questionHash: this.generateQuestionHash('What are your salary expectations?')
      },
      {
        id: 'std-3',
        question: 'Are you authorized to work in the United States?',
        answer: 'Yes',
        category: 'legal',
        platforms: ['linkedin', 'indeed', 'glassdoor', 'monster'],
        frequency: 1,
        lastUsed: new Date().toISOString(),
        isStandard: true,
        questionHash: this.generateQuestionHash('Are you authorized to work in the United States?')
      }
    ];
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const applicationQuestionService = ApplicationQuestionService.getInstance();
