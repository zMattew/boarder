"use client";
import { Providers } from "@repo/db/client";
import { Combobox } from "../combobox";
import { useComponent } from "../component/context";
import { useEffect, useState } from "react";
import { useProject } from "@/hooks/project-context";
import { Textarea } from "../shadcn/textarea";
import { toast } from "sonner";
import { updateComponent } from "@/lib/component";
import { Button } from "../shadcn/button";
import { useFetcher } from "../component/fetch-context";
import { ModelPicker } from "./model-picker";
import { ComponentRespones } from "@repo/core/agent";
import { Loader2 } from "lucide-react";
import { reviewComponentO, saveReviewedComponentO } from "@/lib/form";

export function ReviewComponentForm() {
    const { currentProject } = useProject()
    const { component } = useComponent();
    const { refetch } = useFetcher()
    const [provider, setProvider] = useState<{ name: Providers; id: string; }>();
    const [model, setModel] = useState<string>();
    const [userPrompt, setPrompt] = useState<string>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [state, setState] = useState<Record<string, unknown>>({})
    const [generatedComponent, setComponent] = useState<{ threadId: string, component: ComponentRespones }>()
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
            setComponent(state as { threadId: string, component: ComponentRespones })
    }, [state])
    return <><form className="flex flex-col gap-4">
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
            }} />
        {provider &&
            <ModelPicker provider={provider} setModel={setModel} />
        }
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
                    if (component.id) formData.append("source", component.id);
                    if (provider) formData.append("provider", provider?.id);
                    if (model) formData.append("model", model);
                    if (userPrompt) formData.append("prompt", userPrompt);
                    const parse = reviewComponentO.safeParse(Object.fromEntries(formData.entries()))
                    if (parse.error) throw parse.error.issues[0].message
                    setMessage("Sending request")
                    const res = await fetch(`/prompt/review`, { method: "POST", body: formData })
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
                    toast.error(
                        `Failed to create component: ${error}`,
                    );
                } finally {
                    setLoading(false);
                }
            }}
        >
            Edit
        </Button>
    </form>
        {
            generatedComponent ?
                <>
                    Type : {generatedComponent?.component.name}<br />
                    Description: {generatedComponent?.component.description}<br />
                    <Button
                        disabled={isLoading}
                        onClick={async () => {
                            setLoading(true)
                            try {
                                const parse = saveReviewedComponentO.safeParse({
                                    component: component.id,
                                    name: generatedComponent.component.name,
                                    query: generatedComponent.component.query,
                                    thread: generatedComponent.threadId,
                                    keys: generatedComponent.component.keys,
                                    description: generatedComponent.component.description,
                                })
                                if (parse.error) throw parse.error.issues[0].message
                                const res = await updateComponent(parse.data.component, parse.data.name, parse.data.query, parse.data.description, parse.data.thread, parse.data.keys)
                                if (!res) throw "Component not updated"
                                await refetch()
                            } catch (error) {
                                toast.error(`${error}`)
                            } finally {
                                setLoading(false)
                            }
                        }}>
                        Save
                    </Button>
                </>
                : undefined
        }</>
}
