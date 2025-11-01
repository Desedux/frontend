
export type CardModel = {
  id: number;
  title: string;
  description: string;
  author: string;
  user_id: string;
  up_down: number;
  created_at: string;
  updated_at: string;

  deactivated?: boolean;
};

export type TagResponseDto = {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  count: number;
};

export type CreateCardDto = {
  title: string;
  description: string;
  isAnonymous: boolean;
  tags: number[];
};

export type VoteDto = { isUpvote: boolean };

export type CommentResponseDto = {
  id: number;
  card_id: number;
  parent_id: number | null;
  content: string;
  author: string;
  user_id: string;
  created_at: string;
  updated_at: string;

  likesCount?: number;
  dislikesCount?: number;
  myReaction?: 'like'|'dislike'|null;
  up_down?: number;
  replies?: CommentResponseDto[];
};

export type PaginatedCommentsResponse = {
  data: CommentResponseDto[];
  total: number;
  pageNumber: number;
  itemsPerPage: number;
  hasMore: boolean;
};

export type ReactionDto = { action: 'like'|'dislike'|'none' };
export type ReactionResponseDto = {
  commentId: number;
  up_down: number;
  myReaction: 'like'|'dislike'|'none';
};
