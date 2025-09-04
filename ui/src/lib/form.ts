import type { Providers } from "@repo/db/client";
import z from "zod";

export const newComponentO = z.object({
    source: z.string({error:"Select a source"}),
    provider: z.string({error:"Select a llm provider"}),
    model: z.string({error:"Select a llm model"}),
    prompt: z.string({error:"Write a prompt"})
})

export const saveNewComponentO = z.object({
    name: z.string({error:"Component type missing. Not Saving"}),
    source: z.string({error:"Missing source. Not Saving"}),
    query: z.string({error:"Missing query. Not Saving"}),
    thread: z.string({error:"Missing prompt thread. Not Saving"}),
    keys: z.array(z.string()).optional().default([]),
    description: z.string().optional(),
    view: z.string({error:"Select a view"})
})

export const newLLMO = z.object({
    label:z.string({error:"Write a label to identify your llm"}),
    provider: z.string<Providers>({error:"Select a valid provider"}),
    api:z.string().optional(),
    url: z.url().optional()
})

export const newSourceO = z.object({
    name:z.string({error:"Write a name to identify your source"}),
    connection:z.url()
})