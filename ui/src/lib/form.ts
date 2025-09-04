import z from "zod";


export const newComponentO = z.object({
    source: z.string({error:"Select a source"}),
    provider: z.string({error:"Select a llm provider"}),
    model: z.string({error:"Select a llm model"}),
    prompt: z.string({error:"Write a prompt"})
})
