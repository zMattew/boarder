
import { tool } from "@langchain/core/tools";
import { dbIntrospection, testSQLQuery } from "./db.ts"
import { z } from "zod"
import Components from "./components.ts"
import { initChatModel } from "langchain/chat_models/universal";
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import type { RunnableConfig } from "@langchain/core/runnables"
import { Redis } from "ioredis"
import { SystemMessage, ToolMessage, } from "@langchain/core/messages"
import { getLLM, getComponent } from "@repo/db"
import { decrypt } from "./crypto.ts"
import { availableLLMs } from './llms.ts';
import type { Providers } from "@repo/db/client"
import { MemorySaver, UpdateType } from "@langchain/langgraph";
import { IterableReadableStream } from "@langchain/core/utils/stream";
export { ToolMessage } from "@langchain/core/messages"

const getSchema = tool(async (input: Record<string, any>, config: RunnableConfig) => {
    const sourceId = config.configurable?.sourceId
    return await dbIntrospection(sourceId)
},
    { name: "get_database_schema", description: "Retrive the database schema of the given source", schema: z.object({}) })
const testDbQuery = tool(async ({ query }, config: RunnableConfig) => {
    const sourceId = config.configurable?.sourceId
    return await testSQLQuery(sourceId, query)
}, { name: "test_query", description: "Try to execute the query to catch any error", schema: z.object({ query: z.string().describe("safe SQL query") }) })
const getComponents = tool(async () => JSON.stringify(Components), { name: "get_components_list", description: "Retrive the available components", schema: z.object({}) })


const COMPONENT_SYSTEM_PROMT = `You are an assistant that generate the component metadata based on user input.
    The user will ask to create a type of component with the data that can be found in the database. 
    Your role is to fullfil every needed aspect from the component choose to the query to execute to retrive data:
        - Before generating the query you must be aware of the current database schema.
        - The sql query must only retrive data from the current database.
        - The sql query must not use ; at the end.
        - You can't generate a query to modifiy the database schema.
        - The generated query must be tested to proceed with the final output.
        - The component will be choosen once the test_quert tools is executed with success.
        - The component name must be choose from the component list. It must be or "chart" or "table" . 
        - If user ask 'create a table' should be interpeted as he wants to use a table component. 
        - If the choosen component has field 'requiredKeysDescription' you must add to the final output a field 'keys' where for each 'requiredKeysDescription' entry you must use a column name inside the query output type based on the 'requiredKeysDescription' string that describe what column should be used. If 'requiredKeysDescription' you can omit the keys field in the final output.
        - If the chosen component is a chart, the query should be ordered by the x axis in ascent mode if the chosen key for the x field is a Date type. Don't follow this instruction if the user explictly ask for another order.
    To create a component you must use this tool step by step:
        1) get_components_list: to retrive components list to choose from
        2) get_database_schema: to retrive the current database schema as pg_dump for generate a query based on user prompt
        3) test_query: use the generated query to test it, if is not successful you must reiterate this tool to adjust the query based on passed error
    Once you arrived to the end of this cycle you can output the generated query, the choosen component name and a description of it with (if needed) keys choosen from the query output type. 
    In the final output you must always return valid JSON fenced by a markdown code block. Do not return any additional text.`
const COMPONENT_REVIEW_PROMT = `The user request require a review of the output. Choose what to chage based on user prompt and current component.`
const responseFormat = z.object({
    name: z.enum(["chart", "table"]).describe("Name of the component from the given components list"),
    description: z.string().describe("Brief description of the serve to the user"),
    query: z.string().describe("Query to retrive the data from the database. Without the ending closure ';'"),
    keys: z.array(z.string().describe("Required key requested by choosen component.It must be a key found inside the query output fields.").describe("Required keys requested by choosen component having the same length. They must be keys found inside the query output fields.")).default([]).optional()
})
export type ComponentRespones = z.infer<typeof responseFormat>

async function initAgent(providerId: string, model: string): Promise<ReturnType<typeof createReactAgent>> {
    const provider = await getLLM(providerId)
    if (!provider) throw new Error("No llm provider found")

    const apiKey = provider.apiKey ? await decrypt(provider.apiKey) : undefined
    const providerName = availableLLMs[provider.provider as Providers].effectiveName ? availableLLMs[provider.provider as Providers].effectiveName : provider.provider
    const llm = await initChatModel(model, { modelProvider: providerName, baseUrl: provider?.url ? provider.url : undefined, apiKey: apiKey ? apiKey : undefined, streaming: true })
    const checkpointer = new MemorySaver();
    return createReactAgent({
        llm,
        tools: [getSchema, testDbQuery, getComponents],
        checkpointer,
        checkpointSaver: checkpointer,
        responseFormat,
    })
}


export async function promptComponent(llmId: string, model: string, prompt: string, sourceId: string) {
    const threadId = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("hex");

    const agent = await initAgent(llmId, model)

    const messages = [new SystemMessage(COMPONENT_SYSTEM_PROMT), { role: "user", content: prompt }]
    const response = await agent.stream({ messages }, { configurable: { sourceId, thread_id: threadId }, },)
    const history: (Buffer | number)[] = [0, Buffer.from(JSON.stringify(messages[1]))]
    let index = 1
    return {
        stream: new ReadableStream({
            pull: async (controller) => await handleUpdate(controller, response, threadId, sourceId, history, index)
        }), threadId
    }
}


export async function reviewComponent(llmId: string, model: string, prompt: string, componentId: string) {
    const component = await getComponent(componentId)
    if (!component) throw "Component not Found"
    const agent = await initAgent(llmId, model)
    const currentComponent = {
        name: component.name,
        description: component.description,
        query: component.query,
        keys: component.keys
    }
    if (!component.threadId) throw "No history found"
    const messages = [ ...component.history, { role: "ai", content: `${COMPONENT_REVIEW_PROMT}\nCurrent component:${JSON.stringify(currentComponent)}` }, { role: "user", content: prompt }]
    const response = await agent.stream({ messages:[new SystemMessage(COMPONENT_SYSTEM_PROMT),...messages] }, { configurable: { sourceId: component.source.id, thread_id: component.threadId } })
    const newHistory: (Buffer | number)[] = messages.map((m,i)=>([i,Buffer.from(JSON.stringify(m))])).flat()
    return {
        stream: new ReadableStream({
            pull: async (controller) => await handleUpdate(controller, response, component.threadId!, component.sourceId, newHistory, component.history.length + 1)
        })
    }

}

async function handleUpdate(controller: ReadableStreamDefaultController<any>, response: IterableReadableStream<Record<any, UpdateType<any>>>, threadId: string, sourceId: string, history: (Buffer | number)[], index: number) {
    try {
        const { value, done } = await response.next()

        if (done) {
            controller.close()
            const client = new Redis(process.env.REDIS_URL as string)
            await client.multi()
                .zadd(`llm:${threadId}`, ...history)
                .expire(`llm:${threadId}`, 900)
                .exec()
        } else {
            let message
            if (value?.agent?.messages) {
                if (value.agent.messages instanceof Array) {
                    const agentMessage = value.agent.messages[0]
                    message = agentMessage
                }
            }
            if (value?.tools?.messages) {
                if (value.tools.messages instanceof Array) {
                    const toolMessage = value.tools.messages[0] as ToolMessage
                    controller.enqueue(JSON.stringify({ tool: toolMessage.name, status: toolMessage.status }))
                    message = toolMessage
                }
            }
            if (value?.generate_structured_response) {
                const component = (value?.generate_structured_response as { structuredResponse: ComponentRespones }).structuredResponse
                controller.enqueue(JSON.stringify({ component, threadId, sourceId }))
            }
            if (message) {
                index += 1
                history.push(index, Buffer.from(JSON.stringify(message)))
            }

        }
    } catch (error) {
        controller.enqueue(JSON.stringify({ error: `${error}` }))
        controller.close()
    }
}