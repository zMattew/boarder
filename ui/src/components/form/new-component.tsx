"use client";
import { Combobox } from "../combobox";
import type { Providers } from "@repo/db/client";
import { useEffect, useState } from "react";
import { Textarea } from "../shadcn/textarea";
import { Button } from "../shadcn/button";
import { addComponent } from '@/lib/component';
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
import { ModelPicker } from "./model-picker";
import { ComponentRespones } from "@repo/core/agent";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { newComponentO, saveNewComponentO } from "@/lib/form";
export function NewComponentForm(
) {
    const { currentProject, refreshProjects } = useProject()
    const { push } = useRouter()
    const { currentView } = useView()
    const [source, setSource] = useState<string>();
    const [provider, setProvider] = useState<{ name: Providers; id: string }>();
    const [model, setModel] = useState<string>();
    const [userPrompt, setPrompt] = useState<string>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [state, setState] = useState<Record<string, unknown>>({})
    const [generatedComponent, setComponent] = useState<{ threadId: string, sourceId: string, component: ComponentRespones }>()
    const [message, setMessage] = useState<string>()
    useEffect(() => {
        switch (state.tool) {
            case "get_components_list":
                setMessage(state.status == "success" ? "Retrieved available components" : "Failed retrieve components. Retrying")
                break
            case "get_database_schema":
                setMessage(state.status == "success" ? "Retrieved database schema" : "Failed retrieve database schema. Retrying")
                break
            case "test_query":
                setMessage(state.status == "success" ? "Test successful" : "Query malformed. Updating query")
                break
        }
        if (state.component)
            setComponent(state as { threadId: string, sourceId: string, component: ComponentRespones })
    }, [state])
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
                    <div className="flex flex-col gap-1 justify-start">
                        <Textarea
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="prompt"
                            required
                        />
                        <span className={`${isLoading && !generatedComponent ? '' : 'opacity-0'} flex flex-row gap-1 items-center text-xs text-muted-foreground`}><Loader2 className="animate-spin" size={10} />{message}</span>
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        onClick={async () => {
                            setLoading(true);
                            setComponent(undefined)
                            const formData = new FormData();
                            try {
                                if (source) formData.append("source", source as string);
                                if (provider) formData.append("provider", provider?.id as string,);
                                if (model) formData.append("model", model as string);
                                if (userPrompt) formData.append("prompt", userPrompt as string);
                                const parse = newComponentO.safeParse(Object.fromEntries(formData.entries()))
                                if (parse.error) throw parse.error.issues[0].message
                                setMessage("Sending request")
                                const res = await fetch(`/prompt`, { method: "POST", body: formData })
                                if (!res.ok || !res.body) throw new Error()
                                const reader = res.body.getReader()
                                const decoder = new TextDecoder()
                                setMessage("Request accepted")
                                while (true) {
                                    const { done, value } = await reader.read();
                                    if (done) {
                                        setMessage(undefined)
                                        return;
                                    } else {
                                        const update = decoder.decode(value)
                                        const updateObj = JSON.parse(update)
                                        console.log(updateObj)
                                        setState(updateObj)
                                    }
                                }
                            } catch (error) {
                                toast.error(`${error}`);
                            } finally {
                                setLoading(false);
                                if (state.error) toast.error('An error occured generating component')
                                if (state.component) toast.success(`Component generated`)
                            }
                        }}
                    >
                        Submit
                    </Button>
                    {generatedComponent ?
                        <>
                            Type : {generatedComponent?.component.name}<br />
                            Description: {generatedComponent?.component.description}<br />
                            <Button
                                disabled={isLoading}
                                onClick={async () => {
                                    setLoading(true)
                                    try {
                                        const parse = saveNewComponentO.safeParse({
                                            name: generatedComponent.component.name,
                                            source: generatedComponent.sourceId,
                                            query: generatedComponent.component.query,
                                            thread: generatedComponent.threadId,
                                            keys: generatedComponent.component.keys,
                                            description: generatedComponent.component.description,
                                            view: currentView?.id
                                        })
                                        if (parse.error) throw parse.error.issues[0].message
                                        const res = await addComponent(parse.data.name, parse.data.source, parse.data.query, parse.data.thread, parse.data.view, parse.data.keys, parse.data.description)
                                        if (!res) throw "Component not created"
                                        await refreshProjects()
                                        push(`/home/views/${parse.data.view}`)
                                    } catch (error) {
                                        toast.error(`${error}`)
                                    } finally {
                                        setLoading(false)
                                    }
                                }}>
                                Save
                            </Button>
                        </>
                        : undefined}
                </CardContent>
            </Card>
        </>
    );
}


