import { redirect } from "next/navigation";
import { signIn, auth } from "@/lib/auth";
import {  oAuthProviderMap } from "@repo/auth/providers";
import { AuthError } from "next-auth";
import { Button } from "@/components/shadcn/button";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "@/components/form/login";

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
                        </div>
                        <LoginForm />
                        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                            <span className="bg-background text-muted-foreground relative z-10 px-2">
                                Or
                            </span>
                        </div>
                        {Object.values(oAuthProviderMap).map((provider) => (
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
                                                `/error?error=${error.type}`,
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
