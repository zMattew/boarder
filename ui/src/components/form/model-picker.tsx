"use client";
import { availableLLMs } from "@repo/core/llms";
import type { Providers } from "@repo/db/client";
import { Combobox } from "../combobox";
import { useQuery } from "@tanstack/react-query";

export function ModelPicker({ provider, setModel }: { provider: { name: Providers; id: string; }; setModel: (value: string) => void; }) {
    const { data: models } = useQuery({
        initialData: typeof availableLLMs[provider.name].model != "function" ? availableLLMs[provider.name].model as string[] : [],
        queryKey: ["llm", provider.id],
        refetchOnWindowFocus:false,
        queryFn: async () => {
            const models = availableLLMs[provider.name].model;
            if (typeof models == "function") return await models(provider.id)
            else if (models instanceof Array) return availableLLMs[provider.name].model as string[]
        }
    })
    return <Combobox
        options={models?.map(
            (
                p
            ) => ({
                label: p,
                value: p,
            })
        )}
        placeholder="Select a model"
        onSelect={setModel} />;
}
