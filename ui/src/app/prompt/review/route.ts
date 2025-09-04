import { auth } from "@/lib/auth";
import { reviewComponentO } from "@/lib/form";
import { actionLimiter } from "@/lib/limiter";
import { reviewComponent } from "@repo/core/agent";
import client from "@repo/db/client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user) throw "Unauthorized"
    const { success } = await actionLimiter.limit(session.user.id ?? "")
    if (!success) throw "Too many request"
    const form = await req.formData()
    const parse = reviewComponentO.safeParse(Object.fromEntries(form.entries()))
    if (parse.error) throw parse.error
    const response = await reviewComponent(parse.data.provider, parse.data.model, parse.data.prompt, parse.data.component)
    const projectId = req.cookies.get("selected-project")?.value
    const project = await client.project.findUnique({ where: { id: projectId, OR: [{ team: { some: { userId: session.user.id } } }, { ownerId: session.user.id }], llms: { some: { id: parse.data.provider } }, view: { some: { components: { some: { id: parse.data.component } } } } } })
    if (!project) throw "Unauthorized"
    return new Response(response.stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
        }
    })
}