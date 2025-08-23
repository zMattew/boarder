import { getMemberRole } from "@/lib/role";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function Layout({ children }: { children: ReactNode }) {
    const {role} = await getMemberRole();
    if (role != "admin") redirect("/home");
    return (
        <>
            {children}
        </>
    );
}
