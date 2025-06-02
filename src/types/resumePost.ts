
export interface ResumeAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface ResumeComment {
  id: string;
  author: ResumeAuthor;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  isCurrentUser: boolean;
}

export interface ResumePost {
  id: string;
  title: string;
  author: ResumeAuthor;
  content: string;
  resumeUrl?: string;
  upvotes: number;
  downvotes: number;
  comments: ResumeComment[];
  createdAt: string;
  tags: string[];
  company?: string;
  role?: string;
  matchPercentage?: number;
}

export interface LinkedInContact {
  id: string;
  name: string;
  title: string;
  company: string;
  profileUrl: string;
  avatar?: string;
  connectionDegree: number;
  mutualConnections: number;
  isAlumni?: boolean;
  graduationYear?: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'recruiter' | 'alumni' | 'hiring-manager' | 'referral';
  variables: string[];
}
