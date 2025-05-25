
import { Job } from '@/types/job';
import { User } from '@/types/auth';

interface SharedJob {
  id: string;
  jobId: string;
  sharedBy: string;
  sharedWith: string[];
  message?: string;
  sharedAt: string;
  platform: 'email' | 'linkedin' | 'twitter' | 'slack' | 'direct';
}

interface ReferralRequest {
  id: string;
  jobId: string;
  requesterId: string;
  targetUserId?: string;
  targetEmail?: string;
  targetLinkedIn?: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
  respondedAt?: string;
}

interface NetworkConnection {
  id: string;
  userId: string;
  connectedUserId?: string;
  email?: string;
  name: string;
  company: string;
  position: string;
  linkedInUrl?: string;
  connectionType: 'colleague' | 'alumni' | 'friend' | 'recruiter' | 'other';
  relationship: string;
  addedAt: string;
  lastContactedAt?: string;
}

class SocialFeaturesService {
  private sharedJobsKey = 'shared_jobs';
  private referralRequestsKey = 'referral_requests';
  private networkConnectionsKey = 'network_connections';

  // Job Sharing Features
  async shareJob(
    job: Job,
    sharedBy: string,
    shareConfig: {
      platform: 'email' | 'linkedin' | 'twitter' | 'slack' | 'direct';
      recipients: string[];
      message?: string;
    }
  ): Promise<SharedJob> {
    const sharedJob: SharedJob = {
      id: `share-${Date.now()}`,
      jobId: job.id,
      sharedBy,
      sharedWith: shareConfig.recipients,
      message: shareConfig.message,
      sharedAt: new Date().toISOString(),
      platform: shareConfig.platform
    };

    const sharedJobs = this.getSharedJobs(sharedBy);
    sharedJobs.push(sharedJob);
    localStorage.setItem(`${this.sharedJobsKey}_${sharedBy}`, JSON.stringify(sharedJobs));

    // Generate shareable content based on platform
    await this.generateShareableContent(job, shareConfig);

    return sharedJob;
  }

  private async generateShareableContent(
    job: Job,
    shareConfig: {
      platform: 'email' | 'linkedin' | 'twitter' | 'slack' | 'direct';
      recipients: string[];
      message?: string;
    }
  ) {
    const baseMessage = shareConfig.message || `Check out this ${job.title} position at ${job.company}!`;
    const jobUrl = job.applyUrl || `#job-${job.id}`;

    switch (shareConfig.platform) {
      case 'email':
        await this.shareViaEmail(job, baseMessage, shareConfig.recipients);
        break;
      case 'linkedin':
        await this.shareViaLinkedIn(job, baseMessage);
        break;
      case 'twitter':
        await this.shareViaTwitter(job, baseMessage);
        break;
      case 'slack':
        await this.shareViaSlack(job, baseMessage, shareConfig.recipients);
        break;
      case 'direct':
        await this.shareDirectly(job, baseMessage, shareConfig.recipients);
        break;
    }
  }

  private async shareViaEmail(job: Job, message: string, recipients: string[]) {
    const subject = `Job Opportunity: ${job.title} at ${job.company}`;
    const body = `${message}\n\nJob Details:\n${job.title} at ${job.company}\nLocation: ${job.location}\nSalary: $${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}\n\nApply here: ${job.applyUrl || 'Contact me for details'}`;
    
    const emailUrl = `mailto:${recipients.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
  }

  private async shareViaLinkedIn(job: Job, message: string) {
    const text = `${message} ${job.title} at ${job.company} - ${job.location}. ${job.applyUrl || ''}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(job.applyUrl || window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank');
  }

  private async shareViaTwitter(job: Job, message: string) {
    const text = `${message} ${job.title} at ${job.company} - ${job.location}. #jobs #hiring`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(job.applyUrl || window.location.href)}`;
    window.open(twitterUrl, '_blank');
  }

  private async shareViaSlack(job: Job, message: string, channels: string[]) {
    // For Slack, we'd typically use their API or webhook
    // For now, we'll copy a formatted message to clipboard
    const slackMessage = `${message}\n\n*${job.title}* at *${job.company}*\n📍 ${job.location}\n💰 $${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}\n🔗 ${job.applyUrl || 'Contact for details'}`;
    
    await navigator.clipboard.writeText(slackMessage);
    console.log('Slack message copied to clipboard:', slackMessage);
  }

  private async shareDirectly(job: Job, message: string, userIds: string[]) {
    // Store direct shares for in-app notifications
    const directShares = JSON.parse(localStorage.getItem('direct_shares') || '[]');
    const share = {
      id: `direct-${Date.now()}`,
      jobId: job.id,
      message,
      recipients: userIds,
      sharedAt: new Date().toISOString()
    };
    directShares.push(share);
    localStorage.setItem('direct_shares', JSON.stringify(directShares));
  }

  getSharedJobs(userId: string): SharedJob[] {
    try {
      const stored = localStorage.getItem(`${this.sharedJobsKey}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Referral Request Features
  async requestReferral(
    job: Job,
    requesterId: string,
    target: {
      userId?: string;
      email?: string;
      linkedInUrl?: string;
    },
    message: string
  ): Promise<ReferralRequest> {
    const referralRequest: ReferralRequest = {
      id: `referral-${Date.now()}`,
      jobId: job.id,
      requesterId,
      targetUserId: target.userId,
      targetEmail: target.email,
      targetLinkedIn: target.linkedInUrl,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const requests = this.getReferralRequests(requesterId);
    requests.push(referralRequest);
    localStorage.setItem(`${this.referralRequestsKey}_${requesterId}`, JSON.stringify(requests));

    // Send referral request notification/email
    await this.sendReferralRequest(referralRequest, job);

    return referralRequest;
  }

  private async sendReferralRequest(request: ReferralRequest, job: Job) {
    if (request.targetEmail) {
      const subject = `Referral Request for ${job.title} at ${job.company}`;
      const body = `Hi! I'm applying for a ${job.title} position at ${job.company} and would appreciate your referral or any insights you might have.\n\nMessage: ${request.message}\n\nJob details: ${job.applyUrl || 'Available upon request'}`;
      
      const emailUrl = `mailto:${request.targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(emailUrl);
    }

    if (request.targetLinkedIn) {
      // For LinkedIn, we'd typically use their messaging API
      console.log('LinkedIn referral request would be sent to:', request.targetLinkedIn);
    }
  }

  async respondToReferralRequest(
    requestId: string,
    response: 'accepted' | 'declined',
    notes?: string
  ): Promise<void> {
    // This would typically update the request in a backend database
    // For now, we'll update local storage
    const allRequests = JSON.parse(localStorage.getItem('all_referral_requests') || '[]');
    const requestIndex = allRequests.findIndex((req: ReferralRequest) => req.id === requestId);
    
    if (requestIndex !== -1) {
      allRequests[requestIndex].status = response;
      allRequests[requestIndex].respondedAt = new Date().toISOString();
      localStorage.setItem('all_referral_requests', JSON.stringify(allRequests));
    }
  }

  getReferralRequests(userId: string): ReferralRequest[] {
    try {
      const stored = localStorage.getItem(`${this.referralRequestsKey}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Network Management Features
  async addNetworkConnection(
    userId: string,
    connection: Omit<NetworkConnection, 'id' | 'userId' | 'addedAt'>
  ): Promise<NetworkConnection> {
    const newConnection: NetworkConnection = {
      id: `connection-${Date.now()}`,
      userId,
      ...connection,
      addedAt: new Date().toISOString()
    };

    const connections = this.getNetworkConnections(userId);
    connections.push(newConnection);
    localStorage.setItem(`${this.networkConnectionsKey}_${userId}`, JSON.stringify(connections));

    return newConnection;
  }

  getNetworkConnections(userId: string): NetworkConnection[] {
    try {
      const stored = localStorage.getItem(`${this.networkConnectionsKey}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Find potential referrers for a job
  findPotentialReferrers(job: Job, userId: string): NetworkConnection[] {
    const connections = this.getNetworkConnections(userId);
    
    return connections.filter(connection => {
      // Match by company
      if (connection.company.toLowerCase().includes(job.company.toLowerCase()) ||
          job.company.toLowerCase().includes(connection.company.toLowerCase())) {
        return true;
      }
      
      // Match by industry (simplified)
      const jobIndustry = this.inferIndustryFromJob(job);
      const connectionIndustry = this.inferIndustryFromPosition(connection.position);
      
      return jobIndustry === connectionIndustry;
    });
  }

  private inferIndustryFromJob(job: Job): string {
    const description = job.description.toLowerCase();
    const title = job.title.toLowerCase();
    
    if (title.includes('software') || title.includes('developer') || title.includes('engineer')) {
      return 'technology';
    }
    if (description.includes('marketing') || title.includes('marketing')) {
      return 'marketing';
    }
    if (description.includes('sales') || title.includes('sales')) {
      return 'sales';
    }
    if (description.includes('finance') || title.includes('finance')) {
      return 'finance';
    }
    
    return 'general';
  }

  private inferIndustryFromPosition(position: string): string {
    const pos = position.toLowerCase();
    
    if (pos.includes('software') || pos.includes('developer') || pos.includes('engineer')) {
      return 'technology';
    }
    if (pos.includes('marketing')) {
      return 'marketing';
    }
    if (pos.includes('sales')) {
      return 'sales';
    }
    if (pos.includes('finance')) {
      return 'finance';
    }
    
    return 'general';
  }

  // Generate referral templates
  generateReferralMessage(job: Job, referrer: NetworkConnection, requester: User): string {
    const templates = [
      `Hi ${referrer.name}, I hope you're doing well! I'm currently applying for a ${job.title} position at ${job.company} and noticed you work there. Would you be open to providing a referral or sharing any insights about the role and team? I'd really appreciate any help you can offer!`,
      
      `Hello ${referrer.name}! I saw that you're at ${job.company} and wanted to reach out about a ${job.title} opportunity I'm interested in. Would you have time for a quick chat about the company culture and this role? Any guidance would be incredibly valuable.`,
      
      `Hi ${referrer.name}, I hope this message finds you well. I'm excited about a ${job.title} position at ${job.company} and would love to learn more about your experience there. Would you be willing to provide a referral or share your thoughts on the role?`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Track referral success rates
  getReferralAnalytics(userId: string) {
    const requests = this.getReferralRequests(userId);
    const total = requests.length;
    const accepted = requests.filter(req => req.status === 'accepted').length;
    const completed = requests.filter(req => req.status === 'completed').length;
    
    return {
      totalRequests: total,
      acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      averageResponseTime: this.calculateAverageResponseTime(requests)
    };
  }

  private calculateAverageResponseTime(requests: ReferralRequest[]): number {
    const respondedRequests = requests.filter(req => req.respondedAt);
    
    if (respondedRequests.length === 0) return 0;
    
    const totalTime = respondedRequests.reduce((sum, req) => {
      const created = new Date(req.createdAt).getTime();
      const responded = new Date(req.respondedAt!).getTime();
      return sum + (responded - created);
    }, 0);
    
    const avgMilliseconds = totalTime / respondedRequests.length;
    return Math.round(avgMilliseconds / (1000 * 60 * 60 * 24)); // Convert to days
  }
}

export const socialFeaturesService = new SocialFeaturesService();
