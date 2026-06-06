export interface CommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface FeedComment {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  likeCount: number;
  replyCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  author: CommentAuthor;
  replies?: FeedComment[];
}

export interface CommentsResponse {
  comments: FeedComment[];
  nextCursor: string | null;
}
