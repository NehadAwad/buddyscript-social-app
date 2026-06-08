const MAX_ENTRIES = 500;

interface CacheEntry<T> {
  data: T;
  expires: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }

  return entry.data as T;
}

export function cacheSet<T>(key: string, data: T, ttlSeconds = 60): void {
  if (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey) {
      store.delete(oldestKey);
    }
  }

  store.set(key, {
    data,
    expires: Date.now() + ttlSeconds * 1000,
  });
}

export function cacheDelete(key: string): void {
  store.delete(key);
}

export function cacheDeleteByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

export function feedCacheKey(userId: string, limit: number): string {
  return `feed:${userId}:${limit}`;
}

export function invalidateFeedCaches(): void {
  cacheDeleteByPrefix("feed:");
}
