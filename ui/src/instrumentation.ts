export const register = async () => {
  if (!process.env.VERCEL)
    if (process.env.NODE_ENV == "production" && process.env.NEXT_RUNTIME === "nodejs") {
      const { registerInitialCache } = await import(
        "@fortedigital/nextjs-cache-handler/instrumentation"
      );
      const CacheHandler = (await import("../cache-handler.mjs")).default;
      await registerInitialCache(CacheHandler);
      const Redis = (await import("ioredis")).default
      const client = new Redis(process.env.REDIS_URL as string)
      await client.del('nextjs:/login'); //deleting login cache page that isn't showing the right third party provider
    }
};