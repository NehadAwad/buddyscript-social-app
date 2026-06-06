const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

/** Backend committed asset; survives deploys (see backend/assets/static/). */
export const POST_FALLBACK_IMAGE_PATH =
  process.env.NEXT_PUBLIC_POST_FALLBACK_IMAGE ?? "/static/post-fallback.png";

export const POST_FALLBACK_IMAGE = resolveBackendAssetUrl(POST_FALLBACK_IMAGE_PATH);

/** Local copy in frontend/public — used if backend static is unavailable. */
export const POST_LOCAL_FALLBACK_IMAGE =
  process.env.NEXT_PUBLIC_POST_LOCAL_FALLBACK_IMAGE ?? "/images/post-fallback.png";

function resolveBackendAssetUrl(assetPath: string): string {
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }

  if (assetPath.startsWith("/static/") || assetPath.startsWith("/uploads/")) {
    return `${API_ORIGIN}${assetPath}`;
  }

  return assetPath;
}

/** Builds a browser-ready src for post images returned by the API. */
export function getPostImageSrc(imageUrl: string | null): string | null {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/images/")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/uploads/") || imageUrl.startsWith("/static/")) {
    return resolveBackendAssetUrl(imageUrl);
  }

  return imageUrl;
}

export function handlePostImageError(image: HTMLImageElement): void {
  const stage = image.dataset.fallbackStage ?? "original";

  if (stage === "original") {
    image.dataset.fallbackStage = "backend";
    image.src = POST_FALLBACK_IMAGE;
    return;
  }

  if (stage === "backend") {
    image.dataset.fallbackStage = "local";
    image.onerror = null;
    image.src = POST_LOCAL_FALLBACK_IMAGE;
  }
}
