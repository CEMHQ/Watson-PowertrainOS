import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// ─── No-op fallback when Redis credentials are not configured ─────────────────

const noopRateLimit = {
  limit: async (_identifier: string) => ({ success: true, remaining: 999, reset: 0, limit: 999, pending: Promise.resolve() }),
}

import type { Duration } from '@upstash/ratelimit'

function makeRateLimit(prefix: string, window: Duration, requests: number): Ratelimit | typeof noopRateLimit {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return noopRateLimit
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix,
  })
}

// General API: 100 req / 60s
export const apiRateLimit = makeRateLimit('rl:api', '60 s', 100)

// Auth endpoints: 10 req / 60s
export const authRateLimit = makeRateLimit('rl:auth', '60 s', 10)

// AI endpoints: 20 req / 60s (Claude API calls)
export const aiRateLimit = makeRateLimit('rl:ai', '60 s', 20)

// ─── Helper ───────────────────────────────────────────────────────────────────

export async function checkRateLimit(
  limiter: Ratelimit | typeof noopRateLimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { success, remaining, reset } = await limiter.limit(identifier)
  return { success, remaining, reset }
}
