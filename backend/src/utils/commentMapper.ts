import { Comment } from "../entities/Comment";
import { CommentAuthor, toCommentAuthor } from "./commentAuthor";

export interface CommentDto {
  id: string;
  postId: string;
  parentId: string | null;
  content: string;
  likeCount: number;
  replyCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  author: CommentAuthor;
  replies?: CommentDto[];
}

export function toCommentDto(
  comment: Comment,
  isLikedByMe = false,
  replies?: CommentDto[]
): CommentDto {
  if (!comment.author) {
    throw new Error("Comment author relation required");
  }

  const dto: CommentDto = {
    id: comment.id,
    postId: comment.postId,
    parentId: comment.parentId,
    content: comment.content,
    likeCount: comment.likeCount,
    replyCount: comment.replyCount,
    isLikedByMe,
    createdAt: comment.createdAt.toISOString(),
    author: toCommentAuthor(comment.author),
  };

  if (replies !== undefined) {
    dto.replies = replies;
  }

  return dto;
}
