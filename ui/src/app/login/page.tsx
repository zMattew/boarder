import { oAuthProviderMap } from "@repo/auth/providers";
import { GalleryVerticalEnd, Loader } from "lucide-react";
import { LoginForm, ThirdPartyLoginFrom } from "@/components/form/login";
import { Suspense } from "react";

export default function SignInPage() {
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
                        <Suspense fallback={<Loader className="animate-spin m-auto h-full" />}>
                            {Object.values(oAuthProviderMap()).map((provider) => (
                                <ThirdPartyLoginFrom key={provider.id} id={provider.id} name={provider.name} />
                            ))}
                        </Suspense>
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

