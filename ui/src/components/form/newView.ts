"use server"
import { actionLimiter } from "@/lib/limiter";
import { getMemberRole } from "@/lib/role";
import { addView } from "@/lib/view";

export async function createView(formData: FormData) {
    const { userId, role } = await getMemberRole()
    if (role == "viewer") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    const name = formData.get("name") as string;
    if (!name) {
        throw new Error("Name is required");
    }
    const projectId = formData.get("projectId") as string
    if (!projectId) {
        throw new Error("Project is required");
    }
    return await addView(name, projectId);
}