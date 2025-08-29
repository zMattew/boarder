"use client";

import { toast } from "sonner";
import { Button } from "../shadcn/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../shadcn/card";
import { Input } from "../shadcn/input";
import { Label } from "../shadcn/label";
import { useProject } from "../../hooks/project-context";
import { createView } from "./newView";
import { useState } from "react";

export function NewViewForm() {
    const { currentProject, refreshProjects } = useProject();
    const [isLoading, setLoading] = useState<boolean>(false);

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Add a view</CardTitle>
                <CardDescription>
                    Add a view to show all your data in one place
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    action={async (formData: FormData) => {
                        try {
                            setLoading(true)
                            if (!currentProject) throw "Select a project";
                            formData.append("projectId", currentProject.id);
                            await createView(formData);
                            await refreshProjects();
                            toast.success("View created");
                        } catch (error) {
                            toast.error(`${error}`);
                        } finally {
                            setLoading(false)
                        }
                    }}
                >
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        placeholder="Name"
                        name="name"
                        required
                        className="w-full max-w-md"
                    />
                    <Button type="submit" className="mt-4" disabled={isLoading}>Create View</Button>
                </form>
            </CardContent>
        </Card>
    );
}
