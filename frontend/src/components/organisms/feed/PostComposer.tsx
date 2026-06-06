"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicUser } from "@/types/auth";
import { ApiError } from "@/lib/api";
import { createPost } from "@/lib/posts";
import { Avatar, FormError } from "@/components/atoms";
import { PhotoAttachButton, PostSubmitButton } from "@/components/molecules";

interface PostComposerProps {
  user: PublicUser;
  onPostCreated: () => void;
}

export function PostComposer({ user, onPostCreated }: PostComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!image) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImage(file);
    setError(null);
  }

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed && !image) {
      setError("Write something or add a photo");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createPost({ content: trimmed || undefined, visibility, image });
      setContent("");
      setImage(null);
      setVisibility("public");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onPostCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
      <div className="_feed_inner_text_area_box">
        <div className="_feed_inner_text_area_box_image">
          <Avatar
            src={user.avatarUrl}
            className="_txt_img"
            fallback="/images/txt_img.png"
          />
        </div>
        <div className="form-floating _feed_inner_text_area_box_form">
          <textarea
            className="form-control _textarea"
            placeholder="Leave a comment here"
            id="feed-composer-textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <label className="_feed_textarea_label" htmlFor="feed-composer-textarea">
            Write something ...
            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="24" fill="none" viewBox="0 0 23 24">
              <path
                fill="#666"
                d="M19.504 19.209c.332 0 .601.289.601.646 0 .326-.226.596-.52.64l-.081.005h-6.276c-.332 0-.602-.289-.602-.645 0-.327.227-.597.52-.64l.082-.006h6.276zM13.4 4.417c1.139-1.223 2.986-1.223 4.125 0l1.182 1.268c1.14 1.223 1.14 3.205 0 4.427L9.82 19.649a2.619 2.619 0 01-1.916.85h-3.64c-.337 0-.61-.298-.6-.66l.09-3.941a3.019 3.019 0 01.794-1.982l8.852-9.5zm-.688 2.562l-7.313 7.85a1.68 1.68 0 00-.441 1.101l-.077 3.278h3.023c.356 0 .698-.133.968-.376l.098-.096 7.35-7.887-3.608-3.87zm3.962-1.65a1.633 1.633 0 00-2.423 0l-.688.737 3.606 3.87.688-.737c.631-.678.666-1.755.105-2.477l-.105-.124-1.183-1.268z"
              />
            </svg>
          </label>
        </div>
      </div>

      {imagePreview && (
        <div className="_feed_inner_timeline_image _mar_t16">
          <img src={imagePreview} alt="" className="_time_img" />
        </div>
      )}

      {error && <FormError message={error} className="_mar_t16 text-danger" />}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="d-none"
        onChange={handleFileChange}
      />

      <div className="_feed_inner_text_area_bottom">
        <div className="_feed_inner_text_area_item">
          <PhotoAttachButton onClick={handlePhotoClick} />
          <div className="_feed_inner_text_area_bottom_video _feed_common">
            <button type="button" className="_feed_inner_text_area_bottom_photo_link">
              <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                  <path
                    fill="#666"
                    d="M11.485 4.5c2.213 0 3.753 1.534 3.917 3.784l2.418-1.082c1.047-.468 2.188.327 2.271 1.533l.005.141v6.64c0 1.237-1.103 2.093-2.155 1.72l-.121-.047-2.418-1.083c-.164 2.25-1.708 3.785-3.917 3.785H5.76c-2.343 0-3.932-1.72-3.932-4.188V8.688c0-2.469 1.589-4.188 3.932-4.188h5.726zm0 1.5H5.76C4.169 6 3.197 7.05 3.197 8.688v7.015c0 1.636.972 2.688 2.562 2.688h5.726c1.586 0 2.562-1.054 2.562-2.688v-.686-6.329c0-1.636-.973-2.688-2.562-2.688zM18.4 8.57l-.062.02-2.921 1.306v4.596l2.921 1.307c.165.073.343-.036.38-.215l.008-.07V8.876c0-.195-.16-.334-.326-.305z"
                  />
                </svg>
              </span>
              Video
            </button>
          </div>
          <select
            className="form-select form-select-sm _mar_l16"
            style={{ maxWidth: 120 }}
            value={visibility}
            onChange={(event) =>
              setVisibility(event.target.value as "public" | "private")
            }
            aria-label="Post visibility"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <PostSubmitButton onClick={handleSubmit} submitting={submitting} />
      </div>

      <div className="_feed_inner_text_area_bottom_mobile">
        <div className="_feed_inner_text_mobile">
          <div className="_feed_inner_text_area_item">
            <PhotoAttachButton onClick={handlePhotoClick} showLabel={false} />
          </div>
          <PostSubmitButton onClick={handleSubmit} submitting={submitting} />
        </div>
      </div>
    </div>
  );
}
