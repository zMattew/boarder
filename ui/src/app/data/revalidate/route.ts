import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import client from "@repo/db/client";
import { revalidateTag } from "next/cache";
import { dataFetchLimiter } from "@/lib/limiter";

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) throw "Unauthorized"
        const { success, } = await dataFetchLimiter.limit(session.user.id ?? "")
        if (!success) throw "Too many request"
        const reqData = await req.formData()
        const componentId = reqData.get("componentId") as string
        const component = await client.component.findUnique({ where: { id: componentId, OR: [{ view: { project: { team: { some: { userId: session.user.id } } } } }, { view: { project: { ownerId: session.user.id } } }] }, include: { source: true } })
        if (!component) throw "Component not found or unauthorized"
        revalidateTag(componentId)
        return Response.json({ status: "ok", id: componentId })
    } catch (error) {
        console.log(error)
        return Response.json({ error: error }, { status: 401 })
    }
}