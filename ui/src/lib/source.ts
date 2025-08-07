"use server"

import { encrypt } from "#/core/src/crypto"
import client from "#/db/client"
import { getMemberRole } from "./role"

export async function addSource(name: string, connectionUrl: string,projectId:string) {
    const role = await getMemberRole()
    if(role != "admin") throw "You can't do this action"
    connectionUrl = await encrypt(connectionUrl)
    return await client.source.create({
        data: {
            name,
            connectionUrl,
            projectId
        }
    })
}

export async function removeSource(projectId: string, sourceId: string) {
    const role = await getMemberRole()
    if(role != "admin") throw "You can't do this action"
    return await client.source.delete({ where: { projectId, id: sourceId } })
}

export async function editSource(projectId: string, sourceId: string, name?: string, connectionUrl?: string) {
    const role = await getMemberRole()
    if(role != "admin") throw "You can't do this action"
    const data: {name?:string,connectionUrl?:string} = {}
    if(name)
        data.name = name
    if(connectionUrl)
        data.connectionUrl = await encrypt(connectionUrl)
    return await client.source.update({
        where: {
            id: sourceId,
            projectId
        },
        data
    })
}