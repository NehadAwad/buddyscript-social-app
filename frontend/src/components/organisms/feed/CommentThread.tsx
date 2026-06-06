"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { listComments } from "@/lib/comments";
import type { FeedComment } from "@/types/comment";
import { CommentItem } from "./CommentItem";

interface CommentThreadProps {
  postId: string;
  currentUserId: string;
  userAvatar?: string | null;
  refreshKey: number;
  onTopLevelRemoved?: () => void;
  onOpenLikers: (targetId: string, targetType: "comment") => void;
}

export function CommentThread({
  postId,
  currentUserId,
  userAvatar,
  refreshKey,
  onTopLevelRemoved,
  onOpenLikers,
}: CommentThreadProps) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listComments(postId);
      setComments(result.comments);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments, refreshKey]);

  async function loadMore() {
    if (!nextCursor || loadingMore) {
      return;
    }

    setLoadingMore(true);
    try {
      const result = await listComments(postId, 20, nextCursor);
      setComments((current) => [...current, ...result.comments]);
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load more comments");
    } finally {
      setLoadingMore(false);
    }
  }

  function handleRefresh() {
    loadComments();
  }

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="_timline_comment_main">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="_timline_comment_main">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          currentUserId={currentUserId}
          userAvatar={userAvatar}
          onRefresh={handleRefresh}
          onTopLevelRemoved={onTopLevelRemoved}
          onOpenLikers={onOpenLikers}
        />
      ))}

      {nextCursor ? (
        <div className="_previous_comment">
          <button
            type="button"
            className="_previous_comment_txt"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "View more comments"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
