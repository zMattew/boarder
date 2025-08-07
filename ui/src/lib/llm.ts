"use server"
import { encrypt } from "#/core/src/crypto";
import client from "#/db/client";
import { Providers } from "@prisma/client";
import { getMemberRole } from "./role";

export async function addLLM(label:string,provider:Providers,projectId:string,url?:string,api?:string){
    const role = await getMemberRole()
    if(role != "admin") throw "You can't do this action"
    const apiKey = api ? await encrypt(api) : undefined
    return await client.llm.create({
        data:{
            provider,
            url,
            apiKey,
            label,
            projectId,
        }
    })
}

export async function removeLLM(projectId:string,llmId:string){
    const role = await getMemberRole()
    if(role != "admin") throw "You can't do this action"
    return await client.llm.delete({
        where:{
            id:llmId,
            projectId:projectId
        }
    })

}