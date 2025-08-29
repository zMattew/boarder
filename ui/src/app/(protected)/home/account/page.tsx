import { ChangePasswordForm } from "@/components/form/set-password";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardTitle } from "@/components/shadcn/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/shadcn/dialog";
import { auth } from "@/lib/auth";
import client from "@repo/db/client";

export default async function Page() {
    const session = await auth()
    const user = await client.user.findUnique({ where: { id: session?.user?.id } })
    return (
        <Card className="w-full max-w-md mx-auto p-4">
            <CardTitle>
                Account {user?.name}
            </CardTitle>
            <CardContent>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            {user?.password ? "Change password" : "Set password"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {user?.password ? "Change password" : "Set password"}
                            </DialogTitle>
                            <DialogDescription className="flex flex-col">
                                Set a password to access your account
                            </DialogDescription>
                        </DialogHeader>
                        <ChangePasswordForm currentPass={!!user?.password} />
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
