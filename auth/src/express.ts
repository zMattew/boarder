import { ExpressAuth } from "@auth/express"
import authConfig from "./auth.config.ts"
import type { Provider } from "@auth/express/providers"
import Nodemailer from "@auth/express/providers/nodemailer"
import { createTransport } from "nodemailer"
import { render } from '@react-email/components'
import LoginEmail from "./emails/login.tsx"
import { PrismaAdapter } from "@auth/prisma-adapter"
import client from "@repo/db/esm"

export const providers: Provider[] = [
    Nodemailer({
        server: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT ?? "0"),
            secure: true,
            auth: {
                type: "OAuth2",
                clientId: process.env.SMTP_CLIENT_ID,
                clientSecret: process.env.SMTP_SECRET,
                accessToken: process.env.SMTP_ACCESS,
                refreshToken: process.env.SMTP_REFRESH,
                user: process.env.SMTP_EMAIL,
            }
        },
        from: process.env.SMTP_EMAIL,
        async sendVerificationRequest({
            identifier: email,
            url,
            provider: { server, from },
        }) {
            const { host } = new URL(url)
            const transport = createTransport(server)
            const result = await transport.sendMail({
                to: email,
                from: from,
                subject: `Sign in to ${host}`,
                html: await render(LoginEmail({ url })),
            })
            const failed = result.rejected.concat(result.pending).filter(Boolean)
            if (failed.length) {
                throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
            }
        },
    })
]

export const providerMap = providers
    .map((provider) => {
        if (typeof provider === "function") {
            const providerData = provider()
            return { id: providerData.id, name: providerData.name }
        } else {
            return { id: provider.id, name: provider.name }
        }
    })
    .filter((provider) => provider.id !== "nodemailer")

export const auth = ExpressAuth({
    ...authConfig,
    adapter: PrismaAdapter(client),
    providers: [...authConfig.providers, ...providers],
})
export * from "@auth/express"

