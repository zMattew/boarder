"use client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shadcn/table";
import { useProject } from "@/hooks/project-context";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuPortal,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/shadcn/context-menu";
import { changeMemberRole, removeMemberRole } from "@/lib/team";
import { toast } from "sonner";

export default function Page() {
    const { currentProject, refreshProjects } = useProject();
    return (
        <div className="bg-background flex min-h-svh flex-col items-center  gap-6 p-6 md:p-10">
            <div className="w-full max-w-3xl">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{currentProject?.owner.name}</TableCell>
                            <TableCell>{currentProject?.owner.email}</TableCell>
                            <TableCell>owner</TableCell>
                        </TableRow>
                        {currentProject?.team?.map((member) => (
                            <ContextMenu key={member.id}>
                                <ContextMenuTrigger asChild>
                                    <TableRow>
                                        <TableCell>
                                            {member.user.name}
                                        </TableCell>
                                        <TableCell>
                                            {member.user.email}
                                        </TableCell>
                                        <TableCell>{member.role}</TableCell>
                                    </TableRow>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuSub>
                                        <ContextMenuSubTrigger>
                                            Change role
                                        </ContextMenuSubTrigger>
                                        <ContextMenuPortal>
                                            <ContextMenuSubContent>
                                                <ContextMenuItem
                                                    onClick={async () => {
                                                        try {
                                                            await changeMemberRole(
                                                                currentProject
                                                                    .id,
                                                                member.id,
                                                                "admin",
                                                            );
                                                            refreshProjects();
                                                            toast.success(
                                                                `Role changed to admin for ${member.user.email}`,
                                                            );
                                                        } catch (error) {
                                                            toast.error(
                                                                `${error}`,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Admin
                                                </ContextMenuItem>
                                                <ContextMenuItem
                                                    onClick={async () => {
                                                        try {
                                                            await changeMemberRole(
                                                                currentProject
                                                                    .id,
                                                                member.id,
                                                                "editor",
                                                            );
                                                            refreshProjects();
                                                            refreshProjects();
                                                            toast.success(
                                                                `Role changed to editor for ${member.user.email}`,
                                                            );
                                                        } catch (error) {
                                                            toast.error(
                                                                `${error}`,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Editor
                                                </ContextMenuItem>
                                                <ContextMenuItem
                                                    onClick={async () => {
                                                        try {
                                                            await changeMemberRole(
                                                                currentProject
                                                                    .id,
                                                                member.id,
                                                                "viewer",
                                                            );
                                                            refreshProjects();
                                                            refreshProjects();
                                                            toast.success(
                                                                `Role changed to viewer for ${member.user.email}`,
                                                            );
                                                        } catch (error) {
                                                            toast.error(
                                                                `${error}`,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Viewer
                                                </ContextMenuItem>
                                            </ContextMenuSubContent>
                                        </ContextMenuPortal>
                                    </ContextMenuSub>

                                    <ContextMenuItem
                                        onClick={async () => {
                                            try {
                                                await removeMemberRole(
                                                    currentProject.id,
                                                    member.id,
                                                );
                                                refreshProjects();
                                                toast.success(
                                                    `${member.user.email} removed from the team`,
                                                );
                                            } catch (error) {
                                                toast.error(`${error}`);
                                            }
                                        }}
                                    >
                                        Remove
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
