"use server"
import { Prisma } from "@repo/db/client";
import { getMemberRole } from "./role";
import client from "@repo/db/client";
import { actionLimiter } from "./limiter";

export async function addView(name: string) {
    const { userId, role, selectedProject } = await getMemberRole()
    if (role == "viewer") throw "You can't do this action"
    if (!selectedProject) throw "Select a project"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.view.create({
        data: {
            name,
            projectId: selectedProject
        }
    })
}

export async function deleteView(viewId: string) {
    const { userId, role, selectedProject } = await getMemberRole()
    if (role != "admin") throw "You can't do this action"
    if (!selectedProject) throw "Select a project"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.view.delete({ where: { id: viewId, projectId: selectedProject } })
}
export async function saveViewState(viewId: string, viewMeta: Record<string, unknown>, components: { id: string; meta: Record<string, unknown> }[]) {
    const { userId, role } = await getMemberRole()
    if (role == "viewer") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    await client.view.update({
        where: { id: viewId },
        data: {
            meta: viewMeta as Prisma.InputJsonObject,
            components: {
                updateMany: components.map((c) => (
                    { where: { id: c.id, viewId: viewId }, data: { meta: c.meta as Prisma.InputJsonObject } }
                ))
            }
        }
    })
}
