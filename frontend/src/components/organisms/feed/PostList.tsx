"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { listPosts } from "@/lib/posts";
import type { PublicUser } from "@/types/auth";
import type { FeedPost } from "@/types/post";
import { FeedStatusCard, PostCardSkeleton } from "@/components/molecules";
import { PostCard } from "./PostCard";

interface PostListProps {
  currentUser: PublicUser;
  refreshToken: number;
}

export function PostList({ currentUser, refreshToken }: PostListProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const lastRefreshToken = useRef(refreshToken);

  const loadPosts = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPosts([]);
      setNextCursor(null);
    }
    setError(null);

    try {
      const result = await listPosts(10);
      setPosts(result.posts);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) {
      return;
    }

    setLoadingMore(true);

    try {
      const result = await listPosts(10, nextCursor);
      setPosts((current) => [...current, ...result.posts]);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load more posts");
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore]);

  useEffect(() => {
    loadPosts(true);
  }, [loadPosts]);

  useEffect(() => {
    if (refreshToken !== lastRefreshToken.current) {
      lastRefreshToken.current = refreshToken;
      loadPosts(true);
    }
  }, [refreshToken, loadPosts]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && nextCursor && !loadingMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(loader);

    return () => {
      observer.disconnect();
    };
  }, [nextCursor, loadingMore, loading, loadMore]);

  function handlePostDeleted(deletedPostId: string) {
    setPosts((current) => current.filter((post) => post.id !== deletedPostId));
  }

  if (loading) {
    return (
      <>
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </>
    );
  }

  if (error && posts.length === 0) {
    return (
      <FeedStatusCard error>
        {error}
        <button
          type="button"
          onClick={() => loadPosts(true)}
          className="_btn1 _mar_t16"
          style={{ display: "block", marginTop: 12 }}
        >
          Retry
        </button>
      </FeedStatusCard>
    );
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
          onDeleted={() => handlePostDeleted(post.id)}
        />
      ))}

      <div ref={loaderRef}>
        {loadingMore && <PostCardSkeleton />}
        {!nextCursor && posts.length > 0 && (
          <div
            className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16 _padd_r24 _padd_l24"
            style={{ textAlign: "center" }}
          >
            <p className="_feed_inner_timeline_post_box_para" style={{ color: "#999" }}>
              You&apos;ve reached the end
            </p>
          </div>
        )}
      </div>

      {error && posts.length > 0 && (
        <FeedStatusCard error>
          {error}
          <button
            type="button"
            onClick={loadMore}
            className="_btn1"
            style={{ display: "block", marginTop: 12 }}
          >
            Retry
          </button>
        </FeedStatusCard>
      )}
    </>
  );
}
