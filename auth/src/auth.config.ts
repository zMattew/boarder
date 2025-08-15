import type { NextAuthConfig } from "next-auth"
import type { ExpressAuthConfig } from "@auth/express"
import { getOAuthProvidersFromEnv } from "./oauth.providers.ts"

const availableEnvProviders = getOAuthProvidersFromEnv()
export default {
    providers: [ ...availableEnvProviders],
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        session({ session, token }) {
            session.user.id = token?.id as string
            return session
        },
        async redirect({ baseUrl }) {
            return baseUrl + "/home"
        },
    }
} satisfies NextAuthConfig | ExpressAuthConfig

