"use server"

import { actionLimiter } from "@/lib/limiter"
import client from "@repo/db/client"

export async function newProject(formData: FormData) {
    const name = formData.get('name') as string
    const userId = formData.get('userId') as string
    const {success} = await actionLimiter.limit(userId)
    if(!success) throw "Too many request"
    return await client.project.create({
        data: {
            name: name,
            owner: {
                connect: {
                    id: userId
                }
            }
        }
    })
}