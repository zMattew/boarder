export const register = async () => {
  if (!process.env.VERCEL && process.env.NODE_ENV == "production" && process.env.NEXT_RUNTIME === "nodejs") {
    const Redis = (await import("ioredis")).default
    const client = new Redis(process.env.REDIS_URL as string)
    const keys = await client.keys('nextjs:*');
    await client.del(keys);
  }
};