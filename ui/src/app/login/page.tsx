import { redirect } from "next/navigation";
import { signIn, providerMap, auth } from "@/lib/auth";
import { AuthError } from "next-auth";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { Input } from "@/components/shadcn/input";
import { GalleryVerticalEnd } from "lucide-react";

const SIGNIN_ERROR_URL = "/error";

export default async function SignInPage({ params }: {
    params: Promise<{
        searchParams: { callbackUrl: string | undefined };
    }>;
}) {
    const session = await auth()
    if(session) redirect("/home")
    const { searchParams } = await params;
    return (
        <>
            <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <a
                                href="#"
                                className="flex flex-col items-center gap-2 font-medium"
                            >
                                <div className="flex size-8 items-center justify-center rounded-md">
                                    <GalleryVerticalEnd className="size-6" />
                                </div>
                                <span className="sr-only">Boarder</span>
                            </a>
                            <h1 className="text-xl font-bold">
                                Welcome to Boarder
                            </h1>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <a
                                    href="#"
                                    className="underline underline-offset-4"
                                >
                                    Sign up
                                </a>
                            </div>
                        </div>
                        <form
                            action={async (formData) => {
                                "use server";
                                try {
                                    const pass = formData.get("password")
                                    const authType = pass  ? "credentials": "nodemailer"   
                                    await signIn(authType, formData);
                                } catch (error) {
                                    if (error instanceof AuthError) { 
                                        return redirect(
                                            `${SIGNIN_ERROR_URL}?error=${error.type}`,
                                        );
                                    }
                                    throw error;
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
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Login
                                </Button>
                            </div>
                        </form>
                        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                            <span className="bg-background text-muted-foreground relative z-10 px-2">
                                Or
                            </span>
                        </div>
                        {Object.values(providerMap).map((provider) => (
                            <form
                                key={provider.id}
                                action={async () => {
                                    "use server";
                                    try {
                                        await signIn(provider.id, {
                                            redirectTo:
                                                searchParams?.callbackUrl ??
                                                    process.env.NEXT_PUBLIC_URL+"/home",
                                        });
                                    } catch (error) {
                                        if (error instanceof AuthError) {
                                            return redirect(
                                                `${SIGNIN_ERROR_URL}?error=${error.type}`,
                                            );
                                        }
                                        throw error;
                                    }
                                }}
                            >
                                <Button
                                    variant="outline"
                                    type="submit"
                                    className="w-full"
                                >
                                    Continue with {provider.name}
                                </Button>
                            </form>
                        ))}
                    </div>
                    <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                        By clicking continue, you agree to our{" "}
                        <a href="#">Terms of Service</a> and{" "}
                        <a href="#">Privacy Policy</a>.
                    </div>
                </div>
            </div>
        </>
    );
}
