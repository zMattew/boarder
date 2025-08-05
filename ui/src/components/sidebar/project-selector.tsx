"use client";

import * as React from "react";
import { Check, ChevronsUpDown, GalleryVerticalEnd, Loader, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/shadcn/sidebar";
import { useProject } from "../../hooks/project-context";
import Link from "next/link";
import { setProjectCookie } from "@/lib/project";

export function ProjectSwithcer() {
  const { projects, setProject, currentProject } = useProject();

  return (
    <SidebarMenu className="bg-secondary rounded border">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">
                  {currentProject?.name
                    ? currentProject?.name
                    : "Select project"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
          >
            {projects
              ? projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onSelect={async () => {
                    await setProjectCookie(project.id)
                    setProject(project)}}
                >
                  {project.name}{" "}
                  {project.id === currentProject?.id && (
                    <Check className="ml-auto" />
                  )}
                </DropdownMenuItem>
              ))
              : (
                <DropdownMenuItem>
                  <Loader className="animate-spin m-auto h-full" />
                </DropdownMenuItem>
              )}
            <DropdownMenuItem asChild>
              <Link href={"/home/projects/create"}>
                <Plus /> New project
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
