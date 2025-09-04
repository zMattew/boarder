"use client";
import { Button } from "@/components/shadcn/button";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/shadcn/context-menu";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/shadcn/dialog";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/shadcn/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/shadcn/table";
import { useProject } from "@/hooks/project-context";
import { editSource, removeSource } from "@/lib/source";
import { toast } from "sonner";

function EditSourceForm(
    { sourceName, sourceId }: { sourceName: string; sourceId: string },
) {
    const { refreshProjects } = useProject();
    return (
        <form
            action={async (formData: FormData) => {
                try {
                    const sourceName = formData.get("name") as string;
                    const url = formData.get("connection") as string;
                    if (!sourceName && !url) throw "Nothing changed";
                    await editSource(
                        sourceId,
                        sourceName,
                        url,
                    );
                    await refreshProjects();
                    toast.success("Source edited")
                } catch (error) {
                    toast.error(`${error}`);
                }
            }}
            className="flex flex-col gap-4 px-4"
        >
            <div>
                <Label htmlFor="name">
                    Source Name
                </Label>
                <Input
                    id="name"
                    placeholder={sourceName}
                    name="name"
                    className="w-full max-w-md"
                />
            </div>
            <div>
                <Label htmlFor="connection">
                    Connection Url
                </Label>
                <Input
                    id="connection"
                    placeholder="postgresql://user:password@host:port/schema"
                    name="connection"
                    type="password"
                    className="w-full max-w-md"
                />
            </div>
            <Button type="submit" className="mt-4">
                Edit
            </Button>
        </form>
    );
}

export default function Page() {
    const { currentProject, refreshProjects } = useProject();
    return (
        <div className="bg-background flex min-h-svh flex-col items-center  gap-6 p-6 md:p-10">
            <div className="w-full max-w-3xl">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Components count</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentProject?.sources?.map((source) => (
                            <ContextMenu key={source.id}>
                                <ContextMenuTrigger asChild>
                                    <TableRow>
                                        <TableCell>{source.name}</TableCell>
                                        <TableCell>
                                            {source.components.length}
                                        </TableCell>
                                    </TableRow>
                                </ContextMenuTrigger>

                                <ContextMenuContent>
                                    <ContextMenuItem>
                                        <Sheet>
                                            <SheetTrigger
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                Edit
                                            </SheetTrigger>
                                            <SheetContent
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <SheetHeader>
                                                    <SheetTitle>
                                                        Edit Source
                                                    </SheetTitle>
                                                    <SheetDescription>
                                                        This action could break
                                                        some component if there
                                                        is the same schema used
                                                        when was generated.
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <EditSourceForm
                                                    sourceId={source.id}
                                                    sourceName={source.name}
                                                />
                                            </SheetContent>
                                        </Sheet>
                                    </ContextMenuItem>
                                    <ContextMenuItem>
                                        <Dialog>
                                            <DialogTrigger
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                Remove
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>
                                                        Are you absolutely sure?
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                        Removing this source
                                                        will delete{" "}
                                                        {source.components
                                                            .length}. This
                                                        action cannot be undone.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                        >
                                                            Close
                                                        </Button>
                                                    </DialogClose>
                                                    <Button
                                                        onClick={async () => {
                                                            try {
                                                                await removeSource(
                                                                    source.id,
                                                                );
                                                                await refreshProjects();
                                                                toast.success("Source removed")
                                                            } catch (error) {
                                                                toast.error(`${error}`)
                                                            }
                                                        }}
                                                    >
                                                        Confirm
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
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
