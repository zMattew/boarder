"use server"
import { InputJsonObject } from "@prisma/client/runtime/library";
import { getMemberRole } from "./role";
import client from "#/db/client";

export async function addView(name: string, projectId: string) {
    return await client.view.create({
        data: {
            name,
            projectId
        }
    })
}

export async function deleteView(projectId: string, viewId: string) {
    const userRole = await getMemberRole()
    if (userRole != "admin") throw "You can't do this action"
    return await client.view.delete({ where: { id: viewId, projectId } })
}
export async function saveViewState(viewId: string, viewMeta: Record<string, unknown>, components: { id: string; meta: Record<string, unknown>} []) {
    const userRole = await getMemberRole()
    if (userRole == "viewer") throw "You can't do this action"
    await client.view.update({
        where: { id: viewId },
        data: {
            meta: viewMeta as InputJsonObject,
            components: {
                updateMany: components.map((c) => (
                    { where: { id: c.id, viewId: viewId }, data: { meta: c.meta as InputJsonObject } }
                ))
            }
        }
    })
}
