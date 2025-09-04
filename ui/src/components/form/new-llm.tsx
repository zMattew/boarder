"use client";

import type { Providers } from "@repo/db/client";
import { availableLLMs } from "@repo/core/llms";
import { useState } from "react";
import { Combobox } from "../combobox";
import { Input } from "../shadcn/input";
import { Button } from "../shadcn/button";
import { toast } from "sonner";
import { useProject } from "../../hooks/project-context";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../shadcn/card";
import { Label } from "../shadcn/label";
import { newLLMO } from "@/lib/form";
import { addLLM } from "@/lib/llm";

export function NewLLMForm() {
    const [label, setLabel] = useState<string>("");
    const [provider, setProvider] = useState<Providers>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [url, setUrl] = useState<string>();
    const [api, setApi] = useState<string>();
    const { refreshProjects } = useProject();
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Add a llm</CardTitle>
                <CardDescription>
                    Add a llm to create your view with your data retrived with
                    the AI power
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Label htmlFor="label">Label</Label>
                <Input
                    id="label"
                    className="w-fit"
                    name="label"
                    placeholder={`Insert label name`}
                    required
                    onChange={(e) => setLabel(e.target.value)}
                />
                <Combobox
                    options={Object.keys(availableLLMs).map((llm) => ({
                        label: llm,
                        value: llm,
                    }))}
                    placeholder="Select a provider"
                    onSelect={(string) => setProvider(string as Providers)}
                />
                {provider &&
                    availableLLMs[provider].require?.map((value) => (
                        <Input
                            className="w-fit"
                            key={value}
                            name={value}
                            placeholder={`Insert ${value}`}
                            type={value == "api" ? `password` : `text`}
                            onChange={(e) => {
                                if (value == "api") setApi(e.target.value);
                                if (value == "url") setUrl(e.target.value);
                            }}
                            required
                        />
                    ))}
                <Button
                    type="submit"
                    disabled={isLoading}
                    onClick={async () => {
                        setLoading(true);
                        const formData = new FormData();
                        try {
                            if (label) formData.append("label", label);
                            if (provider) formData.append("provider", provider);
                            const parse = newLLMO.safeParse(Object.fromEntries(formData.entries()))
                            if (parse.error) throw parse.error.issues[0].message

                            if (
                                availableLLMs[parse.data.provider].require?.find((v) =>
                                    v == "url"
                                )
                            ) {
                                if (!url) throw "Url required for this provider";
                                formData.append("url", url);
                            }

                            if (
                                availableLLMs[parse.data.provider].require?.find((v) =>
                                    v == "api"
                                )
                            ) {
                                if (!api) throw "Api key require for this provider";
                                formData.append("api", api);
                            }
                            const response = await addLLM(parse.data.label, parse.data.provider, parse.data.url, parse.data.api);
                            await refreshProjects()
                            toast.success(
                                `Provider added \nId: ${response.id}`,
                            );
                        } catch (error) {
                            toast.error(
                                `${error}`,
                            );
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    Add provider
                </Button>
            </CardContent>
        </Card>
    );
}
