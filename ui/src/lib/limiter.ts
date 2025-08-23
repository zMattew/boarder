import { Ratelimit } from "@upstash/ratelimit"; 
import { Redis } from "@upstash/redis/node"

const client = new Redis({ url: process.env.KV_REST_API_URL as string, token: process.env.KV_REST_API_TOKEN as string })

export const actionLimiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(30, "20 s"),
    analytics: true,
    prefix: "action",
});

export const dataFetchLimiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "fetch",
});

export const antiBot = new Ratelimit({
    redis: client,
    limiter: Ratelimit.tokenBucket(5, "60 s", 10),
    analytics: true,
    prefix: "antibot",
});
