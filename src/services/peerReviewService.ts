
// Mock implementation of peer review service
// TODO: Replace with actual Supabase implementation once database tables are created

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
  // Mock data for demonstration
  private static mockReviews: PeerReview[] = [
    {
      id: '1',
      reviewer_id: 'reviewer1',
      reviewee_id: 'reviewee1',
      document_id: 'doc1',
      document_type: 'resume',
      status: 'pending',
      feedback: [],
      overall_rating: 0,
      created_at: new Date().toISOString()
    }
  ];

  private static mockFeedback: ReviewFeedback[] = [
    {
      id: '1',
      section: 'Experience',
      type: 'suggestion',
      comment: 'Consider adding more quantifiable achievements',
      priority: 'high'
    }
  ];

  static async requestReview(revieweeId: string, request: ReviewRequest): Promise<string> {
    try {
      // Mock implementation - would be real database operation in production
      const newReview: PeerReview = {
        id: Date.now().toString(),
        reviewer_id: '',
        reviewee_id: revieweeId,
        document_id: request.document_id,
        document_type: request.document_type,
        status: 'pending',
        feedback: [],
        overall_rating: 0,
        created_at: new Date().toISOString()
      };

      this.mockReviews.push(newReview);
      console.log('Mock: Created review request', newReview);
      return newReview.id;
    } catch (error) {
      console.error('Failed to request review:', error);
      throw error;
    }
  }

  static async acceptReview(reviewId: string, reviewerId: string): Promise<void> {
    try {
      // Mock implementation
      const review = this.mockReviews.find(r => r.id === reviewId);
      if (review) {
        review.reviewer_id = reviewerId;
        review.status = 'in_progress';
        console.log('Mock: Accepted review', review);
      }
    } catch (error) {
      console.error('Failed to accept review:', error);
      throw error;
    }
  }

  static async submitFeedback(reviewId: string, feedback: Omit<ReviewFeedback, 'id'>[]): Promise<void> {
    try {
      // Mock implementation
      const newFeedback = feedback.map(f => ({
        id: Date.now().toString() + Math.random(),
        ...f
      }));

      this.mockFeedback.push(...newFeedback);
      console.log('Mock: Submitted feedback', newFeedback);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  }

  static async completeReview(reviewId: string, overallRating: number): Promise<void> {
    try {
      // Mock implementation
      const review = this.mockReviews.find(r => r.id === reviewId);
      if (review) {
        review.status = 'completed';
        review.overall_rating = overallRating;
        review.completed_at = new Date().toISOString();
        console.log('Mock: Completed review', review);
      }
    } catch (error) {
      console.error('Failed to complete review:', error);
      throw error;
    }
  }

  static async getMyReviews(userId: string): Promise<PeerReview[]> {
    try {
      // Mock implementation
      const userReviews = this.mockReviews.filter(
        r => r.reviewer_id === userId || r.reviewee_id === userId
      );
      console.log('Mock: Retrieved user reviews', userReviews);
      return userReviews;
    } catch (error) {
      console.error('Failed to get reviews:', error);
      return [];
    }
  }

  static async getAvailableReviews(userId: string): Promise<PeerReview[]> {
    try {
      // Mock implementation
      const availableReviews = this.mockReviews.filter(
        r => r.status === 'pending' && r.reviewee_id !== userId
      );
      console.log('Mock: Retrieved available reviews', availableReviews);
      return availableReviews;
    } catch (error) {
      console.error('Failed to get available reviews:', error);
      return [];
    }
  }

  static async getReviewFeedback(reviewId: string): Promise<ReviewFeedback[]> {
    try {
      // Mock implementation - in real implementation, feedback would be linked to review
      console.log('Mock: Retrieved review feedback for review', reviewId);
      return this.mockFeedback;
    } catch (error) {
      console.error('Failed to get review feedback:', error);
      return [];
    }
  }
}
