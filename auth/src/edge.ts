import NextAuth from "next-auth"
import authConfig from "./auth.config.ts"

export const nextAuth = NextAuth({
    ...authConfig
})

