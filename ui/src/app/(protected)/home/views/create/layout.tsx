import { getProjectMemberRole } from "@/lib/role";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
    const role = await getProjectMemberRole();
    if (role == "viewer") redirect("/home");
    return (
        <>
            {children}
        </>
    );
}
