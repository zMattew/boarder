"use server"
import client from "@repo/db/client";
import { TeamRole } from "@repo/db/client";
import { getMemberRole } from "./role";
import { actionLimiter } from "./limiter";

export async function changeMemberRole(projectId: string, memberId: string, role: TeamRole) {
    const { userId, role: userRole } = await getMemberRole()
    if (userRole != "admin") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.teamMember.update({ where: { projectId: projectId, id: memberId }, data: { role } })
}

export async function removeMemberRole(projectId: string, memberId: string) {
    const { userId, role: userRole } = await getMemberRole()
    if (userRole != "admin") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.teamMember.delete({
        where: { id: memberId, projectId }
    })
}