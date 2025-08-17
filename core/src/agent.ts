
import { tool } from "@langchain/core/tools"
import { dbIntrospection, testSQLQuery } from "./db.ts"
import { z } from "zod"
import Components from "./components.ts"
import { initChatModel } from "langchain/chat_models/universal";
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { MemorySaver } from "@langchain/langgraph-checkpoint"
import type { RunnableConfig } from "@langchain/core/runnables"
import { SystemMessage } from "@langchain/core/messages"
import { getLLM } from "@repo/db/esm.handler"
import { decrypt } from "./crypto.ts"
import { availableLLMs } from './llms.ts';
import type {Providers}  from "@repo/db/esm"

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


async function initAgent(providerId: string, model: string) {
    const provider = await getLLM(providerId)
    if (!provider) throw new Error("No llm provider found")
    const apiKey = provider.apiKey ? await decrypt(provider.apiKey) : undefined
    const providerName = availableLLMs[provider.provider as Providers].effectiveName ? availableLLMs[provider.provider as Providers].effectiveName : provider.provider
    const llm = await initChatModel(model, { modelProvider: providerName, baseUrl: provider?.url ? provider.url : undefined, apiKey: apiKey ? apiKey : undefined })
    const checkpointer = new MemorySaver();
    return createReactAgent({
        llm,
        tools: [getSchema, testDbQuery, getComponents],
        checkpointer,

        checkpointSaver: checkpointer,
        responseFormat: z.object({
            name: z.enum(["chart","table"]).describe("Name of the component from the given components list"),
            description: z.string().describe("Brief description of the serve to the user"),
            query: z.string().describe("Query to retrive the data from the database. Without the ending closure ';'"),
            keys: z.array(z.string().describe("Required key requested by choosen component.It must be a key found inside the query output fields.").describe("Required keys requested by choosen component having the same length. They must be keys found inside the query output fields.")).default([]).optional()
        }),
        prompt: new SystemMessage(`You are an assistant that generate the component metadata based on user input.
    The user will ask to create a type of component with the data that can be found in the database. 
    Your role is to fullfil every needed aspect from the component choose to the query to execute to retrive data:
        - Before generating the query you must be aware of the current database schema.
        - The sql query must only retrive data from the current database.
        - You can't generate a query to modifiy the database schema.
        - The generated query must be tested to proceed with the final output.
        - The component will be choosen once the test_quert tools is executed with success.
        - The component name must be choose from the component list. It must be or "chart" or "table" . 
        - If user ask 'create a table' should be interpeted as he wants to use a table component. 
        - If the choosen component has field 'requiredKeysDescription' you must add to the final output a field 'keys' where for each 'requiredKeysDescription' entry you must use a column name inside the query output type based on the 'requiredKeysDescription' string that describe what column should be used. If 'requiredKeysDescription' you can omit the keys field in the final output.
        - If the chosen component is a chart, the query should be ordered by the x axis in Descent mode if the chosen key for the x field is a Date type. Don't follow this instruction if the user explictly ask for another order.
    To create a component you must use this tool step by step:
        1) get_components_list: to retrive components list to choose from
        2) get_database_schema: to retrive the current database schema as pg_dump for generate a query based on user prompt
        3) test_query: use the generated query to test it, if is not successful you must reiterate this tool to adjust the query based on passed error
    Once you arrived to the end of this cycle you can output the generated query, the choosen component name and a description of it with (if needed) keys choosen from the query output type.

        `)
    })
}


export async function promptComponent(llmId: string, model: string, prompt: string, sourceId: string, session: string) {
    const agent = await initAgent(llmId, model)
    const response = await agent.invoke({ messages: [{ role: "user", content: prompt }] }, { configurable: { sourceId, thread_id: session } })
    /* const output = ""
    for await (const [token, meta] of response) {
        output.concat(output, token.content)
        process.stdout.write(token.content)
    } */
    console.log(response.messages)
    return response.structuredResponse as { name: string, description: string, query: string, keys?: string[] }
}