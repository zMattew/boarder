"use server"
import { addView } from "@/lib/view";

export async function createView(formData: FormData) {
    const name = formData.get("name") as string;
    if (!name) {
        throw new Error("Name is required");
    }
    const projectId = formData.get("projectId") as string
    if (!projectId) {
        throw new Error("Project is required");
    }
    await addView(name, projectId);
}