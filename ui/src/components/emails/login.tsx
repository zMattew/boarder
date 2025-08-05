import { Button } from "@react-email/components";
import EmailTemplate from "./template";

export default function LoginEmail({url}:{url:string}) {
    return (
        <EmailTemplate>
            <h1>Login</h1>
            <p>
                Hello,<br />
                We need to verify your email ownership before login you to your
                profile and<br />
                start making operation
            </p>
            <div className="mx-auto">
                <Button
                    href={`${url}`}
                >
                    Login
                </Button>
            </div>
        </EmailTemplate>
    );
}
