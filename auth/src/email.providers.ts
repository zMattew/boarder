import { NodemailerConfig } from "@auth/core/providers/nodemailer"
import { Theme } from "@auth/core/types"
import { createTransport } from "nodemailer"
import LoginEmail from "./emails/login"
import { render } from "@react-email/components"

export async function getEmailProviderFromEnv() {
    const host = process.env.SMTP_HOST
    if (!host) return
    const port = process.env.SMTP_PORT
    if (!port) return
    const email = process.env.SMTP_EMAIL
    if (!email) return
    const { default: provider } = await import("@auth/core/providers/nodemailer")
    const verificationRequest = async ({
        identifier: email,
        url,
        provider: { server, from },
    }: {
        identifier: string
        url: string
        expires: Date
        provider: NodemailerConfig
        token: string
        theme: Theme
        request: Request
    }) => {
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
    }
    const password = process.env.SMTP_PASSWORD
    if (!password) {
        const clientId = process.env.SMTP_CLIENT_ID
        if (!clientId) return
        const secret = process.env.SMTP_SECRET
        if (!secret) return
        const accessToken = process.env.SMTP_ACCESS
        if (!accessToken) return
        const refreshToken = process.env.SMTP_REFRESH
        if (!refreshToken) return
        return provider({
            server: {
                host: host,
                port: parseInt(port),
                secure: true,
                auth: {
                    type: "OAuth2",
                    clientId,
                    clientSecret: secret,
                    accessToken,
                    refreshToken,
                    user: email,
                },
            },
            from: email,
            sendVerificationRequest: verificationRequest
        })
    } else return provider({
        server: {
            host: host,
            port: parseInt(port),
            secure: true,
            auth: {
                type: "login",
                pass: password,
                user: email,
            },
        },
        from: email,
        sendVerificationRequest: verificationRequest
    })
}