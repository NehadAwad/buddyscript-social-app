import type { FeedPost } from "@/types/post";

const CACHE_TTL_MS = 60 * 1000;

interface CachedFeed {
  posts: FeedPost[];
  nextCursor: string | null;
  timestamp: number;
}

function feedCacheKey(userId: string): string {
  return `feed_cache_${userId}`;
}

export function getCachedFeed(userId: string): CachedFeed | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(feedCacheKey(userId));
  if (!raw) {
    return null;
  }

  try {
    const cached = JSON.parse(raw) as CachedFeed;
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(feedCacheKey(userId));
      return null;
    }
    return cached;
  } catch {
    sessionStorage.removeItem(feedCacheKey(userId));
    return null;
  }
}

export function setCachedFeed(
  userId: string,
  posts: FeedPost[],
  nextCursor: string | null
): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: CachedFeed = {
    posts,
    nextCursor,
    timestamp: Date.now(),
  };

  sessionStorage.setItem(feedCacheKey(userId), JSON.stringify(payload));
}

export function clearCachedFeed(userId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(feedCacheKey(userId));
}
