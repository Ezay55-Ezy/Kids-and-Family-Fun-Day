import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const limiters = new Map<string, Ratelimit>();

function getLimiter(key: string, maxRequests: number, windowMs: number): Ratelimit {
  const cacheKey = `${key}:${maxRequests}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
      analytics: false,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

export async function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000,
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  if (!redis) {
    return { allowed: true, retryAfterMs: 0 };
  }

  const limiter = getLimiter(key, maxRequests, windowMs);
  const result = await limiter.limit(key);

  return {
    allowed: result.success,
    retryAfterMs: result.success ? 0 : Math.max(0, result.reset - Date.now()),
  };
}
