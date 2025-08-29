"use client"
import { toast } from "sonner";
import { Button } from "../shadcn/button";
import { Input } from "../shadcn/input";
import { Label } from "../shadcn/label";
import { setPassword } from "@/lib/user";

export function ChangePasswordForm({ currentPass }: { currentPass?: boolean }) {
    return <form action={async (formData) => {
        try {
            const password = formData.get("password") as string
            const password2 = formData.get("password2") as string
            if (password != password2) throw "The new password doesn't match"
            const currPassword = formData.get("currpassword") as string | undefined
            if (currentPass && !currPassword) throw "You must write the current password"
            await setPassword(password, password2, currPassword)
            toast.success("Password updated")
        } catch (error) {
            toast(`${error}`)
        }
    }} className="flex flex-col gap-4">
        {currentPass && <>
            <Label htmlFor="currpassword">
                Current Password
            </Label>
            <Input name="currpassword" type="password" required={currentPass} />
        </>}
        <Label htmlFor="password">
            New Password
        </Label>
        <Input name="password" type="password" required />
        <Label htmlFor="password2">
            Confirm New Password
        </Label>
        <Input name="password2" type="password" required />
        <Button
            type="submit"
        >
            Confirm
        </Button>
    </form>
}