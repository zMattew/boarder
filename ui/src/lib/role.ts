import { cookies } from "next/headers";
import { auth } from "./auth";
import client from "#/db/client";

export async function getProjectMemberRole() {
    const session = await auth();
    if (!session?.user) throw "Unauthorized";
    const projectId = (await cookies()).get("selected-project")?.value as string;
    const project = await client.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { team: { some: { userId: session.user.id } } },
                { ownerId: session.user.id },
            ],
        },
        include:{
            team:true
        }
    });
    if (!project || (project.team.length < 1 && project.ownerId != session.user.id)) throw "Unauthorized";
    return project.ownerId == session.user.id ? "admin" : project.team[0].role;
}