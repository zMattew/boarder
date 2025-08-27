"use client"
import { Label } from "../shadcn/label";
import { Input } from "../shadcn/input";
import { Button } from "../shadcn/button";
import { login, thirdPartyLogin } from "@/lib/login";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";


export function LoginForm() {
    const { push } = useRouter()
    return <form
        action={async (formData) => {
            const res = await login(formData);
            if (res == "success") push("/home")
            else toast.error(`${res}`)
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
export function ThirdPartyLoginFrom({ id, name }: { id: string; name: string; }) {
    const searchParams = useSearchParams()
    useEffect(() => {
        const error = searchParams.get("error");
        if (!error) return;
        toast.error(AUTH_ERROR_MESSAGES[error as keyof typeof AUTH_ERROR_MESSAGES]);
    });
    return <form
        key={id}
        action={async () => {
            try {
                await thirdPartyLogin(id);
            } catch (error) {
                throw error
            }
        }}
    >
        <Button
            variant="outline"
            type="submit"
            className="w-full"
        >
            Continue with {name}
        </Button>
    </form>;
}

export const AUTH_ERROR_MESSAGES = {
    OAuthSignin: "Error signing in with OAuth provider.",
    OAuthCallback: "Error during OAuth callback.",
    OAuthCreateAccount: "Could not create account from OAuth profile.",
    EmailCreateAccount: "Could not create account with email.",
    EmailSignin: "Error sending sign-in email.",
    CredentialsSignin: "Invalid credentials.",
    SessionRequired: "Please sign in to access that page.",
    OAuthAccountNotLinked: "This account is linked with a different provider.",
    Callback: "Authentication callback error.",
};