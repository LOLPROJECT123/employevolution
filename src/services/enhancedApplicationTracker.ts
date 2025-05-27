
import { Job } from '@/types/job';

interface ApplicationStatusUpdate {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  timestamp: string;
  source: 'manual' | 'email' | 'ats' | 'website';
  details?: string;
  nextAction?: string;
}

interface ApplicationDeadline {
  id: string;
  applicationId: string;
  type: 'application' | 'interview' | 'follow_up' | 'decision';
  deadline: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isCompleted: boolean;
}

interface InterviewOutcome {
  id: string;
  applicationId: string;
  interviewDate: string;
  interviewType: string;
  feedback: string;
  outcome: 'positive' | 'negative' | 'neutral' | 'pending';
  nextSteps: string[];
  interviewerNotes?: string;
}

type ApplicationStatus = 
  | 'applied' 
  | 'under_review' 
  | 'phone_screen_scheduled'
  | 'phone_screen_completed'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'final_interview'
  | 'reference_check'
  | 'offer_pending'
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_declined'
  | 'rejected'
  | 'withdrawn';

class EnhancedApplicationTracker {
  private statusUpdates: ApplicationStatusUpdate[] = [];
  private deadlines: ApplicationDeadline[] = [];
  private interviewOutcomes: InterviewOutcome[] = [];

  async trackStatusUpdate(applicationId: string, status: ApplicationStatus, source: string, details?: string): Promise<void> {
    const update: ApplicationStatusUpdate = {
      id: `update-${Date.now()}-${Math.random()}`,
      applicationId,
      status,
      timestamp: new Date().toISOString(),
      source: source as any,
      details,
      nextAction: this.getNextAction(status)
    };

    this.statusUpdates.push(update);
    
    // Auto-create deadlines based on status
    await this.createAutoDeadlines(applicationId, status);
    
    // Store in localStorage for persistence
    localStorage.setItem('application_status_updates', JSON.stringify(this.statusUpdates));
    
    console.log(`Status updated for application ${applicationId}: ${status}`);
  }

  async createDeadline(applicationId: string, type: ApplicationDeadline['type'], deadline: string, description: string, priority: ApplicationDeadline['priority'] = 'medium'): Promise<void> {
    const newDeadline: ApplicationDeadline = {
      id: `deadline-${Date.now()}-${Math.random()}`,
      applicationId,
      type,
      deadline,
      description,
      priority,
      isCompleted: false
    };

    this.deadlines.push(newDeadline);
    localStorage.setItem('application_deadlines', JSON.stringify(this.deadlines));
  }

  async recordInterviewOutcome(applicationId: string, interviewDate: string, interviewType: string, feedback: string, outcome: InterviewOutcome['outcome'], nextSteps: string[]): Promise<void> {
    const interviewOutcome: InterviewOutcome = {
      id: `interview-${Date.now()}-${Math.random()}`,
      applicationId,
      interviewDate,
      interviewType,
      feedback,
      outcome,
      nextSteps
    };

    this.interviewOutcomes.push(interviewOutcome);
    localStorage.setItem('interview_outcomes', JSON.stringify(this.interviewOutcomes));
    
    // Update application status based on outcome
    if (outcome === 'positive') {
      await this.trackStatusUpdate(applicationId, 'interview_completed', 'manual', 'Positive interview feedback');
    } else if (outcome === 'negative') {
      await this.trackStatusUpdate(applicationId, 'rejected', 'manual', 'Negative interview feedback');
    }
  }

  getApplicationStatusHistory(applicationId: string): ApplicationStatusUpdate[] {
    return this.statusUpdates
      .filter(update => update.applicationId === applicationId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getUpcomingDeadlines(days: number = 7): ApplicationDeadline[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return this.deadlines
      .filter(deadline => 
        !deadline.isCompleted && 
        new Date(deadline.deadline) <= cutoffDate
      )
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  getInterviewOutcomes(applicationId: string): InterviewOutcome[] {
    return this.interviewOutcomes
      .filter(outcome => outcome.applicationId === applicationId)
      .sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());
  }

  async checkExternalStatusUpdates(applicationUrls: string[]): Promise<ApplicationStatusUpdate[]> {
    // This would integrate with ATS systems to check for status updates
    // For now, simulate some updates
    const mockUpdates: ApplicationStatusUpdate[] = [];
    
    for (const url of applicationUrls) {
      // Simulate occasional status updates
      if (Math.random() > 0.8) {
        const statuses: ApplicationStatus[] = ['under_review', 'phone_screen_scheduled', 'interview_scheduled'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        mockUpdates.push({
          id: `external-${Date.now()}-${Math.random()}`,
          applicationId: this.extractApplicationIdFromUrl(url),
          status: randomStatus,
          timestamp: new Date().toISOString(),
          source: 'ats',
          details: 'Status updated automatically from ATS system'
        });
      }
    }
    
    return mockUpdates;
  }

  private extractApplicationIdFromUrl(url: string): string {
    // Extract application ID from URL - this would be more sophisticated in real implementation
    return url.split('/').pop() || 'unknown';
  }

  private getNextAction(status: ApplicationStatus): string {
    const nextActions: Record<ApplicationStatus, string> = {
      'applied': 'Wait for initial response (typically 1-2 weeks)',
      'under_review': 'Prepare for potential phone screen',
      'phone_screen_scheduled': 'Prepare for phone screen interview',
      'phone_screen_completed': 'Wait for next round invitation',
      'interview_scheduled': 'Prepare thoroughly for interview',
      'interview_completed': 'Send thank you note and wait for feedback',
      'final_interview': 'Prepare for final round questions',
      'reference_check': 'Contact references to expect calls',
      'offer_pending': 'Prepare for salary negotiation',
      'offer_received': 'Review offer and negotiate if needed',
      'offer_accepted': 'Prepare for onboarding',
      'offer_declined': 'Continue job search',
      'rejected': 'Request feedback and continue search',
      'withdrawn': 'Continue with other opportunities'
    };
    
    return nextActions[status] || 'Monitor status and follow up as needed';
  }

  private async createAutoDeadlines(applicationId: string, status: ApplicationStatus): Promise<void> {
    const now = new Date();
    
    switch (status) {
      case 'applied':
        // Follow up if no response in 2 weeks
        const followUpDate = new Date(now);
        followUpDate.setDate(followUpDate.getDate() + 14);
        await this.createDeadline(applicationId, 'follow_up', followUpDate.toISOString(), 'Follow up on application status', 'medium');
        break;
        
      case 'phone_screen_scheduled':
        // Prepare for phone screen
        const prepDate = new Date(now);
        prepDate.setDate(prepDate.getDate() + 1);
        await this.createDeadline(applicationId, 'interview', prepDate.toISOString(), 'Prepare for phone screen', 'high');
        break;
        
      case 'interview_scheduled':
        // Prepare for interview
        const interviewPrepDate = new Date(now);
        interviewPrepDate.setDate(interviewPrepDate.getDate() + 1);
        await this.createDeadline(applicationId, 'interview', interviewPrepDate.toISOString(), 'Prepare for onsite/virtual interview', 'high');
        break;
        
      case 'interview_completed':
        // Send thank you note
        const thankYouDate = new Date(now);
        thankYouDate.setDate(thankYouDate.getDate() + 1);
        await this.createDeadline(applicationId, 'follow_up', thankYouDate.toISOString(), 'Send thank you note', 'high');
        break;
        
      case 'offer_received':
        // Decision deadline (typically 1 week)
        const decisionDate = new Date(now);
        decisionDate.setDate(decisionDate.getDate() + 7);
        await this.createDeadline(applicationId, 'decision', decisionDate.toISOString(), 'Make decision on offer', 'urgent');
        break;
    }
  }

  getApplicationAnalytics(userId: string): {
    totalApplications: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    averageTimeToResponse: number;
    statusBreakdown: Record<ApplicationStatus, number>;
    monthlyTrends: Array<{ month: string; applications: number; responses: number }>;
  } {
    // This would typically query the database for real analytics
    // For now, return mock analytics data
    return {
      totalApplications: 45,
      responseRate: 24.4, // 11/45
      interviewRate: 15.6, // 7/45
      offerRate: 6.7, // 3/45
      averageTimeToResponse: 8.5, // days
      statusBreakdown: {
        'applied': 15,
        'under_review': 8,
        'phone_screen_scheduled': 3,
        'phone_screen_completed': 2,
        'interview_scheduled': 4,
        'interview_completed': 2,
        'final_interview': 1,
        'reference_check': 1,
        'offer_pending': 0,
        'offer_received': 2,
        'offer_accepted': 1,
        'offer_declined': 1,
        'rejected': 4,
        'withdrawn': 1
      },
      monthlyTrends: [
        { month: '2024-01', applications: 12, responses: 3 },
        { month: '2024-02', applications: 15, responses: 4 },
        { month: '2024-03', applications: 18, responses: 4 }
      ]
    };
  }

  async markDeadlineCompleted(deadlineId: string): Promise<void> {
    const deadline = this.deadlines.find(d => d.id === deadlineId);
    if (deadline) {
      deadline.isCompleted = true;
      localStorage.setItem('application_deadlines', JSON.stringify(this.deadlines));
    }
  }

  async snoozeDeadline(deadlineId: string, newDeadline: string): Promise<void> {
    const deadline = this.deadlines.find(d => d.id === deadlineId);
    if (deadline) {
      deadline.deadline = newDeadline;
      localStorage.setItem('application_deadlines', JSON.stringify(this.deadlines));
    }
  }

  // Load data from localStorage on initialization
  private loadStoredData(): void {
    try {
      const storedUpdates = localStorage.getItem('application_status_updates');
      if (storedUpdates) {
        this.statusUpdates = JSON.parse(storedUpdates);
      }
      
      const storedDeadlines = localStorage.getItem('application_deadlines');
      if (storedDeadlines) {
        this.deadlines = JSON.parse(storedDeadlines);
      }
      
      const storedOutcomes = localStorage.getItem('interview_outcomes');
      if (storedOutcomes) {
        this.interviewOutcomes = JSON.parse(storedOutcomes);
      }
    } catch (error) {
      console.error('Error loading stored application data:', error);
    }
  }

  constructor() {
    this.loadStoredData();
  }
}

export const enhancedApplicationTracker = new EnhancedApplicationTracker();
