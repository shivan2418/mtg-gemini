// Simple in-memory cache for server-side caching
class ServerCache {
  private cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();

  set(key: string, data: unknown, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  // Remove expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const serverCache = new ServerCache();

// Run cleanup every 10 minutes
if (typeof global !== 'undefined') {
  setInterval(
    () => {
      serverCache.cleanup();
    },
    10 * 60 * 1000,
  );
}
