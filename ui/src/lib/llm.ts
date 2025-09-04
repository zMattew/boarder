"use server"
import { encrypt } from "@repo/core/crypto";
import client from "@repo/db/client";
import type { Providers } from "@repo/db/client";
import { getMemberRole } from "./role";
import { actionLimiter } from "./limiter";

export async function addLLM(label: string, provider: Providers, url?: string, api?: string) {
    const { userId, role, selectedProject } = await getMemberRole()
    if (role != "admin") throw "You can't do this action"
    if (!selectedProject) throw "Select a project"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    const apiKey = api ? await encrypt(api) : undefined
    return await client.llm.create({
        data: {
            provider,
            url,
            apiKey,
            label,
            projectId: selectedProject,
        }
    })
}

export async function removeLLM(projectId: string, llmId: string) {
    const { userId, role } = await getMemberRole()
    if (role != "admin") throw "You can't do this action"
    const { success } = await actionLimiter.limit(userId)
    if (!success) throw "Too many request"
    return await client.llm.delete({
        where: {
            id: llmId,
            projectId: projectId
        }
    })

}