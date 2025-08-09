import client from "./client.ts";

export async function getSource(id: string) {
    return await client.source.findUnique({
        where: { id },
    })
}

export async function getLLM(id: string) {
    return await client.llm.findUnique({
        where: { id },
    })
}
export async function getMemberRoleFromCookie(projectId: string, userId: string) {
    const project = await client.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { team: { some: { userId: userId } } },
                { ownerId: userId },
            ],
        },
        include: {
            team: true
        }
    });
    if (!project || (project.team.length < 1 && project.ownerId != userId)) throw "Unauthorized";
    return project.ownerId == userId ? "admin" : project.team[0].role;
}

