"use server"
import { addSource } from '@/lib/source';
import { validateUrl } from '../utils/url';
import { getMemberRole } from '@/lib/role';
import { actionLimiter } from '@/lib/limiter';

export async function createSource(formData: FormData) {
    const { userId, role } = await getMemberRole()
    if (role == "viewer") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"

    const name = formData.get("name") as string;
    if (!name) {
        throw new Error("Name is required");
    }
    const url = formData.get("connection") as string;
    if (!url || !validateUrl(url)) {
        throw new Error("Valid URL is required");
    }
    const projectId = formData.get("projectId") as string
    if (!projectId) {
        throw new Error("Project is required");
    }

    return await addSource(name, url, projectId);
}