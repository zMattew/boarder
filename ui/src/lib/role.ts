import { cookies } from "next/headers";
import { auth } from "./auth";
import { getMemberRoleFromCookie } from "@repo/db";

export async function getMemberRole() {
    const session = await auth();
    if (!session?.user?.id) throw "Unauthorized";
    const projectId = (await cookies()).get("selected-project")?.value as string;
    return {userId:session.user.id,role:await getMemberRoleFromCookie(projectId, session.user.id),selectedProject:projectId};
}


