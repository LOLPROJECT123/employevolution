
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
  position?: string; // Added position field
}
