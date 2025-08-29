"use client";
import { Combobox } from "../combobox";
import type { Providers } from "@repo/db/client";
import { useState } from "react";
import { Textarea } from "../shadcn/textarea";
import { Button } from "../shadcn/button";
import { prompt } from '@/lib/component';
import { toast } from "sonner";
import { useProject } from "../../hooks/project-context";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../shadcn/card";
import { useView } from "../../hooks/view-context";
import { redirect, useRouter } from "next/navigation";
import { ModelPicker } from "./model-picker";
export function NewComponentForm(
) {
    const { currentProject, refreshProjects } = useProject()
    const {push} = useRouter()
    if (currentProject?.role == "viewer") redirect("/home")
    const { currentView } = useView()
    const [source, setSource] = useState<string>();
    const [provider, setProvider] = useState<{ name: Providers; id: string }>();
    const [model, setModel] = useState<string>();
    const [userPrompt, setPrompt] = useState<string>();
    const [isLoading, setLoading] = useState<boolean>(false);

    return (
        <>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Add component</CardTitle>
                    <CardDescription>
                        Add a component describing what data you want from your source and define in what format to show it
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Combobox
                        options={currentProject?.sources?.map((source) => ({
                            label: source.name,
                            value: source.id,
                        }))}
                        placeholder="Select a source"
                        onSelect={setSource}
                    />
                    <Combobox
                        options={currentProject?.llms?.map((llm) => ({
                            label: `${llm.label} ${llm.provider}`,
                            value: llm.id,
                        }))}
                        placeholder="Select a provider"
                        onSelect={(llmId) => {
                            setModel(undefined);
                            const llm = currentProject?.llms?.find((llm) => llm.id == llmId)
                            if (llm) setProvider({
                                name: llm.provider as Providers,
                                id: llmId,
                            });
                        }}
                    />
                    {provider && (
                        <ModelPicker provider={provider} setModel={setModel} />
                    )}
                    <Textarea
                        onChange={(e) => setPrompt(e.target.value)}
                        name="prompt"
                        placeholder="prompt"
                        required
                    />
                    <Button
                        type="submit"
                        disabled={isLoading}
                        onClick={async () => {
                            setLoading(true);
                            const formData = new FormData();
                            try {
                                if (!source) throw "No source selected";
                                formData.append("source", source as string);

                                if (!currentView) throw "No view selected";
                                formData.append("view", currentView.id as string);

                                if (!provider) throw "No llm provider selected";
                                formData.append(
                                    "provider",
                                    provider.id as string,
                                );

                                if (!model) throw "No llm model selected";
                                formData.append("model", model as string);

                                if (!userPrompt) throw "No prompt found";
                                formData.append("prompt", userPrompt as string);

                                const component = await prompt(formData);
                                toast.success(
                                    `Component created \nId: ${component.id}`,
                                );
                                await refreshProjects()
                                push(`/home/views/${currentView.id}`)
                            } catch (error) {
                                toast.error(
                                    `Failed to create component: ${error}`,
                                );
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        Submit
                    </Button>
                </CardContent>
            </Card>
        </>
    );
}


