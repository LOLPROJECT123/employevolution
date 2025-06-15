
import { supabase } from '@/integrations/supabase/client';

export interface ApplicationQuestion {
  id: string;
  question: string;
  answer: string;
  category: 'personal' | 'experience' | 'skills' | 'behavioral' | 'technical' | 'legal' | 'custom';
  platforms: string[];
  frequency: number;
  lastUsed: string;
  isStandard: boolean;
  questionHash: string;
}

export interface QuestionScanResult {
  questions: ApplicationQuestion[];
  newQuestions: ApplicationQuestion[];
  existingQuestions: ApplicationQuestion[];
}

class ApplicationQuestionService {
  async scanPageForQuestions(url: string): Promise<QuestionScanResult> {
    try {
      const { data, error } = await supabase.functions.invoke('question-scanner', {
        body: { url }
      });

      if (error) {
        throw new Error(`Question scanning failed: ${error.message}`);
      }

      const scannedQuestions = data.questions || [];
      const existingQuestions = await this.getExistingQuestions();
      
      const newQuestions = scannedQuestions.filter((q: any) => 
        !existingQuestions.some(eq => eq.questionHash === q.questionHash)
      );

      const existing = scannedQuestions.filter((q: any) => 
        existingQuestions.some(eq => eq.questionHash === q.questionHash)
      );

      return {
        questions: scannedQuestions,
        newQuestions,
        existingQuestions: existing
      };
    } catch (error) {
      console.error('Question scanning error:', error);
      throw error;
    }
  }

  async saveQuestionAnswer(question: ApplicationQuestion, answer: string): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('application_questions')
        .upsert({
          user_id: userData.user.id,
          question_hash: question.questionHash,
          question: question.question,
          answer,
          category: question.category,
          platforms: question.platforms,
          frequency: question.frequency + 1,
          last_used: new Date().toISOString(),
          is_standard: question.isStandard
        });

      if (error) {
        throw new Error(`Failed to save question answer: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving question answer:', error);
      throw error;
    }
  }

  async getAnswerForQuestion(questionHash: string): Promise<string | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return null;
      }

      const { data, error } = await supabase
        .from('application_questions')
        .select('answer')
        .eq('user_id', userData.user.id)
        .eq('question_hash', questionHash)
        .maybeSingle();

      if (error) {
        console.error('Error getting answer for question:', error);
        return null;
      }

      return data?.answer || null;
    } catch (error) {
      console.error('Error getting answer for question:', error);
      return null;
    }
  }

  async getAllAnswers(): Promise<Record<string, string>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return {};
      }

      const { data, error } = await supabase
        .from('application_questions')
        .select('question_hash, answer')
        .eq('user_id', userData.user.id);

      if (error) {
        throw new Error(`Failed to get all answers: ${error.message}`);
      }

      const answers: Record<string, string> = {};
      data?.forEach(item => {
        answers[item.question_hash] = item.answer;
      });

      return answers;
    } catch (error) {
      console.error('Error getting all answers:', error);
      return {};
    }
  }

  private async getExistingQuestions(): Promise<ApplicationQuestion[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('application_questions')
        .select('*')
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Error getting existing questions:', error);
        return [];
      }

      return data?.map(item => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        category: item.category,
        platforms: item.platforms || [],
        frequency: item.frequency || 0,
        lastUsed: item.last_used,
        isStandard: item.is_standard || false,
        questionHash: item.question_hash
      })) || [];
    } catch (error) {
      console.error('Error getting existing questions:', error);
      return [];
    }
  }
}

export const applicationQuestionService = new ApplicationQuestionService();
