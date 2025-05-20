
export interface ResumePostAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface ResumeComment {
  id: string;
  author: ResumePostAuthor;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  isCurrentUser?: boolean;
}

export interface ResumePost {
  id: string;
  title: string;
  author: ResumePostAuthor;
  content: string;
  resumeUrl?: string;
  upvotes: number;
  downvotes: number;
  comments: ResumeComment[];
  createdAt: string;
  tags: string[];
  company?: string;
  role?: string;
  position?: string;
  matchPercentage?: number;
  linkedInData?: {
    recruiters?: LinkedInContact[];
    alumni?: LinkedInContact[];
  };
}

export interface LinkedInContact {
  id: string;
  name: string;
  title: string;
  company: string;
  profileUrl: string;
  avatar?: string;
  connectionDegree: 1 | 2 | 3;
  mutualConnections?: number;
  isAlumni?: boolean;
  graduationYear?: string;
  emailAddress?: string;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'recruiter' | 'alumni' | 'hiring-manager' | 'referral';
  variables: string[];
}
