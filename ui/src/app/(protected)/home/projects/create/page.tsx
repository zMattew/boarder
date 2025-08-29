"use client";
import { Button } from "@/components/shadcn/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { toast } from "sonner";
import { useState } from "react";
import { useProject } from "@/hooks/project-context";
import { newProject } from "@/lib/project";

export default function Page() {
    const [loading, setLoading] = useState<boolean>(false);
    const {refreshProjects} =useProject()
    return (
        <div className="h-full w-full grid place-content-center ">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Create Project</CardTitle>
                    <CardDescription>
                        Create a project and start configuring it
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        action={async (formData: FormData) => {
                            setLoading(true);
                            try {

                                const response = await newProject(formData);
                                toast.success(
                                    `Project ${response.name} created`,
                                );
                                refreshProjects()
                            } catch (msg) {
                                toast.error(`${msg}`);
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="w-full my-4"
                            disabled={loading}
                        >
                            Create
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
