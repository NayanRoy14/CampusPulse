export type Category = 'Food' | 'Facilities' | 'Safety' | 'Academics' | 'Cleanliness';
export type PostStatus = 'Open' | 'In Progress' | 'Resolved';
export type VoteType = 'up' | 'down';
export type SortMode = 'trending' | 'latest' | 'top';
export type ReportReason = 'Spam' | 'Abuse' | 'Fake info' | 'Sensitive content';

export interface User {
  id: string;
  alias: string;
  email?: string;
  isBanned: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userAlias: string;
  title: string;
  description: string; // This maps to 'content' in Supabase
  category: Category;
  imageUrl?: string;
  sentimentScore: number;
  votesCount: number; // This maps to 'votes' in Supabase
  commentsCount: number;
  status: PostStatus;
  createdAt: string;
  adminResponse?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userAlias: string;
  parentId?: string;
  content: string;
  votesCount: number; // This maps to 'votes' in Supabase
  reactions: Record<string, number>;
  createdAt: string;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  voteType: VoteType;
}

export interface Report {
  id: string;
  targetId: string;
  targetType: 'post' | 'comment';
  userId: string;
  reason: ReportReason;
  createdAt: string;
  resolved: boolean;
}

export interface UserReaction {
  id: string;
  userId: string;
  commentId: string;
  reactionType: string;
  createdAt: string;
}

export const CATEGORIES: Category[] = ['Food', 'Facilities', 'Safety', 'Academics', 'Cleanliness'];

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: '🍕',
  Facilities: '🏗️',
  Safety: '🛡️',
  Academics: '📚',
  Cleanliness: '✨',
};

export const STATUS_COLORS: Record<PostStatus, string> = {
  Open: 'bg-secondary text-secondary-foreground',
  'In Progress': 'bg-info text-accent-foreground',
  Resolved: 'bg-success text-accent-foreground',
};
