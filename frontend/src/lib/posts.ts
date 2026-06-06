import { ApiError } from "./api";
import type {
  CreatePostResponse,
  FeedPostsResponse,
  FeedPost,
} from "@/types/post";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface CreatePostInput {
  content?: string;
  visibility?: "public" | "private";
  image?: File | null;
}

export async function createPost(input: CreatePostInput): Promise<FeedPost> {
  if (input.image) {
    const formData = new FormData();
    if (input.content?.trim()) {
      formData.append("content", input.content.trim());
    }
    formData.append("visibility", input.visibility ?? "public");
    formData.append("image", input.image);

    const response = await fetch(`${API_URL}/posts`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      post?: FeedPost;
    };

    if (!response.ok) {
      throw new ApiError(response.status, data.message ?? "Failed to create post");
    }

    if (!data.post) {
      throw new ApiError(500, "Invalid create post response");
    }

    return data.post;
  }

  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: input.content?.trim(),
      visibility: input.visibility ?? "public",
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    post?: FeedPost;
  };

  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? "Failed to create post");
  }

  if (!data.post) {
    throw new ApiError(500, "Invalid create post response");
  }

  return data.post;
}

export async function listPosts(
  limit = 10,
  cursor?: string
): Promise<FeedPostsResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set("cursor", cursor);
  }

  const response = await fetch(`${API_URL}/posts?${params.toString()}`, {
    credentials: "include",
  });

  const data = (await response.json().catch(() => ({}))) as FeedPostsResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? "Failed to load posts");
  }

  return { posts: data.posts ?? [], nextCursor: data.nextCursor ?? null };
}

export async function deletePost(postId: string): Promise<void> {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new ApiError(response.status, data.message ?? "Failed to delete post");
  }
}
