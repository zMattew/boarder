"use server"

import { encrypt } from "@repo/core/crypto"
import client from "@repo/db/client"
import { getMemberRole } from "./role"
import { actionLimiter } from "./limiter"

export async function addSource(name: string, connectionUrl: string) {
    const { userId, role, selectedProject } = await getMemberRole()
    if (!selectedProject) throw "Select a project"
    if (role != "admin") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    connectionUrl = await encrypt(connectionUrl)
    return await client.source.create({
        data: {
            name,
            connectionUrl,
            projectId: selectedProject
        }
    })
}

export async function removeSource(sourceId: string) {
    const { userId, role, selectedProject } = await getMemberRole()
    if (!selectedProject) throw "Select a project"
    if (role != "admin") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.source.delete({ where: { projectId: selectedProject, id: sourceId } })
}

export async function editSource(sourceId: string, name?: string, connectionUrl?: string) {
    const { userId, role, selectedProject } = await getMemberRole()
    if (!selectedProject) throw "Select a project"
    if (role != "admin") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    const data: { name?: string, connectionUrl?: string } = {}
    if (name)
        data.name = name
    if (connectionUrl)
        data.connectionUrl = await encrypt(connectionUrl)
    return await client.source.update({
        where: {
            id: sourceId,
            projectId: selectedProject
        },
        data
    })
}