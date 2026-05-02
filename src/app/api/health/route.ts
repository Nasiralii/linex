import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Health check endpoint for production monitoring
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: string; responseTimeMs?: number; error?: string }> = {};
  
  // Database check
  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    checks.database = { status: "connected", responseTimeMs: Date.now() - dbStart };
  } catch (error: any) {
    checks.database = { status: "disconnected", error: error?.message };
  }
  
  // Upstash Redis check
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { Redis } = require("@upstash/redis");
      const redis = Redis.fromEnv();
      const redisStart = Date.now();
      await redis.ping();
      checks.redis = { status: "connected", responseTimeMs: Date.now() - redisStart };
    } else {
      checks.redis = { status: "not_configured" };
    }
  } catch (error: any) {
    checks.redis = { status: "error", error: error?.message };
  }
  
  const totalResponseTime = Date.now() - startTime;
  const isHealthy = checks.database?.status === "connected";
  
  return NextResponse.json({
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    environment: process.env.NODE_ENV || "development",
    responseTimeMs: totalResponseTime,
    checks,
    services: {
      email: process.env.RESEND_API_KEY ? "configured" : "not_configured",
      storage: process.env.AWS_S3_BUCKET ? "configured" : "not_configured",
      ai: process.env.OPENAI_API_KEY ? "configured" : "not_configured",
      payment: process.env.DINERO_MERCHANT_KEY ? "configured" : "not_configured",
      rateLimiting: process.env.UPSTASH_REDIS_REST_URL ? "upstash" : "in-memory",
    },
  }, { status: isHealthy ? 200 : 503 });
}
