"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import {
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "./shadcn/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./shadcn/dropdown-menu";
import { Button } from "./shadcn/button";
import Link from "next/link";

export function SidebarUser() {
    const { data: session } = useSession();
    const { isMobile } = useSidebar();
    return (
        <SidebarFooter>
            {session
                ? (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage
                                                src={session?.user?.image ?? ""}
                                                alt={session?.user?.name ?? ""}
                                            />
                                            <AvatarFallback className="rounded-lg">
                                                {session?.user?.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">
                                                {session?.user?.name}
                                            </span>
                                            <span className="truncate text-xs">
                                                {session?.user?.email}
                                            </span>
                                        </div>
                                        <ChevronsUpDown className="ml-auto size-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg "
                                    side={isMobile ? "bottom" : "right"}
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuLabel className="p-0 font-normal my-2">
                                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                            <Avatar className="h-8 w-8 rounded-lg">
                                                <AvatarImage
                                                    src={session?.user?.image ??
                                                        ""}
                                                    alt={session?.user?.name ??
                                                        ""}
                                                />
                                                <AvatarFallback className="rounded-lg">
                                                    {session?.user?.name
                                                        ?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-medium">
                                                    {session?.user?.name}
                                                </span>
                                                <span className="truncate text-xs">
                                                    {session?.user?.email}
                                                </span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem>
                                            <Sparkles />
                                            Upgrade to Pro
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem>
                                            <BadgeCheck />
                                            Account
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <CreditCard />
                                            Billing
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Bell />
                                            Notifications
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut()}>
                                        <LogOut />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )
                : (
                    <Button>
                        <Link href={"/login"}>Login</Link>
                    </Button>
                )}
        </SidebarFooter>
    );
}
