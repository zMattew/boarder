"use client"
import { deleteUser } from "@/lib/user";
import { Button } from "../shadcn/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteUserButton() {
    const {push} = useRouter() 
    return <Button
        onClick={async () => {
            try {
                await deleteUser();
                toast.success("Account deleted")
            } catch (error) {
            }
        } }
    >
        Confirm
    </Button>;
}
