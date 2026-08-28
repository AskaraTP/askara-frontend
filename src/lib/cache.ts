/**
 * Client-Side Caching Optimization Layer
 * Provides fast in-memory and session caching with TTL (Time To Live) and smart invalidation.
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class ClientCache {
  private memoryCache = new Map<string, CacheEntry<any>>();

  /**
   * Get cached item or null if expired/missing
   */
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache item with TTL in seconds (default 180s = 3 minutes)
   */
  set<T>(key: string, data: T, ttlSeconds = 180): void {
    this.memoryCache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Invalidate specific key or keys matching prefix/pattern
   */
  invalidate(keyOrPrefix: string): void {
    for (const key of this.memoryCache.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.memoryCache.clear();
  }
}

export const clientCache = new ClientCache();
