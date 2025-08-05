import type { NextAuthConfig } from "next-auth"


export default {
    providers:[],
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
        }
    }
} satisfies NextAuthConfig

