"use client"
import { useState } from "react";
import { toast } from "sonner";
import { Combobox } from "../combobox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../shadcn/card";
import { Input } from "../shadcn/input";
import { useProject } from "../../hooks/project-context";
import { Button } from "../shadcn/button";
import { Label } from "../shadcn/label";
import { addMemberO } from "@/lib/form";
import { addMember } from "@/lib/team";

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
                            const parse = addMemberO.safeParse(Object.fromEntries(formData.entries()))
                            if(parse.error) throw parse.error.issues[0].message
                            await addMember(parse.data.email,parse.data.role);
                            await refreshProjects();
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
