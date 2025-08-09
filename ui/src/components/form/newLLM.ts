"use server"
import { addLLM } from "@/lib/llm"
import { getMemberRole } from "@/lib/role"
import type { Providers } from "@repo/db/client"

export async function createLLM(formData: FormData) {
    const userRole = await getMemberRole()
    if (userRole == "viewer") throw "You can't do this action"
    const projectId = formData.get("projectId") as string
    const label = formData.get("label") as string
    const provider = formData.get("provider") as Providers
    const api = formData.get("api") as string
    const url = formData.get("url") as string

    const response = await addLLM(label, provider, projectId, url, api)

    return response
}