"use server"
import client from "@repo/db/client";
import type { TeamRole } from "@repo/db/client";
import { getMemberRole } from "./role";
import { actionLimiter } from "./limiter";

export async function changeMemberRole(memberId: string, role: TeamRole) {
    const { userId, role: userRole, selectedProject } = await getMemberRole()
    if (userRole != "admin") throw "You can't do this action"
    if (!selectedProject) throw "Select a project"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.teamMember.update({ where: { projectId: selectedProject, id: memberId }, data: { role } })
}

export async function removeMemberRole(memberId: string) {
    const { userId, role: userRole, selectedProject } = await getMemberRole()
    if (userRole != "admin") throw "You can't do this action"
    if (!selectedProject) throw "Select a project"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.teamMember.delete({
        where: { id: memberId, projectId: selectedProject }
    })
}

export async function addMember(email: string, role: TeamRole) {
    const { userId, role: userRole, selectedProject } = await getMemberRole()
    if (userRole == "admin") throw "You can't do this action"
    if (!selectedProject) throw "Select a project"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    const user = await client.user.findUnique({ where: { email } })
    if (!user) throw "No user found"
    await client.teamMember.create({
        data: {
            project: { connect: { id: selectedProject } },
            role: role,
            user: { connect: { email: email } }
        }
    })

}