"use server"
import { validateUrl } from '#/utils/url';
import { addSource } from '@/lib/source';

export async function createSource(formData: FormData) {
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