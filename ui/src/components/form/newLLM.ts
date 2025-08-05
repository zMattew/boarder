"use server"
import { addLLM } from "@/lib/llm"
import { getProjectMemberRole } from "@/lib/role"
import { Providers } from "@prisma/client"

export async function createLLM(formData: FormData) {
    const userRole = await getProjectMemberRole()
    if (userRole == "viewer") throw "You can't do this action"
    const projectId =formData.get("projectId") as string
    const label =formData.get("label") as string
    const provider =formData.get("provider") as Providers
    const api =formData.get("api") as string
    const url = formData.get("url") as string
    
    const response = await addLLM(label,provider,projectId,url,api)

    return response
}