import { auth } from "@/lib/auth";
import { actionLimiter } from "@/lib/limiter";
import { ToolMessage, ComponentRespones, reviewComponent } from "@repo/core/agent";
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
    const project = await client.project.findUnique({ where: { id: projectId, OR: [{ team: { some: { userId: session.user.id } } }, { ownerId: session.user.id }], llms: { some: { id: llmId } },view:{some:{components:{some:{id:component}}}} } })
    if (!project) throw "Unauthorized"
    return new Response(new ReadableStream({
        async pull(controller) {
            try {
                const { value, done } = await response.stream.next()

                if (done) {
                    controller.close()
                } else {
                    if (value?.tools?.messages) {
                        if (value.tools.messages instanceof Array) {
                            const toolMessage = value.tools.messages[0] as ToolMessage
                            controller.enqueue(JSON.stringify({ tool: toolMessage.name, status: toolMessage.status }))
                        }
                    }
                    if (value?.generate_structured_response) {
                        const component = (value?.generate_structured_response as { structuredResponse: ComponentRespones }).structuredResponse
                        controller.enqueue(JSON.stringify({ component, threadId: response.threadId, sourceId: component }))
                    }

                }
            } catch (error) {
                controller.enqueue(JSON.stringify({ error: `${error}` }))
                controller.close()
            }
        }
    }), {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
        },
    })
}