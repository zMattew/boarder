"use server"
import client from "#/db/client";
import { TeamRole } from "@prisma/client";
import { getProjectMemberRole } from "./role";

export async function changeMemberRole(projectId: string, memberId: string, role: TeamRole) {
    const userRole = await getProjectMemberRole()
    if (userRole != "admin") throw "You can't do this action"
    return await client.teamMember.update({ where: { projectId: projectId, id: memberId }, data: { role } })
}

export async function removeMemberRole(projectId: string, memberId: string) {
    const userRole = await getProjectMemberRole()
    if (userRole != "admin") throw "You can't do this action"
    return await client.teamMember.delete({
        where: { id: memberId, projectId }
    })
}