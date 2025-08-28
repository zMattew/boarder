import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import client from "@repo/db/client";
import { dataFetchLimiter } from "@/lib/limiter";

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) throw "Unauthorized"
        const { success, } = await dataFetchLimiter.limit(session.user.id ?? "")
        if (!success) throw "Too many request"
        const reqData = await req.formData()
        const llmId = reqData.get("llmId") as string
        const llm = await client.llm.findUnique({ where: { id: llmId, project: { OR: [{ team: { some: { userId: session.user.id } } }, { ownerId: session.user.id }] } } })
        if (!llm) throw "LLM not found or unauthorized"
        switch (llm.provider) {
            case "ollama":
                const res = await fetch(llm.url + "/api/tags")
                if (!res.ok) return Response.json([])
                const data = await res.json() as { models: ({ name: string } & Record<string, unknown>)[] }
                return Response.json(data.models.map((d) => (d.name)))
            default: return Response.json([])
        }
    } catch (error) {
        console.log(error)
        return Response.json({ error: error }, { status: 401 })
    }
}