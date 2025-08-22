"use server"
import client from "@repo/db/client";
import { auth } from "@/lib/auth";
import { TeamRole } from "@repo/db/client";
import { cookies } from "next/headers";


export async function setProjectCookie(projectId: string) {
    (await cookies()).set(`selected-project`, projectId)
}

export async function getUserProject() {
    const session = await auth()
    if (!session?.user) throw new Error("Auth failed")
    return (await client.project.findMany({
        where: {
            OR: [
                {
                    team: {
                        some: {
                            userId: session.user.id
                        }
                    }
                },
                {
                    ownerId: session.user.id
                }
            ],
        },
        include: {
            view: {
                include: {
                    components: {
                        select: {
                            id: true, name: true, meta: true, viewId: true,
                            source: { select: { id: true, name: true } },
                            description: true, query: true, keys: true
                        }
                    },
                },
            },
            team: { include: { user: true } },
            sources: { select: { id: true, name: true, components: true } },
            owner: true,
            llms: { select: { id: true, label: true, provider: true } }
        }
    })).map((project) => {
        if (project.ownerId == session.user?.id) return { ...project, role: "admin" } as typeof project & { role: TeamRole }
        const role = project.team.find((member) => member.userId == session.user?.id)!.role
        const authorizedProject: Partial<typeof project> & Omit<typeof project, "llms" | "sources" | "team"> & { role: TeamRole } = { id: project.id, owner: project.owner, ownerId: project.ownerId, name: project.name, view: project.view, role: role }
        switch (role) {
            case "admin":
                authorizedProject.team = project.team
            case "editor":
                authorizedProject.sources = project.sources
                authorizedProject.llms = project.llms
            case "viewer":
                authorizedProject.view = project.view
        }
        return authorizedProject
    })
}

export async function deleteProject(projectId: string) {
    const session = await auth()
    if (!session) throw "You can't done this action"
    try {
        return await client.project.delete({ where: { id: projectId, ownerId: session.user?.id } })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        throw "Only the owner can delete the project"
    }
}
