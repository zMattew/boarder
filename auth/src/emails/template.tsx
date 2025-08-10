import { Html } from "@react-email/html"
import { Tailwind } from "@react-email/tailwind"
import { Container } from "@react-email/container"

export default function EmailTemplate({ children}:{children:any}) {
    return (
        <Html>
            <Tailwind>
                <Container>
                    <div className="flex flex-col items-center min-h-screen ">
                        
                        <div className="flex-1 p-2">
                            {children}
                        </div>
                        <div className="flex-0">
                            <h3 className="my-4 text-sm text-center font-medium">©{new Date().getFullYear()} -  <span className="font-bold">Boarder</span></h3>
                        </div>
                    </div>
                </Container>
            </Tailwind>
        </Html>
    );
}