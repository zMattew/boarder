import { auth } from "@/lib/auth";
import { actionLimiter } from "@/lib/limiter";
import { promptComponent } from "@repo/core/agent";
import client from "@repo/db/client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user) throw "Unauthorized"
    const { success } = await actionLimiter.limit(session.user.id ?? "")
    if (!success) throw "Too many request"
    const data = await req.formData()
    const source = data.get("source") as string
    const llmId = data.get("provider") as string //ollama local
    const model = data.get("model") as string
    const prompt = data.get("prompt") as string
    const projectId = req.cookies.get("selected-project")?.value
    const project = await client.project.findUnique({ where: { id: projectId, OR: [{ team: { some: { userId: session.user.id } } }, { ownerId: session.user.id }], llms: { some: { id: llmId } }, sources: { some: { id: source } } } })
    if (!project) throw "Unauthorized"
    const response = await promptComponent(llmId, model, prompt, source)
    return new Response(response.stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
        },
    })
}