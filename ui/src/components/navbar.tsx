"use client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./shadcn/dropdown-menu";
import { SidebarMenuButton, SidebarTrigger } from "./shadcn/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/shadcn/breadcrumb";
import { useView } from "../hooks/view-context";
import { Check, ChevronsUpDown, Plus, Trash } from "lucide-react";
import Link from "next/link";
import { useProject } from "../hooks/project-context";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "./shadcn/badge";
import { Button } from "./shadcn/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./shadcn/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { deleteView } from "@/lib/view";
import { toast } from "sonner";
export function Navbar() {
    const { views, currentView, setView } = useView();
    const { currentProject, refreshProjects } = useProject();
    const router = useRouter();
    const path = usePathname();
    return (
        <Breadcrumb className="pl-2 py-2 sticky">
            <BreadcrumbList className="w-full">
                <BreadcrumbItem>
                    <SidebarTrigger />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {currentProject &&
                    (
                        <BreadcrumbItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <div className="flex flex-col gap-0.5 leading-none">
                                            <span className="font-medium">
                                                {currentView?.name
                                                    ? `View: ${currentView?.name}`
                                                    : "Select view"}
                                            </span>
                                        </div>
                                        <ChevronsUpDown className="ml-auto" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-(--radix-dropdown-menu-trigger-width)"
                                    align="start"
                                >
                                    {views && currentProject
                                        ? views.map((view) => (
                                            <DropdownMenuItem
                                                key={view.id}
                                                onSelect={() => {
                                                    setView(view);
                                                    if (
                                                        path !=
                                                        "/home/new-component"
                                                    ) {
                                                        router.push(
                                                            `/home/views/${view.id}`,
                                                        );
                                                    }
                                                }}
                                            >
                                                {view.name}
                                                {view.id ===
                                                    currentView?.id && (
                                                        <Check className="ml-auto" />
                                                    )}
                                            </DropdownMenuItem>
                                        ))
                                        : (
                                            <DropdownMenuItem>
                                                Select project first
                                            </DropdownMenuItem>
                                        )}
                                    {currentProject?.role != "viewer" &&
                                        (
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    href={"/home/views/create"}
                                                >
                                                    <Plus /> New view
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </BreadcrumbItem>
                    )}

                {currentView && currentProject &&
                    (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <span className="font-medium">
                                        <Link
                                            href={`/home/views/${currentView.id}`}
                                        >
                                            Components{" "}
                                            <Badge variant="default">
                                                {currentView.components
                                                    .length}
                                            </Badge>
                                        </Link>
                                    </span>
                                </SidebarMenuButton>
                            </BreadcrumbItem>
                            {currentProject?.role != "viewer" &&
                                (
                                    <BreadcrumbItem>
                                        <Button variant="link" size="icon">
                                            <Link
                                                href={"/home/new-component"}
                                                className="hover:bg-secondary p-0.5 rounded-sm border"
                                            >
                                                <Plus />
                                            </Link>
                                        </Button>
                                    </BreadcrumbItem>
                                )}
                            <div className="grow">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Trash className="place-self-end p-1 m-1" />
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Are you absolutely sure?
                                            </DialogTitle>
                                            <DialogDescription>
                                                This action will delete all the
                                                component associated with this
                                                view and cannot be undone.
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
                                                        await deleteView(
                                                            currentView.id,
                                                        );
                                                        await refreshProjects();
                                                        toast.success("View deleted")
                                                        setView()
                                                        router.push("/home")
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
                            </div>
                        </>
                    )}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
