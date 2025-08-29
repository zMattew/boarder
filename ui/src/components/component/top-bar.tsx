"use client";
import { useDraggable } from "@dnd-kit/core";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/shadcn/hover-card";
import {
    Database,
    EllipsisVertical,
    InfoIcon,
    LockKeyhole,
    LockKeyholeOpen,
    Minimize,
    Minus,
    Pencil,
    Play,
    RefreshCcw,
    Trash,
} from "lucide-react";
import { revalidateData } from "../utils/fetch";

import { useComponent } from "./context";
import { useProject } from "@/hooks/project-context";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../shadcn/dialog";

import { Button } from "../shadcn/button";
import { removeComponent } from "@/lib/component";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../shadcn/sheet";
import { ReviewComponentForm } from "../form/review-component";
import { useFetcher } from "./fetch-context";

export function ComponentTopBar() {
    const { isFetching, refetch } = useFetcher()
    const { setStyle, component, locked, setLocked, restore } = useComponent();
    const { listeners } = useDraggable({
        id: component.id,
    });
    const { currentProject, refreshProjects } = useProject();
    const options = component.name == "chart"
        ? [
            { label: "Area chart", value: "area" },
            { label: "Bar chart", value: "bar" },
            { label: "Line chart", value: "line" },
            { label: "Scatter chart", value: "scatter" },
        ]
        : undefined;
    return (
        <div className="absolute w-full top-[-16] flex flex-row">
            <HoverCard>
                <HoverCardTrigger>
                    <InfoIcon className="h-3" />
                </HoverCardTrigger>
                <HoverCardContent className="text-xs flex flex-col">
                    <div>
                        <Database className="inline h-2" />Source:
                        {component.source.name}
                    </div>
                    <div>
                        <Pencil className="inline h-2" /> Description:
                        {component.description}
                    </div>
                    <div>
                        <Play className="inline h-2" /> Query:
                        {component.query}
                    </div>
                </HoverCardContent>
            </HoverCard>
            <div className="w-full">
                <Minus
                    className={`${locked ? "hidden" : ""
                        } h-3 z-[1] my-0.5 place-self-center hover:bg-secondary rounded-md cursor-grab active:cursor-grabbing touch-none   `}
                    {...listeners}
                />
            </div>
            <div className="flex flex-row gap-0.5">
                <RefreshCcw
                    className={`h-3 hover:cursor-pointer ${isFetching ? "animate-spin" : ""
                        }`}
                    onClick={async () => {
                        await revalidateData(component.id);
                        refetch({ cancelRefetch: false });
                    }}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <EllipsisVertical className="h-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {options
                            ? (
                                <>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            Style
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                {options.map((option) => (
                                                    <DropdownMenuItem
                                                        key={option.value}
                                                        onClick={() =>
                                                            setStyle(
                                                                option.value,
                                                            )}
                                                    >
                                                        {option.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                </>
                            )
                            : <></>}
                        {currentProject && currentProject?.role != "viewer"
                            ? (
                                <>
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <DropdownMenuItem
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                <Pencil />Edit
                                            </DropdownMenuItem>
                                        </SheetTrigger>
                                        <SheetContent>
                                            <SheetHeader>
                                                <SheetTitle>
                                                    Edit component
                                                </SheetTitle>
                                                <SheetDescription>
                                                    Change component type of generate a new query
                                                </SheetDescription>
                                                <SheetTitle>
                                                    Current component
                                                </SheetTitle>
                                                <SheetDescription>
                                                    Type: {component.name}<br />
                                                    Description: {component.description}<br />
                                                    Source: {component.source.name}
                                                </SheetDescription>
                                                <ReviewComponentForm />
                                            </SheetHeader>
                                        </SheetContent>
                                    </Sheet>
                                    <Dialog>
                                        <DialogTrigger
                                            asChild
                                        >
                                            <DropdownMenuItem
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                <Trash /> Delete
                                            </DropdownMenuItem>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Are you absolutely sure?
                                                </DialogTitle>
                                                <DialogDescription>
                                                    This action cannot be
                                                    undone.
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
                                                            await removeComponent(currentProject.id, component.id)
                                                            await refreshProjects()
                                                            toast.success("Component removed")
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
                                </>
                            )
                            : <></>}
                        <DropdownMenuItem onClick={() => setLocked(!locked)}>
                            {locked
                                ? (
                                    <>
                                        <LockKeyholeOpen />Unlock
                                    </>
                                )
                                : (
                                    <>
                                        <LockKeyhole />Lock
                                    </>
                                )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => {
                                restore();
                            }}
                        >
                            <Minimize />Restore
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

