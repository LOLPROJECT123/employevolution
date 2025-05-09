
export type ForumPost = {
  id: string;
  author: {
    name: string;
    avatar?: string;
    initials: string;
  };
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  timestamp: string;
  isAnonymous: boolean;
  matchPercentage?: number;
  company?: string;
  role?: string;
  position?: string;
};

export type ForumComment = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
  likes?: number;
  isLiked?: boolean;
};
