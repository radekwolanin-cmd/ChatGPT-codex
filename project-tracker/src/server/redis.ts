import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

export function getRedis() {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not configured");
  }

  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableAutoPipelining: true,
    });
  }
  return globalForRedis.redis;
}

export async function invalidate(keys: string | string[]) {
  const redis = getRedis();
  const list = Array.isArray(keys) ? keys : [keys];
  if (!list.length) return;
  await redis.del(...list);
}
