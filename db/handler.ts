"use server"
import { client } from "./client";

export async function getSource(id: string) {
    return await client.source.findUnique({
        where: { id },
    })
}

export async function getLLM(id: string) {
    return await client.llm.findUnique({
        where: { id },
    })
}

