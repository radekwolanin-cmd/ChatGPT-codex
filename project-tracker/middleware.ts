import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRedis } from "@/server/redis";

const RATE_LIMIT = 100;
const WINDOW = 60; // seconds

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  try {
    const redis = getRedis();
    const identifier =
      request.headers.get("x-real-ip") ??
      request.headers.get("x-forwarded-for") ??
      request.nextUrl.hostname ??
      "anonymous";
    const key = `rate:${identifier}`;
    const current = Number(await redis.get(key)) || 0;
    if (current >= RATE_LIMIT) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    await redis.multi().incr(key).expire(key, WINDOW).exec();
  } catch (error) {
    console.error("Rate limiter error", error);
  }

  const response = NextResponse.next();
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
