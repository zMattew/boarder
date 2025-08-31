"use server"

import client from "@repo/db/client"
import { getMemberRole } from "./role"
import { actionLimiter } from "./limiter"

export async function addComponent(name: string, sourceId: string, query: string, threadId: string, viewId: string, requiredKeys: string[] = [], description?: string) {
    return await client.component.create({
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
            keys: requiredKeys.length > 0 ? { set: requiredKeys } : undefined,
            source: { connect: { id: sourceId } }
        }
    })
}

export async function removeComponent(projectId: string, componentId: string) {
    const { userId, role } = await getMemberRole()
    if (role == "viewer") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.component.delete({
        where: {
            id: componentId,
            view: { project: { id: projectId } }
        }
    })
}


export async function updateComponent(id: string, name: string, query: string, description: string, keys: string[] = []) {
    return await client.component.update({
        where: { id },
        data: {
            name,
            query,
            description,
            keys
        }
    })
}