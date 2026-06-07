interface AvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallback?: string;
}

export function Avatar({
  src,
  alt = "",
  className = "_post_img",
  fallback = "/images/profile.png",
}: AvatarProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src || fallback} alt={alt} className={className} loading="lazy" />
  );
}
