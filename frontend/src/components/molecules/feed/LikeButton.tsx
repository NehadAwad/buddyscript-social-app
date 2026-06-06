"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { likeTarget, unlikeTarget } from "@/lib/likes";
import type { LikeTargetType } from "@/types/like";

interface LikeButtonProps {
  targetId: string;
  targetType: LikeTargetType;
  isLiked: boolean;
  likeCount: number;
  onChange?: (state: { isLiked: boolean; likeCount: number }) => void;
  variant?: "post" | "comment";
  className?: string;
}

export function LikeButton({
  targetId,
  targetType,
  isLiked,
  likeCount,
  onChange,
  variant = "post",
  className,
}: LikeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (loading) {
      return;
    }

    const previous = { isLiked, likeCount };
    const optimistic = {
      isLiked: !isLiked,
      likeCount: isLiked ? Math.max(0, likeCount - 1) : likeCount + 1,
    };

    onChange?.(optimistic);
    setLoading(true);

    try {
      const result = isLiked
        ? await unlikeTarget(targetId, targetType)
        : await likeTarget(targetId, targetType);
      onChange?.({
        isLiked: result.isLikedByMe,
        likeCount: result.likeCount,
      });
    } catch (err) {
      onChange?.(previous);
      console.error(err instanceof ApiError ? err.message : "Like failed");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "comment") {
    return (
      <li>
        <span
          role="button"
          tabIndex={0}
          className={className}
          onClick={handleToggle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleToggle();
            }
          }}
        >
          {isLiked ? "Unlike" : "Like"}
          {likeCount > 0 ? ` (${likeCount})` : "."}
        </span>
      </li>
    );
  }

  return (
    <button
      type="button"
      className={`_feed_inner_timeline_reaction_emoji _feed_reaction${isLiked ? " _feed_reaction_active" : ""}${className ? ` ${className}` : ""}`}
      onClick={handleToggle}
      disabled={loading}
      aria-pressed={isLiked}
    >
      <span className="_feed_inner_timeline_reaction_link">
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
            <path fill="#FFCC4D" d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z" />
            <path
              fill="#664500"
              d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z"
            />
            <path fill="#fff" d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z" />
            <path
              fill="#664500"
              d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z"
            />
          </svg>
          Haha
        </span>
      </span>
    </button>
  );
}
