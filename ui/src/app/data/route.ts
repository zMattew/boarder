import { dbEncryptedPool } from "#/core/src/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import client from "#/db/client";

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) throw "Unauthorized"
        const reqData = await req.formData()
        const componentId = reqData.get("componentId") as string
        const component = await client.component.findUnique({ where: { id: componentId, OR: [{ view: { project: { team: { some: { userId: session.user.id } } } } }, { view: { project: { ownerId: session.user.id } } }] }, include: { source: true } })
        if (!component) throw "Component not found or unauthorized"
        try {
            const { client: db, protocol } = await dbEncryptedPool(component.source.connectionUrl)
            let response = {}
            switch (protocol) {
                case "postgres":
                case 'postgresql':
                    const { rows, fields } = await db.query(component.query)
                    response = { rows: rows, type: fields }
                    db.release()
                    break
                case 'mysql':
                    const [res, typ] = await db.query(component.query)
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