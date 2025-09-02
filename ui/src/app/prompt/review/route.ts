import { auth } from "@/lib/auth";
import { actionLimiter } from "@/lib/limiter";
import { reviewComponent } from "@repo/core/agent";
import client from "@repo/db/client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user) throw "Unauthorized"
    const { success } = await actionLimiter.limit(session.user.id ?? "")
    if (!success) throw "Too many request"
    const data = await req.formData()
    const component = data.get("component") as string
    const llmId = data.get("provider") as string //ollama local
    const model = data.get("model") as string
    const prompt = data.get("prompt") as string
    const response = await reviewComponent(llmId, model, prompt, component)
    const projectId = req.cookies.get("selected-project")?.value
    const project = await client.project.findUnique({ where: { id: projectId, OR: [{ team: { some: { userId: session.user.id } } }, { ownerId: session.user.id }], llms: { some: { id: llmId } }, view: { some: { components: { some: { id: component } } } } } })
    if (!project) throw "Unauthorized"
    return new Response(response.stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
        }
    })
}