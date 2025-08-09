import client from "@repo/db/client";
import { ComponentView } from "@/components/component/view";
import { auth } from "@/lib/auth.middleware";
import { redirect } from "next/navigation";

export default async function Page(
    { params }: { params: Promise<{ viewId: string }> },
) {
    const currentView = (await params).viewId;
    const session = await auth();
    if (!session?.user) redirect("/login");
    const authorized = !!(await client.view.findUnique({
        where: {
            id: currentView,
            project: {
                OR: [
                    { team: { some: { userId: session.user.id } } },
                    { ownerId: session.user.id },
                ],
            },
        },
        select: { id: true },
    }));
    if (!authorized) redirect("/home");
    return <ComponentView />;
}
