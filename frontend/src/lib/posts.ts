import { ApiError, fetchWithAuth } from "./api";
import type {
  CreatePostResponse,
  FeedPostsResponse,
  FeedPost,
} from "@/types/post";

export interface CreatePostInput {
  content?: string;
  visibility?: "public" | "private";
  image?: File | null;
}

async function parsePostResponse(response: Response): Promise<FeedPost> {
  const data = (await response.json().catch(() => ({}))) as CreatePostResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? "Failed to create post");
  }

  if (!data.post) {
    throw new ApiError(500, "Invalid create post response");
  }

  return data.post;
}

export async function createPost(input: CreatePostInput): Promise<FeedPost> {
  if (input.image) {
    const formData = new FormData();
    if (input.content?.trim()) {
      formData.append("content", input.content.trim());
    }
    formData.append("visibility", input.visibility ?? "public");
    formData.append("image", input.image);

    const response = await fetchWithAuth("/posts", {
      method: "POST",
      body: formData,
    });

    return parsePostResponse(response);
  }

  const response = await fetchWithAuth("/posts", {
    method: "POST",
    body: JSON.stringify({
      content: input.content?.trim(),
      visibility: input.visibility ?? "public",
    }),
  });

  return parsePostResponse(response);
}

export async function listPosts(
  limit = 10,
  cursor?: string
): Promise<FeedPostsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set("cursor", cursor);
  }

  const response = await fetchWithAuth(`/posts?${params.toString()}`);

  const data = (await response.json().catch(() => ({}))) as FeedPostsResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? "Failed to load posts");
  }

  return { posts: data.posts ?? [], nextCursor: data.nextCursor ?? null };
}

export async function deletePost(postId: string): Promise<void> {
  const response = await fetchWithAuth(`/posts/${postId}`, {
    method: "DELETE",
  });

  const data = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? "Failed to delete post");
  }
}
