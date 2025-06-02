
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
