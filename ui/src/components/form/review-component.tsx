"use client";
import { Providers } from "@repo/db/client";
import { Combobox } from "../combobox";
import { useComponent } from "../component/context";
import { useState } from "react";
import { useProject } from "@/hooks/project-context";
import { Textarea } from "../shadcn/textarea";
import { toast } from "sonner";
import { review } from "@/lib/component";
import { Button } from "../shadcn/button";
import { useFetcher } from "../component/fetch-context";
import { ModelPicker } from "./model-picker";

export function ReviewComponentForm() {
    const { currentProject } = useProject()
    const { component } = useComponent();
    const { refetch } = useFetcher()
    const [provider, setProvider] = useState<{ name: Providers; id: string; }>();
    const [model, setModel] = useState<string>();
    const [userPrompt, setPrompt] = useState<string>();
    const [isLoading, setLoading] = useState<boolean>(false);

    return <form action={async () => {
        setLoading(true);
        const formData = new FormData();
        try {
            if (!component.id) throw "No source selected";
            formData.append("component", component.id as string);

            if (!provider) throw "No llm provider selected";
            formData.append(
                "provider",
                provider.id as string,
            );

            if (!model) throw "No llm model selected";
            formData.append("model", model as string);

            if (!userPrompt) throw "No prompt found";
            formData.append("prompt", userPrompt as string);

            const reviewedComponent = await review(formData);
            if (reviewedComponent) refetch()
            toast.success(
                `Component updated`,
            );
        } catch (error) {
            toast.error(
                `Failed to create component: ${error}`,
            );
        } finally {
            setLoading(false);
        }
    }} className="flex flex-col gap-4">
        <Combobox
            options={currentProject?.llms?.map((llm) => ({
                label: `${llm.label} ${llm.provider}`,
                value: llm.id,
            }))}
            placeholder="Select a provider"
            form="llmId"
            onSelect={(llmId) => {
                setModel(undefined);
                const llm = currentProject?.llms?.find((llm) => llm.id == llmId)
                if (llm) setProvider({
                    name: llm.provider as Providers,
                    id: llmId,
                });
            }} />
        {provider &&
            <ModelPicker provider={provider} setModel={setModel} />
        }
        <Textarea
            onChange={(e) => setPrompt(e.target.value)}
            name="prompt"
            placeholder="prompt"
            required
        />
        <Button
            type="submit"
            disabled={isLoading}>
            Edit
        </Button>
    </form>;
}
