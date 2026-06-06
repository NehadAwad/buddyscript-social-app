"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { deletePost } from "@/lib/posts";
import { FormError, ThreeDotIcon } from "@/components/atoms";

interface PostMenuProps {
  postId: string;
  canDelete: boolean;
  onDeleted: () => void;
}

export function PostMenu({ postId, canDelete, onDeleted }: PostMenuProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      await deletePost(postId);
      setOpen(false);
      onDeleted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="_feed_inner_timeline_post_box_dropdown">
      <div className="_feed_timeline_post_dropdown">
        <button
          type="button"
          className="_feed_timeline_post_dropdown_link"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <ThreeDotIcon />
        </button>
      </div>
      <div className={`_feed_timeline_dropdown _timeline_dropdown${open ? " show" : ""}`}>
        <ul className="_feed_timeline_dropdown_list">
          <li className="_feed_timeline_dropdown_item">
            <button type="button" className="_feed_timeline_dropdown_link">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                  <path
                    stroke="#1890FF"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.2"
                    d="M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v12z"
                  />
                </svg>
              </span>
              Save Post
            </button>
          </li>
          {canDelete && (
            <li className="_feed_timeline_dropdown_item">
              <button
                type="button"
                className="_feed_timeline_dropdown_link"
                onClick={handleDelete}
                disabled={deleting}
              >
                <span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18">
                    <path
                      stroke="#1890FF"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.2"
                      d="M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5"
                    />
                  </svg>
                </span>
                {deleting ? "Deleting..." : "Delete Post"}
              </button>
            </li>
          )}
        </ul>
        {error && <FormError message={error} className="_padd_l24 text-danger" />}
      </div>
    </div>
  );
}
