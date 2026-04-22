// ============================================================================
// Rate Limiting — Production-ready with Upstash Redis + In-memory fallback
// ============================================================================

import { logger } from "./logger";

// ============================================================================
// Upstash Redis Rate Limiter (Production)
// ============================================================================

let upstashLimiter: {
  auth: ReturnType<typeof createUpstashLimiter> | null;
  api: ReturnType<typeof createUpstashLimiter> | null;
  ai: ReturnType<typeof createUpstashLimiter> | null;
  register: ReturnType<typeof createUpstashLimiter> | null;
  page: ReturnType<typeof createUpstashLimiter> | null;
} | null = null;

function createUpstashLimiter(requests: number, window: string) {
  try {
    const { Ratelimit } = require("@upstash/ratelimit");
    const { Redis } = require("@upstash/redis");
    
    const redis = Redis.fromEnv();
    
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: true,
      prefix: "linex-forsa",
    });
  } catch (error) {
    logger.warn("Upstash initialization failed, falling back to in-memory", {}, error as Error);
    return null;
  }
}

function initUpstashLimiters() {
  if (upstashLimiter) return;
  
  const hasUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!hasUpstash) {
    logger.info("Upstash not configured, using in-memory rate limiting");
    upstashLimiter = { auth: null, api: null, ai: null, register: null, page: null };
    return;
  }

  try {
    upstashLimiter = {
      auth: createUpstashLimiter(5, "60 s"),
      api: createUpstashLimiter(30, "60 s"),
      ai: createUpstashLimiter(10, "60 s"),
      register: createUpstashLimiter(3, "3600 s"),
      page: createUpstashLimiter(100, "60 s"),
    };
    logger.info("Upstash rate limiters initialized");
  } catch (error) {
    logger.error("Failed to initialize Upstash limiters", {}, error as Error);
    upstashLimiter = { auth: null, api: null, ai: null, register: null, page: null };
  }
}

// ============================================================================
// In-Memory Rate Limiter (Development Fallback)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) rateLimitStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

function checkInMemoryRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetIn: entry.resetAt - now };
}

// ============================================================================
// Unified Rate Limit Interface
// ============================================================================

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

async function checkRateLimitAsync(
  limiterKey: "auth" | "api" | "ai" | "register" | "page",
  identifier: string,
  fallbackLimit: number,
  fallbackWindowMs: number
): Promise<RateLimitResult> {
  initUpstashLimiters();
  
  const upstash = upstashLimiter?.[limiterKey];
  
  if (upstash) {
    try {
      const result = await upstash.limit(identifier);
      return {
        allowed: result.success,
        remaining: result.remaining,
        resetIn: result.reset - Date.now(),
      };
    } catch (error) {
      logger.warn(`Upstash rate limit check failed, falling back to in-memory`, { action: limiterKey }, error as Error);
    }
  }
  
  // Fallback to in-memory
  return checkInMemoryRateLimit(identifier, fallbackLimit, fallbackWindowMs);
}

// ============================================================================
// Preset Rate Limiters
// ============================================================================

export const rateLimits = {
  // Auth: 5 attempts per minute per IP
  auth: (identifier: string): RateLimitResult => {
    // Synchronous fallback for backward compatibility
    initUpstashLimiters();
    if (!upstashLimiter?.auth) {
      return checkInMemoryRateLimit(`auth:${identifier}`, 5, 60 * 1000);
    }
    // For async, callers should use authAsync
    return checkInMemoryRateLimit(`auth:${identifier}`, 5, 60 * 1000);
  },
  
  authAsync: (identifier: string): Promise<RateLimitResult> => 
    checkRateLimitAsync("auth", identifier, 5, 60 * 1000),
  
  // API: 30 requests per minute per user
  api: (identifier: string): RateLimitResult => {
    initUpstashLimiters();
    if (!upstashLimiter?.api) {
      return checkInMemoryRateLimit(`api:${identifier}`, 30, 60 * 1000);
    }
    return checkInMemoryRateLimit(`api:${identifier}`, 30, 60 * 1000);
  },
  
  apiAsync: (identifier: string): Promise<RateLimitResult> =>
    checkRateLimitAsync("api", identifier, 30, 60 * 1000),
  
  // AI Agents: 10 requests per minute per user
  ai: (identifier: string): RateLimitResult => {
    initUpstashLimiters();
    if (!upstashLimiter?.ai) {
      return checkInMemoryRateLimit(`ai:${identifier}`, 10, 60 * 1000);
    }
    return checkInMemoryRateLimit(`ai:${identifier}`, 10, 60 * 1000);
  },
  
  aiAsync: (identifier: string): Promise<RateLimitResult> =>
    checkRateLimitAsync("ai", identifier, 10, 60 * 1000),
  
  // Registration: 3 per hour per IP
  register: (identifier: string): RateLimitResult => {
    initUpstashLimiters();
    if (!upstashLimiter?.register) {
      return checkInMemoryRateLimit(`register:${identifier}`, 3, 60 * 60 * 1000);
    }
    return checkInMemoryRateLimit(`register:${identifier}`, 3, 60 * 60 * 1000);
  },
  
  registerAsync: (identifier: string): Promise<RateLimitResult> =>
    checkRateLimitAsync("register", identifier, 3, 60 * 60 * 1000),
  
  // General page: 100 per minute per IP
  page: (identifier: string): RateLimitResult => {
    initUpstashLimiters();
    if (!upstashLimiter?.page) {
      return checkInMemoryRateLimit(`page:${identifier}`, 100, 60 * 1000);
    }
    return checkInMemoryRateLimit(`page:${identifier}`, 100, 60 * 1000);
  },
  
  pageAsync: (identifier: string): Promise<RateLimitResult> =>
    checkRateLimitAsync("page", identifier, 100, 60 * 1000),
};

// Export for testing
export { checkInMemoryRateLimit, checkRateLimitAsync };