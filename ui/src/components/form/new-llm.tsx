"use client";

import type { Providers } from "@repo/db/client";
import { availableLLMs } from "../../../../core/src/llms";
import { useState } from "react";
import { Combobox } from "../combobox";
import { Input } from "../shadcn/input";
import { Button } from "../shadcn/button";
import { toast } from "sonner";
import { createLLM } from "./newLLM";
import { useProject } from "../../hooks/project-context";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../shadcn/card";
import { Label } from "../shadcn/label";

export function NewLLMForm() {
    const [lable, setLabel] = useState<string>("");
    const [provider, setProvider] = useState<Providers>();
    const [isLoading, setLoading] = useState<boolean>(false);
    const [url, setUrl] = useState<string>();
    const [api, setApi] = useState<string>();
    const { currentProject,refreshProjects } = useProject();
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
                            if (!currentProject) throw "Select a project";
                            formData.append("projectId", currentProject.id);
                            if (!lable) throw "No lable defined";
                            formData.append("label", lable);
                            if (!provider) throw "No provider selected";
                            formData.append("provider", provider);
                            if (
                                availableLLMs[provider].require?.find((v) =>
                                    v == "url"
                                )
                            ) {
                                if (!url) {
                                    throw "url required for this provider";
                                } else formData.append("url", url);
                            }

                            if (
                                availableLLMs[provider].require?.find((v) =>
                                    v == "api"
                                )
                            ) {
                                if (!api) throw "api key require";
                                else formData.append("api", api);
                            }
                            const response = await createLLM(formData);
                            refreshProjects()
                            toast.success(
                                `Provider added \nId: ${response.id}`,
                            );
                        } catch (error) {
                            toast.error(
                                `Failed to create component: ${error}`,
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
