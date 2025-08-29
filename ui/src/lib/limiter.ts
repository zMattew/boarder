import { Ratelimit } from "@upstash/ratelimit";
import type { SetCommandOptions } from "@upstash/redis"


type RatelimitRedisClient = {
    get: <TData>(key: string) => Promise<TData | null>;
    set: <TData>(key: string, value: TData, options?: Pick<SetCommandOptions, "ex">) => Promise<"OK" | TData | null>;
    sadd: <TData>(key: string, ...members: TData[]) => Promise<number>;
    zincrby: <TData>(key: string, increment: number, member: TData) => Promise<number>
    eval: <TArgs extends unknown[], TData = unknown>(
        script: string,
        keys: string[],
        args: TArgs
    ) => Promise<TData>;
    scriptLoad: (script: string) => Promise<string>;
    smismember: (key: string, members: unknown[]) => Promise<(0 | 1)[]>;
    evalsha: <TData>(sha1: string, keys: string[], args: unknown[]) => Promise<TData>;
    hset: <TData>(key: string, kv: Record<string, TData>) => Promise<number>;
}

const client = await (process.env.VERCEL ?
    (async () => {
        const Redis = (await import("@upstash/redis")).Redis
        const client = new Redis({ url: process.env.KV_REST_API_URL as string, token: process.env.KV_REST_API_TOKEN as string })
        return client
    })
    :
    (async () => {
        const Redis = (await import("ioredis")).default
        const client = new Redis(process.env.REDIS_URL as string);

        return {
            get: async<TData>(key: string) => client.get(key) as TData,
            set: async<TData>(key: string, value: TData, options?: Pick<SetCommandOptions, "ex">) => {
                if (options?.ex) {
                    return client.set(key, value as string | number | Buffer<ArrayBufferLike>, 'EX', options.ex)
                }
                return client.set(key, value as string | number | Buffer<ArrayBufferLike>);
            },
            sadd: async<TData>(key: string, ...members: TData[]) =>
                client.sadd(key, ...members.map(String)),
            zincrby: async <TData>(key: string, increment: number, member: TData) => Number(client.zincrby(key, increment, member as string | number | Buffer<ArrayBufferLike>)),
            eval: async<TArgs extends unknown[], TData = unknown>(
                script: string,
                keys: string[],
                args: TArgs
            ) => client.eval(script, keys.length, ...keys, ...(args ?? []).map(String)) as Promise<TData>,
            scriptLoad: async (script: string) => client.script('LOAD', script) as Promise<string>,
            smismember: async (key: string, members: unknown[]) =>
                client.smismember(key, ...(members as string[])) as Promise<(0 | 1)[]>,
            evalsha: async<TData>(sha1: string, keys: string[], args: unknown[]) =>
                client.evalsha(sha1, keys.length, ...keys, ...(args as string[])) as Promise<TData>,
            hset: async<TData>(key: string, kv: Record<string, TData>) => client.hset(key, kv),
        } satisfies RatelimitRedisClient
    }))()


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
