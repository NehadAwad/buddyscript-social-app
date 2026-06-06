"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { listPosts } from "@/lib/posts";
import type { PublicUser } from "@/types/auth";
import type { FeedPost } from "@/types/post";
import { FeedStatusCard } from "@/components/molecules";
import { PostCard } from "./PostCard";

interface PostListProps {
  currentUser: PublicUser;
  refreshToken: number;
}

export function PostList({ currentUser, refreshToken }: PostListProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listPosts(10);
      setPosts(result.posts);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts, refreshToken]);

  if (loading) {
    return <FeedStatusCard>Loading posts...</FeedStatusCard>;
  }

  if (error) {
    return <FeedStatusCard error>{error}</FeedStatusCard>;
  }

  if (posts.length === 0) {
    return (
      <FeedStatusCard>No posts yet. Create the first one above.</FeedStatusCard>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onDeleted={loadPosts}
        />
      ))}
    </>
  );
}
