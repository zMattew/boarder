import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { Label } from "../shadcn/label";
import { Input } from "../shadcn/input";
import { Button } from "../shadcn/button";
import { redirect } from "next/navigation";

const SIGNIN_ERROR_URL = "/login";


export function LoginForm() {
    return <form
        action={async (formData) => {
            "use server"
            const pass = formData.get("password");
            const authType = pass ? "credentials" : "nodemailer";
            try {
                await signIn(authType, formData);
            } catch (error) {
                if (error instanceof AuthError) {
                    return redirect(
                        `${SIGNIN_ERROR_URL}?error=${error.type}`,
                    );
                }
                throw error
            }
        }}
    >
        <div className="flex flex-col gap-6">
            <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required />
                <Label htmlFor="password">Password (optional)</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="*******" />
            </div>
            <Button type="submit" className="w-full">
                Login
            </Button>
        </div>
    </form>
}