
import { supabase } from '@/integrations/supabase/client';

export interface PeerReview {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  document_id: string;
  document_type: 'resume' | 'cover_letter' | 'application';
  status: 'pending' | 'in_progress' | 'completed' | 'declined';
  feedback: ReviewFeedback[];
  overall_rating: number;
  created_at: string;
  completed_at?: string;
}

export interface ReviewFeedback {
  id: string;
  section: string;
  type: 'suggestion' | 'compliment' | 'concern';
  comment: string;
  line_number?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ReviewRequest {
  document_id: string;
  document_type: 'resume' | 'cover_letter' | 'application';
  message?: string;
  deadline?: string;
  specific_areas?: string[];
}

export class PeerReviewService {
  static async requestReview(revieweeId: string, request: ReviewRequest): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('peer_reviews')
        .insert({
          reviewee_id: revieweeId,
          document_id: request.document_id,
          document_type: request.document_type,
          status: 'pending',
          request_message: request.message,
          deadline: request.deadline,
          specific_areas: request.specific_areas
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to request review:', error);
      throw error;
    }
  }

  static async acceptReview(reviewId: string, reviewerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('peer_reviews')
        .update({
          reviewer_id: reviewerId,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to accept review:', error);
      throw error;
    }
  }

  static async submitFeedback(reviewId: string, feedback: Omit<ReviewFeedback, 'id'>[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('review_feedback')
        .insert(
          feedback.map(f => ({
            review_id: reviewId,
            ...f
          }))
        );

      if (error) throw error;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  }

  static async completeReview(reviewId: string, overallRating: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('peer_reviews')
        .update({
          status: 'completed',
          overall_rating: overallRating,
          completed_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to complete review:', error);
      throw error;
    }
  }

  static async getMyReviews(userId: string): Promise<PeerReview[]> {
    try {
      const { data, error } = await supabase
        .from('peer_reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id(full_name),
          reviewee:profiles!reviewee_id(full_name)
        `)
        .or(`reviewer_id.eq.${userId},reviewee_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get reviews:', error);
      return [];
    }
  }

  static async getAvailableReviews(userId: string): Promise<PeerReview[]> {
    try {
      const { data, error } = await supabase
        .from('peer_reviews')
        .select(`
          *,
          reviewee:profiles!reviewee_id(full_name)
        `)
        .eq('status', 'pending')
        .neq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get available reviews:', error);
      return [];
    }
  }

  static async getReviewFeedback(reviewId: string): Promise<ReviewFeedback[]> {
    try {
      const { data, error } = await supabase
        .from('review_feedback')
        .select('*')
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get review feedback:', error);
      return [];
    }
  }
}
