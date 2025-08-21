"use server"

import { promptComponent, reviewComponent } from "@repo/core/agent"
import client from "@repo/db/client"
import { getMemberRole } from "./role"

export async function addComponent(name: string, sourceId: string, query: string, threadId: string, viewId: string, requiredKeys: string[] = [], description?: string) {
    const userRole = await getMemberRole()
    if (userRole == "viewer") throw "You can't do this action"
    return await client.component.create({
        data: {
            name,
            query,
            description,
            threadId,
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
    const userRole = await getMemberRole()
    if (userRole == "viewer") throw "You can't do this action"
    return await client.component.delete({
        where: {
            id: componentId,
            view: { project: { id: projectId } }
        }
    })
}


export async function updateComponent(id: string, name: string,description:string,query:string,keys:string[] = []) {
    return await client.component.update({
        where: { id },
        data: {
            name,
            description,
            query,
            keys
        }
    })
}
export async function prompt(formData: FormData) {
    const userRole = await getMemberRole();
    if (userRole == "viewer") throw "You can't do this action";
    const source = formData.get("source") as string;
    const view = formData.get("view") as string;
    const provider = formData.get("provider") as string;
    const model = formData.get("model") as string;
    const prompt = formData.get("prompt") as string;

    const { component, threadId } = await promptComponent(provider, model, prompt, source);

    return await addComponent(
        component.name,
        source,
        component.query,
        threadId,
        view,
        component.keys,
        component.description
    );
}

export async function review(formData: FormData) {
    const userRole = await getMemberRole();
    if (userRole == "viewer") throw "You can't do this action";
    const componentId = formData.get("component") as string;
    const provider = formData.get("provider") as string;
    const model = formData.get("model") as string;
    const prompt = formData.get("prompt") as string;

    const component = await reviewComponent(provider, model, prompt, componentId);

    return await updateComponent(
        componentId,
        component.name,
        component.description,
        component.query,
        component.keys
    );
}
