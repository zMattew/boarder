import NextAuth, { User } from "next-auth"
import authConfig from "./auth.config.ts"
import type { Provider } from "next-auth/providers"
import { PrismaAdapter } from "@auth/prisma-adapter"
import client from "@repo/db/client"
import { getEmailProviderFromEnv } from "./email.providers.ts"
import Credentials from "next-auth/providers/credentials"
import { decrypt, encrypt } from "@repo/core/crypto"

const providers: Provider[] = []
const nodemailer = await getEmailProviderFromEnv()
nodemailer && providers.push(nodemailer)
providers.push(
    Credentials({
        type: "credentials",
        credentials: {
            email: {
                type: "email"
            },
            password: {
                type: "password"
            }
        },
        async authorize({ email, password }) {
            let user = null

            const pwHash = await encrypt(password as string)

            user = await client.user.findUnique({ where: { email: email as string } })
            if (!user) {
                return user = await client.user.create({ data: { email: email as string, password: pwHash } })
            }
            const savedPass = user.password ? await decrypt(user.password) : ""
            if (savedPass == password) {
               delete (user as Omit<typeof user, "password"> & { password?: string | null })?.password
                return user as Omit<typeof user, "password">
            } else user = undefined
            if (!user) {
                throw new Error("Invalid credentials.")
            }

            return user
        }
    }))
export const nextAuth = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(client),
    providers: [...authConfig.providers, ...providers],
})



