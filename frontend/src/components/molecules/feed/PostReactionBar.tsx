"use client";

import { LikeButton } from "@/components/molecules/feed/LikeButton";

interface PostReactionBarProps {
  postId: string;
  isLiked: boolean;
  likeCount: number;
  onLikeChange(state: { isLiked: boolean; likeCount: number }): void;
  onCommentClick?(): void;
}

export function PostReactionBar({
  postId,
  isLiked,
  likeCount,
  onLikeChange,
  onCommentClick,
}: PostReactionBarProps) {
  return (
    <div className="_feed_inner_timeline_reaction">
      <LikeButton
        targetId={postId}
        targetType="post"
        isLiked={isLiked}
        likeCount={likeCount}
        onChange={onLikeChange}
        variant="post"
      />
      <button
        type="button"
        className="_feed_inner_timeline_reaction_comment _feed_reaction"
        onClick={onCommentClick}
      >
        <span className="_feed_inner_timeline_reaction_link">
          <span>
            <svg
              className="_reaction_svg"
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              fill="none"
              viewBox="0 0 21 21"
            >
              <path
                stroke="#000"
                d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"
              />
              <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
            </svg>
            Comment
          </span>
        </span>
      </button>
      <button type="button" className="_feed_inner_timeline_reaction_share _feed_reaction">
        <span className="_feed_inner_timeline_reaction_link">
          <span>
            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
              <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
            </svg>
            Share
          </span>
        </span>
      </button>
    </div>
  );
}
