import { ExpressAuth } from "@auth/express"
import authConfig from "./auth.config.ts"
import type { Provider } from "@auth/express/providers"
import { PrismaAdapter } from "@auth/prisma-adapter"
import client from "@repo/db/esm"
import Credentials from "@auth/core/providers/credentials"
import { decrypt, encrypt } from "@repo/core/crypto"

const providers: Provider[] = []
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
export const auth = ExpressAuth({
    ...authConfig,
    adapter: PrismaAdapter(client),
    providers: [...authConfig.providers, ...providers],
})
export * from "@auth/express"

