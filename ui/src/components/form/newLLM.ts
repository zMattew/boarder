"use server"
import { actionLimiter } from "@/lib/limiter"
import { addLLM } from "@/lib/llm"
import { getMemberRole } from "@/lib/role"
import type { Providers } from "@repo/db/client"

export async function createLLM(formData: FormData) {
    const { userId,role } = await getMemberRole()
    if (role == "viewer") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    const projectId = formData.get("projectId") as string
    const label = formData.get("label") as string
    const provider = formData.get("provider") as Providers
    const api = formData.get("api") as string
    const url = formData.get("url") as string

    const response = await addLLM(label, provider, projectId, url, api)

    return response
}