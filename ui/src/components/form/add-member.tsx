"use client"
import { useState } from "react";
import { toast } from "sonner";
import { Combobox } from "../combobox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../shadcn/card";
import { Input } from "../shadcn/input";
import { useProject } from "../../hooks/project-context";
import { addMember } from "./addMember";
import { Button } from "../shadcn/button";
import { Label } from "../shadcn/label";

export function AddMemberForm() {
    const { currentProject, refreshProjects } = useProject();
    const [isLoading, setLoading] = useState<boolean>(false);

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Add a member</CardTitle>
                <CardDescription>
                    Add a member to collaborate adding, sources, llms,
                    components
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    action={async (formData: FormData) => {
                        try {
                            setLoading(true);
                            if (!currentProject) throw "Select a project";
                            formData.append(
                                "projectId",
                                currentProject.id,
                            );
                            await addMember(formData);
                            refreshProjects();
                            toast.success("Member added");
                        } catch (error) {
                            toast.error(`${error}`);
                        } finally {
                            setLoading(false);
                        }
                    }}
                    className="flex flex-col gap-4"
                >
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            required
                            className="w-full max-w-md"
                        />
                    </div>
                    <Combobox
                        form="role"
                        placeholder="Select a role"
                        options={[{ label: "Admin", value: "admin" }, {
                            label: "Editor",
                            value: "editor",
                        }, { label: "Viewer", value: "viewer" }]}
                    />
                    <Button type="submit" className="mt-4" disabled={isLoading}>
                        Invite
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
