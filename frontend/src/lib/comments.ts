import { apiFetch } from "./api";
import type { CommentsResponse, FeedComment } from "@/types/comment";

export async function createComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<FeedComment> {
  const data = await apiFetch<{ comment: FeedComment }>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content, ...(parentId ? { parentId } : {}) }),
  });

  return data.comment;
}

export async function listComments(
  postId: string,
  limit = 20,
  cursor?: string
): Promise<CommentsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set("cursor", cursor);
  }

  return apiFetch<CommentsResponse>(`/posts/${postId}/comments?${params.toString()}`);
}

export async function listReplies(
  commentId: string,
  limit = 20,
  cursor?: string
): Promise<CommentsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set("cursor", cursor);
  }

  return apiFetch<CommentsResponse>(`/comments/${commentId}/replies?${params.toString()}`);
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiFetch<{ message: string }>(`/comments/${commentId}`, {
    method: "DELETE",
  });
}
