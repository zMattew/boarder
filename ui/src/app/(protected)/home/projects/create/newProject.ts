"use server"

import client from "#/db/client"

export async function newProject(formData: FormData) {
    const name = formData.get('name') as string
    const userId = formData.get('userId') as string

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