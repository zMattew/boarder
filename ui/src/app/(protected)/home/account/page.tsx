import { DeleteUserButton } from "@/components/form/delete-user";
import { ChangePasswordForm } from "@/components/form/set-password";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardTitle } from "@/components/shadcn/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
            <CardContent className="flex flex-col gap-2">
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
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            Delete account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Are you absolutely sure?
                            </DialogTitle>
                            <DialogDescription className="flex flex-col">
                                Your account will be removed permanetly with the owning project, view, component
                            </DialogDescription>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                    >
                                        Close
                                    </Button>
                                </DialogClose>
                                <DeleteUserButton />
                            </DialogFooter>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

