"use client";

import { useEffect, useState } from "react";
import { formatTimeAgo } from "@/lib/formatTimeAgo";
import { deleteComment } from "@/lib/comments";
import { ApiError } from "@/lib/api";
import type { FeedComment } from "@/types/comment";
import { Avatar } from "@/components/atoms";
import { LikeButton } from "@/components/molecules/feed/LikeButton";
import { CommentInput } from "./CommentInput";

interface CommentItemProps {
  comment: FeedComment;
  postId: string;
  currentUserId: string;
  userAvatar?: string | null;
  isReply?: boolean;
  onRefresh: () => void;
  onTopLevelRemoved?: () => void;
  onOpenLikers: (targetId: string, targetType: "comment") => void;
}

export function CommentItem({
  comment: initialComment,
  postId,
  currentUserId,
  userAvatar,
  isReply = false,
  onRefresh,
  onTopLevelRemoved,
  onOpenLikers,
}: CommentItemProps) {
  const [comment, setComment] = useState(initialComment);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setComment(initialComment);
  }, [initialComment]);

  const authorName = `${comment.author.firstName} ${comment.author.lastName}`;
  const avatar = comment.author.avatarUrl || "/images/txt_img.png";
  const canDelete = comment.author.id === currentUserId;

  async function handleDelete() {
    if (deleting) {
      return;
    }

    setDeleting(true);
    try {
      await deleteComment(comment.id);
      if (comment.parentId) {
        onRefresh();
      } else {
        onTopLevelRemoved?.();
        onRefresh();
      }
    } catch (err) {
      console.error(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="_comment_main" style={isReply ? { marginLeft: 48, marginTop: 12 } : undefined}>
      <div className="_comment_image">
        <span className="_comment_image_link">
          <img src={avatar} alt="" className="_comment_img1" />
        </span>
      </div>
      <div className="_comment_area">
        <div className="_comment_details">
          <div className="_comment_details_top">
            <div className="_comment_name">
              <h4 className="_comment_name_title">{authorName}</h4>
            </div>
            {canDelete ? (
              <button
                type="button"
                className="border-0 bg-transparent p-0 text-danger"
                style={{ fontSize: 12 }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "..." : "Delete"}
              </button>
            ) : null}
          </div>
          <div className="_comment_status">
            <p className="_comment_status_text">
              <span>{comment.content}</span>
            </p>
          </div>
          {comment.likeCount > 0 ? (
            <button
              type="button"
              className="_total_reactions border-0 bg-white"
              onClick={() => onOpenLikers(comment.id, "comment")}
            >
              <div className="_total_react">
                <span className="_reaction_like">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </span>
              </div>
              <span className="_total">{comment.likeCount}</span>
            </button>
          ) : null}
          <div className="_comment_reply">
            <div className="_comment_reply_num">
              <ul className="_comment_reply_list">
                <LikeButton
                  targetId={comment.id}
                  targetType="comment"
                  isLiked={comment.isLikedByMe}
                  likeCount={comment.likeCount}
                  variant="comment"
                  onChange={(state) =>
                    setComment((current) => ({
                      ...current,
                      isLikedByMe: state.isLiked,
                      likeCount: state.likeCount,
                    }))
                  }
                />
                {!isReply ? (
                  <li>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowReplyInput((value) => !value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setShowReplyInput((value) => !value);
                        }
                      }}
                    >
                      Reply
                    </span>
                  </li>
                ) : null}
                <li>
                  <span className="_time_link">.{formatTimeAgo(comment.createdAt)}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {showReplyInput && !isReply ? (
          <CommentInput
            postId={postId}
            parentId={comment.id}
            userAvatar={userAvatar}
            placeholder="Write a reply"
            compact
            onSuccess={() => {
              setShowReplyInput(false);
              onRefresh();
            }}
          />
        ) : null}

        {!isReply && comment.replies?.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            postId={postId}
            currentUserId={currentUserId}
            userAvatar={userAvatar}
            isReply
            onRefresh={onRefresh}
            onOpenLikers={onOpenLikers}
          />
        ))}
      </div>
    </div>
  );
}
