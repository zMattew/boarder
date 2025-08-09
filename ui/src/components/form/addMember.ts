"use server"

import client from "@repo/db/client";
import { TeamRole } from "@prisma/client";

export async function addMember(formData: FormData) {
    const projectId = formData.get("projectId") as string
    if (!projectId) {
        throw new Error("Project is required");
    }
    const email = formData.get("email") as string;
    if (!email) {
        throw new Error("Email is required");
    }
    const user = await client.user.findUnique({where:{email}}) 
    if(!user) throw new Error("No user found")
    const role = formData.get("role") as string as TeamRole;
    if (!role) {
        throw new Error("Role is required");
    }
    await client.teamMember.create({data:{
        project:{connect:{id:projectId}},
        role:role,
        user:{connect:{email:email}}
    }})

}