"use client";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardTitle } from "@/components/shadcn/card";
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
import { useProject } from "@/hooks/project-context";
import { deleteProject } from "@/lib/project";
import { toast } from "sonner";

export default function Page() {
    const { currentProject, refreshProjects } = useProject();
    return (
        <Card className="w-full max-w-md mx-auto p-4">
            <CardTitle>
                {currentProject
                    ? <>Settings for {currentProject?.name} project</>
                    : <>Selecte a project</>}
            </CardTitle>
            {currentProject &&
                (
                    <CardContent>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    Erase project
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Are you absolutely sure?
                                    </DialogTitle>
                                    <DialogDescription className="flex flex-col">
                                        <span>
                                            Removing this project will delete:
                                        </span>
                                        <span>
                                            {currentProject?.team?.length}{" "}
                                            team member
                                        </span>
                                        <span>
                                            {currentProject?.sources?.length}
                                            {" "}
                                            sources
                                        </span>
                                        <span>
                                            {currentProject?.llms?.length} llms
                                        </span>
                                        <span>
                                            {currentProject?.view.length}{" "}
                                            views with{" "}
                                            {currentProject?.view?.reduce(
                                                (prev, curr) => {
                                                    return prev +=
                                                        curr.components.length;
                                                },
                                                0,
                                            )} components in total.
                                        </span>
                                        <span>
                                            This action cannot be undone
                                        </span>
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
                                                await deleteProject(
                                                    currentProject?.id,
                                                );
                                                await refreshProjects();
                                                toast.success("Source removed");
                                            } catch (error) {
                                                toast.error(`${error}`);
                                            }
                                        }}
                                    >
                                        Confirm
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                )}
        </Card>
    );
}
