import { dbEncryptedPool } from "@repo/core/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import client from "@repo/db/client";
import { dataFetchLimiter } from "@/lib/limiter";

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) throw "Unauthorized"
        const { success } = await dataFetchLimiter.limit(session.user.id ?? "")
        if (!success) throw "Too many request"
        const reqData = await req.formData()
        const componentId = reqData.get("componentId") as string
        const component = await client.component.findUnique({ where: { id: componentId, OR: [{ view: { project: { team: { some: { userId: session.user.id } } } } }, { view: { project: { ownerId: session.user.id } } }] }, include: { source: true } })
        if (!component) throw "Component not found or unauthorized"
        try {
            const { client: db, protocol } = await dbEncryptedPool(component.source.connectionUrl)
            let response = {}
            const skip = parseInt(reqData.get("skip")?.toString() ?? "0")
            const limit = parseInt(reqData.get("limit")?.toString() ?? "25")
            switch (protocol) {
                case "postgres":
                case 'postgresql':
                    const { rows, fields } = await db.query(`${component.query} LIMIT $1 OFFSET $2`, [limit, skip])
                    response = { rows: rows, type: fields }
                    db.release()
                    break
                case 'mysql':
                    const [res, typ] = await db.query(`${component.query} LIMIT $1 OFFSET $2`, [limit, skip]) // to test
                    response = { rows: res, type: typ }
                    db.end()
                    break
            }
            return Response.json(response)
        } catch (error) {
            console.log(error)
            return Response.json({ error: error }, { status: 503 })
        }
    } catch (error) {
        return Response.json({ error: error }, { status: 401 })
    }
}