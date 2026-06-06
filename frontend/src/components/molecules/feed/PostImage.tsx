"use client";

import { getPostImageSrc, handlePostImageError } from "@/lib/images";

interface PostImageProps {
  imageUrl: string | null;
  alt?: string;
  className?: string;
}

export function PostImage({
  imageUrl,
  alt = "Post image",
  className = "_time_img",
}: PostImageProps) {
  const src = getPostImageSrc(imageUrl);

  if (!src) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(event) => handlePostImageError(event.currentTarget)}
    />
  );
}
