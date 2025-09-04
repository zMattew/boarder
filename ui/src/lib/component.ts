"use server"

import client from "@repo/db/client"
import { getMemberRole } from "./role"
import { actionLimiter } from "./limiter"
import { Redis } from "ioredis"
export async function addComponent(name: string, sourceId: string, query: string, threadId: string, viewId: string, requiredKeys: string[] = [], description?: string) {
    const redis = new Redis(process.env.REDIS_URL as string)
    const index = await redis.zcount(`llm:${threadId}`, '-inf', '+inf')
    const history = (await redis.zrange(`llm:${threadId}`, 0, index)).map((v) => JSON.parse(v))
    if (!history) throw "Query exipred, please prompt again"
    const component = await client.component.create({
        data: {
            name,
            query,
            description,
            threadId,
            view: {
                connect: {
                    id: viewId
                }
            },
            history: { set: history },
            keys: requiredKeys.length > 0 ? { set: requiredKeys } : undefined,
            source: { connect: { id: sourceId } }
        }
    })
    await redis.del(`llm:${threadId}`)
    return component
}

export async function removeComponent(componentId: string) {
    const { userId, role, selectedProject } = await getMemberRole()
    if (role == "viewer") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.component.delete({
        where: {
            id: componentId,
            view: { project: { id: selectedProject } }
        }
    })
}


export async function updateComponent(id: string, name: string, query: string, description: string, threadId: string, keys: string[] = []) {
    const redis = new Redis(process.env.REDIS_URL as string)
    const index = await redis.zcount(`llm:${threadId}`, '-inf', '+inf')
    const history = (await redis.zrange(`llm:${threadId}`, 0, index)).map((v) => JSON.parse(v))
    if (!history) throw "Query exipred, please prompt again"
    const component = await client.component.update({
        where: { id },
        data: {
            name,
            query,
            description,
            keys,
            history
        }
    })
    await redis.del(`llm:${threadId}`)

    return component
}