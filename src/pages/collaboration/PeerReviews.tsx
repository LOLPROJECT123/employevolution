
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { PeerReviewService, PeerReview, ReviewFeedback } from '@/services/peerReviewService';
import { useToast } from '@/hooks/use-toast';
import { Star, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const PeerReviews: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myReviews, setMyReviews] = useState<PeerReview[]>([]);
  const [availableReviews, setAvailableReviews] = useState<PeerReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<PeerReview | null>(null);
  const [feedback, setFeedback] = useState<Omit<ReviewFeedback, 'id'>[]>([]);
  const [newFeedback, setNewFeedback] = useState<Partial<ReviewFeedback>>({});
  const [activeTab, setActiveTab] = useState<'my-reviews' | 'available' | 'give-feedback'>('my-reviews');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user]);

  const loadReviews = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [myReviewsData, availableReviewsData] = await Promise.all([
        PeerReviewService.getMyReviews(user.id),
        PeerReviewService.getAvailableReviews(user.id)
      ]);
      
      setMyReviews(myReviewsData);
      setAvailableReviews(availableReviewsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptReview = async (reviewId: string) => {
    if (!user) return;
    
    try {
      await PeerReviewService.acceptReview(reviewId, user.id);
      toast({
        title: "Review Accepted",
        description: "You can now provide feedback on this document"
      });
      loadReviews();
      
      const review = availableReviews.find(r => r.id === reviewId);
      if (review) {
        setSelectedReview(review);
        setActiveTab('give-feedback');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept review",
        variant: "destructive"
      });
    }
  };

  const addFeedback = () => {
    if (!newFeedback.section || !newFeedback.comment) return;
    
    const feedbackItem: Omit<ReviewFeedback, 'id'> = {
      section: newFeedback.section,
      type: newFeedback.type || 'suggestion',
      comment: newFeedback.comment,
      priority: newFeedback.priority || 'medium',
      line_number: newFeedback.line_number
    };
    
    setFeedback(prev => [...prev, feedbackItem]);
    setNewFeedback({});
  };

  const submitReview = async () => {
    if (!selectedReview || feedback.length === 0) return;
    
    try {
      await PeerReviewService.submitFeedback(selectedReview.id, feedback);
      await PeerReviewService.completeReview(selectedReview.id, 4); // Mock rating
      
      toast({
        title: "Review Submitted",
        description: "Your feedback has been sent to the document owner"
      });
      
      setSelectedReview(null);
      setFeedback([]);
      setActiveTab('my-reviews');
      loadReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Peer Reviews</h1>
        <p className="text-muted-foreground">Get feedback on your documents and help others improve theirs</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b">
        <Button
          variant={activeTab === 'my-reviews' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('my-reviews')}
        >
          My Reviews
        </Button>
        <Button
          variant={activeTab === 'available' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('available')}
        >
          Available Reviews
        </Button>
        {selectedReview && (
          <Button
            variant={activeTab === 'give-feedback' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('give-feedback')}
          >
            Give Feedback
          </Button>
        )}
      </div>

      {/* My Reviews Tab */}
      {activeTab === 'my-reviews' && (
        <div className="space-y-4">
          {myReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                <p className="text-muted-foreground">
                  Request reviews for your documents or start reviewing others' work
                </p>
              </CardContent>
            </Card>
          ) : (
            myReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(review.status)}
                      <div>
                        <h3 className="font-medium">
                          {review.document_type.replace('_', ' ').toUpperCase()} Review
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {review.status === 'pending' && 'Waiting for reviewer'}
                          {review.status === 'in_progress' && 'Being reviewed'}
                          {review.status === 'completed' && 'Review completed'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant="outline">{review.status}</Badge>
                      {review.overall_rating && (
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{review.overall_rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    Created: {new Date(review.created_at).toLocaleDateString()}
                    {review.completed_at && (
                      <span className="ml-4">
                        Completed: {new Date(review.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Available Reviews Tab */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {availableReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Available Reviews</h3>
                <p className="text-muted-foreground">
                  Check back later for documents that need your expertise
                </p>
              </CardContent>
            </Card>
          ) : (
            availableReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {review.reviewee_id.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {review.document_type.replace('_', ' ').toUpperCase()} Review Request
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Requested {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <Button onClick={() => acceptReview(review.id)}>
                      Accept Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Give Feedback Tab */}
      {activeTab === 'give-feedback' && selectedReview && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Reviewing: {selectedReview.document_type.replace('_', ' ').toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Select
                      value={newFeedback.section || ''}
                      onValueChange={(value) => setNewFeedback(prev => ({ ...prev, section: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Professional Summary</SelectItem>
                        <SelectItem value="experience">Work Experience</SelectItem>
                        <SelectItem value="skills">Skills</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="format">Format & Layout</SelectItem>
                        <SelectItem value="overall">Overall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Feedback Type</Label>
                    <Select
                      value={newFeedback.type || 'suggestion'}
                      onValueChange={(value) => setNewFeedback(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                        <SelectItem value="compliment">Compliment</SelectItem>
                        <SelectItem value="concern">Concern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Comment</Label>
                  <Textarea
                    value={newFeedback.comment || ''}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Provide detailed feedback..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={newFeedback.priority || 'medium'}
                    onValueChange={(value) => setNewFeedback(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={addFeedback}>Add Feedback</Button>
              </div>
            </CardContent>
          </Card>

          {/* Feedback List */}
          {feedback.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Feedback ({feedback.length} items)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedback.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{item.section}</Badge>
                        <Badge variant={item.priority === 'high' ? "destructive" : item.priority === 'medium' ? "secondary" : "default"}>
                          {item.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm">{item.comment}</p>
                      <div className="mt-2">
                        <Badge variant="outline">{item.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button onClick={submitReview} className="w-full">
                    Submit Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default PeerReviews;
