"use server"
import client from "@repo/db/client";
import { TeamRole } from "@repo/db/client";
import { getMemberRole } from "./role";
import { actionLimiter } from "./limiter";

export async function changeMemberRole(memberId: string, role: TeamRole) {
    const { userId, role: userRole,selectedProject } = await getMemberRole()
    if (!selectedProject) throw "Select a project"
    if (userRole != "admin") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.teamMember.update({ where: { projectId: selectedProject, id: memberId }, data: { role } })
}

export async function removeMemberRole(memberId: string) {
    const { userId, role: userRole, selectedProject } = await getMemberRole()
    if (!selectedProject) throw "Select a project"
    if (userRole != "admin") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.teamMember.delete({
        where: { id: memberId, projectId: selectedProject }
    })
}