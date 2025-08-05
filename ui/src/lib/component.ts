"use server"

import { promptComponent } from "#/core/src/agent"
import client from "#/db/client"
import { getProjectMemberRole } from "./role"

export async function addComponent(name: string, sourceId: string, query: string, prompt: string[], viewId: string, requiredKeys: string[] = [], description?: string) {
    const userRole = await getProjectMemberRole()
    if (userRole == "viewer") throw "You can't do this action"
    return await client.component.create({
        data: {
            name,
            query,
            description,
            prompt: { set: prompt },
            view: {
                connect: {
                    id: viewId
                }
            },
            keys: requiredKeys.length > 0 ? { set: requiredKeys } : undefined,
            source: { connect: { id: sourceId } }
        }
    })
}

export async function removeComponent(projectId: string, componentId: string) {
    const userRole = await getProjectMemberRole()
    if (userRole == "viewer") throw "You can't do this action"
    return await client.component.delete({
        where: {
            id: componentId,
            view: { project: { id: projectId } }
        }
    })
}
export async function prompt(formData: FormData) {
    const userRole = await getProjectMemberRole();
    if (userRole == "viewer") throw "You can't do this action";
    const source = formData.get("source") as string;
    const view = formData.get("view") as string;
    const provider = formData.get("provider") as string;
    const model = formData.get("model") as string;
    const prompt = formData.get("prompt") as string;
    const session = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("hex");

    const response = await promptComponent(provider, model, prompt, source, session);

    return await addComponent(
        response.name,
        source,
        response.query,
        [prompt],
        view,
        response.keys,
        response.description
    );
}
