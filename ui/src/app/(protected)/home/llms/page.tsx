"use client";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/shadcn/context-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shadcn/table";
import { useProject } from "@/hooks/project-context";
import { removeLLM } from "@/lib/llm";
import { toast } from "sonner";

export default function Page() {
    const { currentProject,refreshProjects } = useProject();
    return (
        <div className="bg-background flex min-h-svh flex-col items-center  gap-6 p-6 md:p-10">
            <div className="w-full max-w-3xl">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Label</TableHead>
                            <TableHead>Provider</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentProject?.llms?.map((llm) => (
                            <ContextMenu key={llm.id}>
                                <ContextMenuTrigger asChild>
                                    <TableRow>
                                        <TableCell>{llm.label}</TableCell>
                                        <TableCell>{llm.provider}</TableCell>
                                    </TableRow>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem
                                        onClick={async () => {
                                            try {
                                                await removeLLM(
                                                    currentProject.id,
                                                    llm.id,
                                                );
                                                await refreshProjects();
                                                toast.success("LLM removed")
                                            } catch (error) {
                                                toast.error(`${error}`)
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
