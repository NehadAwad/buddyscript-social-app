export interface FeedPostAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface FeedPost {
  id: string;
  content: string | null;
  imageUrl: string | null;
  visibility: "public" | "private";
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  author: FeedPostAuthor;
}

export interface FeedPostsResponse {
  posts: FeedPost[];
  nextCursor: string | null;
}

export interface CreatePostResponse {
  post: FeedPost;
}
