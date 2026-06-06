import { Post } from "../entities/Post";
import { resolvePostImageUrl } from "./postImage";

export interface FeedPostAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface FeedPostDto {
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

export function toFeedPost(post: Post, isLikedByMe = false): FeedPostDto {
  if (!post.author) {
    throw new Error("Post author relation required");
  }

  return {
    id: post.id,
    content: post.content,
    imageUrl: resolvePostImageUrl(post.imageUrl),
    visibility: post.visibility,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    isLikedByMe,
    createdAt: post.createdAt.toISOString(),
    author: {
      id: post.author.id,
      firstName: post.author.firstName,
      lastName: post.author.lastName,
      avatarUrl: post.author.avatarUrl,
    },
  };
}
