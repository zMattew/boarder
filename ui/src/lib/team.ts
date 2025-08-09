"use server"
import client from "@repo/db/client";
import { TeamRole } from "@repo/db/client";
import { getMemberRole } from "./role";

export async function changeMemberRole(projectId: string, memberId: string, role: TeamRole) {
    const userRole = await getMemberRole()
    if (userRole != "admin") throw "You can't do this action"
    return await client.teamMember.update({ where: { projectId: projectId, id: memberId }, data: { role } })
}

export async function removeMemberRole(projectId: string, memberId: string) {
    const userRole = await getMemberRole()
    if (userRole != "admin") throw "You can't do this action"
    return await client.teamMember.delete({
        where: { id: memberId, projectId }
    })
}