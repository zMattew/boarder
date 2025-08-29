"use client"
import { deleteUser } from "@/lib/user";
import { Button } from "../shadcn/button";
import { toast } from "sonner";

export function DeleteUserButton() {
    return <Button
        onClick={async () => {
            try {
                await deleteUser();
                toast.success("Account deleted")
            } catch {
            }
        } }
    >
        Confirm
    </Button>;
}
