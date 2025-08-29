import type { Providers } from "@repo/db/client";

export const availableLLMs: Record<Providers, { effectiveName?: string, model: string[] | ((url: string) => Promise<string[]>), require?: ("url" | "api")[] }> = {
    google: { effectiveName: "google-genai", model: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite"], require: ["api"] },
    gcp: { effectiveName: "google-vertexai", model: [], require: ["api"] },
    ollama: {
        model: getProviderModels, require: ["url"]
    },
    openai: { model: ["GPT-5", "GPT-4.1", "GPT-4o", "o4-mini", "o3-pro", "o3", "o3-mini", "o1"], require: ["api"] },
    anthropic: { model: ["claude-opus-4-0", "claude-sonnet-4-0", "claude-3-7-sonnet-latest", "claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"], require: ["api"] },
    aws: { model: [], require: ["api"] },
    groq: { model: [] },
    mistral: { model: ["mistral-medium-2505", "magistral-medium-2507", "magistral-medium-2506", "ministral-3b-2410", "ministral-8b-2410", "mistral-large-2411", "mistral-small-2407"] }
}


export async function getProviderModels(llmId: string) {
    const body = new FormData()
    body.append("llmId", llmId)
    const result = await fetch("/llms", { method: "POST", body })
    if (!result.ok) return []
    const data = await result.json() as string[]
    return data
}