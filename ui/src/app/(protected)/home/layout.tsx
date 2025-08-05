import { Navbar } from "@/components/navbar";
import { SidebarProvider } from "@/components/shadcn/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { ProjectProvider } from "@/hooks/project-context";
import { ViewProvider } from "@/hooks/view-context";
import { QueryProvider } from "@/components/utils/query-layout";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SessionProvider>
            <QueryProvider>
                <ProjectProvider>
                        <ViewProvider>
                            <SidebarProvider>
                                <AppSidebar />
                                <main className="w-full ">
                                    <Navbar />
                                    {children}
                                    <Toaster />
                                </main>
                            </SidebarProvider>
                        </ViewProvider>
                </ProjectProvider>
            </QueryProvider>
        </SessionProvider>
    );
}
