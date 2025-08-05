"use client";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { useProject } from "@/hooks/project-context";
import { createSource } from "./newSource";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../shadcn/card";
import { Label } from "../shadcn/label";
import { toast } from "sonner";
import { useState } from "react";

export function NewSourceForm() {
    const { currentProject ,refreshProjects} = useProject();
    const [isLoading, setLoading] = useState<boolean>(false);

    return currentProject
        ?
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Add a source</CardTitle>
                <CardDescription>
                    Add a database endpoint to get all your app data
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    action={async (formData: FormData) => {
                        try {
                            setLoading(true)
                            if(!currentProject.id) throw "Select a project"
                            formData.append("projectId", currentProject.id);
                            await createSource(formData);
                            refreshProjects()
                            toast.success("Source created")
                        } catch (error) {
                            toast.error(`${error}`)
                        }finally{
                            setLoading(false)
                        }
                    }}
                    className="flex flex-col gap-4"
                >
                    <div>
                        <Label htmlFor="name">Source Name</Label>
                        <Input
                            id="name"
                            placeholder="Name"
                            name="name"
                            required
                            className="w-full max-w-md"
                        />
                    </div>
                    <div>
                        <Label htmlFor="connection">Connection Url</Label>
                        <Input
                            id="connection"
                            placeholder="postgresql://user:password@host:port/schema"
                            name="connection"
                            type="password"
                            required
                            className="w-full max-w-md"
                        />
                    </div>
                    <Button type="submit" className="mt-4" disabled={isLoading}>
                        Create Source
                    </Button>
                </form>
            </CardContent>
        </Card>
     : <div>Select a project from sidebar</div>
}
