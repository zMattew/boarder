"use client";
import {
    Bot,
    ChevronDown,
    Database,
    List,
    Plus,
    Settings,
    Users,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "./shadcn/sidebar";
import Link from "next/link";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./shadcn/collapsible";
import { ProjectSwithcer } from "./sidebar/project-selector";
import { SidebarUser } from "./user-sidebar";
import { useProject } from "../hooks/project-context";

export function AppSidebar() {
    const { currentProject } = useProject();
    return (
        <Sidebar>
            <SidebarHeader>
                <ProjectSwithcer />
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {currentProject?.team && currentProject.role == "admin" &&
                        (
                            <Collapsible className="group/collapsible">
                                <SidebarGroup>
                                    <SidebarGroupLabel asChild>
                                        <CollapsibleTrigger>
                                            <Users />
                                            <span className="ml-1">
                                                Team
                                            </span>
                                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                        </CollapsibleTrigger>
                                    </SidebarGroupLabel>
                                    <CollapsibleContent>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                            >
                                                <Link
                                                    href={"/home/team/"}
                                                >
                                                    <List />
                                                    <span>
                                                        List
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                            >
                                                <Link
                                                    href={"/home/team/add"}
                                                >
                                                    <Plus />
                                                    <span>
                                                        Add member
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>
                        )}
                    {currentProject?.sources &&
                        currentProject.role == "admin" &&
                        (
                            <Collapsible className="group/collapsible">
                                <SidebarGroup>
                                    <SidebarGroupLabel asChild>
                                        <CollapsibleTrigger>
                                            <Database />
                                            <span className="ml-1">
                                                Sources
                                            </span>
                                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                        </CollapsibleTrigger>
                                    </SidebarGroupLabel>
                                    <CollapsibleContent>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                            >
                                                <Link
                                                    href={"/home/sources"}
                                                >
                                                    <List />
                                                    <span>
                                                        List
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                            >
                                                <Link
                                                    href={"/home/sources/add"}
                                                >
                                                    <Plus />
                                                    <span>
                                                        Add
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>
                        )}
                    {currentProject?.llms && currentProject.role == "admin" &&
                        (
                            <Collapsible className="group/collapsible">
                                <SidebarGroup>
                                    <SidebarGroupLabel asChild>
                                        <CollapsibleTrigger>
                                            <Bot />
                                            <span className="ml-1">
                                                LLMs
                                            </span>
                                            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                        </CollapsibleTrigger>
                                    </SidebarGroupLabel>
                                    <CollapsibleContent>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                            >
                                                <Link
                                                    href={"/home/llms/"}
                                                >
                                                    <List />
                                                    <span>
                                                        List
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                            >
                                                <Link
                                                    href={"/home/llms/add"}
                                                >
                                                    <Plus />
                                                    <span>
                                                        Add
                                                    </span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>
                        )}
                    <SidebarGroup>
                        <SidebarGroupLabel asChild>
                            <SidebarMenuButton asChild>
                                <Link href={"/home/projects/settings"}>
                                    <Settings />
                                    Settings
                                </Link>
                            </SidebarMenuButton>
                        </SidebarGroupLabel>
                    </SidebarGroup>
                </SidebarMenu>
            </SidebarContent>
            <SidebarUser />
        </Sidebar>
    );
}
