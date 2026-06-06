"use client";

import { FormEvent, useState } from "react";
import { ApiError } from "@/lib/api";
import { createComment } from "@/lib/comments";
import { Avatar } from "@/components/atoms";

interface CommentInputProps {
  postId: string;
  parentId?: string;
  userAvatar?: string | null;
  placeholder?: string;
  compact?: boolean;
  onSuccess?: () => void;
}

export function CommentInput({
  postId,
  parentId,
  userAvatar,
  placeholder = "Write a comment",
  compact = false,
  onSuccess,
}: CommentInputProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createComment(postId, trimmed, parentId);
      setContent("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  }

  const box = (
    <form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
      <div className="_feed_inner_comment_box_content">
        <div className="_feed_inner_comment_box_content_image">
          <Avatar
            src={userAvatar}
            className="_comment_img"
            fallback="/images/comment_img.png"
          />
        </div>
        <div className="_feed_inner_comment_box_content_txt">
          <textarea
            className="form-control _comment_textarea"
            placeholder={placeholder}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={submitting}
          />
        </div>
      </div>
      {error ? <p className="text-danger _mar_t8">{error}</p> : null}
      {content.trim() ? (
        <div className="_mar_t8">
          <button type="submit" className="_btn1" disabled={submitting} style={{ padding: "8px 24px" }}>
            {submitting ? "Posting..." : parentId ? "Reply" : "Comment"}
          </button>
        </div>
      ) : null}
    </form>
  );

  if (compact) {
    return <div className="_feed_inner_comment_box">{box}</div>;
  }

  return (
    <div className="_feed_inner_timeline_cooment_area">
      <div className="_feed_inner_comment_box">{box}</div>
    </div>
  );
}
