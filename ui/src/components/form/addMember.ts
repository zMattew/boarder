"use server"

import { actionLimiter } from "@/lib/limiter";
import { getMemberRole } from "@/lib/role";
import client from "@repo/db/client";
import { TeamRole } from "@repo/db/client";

export async function addMember(formData: FormData) {
    const {userId,role:userRole} = await getMemberRole()
    if (userRole == "admin") throw "You can't do this action"
    const {success} = await actionLimiter.limit(userId)
    if(!success) throw "Too many request"
    const projectId = formData.get("projectId") as string
    if (!projectId) {
        throw "Project is required"
    }
    const email = formData.get("email") as string;
    if (!email) {
        throw "Email is required"
    }
    const user = await client.user.findUnique({ where: { email } })
    if (!user) throw "No user found"
    const role = formData.get("role") as string as TeamRole;
    if (!role) {
        throw "Role is required"
    }
    await client.teamMember.create({
        data: {
            project: { connect: { id: projectId } },
            role: role,
            user: { connect: { email: email } }
        }
    })

}