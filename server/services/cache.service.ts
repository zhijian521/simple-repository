interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>()

  async get<T>(key: string): Promise<T | null> {
    this.cleanup()

    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  async set<T>(key: string, data: T, ttl: number = 300): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttl * 1000,
    }

    this.cache.set(key, entry as CacheEntry<unknown>)
    setTimeout(() => this.delete(key), ttl * 1000)
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key)
      }
    }
  }
}

export default new CacheService()
