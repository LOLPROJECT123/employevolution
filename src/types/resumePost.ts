
export interface ResumePost {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  resumeUrl?: string;
  upvotes: number;
  downvotes: number;
  comments: ResumeComment[];
  createdAt: string;
  tags: string[];
  matchPercentage?: number;
}

export interface ResumeComment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}
