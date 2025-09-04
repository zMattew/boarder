import { auth } from "@/lib/auth";
import { newComponentO } from "@/lib/form";
import { actionLimiter } from "@/lib/limiter";
import { promptComponent } from "@repo/core/agent";
import client from "@repo/db/client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user) throw "Unauthorized"
    const { success } = await actionLimiter.limit(session.user.id ?? "")
    if (!success) throw "Too many request"
    const form = await req.formData()
    const parse = newComponentO.safeParse(Object.fromEntries(form.entries()))
    if (parse.error) throw parse.error
    const projectId = req.cookies.get("selected-project")?.value
    const project = await client.project.findUnique({ where: { id: projectId, OR: [{ team: { some: { userId: session.user.id } } }, { ownerId: session.user.id }], llms: { some: { id: parse.data.provider } }, sources: { some: { id: parse.data.source } } } })
    if (!project) throw "Unauthorized"
    const response = await promptComponent(parse.data.provider, parse.data.model, parse.data.prompt, parse.data.source)
    return new Response(response.stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
        },
    })
}